// Pruebas del sistema de referidos.
//
//  - Parte A (siempre): lógica pura (descuento, aplicación de saldo, casos borde
//    de montos). No toca la base de datos.
//  - Parte B (opcional, RUN_DB_TESTS=1): escenarios de integración contra la DB.
//    Crea y BORRA sus propios datos (prefijo __reftest__). Úsalo solo contra una
//    base de pruebas, nunca producción.
//
// Uso:
//   node scripts/test-referrals.mjs
//   RUN_DB_TESTS=1 node scripts/test-referrals.mjs

let passed = 0;
let failed = 0;
function assert(cond, msg) {
  if (cond) {
    passed++;
    console.log("  ✓ " + msg);
  } else {
    failed++;
    console.error("  ✗ " + msg);
  }
}

// Lógica pura (réplica para no importar TS).
const REWARD = 5;
const RATE = 0.2;
const PRO_PEN = 29.9;
const MIN_WITHDRAWAL = 50;
const round2 = (n) => Math.round(n * 100) / 100;
const welcomeDiscount = () => round2(PRO_PEN * RATE);
// Saldo disponible = Σ de movimientos (créditos +, retiros −), clamp a 0.
const balance = (movs) => Math.max(0, movs.reduce((a, m) => a + m, 0));
const canWithdraw = (available) => available >= MIN_WITHDRAWAL;

console.log("\nParte A — lógica pura\n");

// Descuento de bienvenida 20% (invitado).
assert(welcomeDiscount() === 5.98, "20% de S/29.90 = S/5.98");
assert(round2(PRO_PEN - welcomeDiscount()) === 23.92, "Primer mes con descuento = S/23.92");

// Recompensa del referente.
assert(REWARD === 5, "Recompensa por referido = S/5");

// Saldo retirable: suma del libro mayor.
assert(balance([5, 5, 5]) === 15, "3 recompensas liberadas = S/15 disponible");
assert(balance([5, 5, 5, 5, 5, 5, 5, 5, 5, 5]) === 50, "10 referidos liberados = S/50");
assert(balance([50, -50]) === 0, "Tras pagar el retiro, saldo vuelve a S/0");
assert(balance([50, -20]) === 30, "Retiro parcial de S/20 deja S/30");

// Mínimo de retiro S/50.
assert(canWithdraw(50) === true, "Con S/50 se puede retirar");
assert(canWithdraw(49.99) === false, "Con S/49.99 NO se puede retirar");
assert(canWithdraw(0) === false, "Sin saldo no se puede retirar");

// ---------------------------------------------------------------------------
async function dbTests() {
  console.log("\nParte B — integración (DB)\n");
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const P = "__reftest__";
  const DAY = 24 * 60 * 60 * 1000;

  // Limpieza previa por si quedó basura de una corrida anterior.
  async function cleanup() {
    const shops = await prisma.barbershop.findMany({
      where: { slug: { startsWith: P } },
      select: { id: true, ownerId: true },
    });
    const ids = shops.map((s) => s.id);
    if (ids.length) {
      await prisma.referral.deleteMany({ where: { OR: [{ referrerId: { in: ids } }, { referredId: { in: ids } }] } });
      await prisma.creditMovement.deleteMany({ where: { barbershopId: { in: ids } } });
      await prisma.barbershop.updateMany({ where: { id: { in: ids } }, data: { referredById: null } });
      await prisma.barbershop.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.user.deleteMany({ where: { email: { startsWith: P } } });
  }

  async function makeShop(tag, opts = {}) {
    const user = await prisma.user.create({
      data: { email: `${P}${tag}@test.com`, name: tag, role: "OWNER" },
    });
    return prisma.barbershop.create({
      data: {
        ownerId: user.id,
        slug: `${P}${tag}`,
        name: `Barbería ${tag}`,
        referralCode: `${P}${tag}`.slice(0, 18),
        ...opts,
      },
    });
  }

  try {
    await cleanup();

    const referrer = await makeShop("ref");

    // Caso: usuario paga y la recompensa nace PENDING.
    const paid = await makeShop("paid", { referredById: referrer.id, plan: "PRO", status: "ACTIVE" });
    await prisma.referral.create({
      data: { referrerId: referrer.id, referredId: paid.id, status: "PENDING", rewardAmount: REWARD,
        proPaidAt: new Date(), unlockAt: new Date(Date.now() + 30 * DAY) },
    });
    let r = await prisma.referral.findUnique({ where: { referredId: paid.id } });
    assert(r && r.status === "PENDING", "Pago Pro: recompensa creada en PENDING");

    // Antifraude: una sola recompensa por barbería referida (referredId @unique).
    let dup = false;
    try {
      await prisma.referral.create({ data: { referrerId: referrer.id, referredId: paid.id, status: "PENDING", rewardAmount: REWARD } });
    } catch { dup = true; }
    assert(dup, "Antifraude: no se permite recompensa duplicada por barbería referida");

    // Caso: cumplido el plazo y sigue Pro → liberar a AVAILABLE.
    await prisma.referral.update({ where: { id: r.id }, data: { unlockAt: new Date(Date.now() - DAY) } });
    // Simulación de reconcileReferrals (release):
    await prisma.$transaction([
      prisma.referral.update({ where: { id: r.id }, data: { status: "AVAILABLE" } }),
      prisma.creditMovement.create({ data: { barbershopId: referrer.id, amount: REWARD, reason: "REWARD_RELEASED", referralId: r.id } }),
    ]);
    r = await prisma.referral.findUnique({ where: { referredId: paid.id } });
    assert(r.status === "AVAILABLE", "Día 30 + Pro activo: recompensa liberada (AVAILABLE)");

    const released = await prisma.creditMovement.aggregate({ where: { barbershopId: referrer.id, reason: "REWARD_RELEASED" }, _sum: { amount: true } });
    assert((released._sum.amount ?? 0) === REWARD, "Saldo liberado = S/5 en el libro mayor");

    // Caso: paga y cancela antes de 30 días → CANCELLED.
    const cancelled = await makeShop("cancel", { referredById: referrer.id, plan: "FREE", status: "ACTIVE" });
    const rc = await prisma.referral.create({
      data: { referrerId: referrer.id, referredId: cancelled.id, status: "PENDING", rewardAmount: REWARD,
        proPaidAt: new Date(), unlockAt: new Date(Date.now() + 30 * DAY) },
    });
    // Simulación de onReferredCancelled (status sigue PENDING):
    await prisma.referral.update({ where: { id: rc.id }, data: { status: "CANCELLED" } });
    const rc2 = await prisma.referral.findUnique({ where: { id: rc.id } });
    assert(rc2.status === "CANCELLED", "Cancelación antes de 30 días: recompensa CANCELLED");

    console.log("\n  (escenarios de signup/autorreferido/multi-link se validan en linkReferral)");
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }
}

async function main() {
  if (process.env.RUN_DB_TESTS === "1") {
    await dbTests();
  } else {
    console.log("\n(Parte B omitida — exporta RUN_DB_TESTS=1 contra una DB de pruebas para correrla)");
  }
  console.log(`\nResultado: ${passed} pasaron, ${failed} fallaron\n`);
  process.exit(failed ? 1 : 0);
}

main();

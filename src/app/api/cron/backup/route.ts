import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { createCipheriv, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

// Backup diario de la base de datos a Vercel Blob.
// El JSON con todos los datos se CIFRA con AES-256-GCM (clave en BACKUP_ENCRYPTION_KEY)
// antes de subirse, así que aunque el blob sea de un store público y alguien
// adivinara la URL, el contenido es ilegible sin la clave. Conserva los últimos KEEP.
// Protección del endpoint: Vercel Cron envía `Authorization: Bearer <CRON_SECRET>`.
//
// Formato del archivo .enc: [iv(12 bytes)][authTag(16 bytes)][ciphertext].
// Restaurar: descargar el .enc, separar iv/tag/ciphertext y descifrar con la clave.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const KEEP = 30; // backups a conservar (≈1 mes con cron diario)

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const keyHex = process.env.BACKUP_ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    return NextResponse.json(
      { ok: false, error: "BACKUP_ENCRYPTION_KEY no configurada (debe ser 64 hex / 32 bytes)" },
      { status: 500 }
    );
  }

  try {
    const [
      User, Barbershop, Service, Customer, Visit, Reward, Redemption,
      Appointment, Payment, Referral, CreditMovement, AuditEvent,
      ClientReferral, ClientReferralReward,
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.barbershop.findMany(),
      prisma.service.findMany(),
      prisma.customer.findMany(),
      prisma.visit.findMany(),
      prisma.reward.findMany(),
      prisma.redemption.findMany(),
      prisma.appointment.findMany(),
      prisma.payment.findMany(),
      prisma.referral.findMany(),
      prisma.creditMovement.findMany(),
      prisma.auditEvent.findMany(),
      prisma.clientReferral.findMany(),
      prisma.clientReferralReward.findMany(),
    ]);

    const dump = {
      _meta: { takenAt: new Date().toISOString(), version: 1 },
      User, Barbershop, Service, Customer, Visit, Reward, Redemption,
      Appointment, Payment, Referral, CreditMovement, AuditEvent,
      ClientReferral, ClientReferralReward,
    };

    // Cifrado AES-256-GCM
    const key = Buffer.from(keyHex, "hex");
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const plaintext = Buffer.from(JSON.stringify(dump), "utf8");
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const payload = Buffer.concat([iv, authTag, ciphertext]);

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const blob = await put(`backups/db-${stamp}.enc`, payload, {
      access: "public",
      contentType: "application/octet-stream",
      addRandomSuffix: true, // URL impredecible; además el contenido va cifrado
    });

    // Retención: conserva los KEEP más recientes (timestamp en el nombre).
    let deletedOld = 0;
    try {
      const { blobs } = await list({ prefix: "backups/" });
      const sorted = blobs.sort((a, b) => (a.pathname < b.pathname ? 1 : -1));
      const toDelete = sorted.slice(KEEP);
      if (toDelete.length) {
        await del(toDelete.map((b) => b.url));
        deletedOld = toDelete.length;
      }
    } catch (e) {
      console.error("Backup retention cleanup error:", e);
    }

    const counts = Object.fromEntries(
      Object.entries(dump)
        .filter(([k]) => k !== "_meta")
        .map(([k, v]) => [k, (v as unknown[]).length])
    );

    return NextResponse.json({ ok: true, file: blob.pathname, bytes: payload.length, counts, deletedOld });
  } catch (e) {
    console.error("Cron backup error:", e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

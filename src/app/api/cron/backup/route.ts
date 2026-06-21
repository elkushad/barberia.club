import { NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

// Backup diario de la base de datos a Vercel Blob (privado).
// Vuelca todas las tablas a un JSON con timestamp y conserva los últimos KEEP.
// Protección: Vercel Cron envía `Authorization: Bearer <CRON_SECRET>`.
//
// Restaurar: descarga el JSON desde el dashboard de Blob y reinserta con un
// script (mismo formato que usó la migración Neon→Supabase).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const KEEP = 30; // cuántos backups conservar (≈1 mes con cron diario)

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
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

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const blob = await put(`backups/db-${stamp}.json`, JSON.stringify(dump), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
    });

    // Retención: conserva los KEEP más recientes (nombre con timestamp ISO → orden lexicográfico = cronológico).
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

    return NextResponse.json({ ok: true, file: blob.pathname, counts, deletedOld });
  } catch (e) {
    console.error("Cron backup error:", e);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

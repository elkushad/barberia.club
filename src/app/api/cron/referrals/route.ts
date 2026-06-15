import { NextResponse } from "next/server";
import { reconcileReferrals } from "@/lib/referrals";

// Cron diario (Vercel Cron) que libera recompensas cumplidos los 30 días y
// cancela las de barberías que dejaron de ser Pro. También reconcilia de forma
// perezosa al abrir el panel, así que funciona aunque el cron no esté activo.
//
// Protección: Vercel Cron envía `Authorization: Bearer <CRON_SECRET>`.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  try {
    await reconcileReferrals();
    return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
  } catch (e) {
    console.error("Cron referrals error:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

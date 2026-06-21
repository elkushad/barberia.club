import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import BarbershopCard from "./BarbershopCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Descubrir barberías | Barbería Club",
  description: "Explora las barberías registradas en Barbería Club y sus programas de recompensas.",
};

// Mismo parseo del banner que la landing pública: el campo guarda un JSON array
// de URLs de medios (o una sola URL en formato legacy). Devolvemos el primer medio.
function firstMedia(banner: string | null): string | null {
  if (!banner) return null;
  try {
    const parsed = JSON.parse(banner);
    if (Array.isArray(parsed)) return parsed[0] ?? null;
  } catch {
    /* legacy: una sola URL en texto plano */
  }
  return banner || null;
}

export default async function DescubrirPage() {
  // Estructura pensada para crecer (búsqueda, orden por distancia/recompensas).
  // Por ahora: todas las barberías activas con sus recompensas (hitos).
  const barbershops = await prisma.barbershop.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      banner: true,
      address: true,
      brandColor: true,
      rewards: {
        orderBy: { visitsRequired: "asc" },
        select: { id: true, name: true, visitsRequired: true },
      },
    },
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        backgroundColor: "var(--bg-primary)",
        backgroundImage:
          "radial-gradient(circle at 50% 0%, rgba(20,20,20,1) 0%, rgba(5,5,5,1) 100%)",
      }}
    >
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          backgroundColor: "rgba(5,5,5,0.75)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <Link
          href="/"
          aria-label="Volver"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            border: "1px solid var(--border-color)",
            color: "var(--text-primary)",
            textDecoration: "none",
            fontSize: "1.1rem",
            flexShrink: 0,
          }}
        >
          ←
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(1.1rem, 4.5vw, 1.5rem)",
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              lineHeight: 1.1,
            }}
          >
            🌐 Descubrir barberías
          </h1>
          <p style={{ margin: "0.1rem 0 0", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            {barbershops.length}{" "}
            {barbershops.length === 1 ? "barbería disponible" : "barberías disponibles"}
          </p>
        </div>
      </header>

      {/* Barra de búsqueda (preparada para el futuro: filtros / orden / distancia) */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "1rem 1.25rem 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.7rem 1rem",
            borderRadius: "14px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            opacity: 0.7,
          }}
          aria-disabled="true"
        >
          <span style={{ fontSize: "1rem" }}>🔍</span>
          <span>Buscar barberías cercanas (próximamente)</span>
        </div>
      </div>

      {/* Listado de cards */}
      <main
        style={{
          maxWidth: "680px",
          margin: "0 auto",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {barbershops.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-secondary)", padding: "3rem 0" }}>
            Aún no hay barberías para mostrar.
          </p>
        ) : (
          barbershops.map((shop) => (
            <BarbershopCard key={shop.id} shop={shop} backgroundUrl={firstMedia(shop.banner)} />
          ))
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "1rem",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "0.7rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span>Powered by</span>
        <Image src="/logo.png" alt="Barber.club Logo" width={80} height={24} style={{ objectFit: "contain" }} />
      </footer>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Image from "next/image";
import BarbershopCard from "./BarbershopCard";
import DiscoverHeader from "./DiscoverHeader";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Descubrir barberías | Barbería Club",
  description: "Explora las barberías registradas en Barbería Club y sus programas de recompensas.",
};

// Mismo parseo del banner que la landing pública: el campo guarda un JSON array
// de URLs de medios (o una sola URL en formato legacy). Devolvemos todos los medios.
function parseMedia(banner: string | null): string[] {
  if (!banner) return [];
  try {
    const parsed = JSON.parse(banner);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    /* legacy: una sola URL en texto plano */
    return [banner];
  }
  return banner ? [banner] : [];
}

export default async function DescubrirPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; back?: string }>;
}) {
  const { from, back } = await searchParams;

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

  // Barbería desde la que entró el usuario (para "Regresar" y la ubicación por defecto).
  const fromShop = from
    ? await prisma.barbershop.findUnique({
        where: { slug: from },
        select: { slug: true, address: true },
      })
    : null;

  // País por defecto: hoy la plataforma opera en Perú. Cuando el modelo guarde
  // el país de cada barbería, se derivará desde la de origen (fromShop).
  const country = "Perú";

  // Destino de "Regresar": ruta interna explícita (?back=) > landing de origen > home.
  const isInternalPath = !!back && back.startsWith("/") && !back.startsWith("//");
  const backHref = isInternalPath ? back! : fromShop ? `/${fromShop.slug}` : "/";

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
      <DiscoverHeader backHref={backHref} defaultCountry={country} />

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
            <BarbershopCard key={shop.id} shop={shop} media={parseMedia(shop.banner)} />
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

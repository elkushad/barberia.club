import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Subida simple servidor→Blob. Las imágenes se comprimen en el cliente antes de
// enviarlas, así que pesan poco y entran de sobra en el límite de la función
// serverless (~4.5 MB). Evita el flujo cliente→Blob (token/callbacks/multipart)
// que se quedaba trabado.
export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió el archivo." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imágenes." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen es demasiado pesada." }, { status: 413 });
  }

  try {
    const blob = await put(file.name, file, { access: "public", addRandomSuffix: true });
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

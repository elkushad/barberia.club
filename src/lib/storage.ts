import { put } from "@vercel/blob";

/**
 * Sube un archivo a Vercel Blob y devuelve su URL pública.
 * Requiere la variable de entorno BLOB_READ_WRITE_TOKEN.
 *
 * Nota: la subida pasa por la server action (límite de tamaño según
 * `serverActions.bodySizeLimit`). Para archivos grandes conviene migrar a
 * subidas desde el cliente con `handleUpload` de @vercel/blob.
 */
export async function uploadToBlob(file: File, prefix: string): Promise<string> {
  const extension = file.name?.split(".").pop()?.toLowerCase() || "bin";
  const blob = await put(`${prefix}.${extension}`, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}

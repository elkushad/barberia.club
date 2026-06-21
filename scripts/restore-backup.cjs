// Descifra un backup .enc (AES-256-GCM) generado por /api/cron/backup.
// Uso:
//   BACKUP_ENCRYPTION_KEY=<64hex> node scripts/restore-backup.cjs <archivo.enc> [salida.json]
//
// Formato del .enc: [iv(12)][authTag(16)][ciphertext].
// El JSON resultante tiene una propiedad por tabla (User, Barbershop, ...) lista
// para reinsertar en la BD (mismo patrón que la migración Neon→Supabase).
const fs = require("fs");
const { createDecipheriv } = require("crypto");

const keyHex = process.env.BACKUP_ENCRYPTION_KEY;
const inFile = process.argv[2];
const outFile = process.argv[3] || (inFile ? inFile.replace(/\.enc$/, "") + ".json" : null);

if (!keyHex || keyHex.length !== 64) {
  console.error("Falta BACKUP_ENCRYPTION_KEY (64 hex chars) en el entorno.");
  process.exit(1);
}
if (!inFile) {
  console.error("Uso: BACKUP_ENCRYPTION_KEY=<hex> node scripts/restore-backup.cjs <archivo.enc> [salida.json]");
  process.exit(1);
}

const buf = fs.readFileSync(inFile);
const iv = buf.subarray(0, 12);
const authTag = buf.subarray(12, 28);
const ciphertext = buf.subarray(28);

const decipher = createDecipheriv("aes-256-gcm", Buffer.from(keyHex, "hex"), iv);
decipher.setAuthTag(authTag);
const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

fs.writeFileSync(outFile, plaintext);
const data = JSON.parse(plaintext.toString("utf8"));
const counts = Object.fromEntries(
  Object.entries(data).filter(([k]) => k !== "_meta").map(([k, v]) => [k, Array.isArray(v) ? v.length : "?"])
);
console.log("Backup descifrado →", outFile);
console.log("Tomado:", data._meta?.takenAt);
console.log("Conteos:", JSON.stringify(counts));

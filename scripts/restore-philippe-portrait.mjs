import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const parts = [
  "assets/philippe-portrait/part-01.b64",
  "assets/philippe-portrait/part-02.b64",
  "assets/philippe-portrait/part-03.b64",
  "assets/philippe-portrait/part-04.b64",
  "assets/philippe-portrait/part-05.b64",
];

const expectedBase64Length = 22408;
const expectedByteLength = 16804;
const expectedSha256 = "a62b06d7d4fc497c8da2205edd8890149ae8cbfd121bcaea11f5b9691b684925";
const outputPath = resolve("public/images/philippe-elalouf-medical-2026.jpg");

const encoded = (
  await Promise.all(parts.map((part) => readFile(resolve(part), "utf8")))
)
  .map((part) => part.trim())
  .join("");

if (encoded.length !== expectedBase64Length) {
  throw new Error(`Source de Philippe incomplète : ${encoded.length} caractères au lieu de ${expectedBase64Length}.`);
}

const jpeg = Buffer.from(encoded, "base64");
if (
  jpeg.length !== expectedByteLength ||
  jpeg[0] !== 0xff ||
  jpeg[1] !== 0xd8 ||
  jpeg.at(-2) !== 0xff ||
  jpeg.at(-1) !== 0xd9
) {
  throw new Error("Le portrait reconstruit de Philippe n'est pas un JPEG complet.");
}

const sha256 = createHash("sha256").update(jpeg).digest("hex");
if (sha256 !== expectedSha256) {
  throw new Error(`Empreinte du portrait de Philippe invalide : ${sha256}.`);
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, jpeg);

console.log(`Portrait de Philippe restauré depuis la source studio saine (400x461, ${jpeg.length} octets).`);

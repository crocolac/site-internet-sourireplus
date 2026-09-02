import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const sourcePath = resolve("public/images/philippe-elalouf-medical-2026.webp");
const outputPath = resolve("public/images/philippe-elalouf-medical-2026.jpg");

const source = sharp(sourcePath, { failOn: "error" });
const metadata = await source.metadata();

if (metadata.format !== "webp" || !metadata.width || !metadata.height) {
  throw new Error("Le portrait source de Philippe n'est pas un WebP valide.");
}

await mkdir(dirname(outputPath), { recursive: true });
await sharp(sourcePath, { failOn: "error" })
  .jpeg({ quality: 88, progressive: false, chromaSubsampling: "4:4:4" })
  .toFile(outputPath);

console.log(`Portrait de Philippe généré depuis la source studio saine (${metadata.width}x${metadata.height}).`);

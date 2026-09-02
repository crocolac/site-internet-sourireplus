import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const sourceUrl = process.env.PHILIPPE_PORTRAIT_SOURCE_URL
  ?? "https://sourireplus.ch/images/philippe-elalouf-medical-2026.png";
const jpegPath = resolve("public/images/philippe-elalouf-medical-2026.jpg");
const webpPath = resolve("public/images/philippe-elalouf-medical-2026.webp");
const pagePath = resolve("app/page.tsx");
const cacheVersion = process.env.PHILIPPE_PORTRAIT_VERSION
  ?? process.env.GITHUB_SHA?.slice(0, 12)
  ?? "ovh-png-20260902";

const requestUrl = new URL(sourceUrl);
requestUrl.searchParams.set("build", cacheVersion);

const response = await fetch(requestUrl, {
  headers: {
    Accept: "image/png,image/*;q=0.8",
    "Cache-Control": "no-cache",
    "User-Agent": "SourirePlus-static-build/1.0",
  },
});

if (!response.ok) {
  throw new Error(`Impossible de télécharger le portrait PNG de Philippe depuis OVH (HTTP ${response.status}).`);
}

const announcedLength = Number(response.headers.get("content-length") || 0);
if (announcedLength > 25 * 1024 * 1024) {
  throw new Error("Le portrait PNG de Philippe dépasse la taille maximale autorisée de 25 Mo.");
}

const sourceBuffer = Buffer.from(await response.arrayBuffer());
if (sourceBuffer.length === 0 || sourceBuffer.length > 25 * 1024 * 1024) {
  throw new Error("Le portrait PNG de Philippe reçu depuis OVH est vide ou trop volumineux.");
}

const metadata = await sharp(sourceBuffer, { failOn: "error" }).metadata();
if (metadata.format !== "png" || !metadata.width || !metadata.height) {
  throw new Error("Le fichier placé sur OVH n'est pas un PNG valide.");
}
if (metadata.width < 300 || metadata.height < 300) {
  throw new Error(`Le portrait PNG de Philippe est trop petit (${metadata.width}x${metadata.height}).`);
}

await mkdir(dirname(jpegPath), { recursive: true });
await Promise.all([
  sharp(sourceBuffer, { failOn: "error" })
    .rotate()
    .jpeg({ quality: 90, progressive: true, chromaSubsampling: "4:4:4" })
    .toFile(jpegPath),
  sharp(sourceBuffer, { failOn: "error" })
    .rotate()
    .webp({ quality: 88, effort: 5 })
    .toFile(webpPath),
]);

const pageSource = await readFile(pagePath, "utf8");
const portraitReference = /\/images\/philippe-elalouf-medical-2026\.(?:jpe?g|webp|png)(?:\?v=[^\"]*)?/g;
const updatedPageSource = pageSource.replace(
  portraitReference,
  `/images/philippe-elalouf-medical-2026.jpg?v=${cacheVersion}`,
);

if (updatedPageSource === pageSource) {
  throw new Error("La référence au portrait de Philippe n'a pas été trouvée dans la page d'accueil.");
}

await writeFile(pagePath, updatedPageSource, "utf8");

console.log(
  `Portrait de Philippe téléchargé depuis OVH (${metadata.width}x${metadata.height}), puis généré en JPEG et WebP.`,
);

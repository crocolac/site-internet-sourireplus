import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
if (!apiKey) {
  throw new Error("GOOGLE_PLACES_API_KEY is required for the OVH deployment");
}

const outputDirectory = path.resolve("out/config");
const outputPath = path.join(outputDirectory, "google-places.php");
const escapedApiKey = apiKey.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
const source = `<?php\ndeclare(strict_types=1);\nreturn ['api_key' => '${escapedApiKey}'];\n`;

await mkdir(outputDirectory, { recursive: true, mode: 0o700 });
await writeFile(outputPath, source, { encoding: "utf8", mode: 0o600 });

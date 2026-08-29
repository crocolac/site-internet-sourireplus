import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the Google Places key server-side and disables caching", async () => {
  const proxy = await readFile(new URL("../public/google-rating.php", import.meta.url), "utf8");
  const configWriter = await readFile(new URL("../scripts/write-google-places-config.mjs", import.meta.url), "utf8");

  assert.match(proxy, /X-Goog-FieldMask: rating,userRatingCount/);
  assert.match(proxy, /Cache-Control: no-store/);
  assert.match(proxy, /ChIJCUVLYRgKjkcRZphhNDOn-4I/);
  assert.doesNotMatch(proxy, /AIza[0-9A-Za-z_-]{20,}/);
  assert.match(configWriter, /process\.env\.GOOGLE_PLACES_API_KEY/);
});

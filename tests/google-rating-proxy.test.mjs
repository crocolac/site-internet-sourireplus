import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the Google Places key server-side and caches Google responses", async () => {
  const proxy = await readFile(new URL("../public/google-rating.php", import.meta.url), "utf8");
  const configWriter = await readFile(new URL("../scripts/write-google-places-config.mjs", import.meta.url), "utf8");

  assert.match(proxy, /X-Goog-FieldMask: rating,userRatingCount/);
  assert.match(proxy, /GOOGLE_CACHE_TTL_SECONDS = 3600/);
  assert.match(proxy, /sys_get_temp_dir\(\)/);
  assert.match(proxy, /Response is stale/);
  assert.match(proxy, /ChIJCUVLYRgKjkcRZphhNDOn-4I/);
  assert.doesNotMatch(proxy, /AIza[0-9A-Za-z_-]{20,}/);
  assert.match(configWriter, /process\.env\.GOOGLE_PLACES_API_KEY/);
});

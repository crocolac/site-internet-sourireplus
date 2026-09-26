import { mkdir, writeFile } from "node:fs/promises";

const env = (name) => process.env[name] ?? "";
const b64 = (value) => Buffer.from(value, "utf8").toString("base64");

const graphVersion = env("META_GRAPH_VERSION") || "v26.0";
const publicBaseUrl = env("SOCIAL_HUB_PUBLIC_BASE_URL") || "https://sourireplus.ch/social-hub";

const php = `<?php
declare(strict_types=1);

return [
    'api_key' => base64_decode('${b64(env("SOCIAL_HUB_API_KEY"))}', true),
    'graph_version' => base64_decode('${b64(graphVersion)}', true),
    'page_id' => base64_decode('${b64(env("META_PAGE_ID"))}', true),
    'page_access_token' => base64_decode('${b64(env("META_PAGE_ACCESS_TOKEN"))}', true),
    'instagram_user_id' => base64_decode('${b64(env("META_INSTAGRAM_USER_ID"))}', true),
    'public_base_url' => base64_decode('${b64(publicBaseUrl)}', true),
];
`;

await mkdir("out/config", { recursive: true });
await writeFile("out/config/social-hub.php", php, { mode: 0o600 });

console.log(
  JSON.stringify({
    socialHubConfigWritten: true,
    apiKeyConfigured: env("SOCIAL_HUB_API_KEY") !== "",
    facebookConfigured: env("META_PAGE_ID") !== "" && env("META_PAGE_ACCESS_TOKEN") !== "",
    instagramConfigured:
      env("META_INSTAGRAM_USER_ID") !== "" && env("META_PAGE_ACCESS_TOKEN") !== "",
    graphVersion,
  }),
);

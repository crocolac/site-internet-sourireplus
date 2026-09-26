import { mkdir, writeFile } from "node:fs/promises";

const env = (name) => process.env[name] ?? "";
const first = (...names) => names.map(env).find((value) => value !== "") ?? "";
const b64 = (value) => Buffer.from(value, "utf8").toString("base64");

const graphVersion = env("META_GRAPH_VERSION") || "v26.0";
const publicBaseUrl = env("SOCIAL_HUB_PUBLIC_BASE_URL") || "https://sourireplus.ch/social-hub";

const accounts = {
  pro: {
    label: env("META_PRO_LABEL") || "Compte pro",
    kind: "professional",
    page_id: first("META_PRO_PAGE_ID", "META_PAGE_ID"),
    page_access_token: first("META_PRO_PAGE_ACCESS_TOKEN", "META_PAGE_ACCESS_TOKEN"),
    instagram_user_id: first("META_PRO_INSTAGRAM_USER_ID", "META_INSTAGRAM_USER_ID"),
    instagram_account_type: env("META_PRO_INSTAGRAM_ACCOUNT_TYPE") || "",
  },
  private: {
    label: env("META_PRIVATE_LABEL") || "Compte privé",
    kind: env("META_PRIVATE_KIND") || "personal",
    page_id: env("META_PRIVATE_PAGE_ID"),
    page_access_token: env("META_PRIVATE_PAGE_ACCESS_TOKEN"),
    instagram_user_id: env("META_PRIVATE_INSTAGRAM_USER_ID"),
    instagram_account_type: env("META_PRIVATE_INSTAGRAM_ACCOUNT_TYPE") || "",
  },
};

const accountPhp = Object.entries(accounts)
  .map(([key, account]) => `
        '${key}' => [
            'label' => base64_decode('${b64(account.label)}', true),
            'kind' => base64_decode('${b64(account.kind)}', true),
            'page_id' => base64_decode('${b64(account.page_id)}', true),
            'page_access_token' => base64_decode('${b64(account.page_access_token)}', true),
            'instagram_user_id' => base64_decode('${b64(account.instagram_user_id)}', true),
            'instagram_account_type' => base64_decode('${b64(account.instagram_account_type)}', true),
        ],`)
  .join("\n");

const php = `<?php
declare(strict_types=1);

return [
    'api_key' => base64_decode('${b64(env("SOCIAL_HUB_API_KEY"))}', true),
    'graph_version' => base64_decode('${b64(graphVersion)}', true),
    'public_base_url' => base64_decode('${b64(publicBaseUrl)}', true),
    'accounts' => [
${accountPhp}
    ],
];
`;

await mkdir("out/config", { recursive: true });
await writeFile("out/config/social-hub.php", php, { mode: 0o600 });

console.log(
  JSON.stringify({
    socialHubConfigWritten: true,
    apiKeyConfigured: env("SOCIAL_HUB_API_KEY") !== "",
    accounts: Object.fromEntries(
      Object.entries(accounts).map(([key, account]) => [
        key,
        {
          label: account.label,
          facebookConfigured: account.page_id !== "" && account.page_access_token !== "",
          instagramConfigured:
            account.instagram_user_id !== "" && account.page_access_token !== "",
          kind: account.kind,
        },
      ]),
    ),
    graphVersion,
  }),
);

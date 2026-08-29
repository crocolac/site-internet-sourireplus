import type { MetadataRoute } from "next";

export const dynamic = "force-static";
import { SITE_URL } from "./site-data";

const routes = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/methode/", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/proprietaires/", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/acces/", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/journal/cafe-et-dents/", priority: 0.7, changeFrequency: "yearly" as const },
  { path: "/journal/brosse-electrique/", priority: 0.7, changeFrequency: "yearly" as const },
  { path: "/journal/casse-du-week-end/", priority: 0.7, changeFrequency: "yearly" as const },
  { path: "/mentions-legales/", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/protection-des-donnees/", priority: 0.3, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-29T00:00:00+02:00");
  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

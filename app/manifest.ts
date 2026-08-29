import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clinique Dentaire SourirePlus",
    short_name: "SourirePlus",
    description: "Clinique dentaire à Neuchâtel, fondée en 2008.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfbf7",
    theme_color: "#08253c",
    lang: "fr-CH",
    icons: [{ src: "/favicon.png", sizes: "192x192", type: "image/png" }],
  };
}

import type { Metadata } from "next";
import { JournalArticlePage } from "../JournalArticlePage";
import { coffeeArticle } from "../articles";

export const metadata: Metadata = {
  title: "Le café jaunit-il vraiment les dents ? | SourirePlus",
  description: "Le café colore-t-il les dents ? Une réponse légère, des explications simples et des conseils pratiques sans renoncer à l’espresso.",
  alternates: { canonical: "/journal/cafe-et-dents/" },
  openGraph: { title: "Le café jaunit-il vraiment les dents ?", description: "Une réponse légère et des conseils pratiques sans renoncer à l’espresso.", url: "/journal/cafe-et-dents/", type: "article" },
};

export default function CoffeeAndTeethPage() {
  return <JournalArticlePage article={coffeeArticle} />;
}

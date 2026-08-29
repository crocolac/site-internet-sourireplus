import type { Metadata } from "next";
import { JournalArticlePage } from "../JournalArticlePage";
import { electricArticle } from "../articles";

export const metadata: Metadata = {
  title: "Brosse électrique : meilleure, vraiment ? | SourirePlus",
  description: "La brosse électrique aide-t-elle vraiment ? Un mode d’emploi simple et amusant pour mieux brosser sans transformer la salle de bain en laboratoire.",
  alternates: { canonical: "/journal/brosse-electrique/" },
  openGraph: { title: "Brosse électrique : meilleure, vraiment ?", description: "Un mode d’emploi simple et amusant pour mieux brosser.", url: "/journal/brosse-electrique/", type: "article" },
};

export default function ElectricToothbrushPage() {
  return <JournalArticlePage article={electricArticle} />;
}

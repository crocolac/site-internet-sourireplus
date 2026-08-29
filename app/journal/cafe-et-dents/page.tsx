import type { Metadata } from "next";
import { JournalArticlePage } from "../JournalArticlePage";
import { coffeeArticle } from "../articles";

export const metadata: Metadata = {
  title: "Le café jaunit-il vraiment les dents ? | SourirePlus",
  description: "Le café colore-t-il les dents ? Une réponse légère, des explications simples et des conseils pratiques sans renoncer à l’espresso.",
};

export default function CoffeeAndTeethPage() {
  return <JournalArticlePage article={coffeeArticle} />;
}

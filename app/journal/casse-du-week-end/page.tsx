import type { Metadata } from "next";
import { JournalArticlePage } from "../JournalArticlePage";
import { weekendArticle } from "../articles";

export const metadata: Metadata = {
  title: "Pourquoi ça casse toujours le week-end | SourirePlus",
  description: "Dent cassée le week-end : pourquoi cela arrive, les bons réflexes et les signes qui nécessitent une prise en charge urgente.",
  alternates: { canonical: "/journal/casse-du-week-end/" },
  openGraph: { title: "Pourquoi ça casse toujours le week-end", description: "Les bons réflexes lorsqu’une dent casse et les signes d’une vraie urgence.", url: "/journal/casse-du-week-end/", type: "article" },
};

export default function WeekendBreakagePage() {
  return <JournalArticlePage article={weekendArticle} />;
}

import type { Metadata } from "next";
import { TreatmentPage } from "../TreatmentPage";

export const metadata: Metadata = {
  title: "Esthétique dentaire à Neuchâtel | SourirePlus",
  description: "Esthétique du sourire à Neuchâtel : blanchiment, restaurations esthétiques, facettes et stratégie globale avec une recherche de résultat naturel.",
  alternates: { canonical: "/esthetique-dentaire/" },
  openGraph: {
    title: "Esthétique dentaire à Neuchâtel | SourirePlus",
    description: "Une esthétique dentaire pensée pour rester naturelle, cohérente avec le visage et intégrée à la santé de la bouche.",
    url: "/esthetique-dentaire/",
  },
};

export default function EsthetiqueDentairePage() {
  return (
    <TreatmentPage
      serviceName="Esthétique dentaire"
      servicePath="/esthetique-dentaire/"
      eyebrow="Esthétique du sourire · Neuchâtel"
      title="Améliorer le sourire sans lui enlever"
      accent="ce qui le rend naturel."
      lead="L’esthétique dentaire n’est pas un catalogue de dents blanches. Nous partons de votre visage, de vos proportions, de la couleur, de l’alignement, des gencives, de la fonction et surtout de ce que vous souhaitez réellement changer."
      intro="Le bon traitement esthétique est celui qui répond à votre demande avec le minimum de transformation nécessaire, tout en restant cohérent avec la santé et la fonction de votre bouche."
      image="smile"
      highlights={[
        { title: "Naturel d’abord", text: "Les formes, les volumes et la couleur sont pensés pour s’intégrer au visage, pas pour imposer un sourire standard." },
        { title: "Le plus conservateur possible", text: "Selon l’indication, blanchiment, composite, alignement ou céramique sont comparés avant de choisir la solution." },
        { title: "Une vision globale", text: "Un projet esthétique durable tient compte des gencives, de l’occlusion, des restaurations existantes et de l’évolution dans le temps." },
      ]}
      situationsTitle="Projet esthétique"
      situationsIntro="L’esthétique peut concerner une seule dent ou l’ensemble du sourire. Le diagnostic sert notamment à savoir jusqu’où il faut — ou ne faut pas — intervenir."
      situations={[
        "Couleur jugée trop sombre ou irrégulière",
        "Dent fracturée, usée ou dont la forme ne vous convient plus",
        "Espaces, asymétries ou proportions à harmoniser",
        "Anciennes restaurations visibles ou vieillissantes",
        "Projet de facettes ou de restaurations céramiques à évaluer",
        "Envie d’améliorer le sourire sans savoir quel traitement choisir",
      ]}
      approachTitle="Commencer par votre ressenti."
      approachText="L’esthétique est l’un des six axes de la Méthode SourirePlus. Nous confrontons ce que vous voyez à ce que l’examen montre, puis nous cherchons la réponse la plus cohérente."
      steps={[
        { number: "01", title: "Écouter", text: "Identifier précisément ce que vous souhaitez changer et ce que vous voulez absolument préserver." },
        { number: "02", title: "Analyser", text: "Photos, scan 3D et examen clinique replacent la demande esthétique dans l’ensemble du sourire." },
        { number: "03", title: "Comparer", text: "Les options sont mises en balance selon leur invasivité, leur entretien et leur cohérence à long terme." },
        { number: "04", title: "Harmoniser", text: "Le traitement retenu vise un résultat lisible pour vous, mais discret pour les autres." },
      ]}
      noteTitle="L’esthétique n’est jamais isolée du reste de la bouche."
      noteText="Une couleur, une forme ou un alignement peuvent être améliorés de plusieurs façons. Le traitement global permet de choisir la solution qui respecte le mieux les tissus et les autres soins présents ou futurs."
      relatedHref="/traitement-global/"
      relatedLabel="Voir notre approche du traitement global"
      ctaTitle="Vous avez un projet de sourire ?"
      ctaText="Un bilan permet de transformer une envie parfois vague en options concrètes, comparables et compréhensibles."
    />
  );
}

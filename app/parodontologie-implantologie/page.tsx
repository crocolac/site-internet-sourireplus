import type { Metadata } from "next";
import { TreatmentPage } from "../TreatmentPage";

export const metadata: Metadata = {
  title: "Parodontologie et implantologie à Neuchâtel | SourirePlus",
  description: "Pôle parodontologie et implantologie SourirePlus à Neuchâtel, avec un spécialiste en parodontologie et implantologie pour les gencives, tissus de soutien et implants.",
  alternates: { canonical: "/parodontologie-implantologie/" },
  openGraph: {
    title: "Parodontologie & implantologie à Neuchâtel | SourirePlus",
    description: "Un pôle dédié aux gencives, aux tissus de soutien et à l’implantologie avec un spécialiste en parodontologie et implantologie.",
    url: "/parodontologie-implantologie/",
  },
};

export default function ParodontologieImplantologiePage() {
  return (
    <TreatmentPage
      serviceName="Parodontologie et implantologie"
      servicePath="/parodontologie-implantologie/"
      eyebrow="Parodontologie & implantologie · Neuchâtel"
      title="Préserver les tissus."
      accent="Reconstruire quand il le faut."
      lead="Notre pôle de parodontologie et implantologie s’appuie sur un spécialiste de ces disciplines. Il prend en charge les gencives, les tissus qui soutiennent les dents et, lorsqu’une dent ne peut plus être conservée, les solutions implantaires."
      intro="Un implant n’est jamais un traitement isolé. La santé des gencives, le volume osseux, l’entretien futur et l’intégration au reste de la bouche conditionnent la qualité du résultat dans le temps."
      image="digital"
      highlights={[
        { title: "Parodontologie", text: "Diagnostiquer et traiter les maladies des gencives et des tissus de soutien afin de préserver les dents et stabiliser la bouche." },
        { title: "Implantologie", text: "Planifier le remplacement d’une ou plusieurs dents lorsque l’implant constitue une solution pertinente." },
        { title: "Une même logique", text: "Santé parodontale, position de l’implant, restauration finale et maintenance sont pensés ensemble." },
      ]}
      situationsTitle="Parodontologie & implants"
      situationsIntro="Le pôle intervient aussi bien pour préserver les dents que pour préparer ou maintenir une solution implantaire."
      situations={[
        "Saignement, inflammation ou rétraction des gencives",
        "Déchaussement ou perte de soutien autour des dents",
        "Évaluation d’une dent au pronostic incertain",
        "Remplacement d’une dent absente ou non conservable",
        "Planification d’un implant dans un traitement global",
        "Maintenance et surveillance des implants dans le temps",
      ]}
      approachTitle="La reconstruction commence par les fondations."
      approachText="Avant de parler implant, il faut comprendre l’état des tissus et la place de la future dent dans l’ensemble de la bouche. Cette séquence limite les décisions isolées et facilite la maintenance."
      steps={[
        { number: "01", title: "Diagnostiquer", text: "Gencives, os, dents voisines et facteurs de risque sont évalués." },
        { number: "02", title: "Stabiliser", text: "La santé parodontale est prise en charge avant ou parallèlement au projet reconstructeur." },
        { number: "03", title: "Planifier", text: "Le projet implantaire est défini en fonction de la restauration finale et du traitement global." },
        { number: "04", title: "Maintenir", text: "Une surveillance spécifique des tissus et des implants accompagne le résultat dans le temps." },
      ]}
      noteTitle="Préserver et remplacer ne sont pas deux stratégies opposées."
      noteText="La décision dépend du pronostic de la dent, des tissus qui l’entourent, de la fonction et du projet global. Le rôle du spécialiste est précisément d’aider à choisir et à planifier cette transition."
      relatedHref="/traitement-global/"
      relatedLabel="Voir notre approche du traitement global"
      ctaTitle="Gencives fragiles, dent absente ou projet implantaire ?"
      ctaText="Un bilan permet d’évaluer les tissus, le pronostic des dents et les options de reconstruction."
    />
  );
}

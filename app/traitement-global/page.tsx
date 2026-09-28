import type { Metadata } from "next";
import { TreatmentPage } from "../TreatmentPage";

export const metadata: Metadata = {
  title: "Traitement global dentaire à Neuchâtel | SourirePlus",
  description: "Traitement global et réhabilitation orale à Neuchâtel : bilan numérique, priorités, planification par étapes et coordination des soins chez SourirePlus.",
  alternates: { canonical: "/traitement-global/" },
  openGraph: {
    title: "Traitement global dentaire à Neuchâtel | SourirePlus",
    description: "Quand plusieurs problèmes se croisent, SourirePlus construit un plan cohérent avant de traiter chaque dent séparément.",
    url: "/traitement-global/",
  },
};

export default function TraitementGlobalPage() {
  return (
    <TreatmentPage
      eyebrow="Traitement global · Neuchâtel"
      title="Traiter toute la bouche avec"
      accent="une seule logique."
      lead="Quand plusieurs dents, anciennes restaurations, gencives, fonction et esthétique se répondent, une succession de soins isolés ne suffit plus. Le traitement global commence par une vision d’ensemble, puis organise les priorités."
      intro="Notre objectif n’est pas de tout faire en même temps. Il est de savoir où l’on va, dans quel ordre, et pourquoi — avec un plan compréhensible qui peut se réaliser par étapes."
      image="digital"
      highlights={[
        { title: "Diagnostiquer avant d’additionner les soins", text: "Le jumeau numérique, les radios, l’examen clinique et vos attentes sont réunis avant de décider d’un traitement." },
        { title: "Hiérarchiser", text: "Urgent, essentiel, fonctionnel, esthétique : les priorités sont explicites afin que chaque décision prépare la suivante." },
        { title: "Construire dans le temps", text: "Une réhabilitation orale peut être organisée en phases, avec des objectifs mesurables et un suivi de la trajectoire." },
      ]}
      situationsTitle="Traitement global"
      situationsIntro="Cette approche devient particulièrement pertinente dès qu’un seul problème ne résume plus la situation."
      situations={[
        "Plusieurs dents abîmées, restaurées ou fragilisées",
        "Usure dentaire, perte de hauteur ou déséquilibre fonctionnel",
        "Anciennes couronnes, composites ou bridges à reprendre progressivement",
        "Dents manquantes associées à des besoins esthétiques ou fonctionnels",
        "Projet esthétique qui nécessite d’abord de sécuriser la santé et la fonction",
        "Soins différés à organiser dans un calendrier réaliste",
      ]}
      approachTitle="Un plan avant les actes."
      approachText="La méthode SourirePlus donne une direction commune aux différents traitements. Elle permet de visualiser l’état actuel, de définir les objectifs et de conserver un fil entre chaque étape."
      steps={[
        { number: "01", title: "Bilan", text: "Scan 3D, imagerie, examen et recueil de votre ressenti." },
        { number: "02", title: "Priorités", text: "Ce qui doit être traité maintenant, ce qui peut attendre et ce qui relève de votre projet." },
        { number: "03", title: "Séquençage", text: "Les soins sont organisés pour éviter les décisions contradictoires et les reprises inutiles." },
        { number: "04", title: "Suivi", text: "Le projet reste lisible dans le temps, y compris lorsque certaines étapes sont différées." },
      ]}
      noteTitle="Le traitement global est le prolongement naturel de la Méthode SourirePlus."
      noteText="Les six axes — alignement, caries, gencives, restaurations, fonction et esthétique — permettent de ne pas réduire la bouche au problème qui se voit ou qui fait mal aujourd’hui."
      relatedHref="/methode/"
      relatedLabel="Découvrir la Méthode SourirePlus"
      ctaTitle="Vous avez l’impression qu’il faut tout reprendre ?"
      ctaText="Commencez par un bilan. Nous organiserons ensemble ce qui est urgent, ce qui est important et ce qui peut être construit dans le temps."
    />
  );
}

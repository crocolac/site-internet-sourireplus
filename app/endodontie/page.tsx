import type { Metadata } from "next";
import { TreatmentPage } from "../TreatmentPage";

export const metadata: Metadata = {
  title: "Endodontie spécialisée à Neuchâtel | SourirePlus",
  description: "Endodontie à Neuchâtel : diagnostic des douleurs dentaires, traitement canalaire et retraitement pour conserver la dent lorsque son pronostic le permet.",
  alternates: { canonical: "/endodontie/" },
  openGraph: {
    title: "Endodontie spécialisée à Neuchâtel | SourirePlus",
    description: "Diagnostic, traitement canalaire et retraitement : une endodontie de précision au service de la conservation de la dent.",
    url: "/endodontie/",
  },
};

export default function EndodontiePage() {
  return (
    <TreatmentPage
      eyebrow="Endodontie spécialisée · Neuchâtel"
      title="Conserver la dent quand l’intérieur"
      accent="de la dent devient le problème."
      lead="L’endodontie concerne la pulpe et le système canalaire. Elle vise à comprendre l’origine d’une douleur ou d’une infection, à désinfecter l’intérieur de la dent et à la conserver lorsque son pronostic le permet."
      intro="Une douleur dentaire n’indique pas toujours la même cause. En endodontie, la qualité du diagnostic compte autant que le geste : traiter la bonne dent, pour la bonne raison, avec une stratégie de conservation."
      image="digital"
      highlights={[
        { title: "Diagnostiquer précisément", text: "Douleur spontanée, sensibilité persistante, infection ou lésion autour d’une racine demandent d’abord d’identifier l’origine du problème." },
        { title: "Traiter ou retraiter", text: "Selon la situation, l’indication peut concerner un premier traitement canalaire ou la reprise d’un traitement ancien." },
        { title: "Préserver quand c’est raisonnable", text: "L’objectif est de conserver la dent lorsqu’elle peut encore être restaurée et suivie avec un pronostic acceptable." },
      ]}
      situationsTitle="Quand consulter"
      situationsIntro="Certaines situations justifient une évaluation endodontique ciblée, notamment lorsque les symptômes persistent ou qu’un traitement antérieur pose question."
      situations={[
        "Douleur spontanée ou pulsatile d’une dent",
        "Sensibilité au chaud ou au froid qui persiste",
        "Gonflement, abcès ou épisode infectieux d’origine dentaire",
        "Dent nécrosée découverte lors d’un examen ou d’une radiographie",
        "Lésion persistante autour d’une racine déjà traitée",
        "Besoin d’évaluer un retraitement avant d’envisager une extraction",
      ]}
      approachTitle="Une spécialité au service de la conservation."
      approachText="Le traitement endodontique n’est pas une fin en soi. Il doit s’intégrer à la restauration de la dent, à sa fonction et au plan global de la bouche."
      steps={[
        { number: "01", title: "Diagnostic", text: "Examen clinique et imagerie adaptée pour relier les symptômes à la dent concernée." },
        { number: "02", title: "Désinfection", text: "Accès au système canalaire, nettoyage et désinfection selon l’anatomie et la situation clinique." },
        { number: "03", title: "Obturation", text: "Le système canalaire est obturé après préparation afin de permettre la poursuite de la restauration." },
        { number: "04", title: "Protection", text: "La dent est ensuite restaurée et suivie en fonction de sa fragilité, de sa fonction et de son pronostic." },
      ]}
      noteTitle="Sauver une dent n’a de sens que si elle peut ensuite servir durablement."
      noteText="C’est pourquoi l’endodontie est reliée au traitement global : état de la dent, quantité de tissu restant, restauration future, fonction et alternatives sont considérés ensemble avant la décision."
      relatedHref="/traitement-global/"
      relatedLabel="Voir notre approche du traitement global"
      ctaTitle="Une dent vous fait mal ou un ancien traitement pose question ?"
      ctaText="Pour une douleur aiguë, choisissez une urgence. Pour un diagnostic ou un retraitement, un bilan permet de préparer la suite."
    />
  );
}

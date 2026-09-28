import type { Metadata } from "next";
import { TreatmentPage } from "../TreatmentPage";

export const metadata: Metadata = {
  title: "Orthodontie enfant et adulte à Neuchâtel | SourirePlus",
  description: "Orthodontie enfants et adultes à Neuchâtel chez SourirePlus : alignement, fonction, croissance et stabilité du résultat dans le temps.",
  alternates: { canonical: "/orthodontie/" },
  openGraph: {
    title: "Orthodontie enfant & adulte à Neuchâtel | SourirePlus",
    description: "Une orthodontie pour les enfants comme pour les adultes, pensée autour de l’alignement, de la fonction et de la stabilité.",
    url: "/orthodontie/",
  },
};

export default function OrthodontiePage() {
  return (
    <TreatmentPage
      eyebrow="Orthodontie · Enfants et adultes"
      title="Aligner à tout âge avec"
      accent="une vision durable."
      lead="Notre pôle orthodontie prend en charge les enfants comme les adultes. L’objectif ne se limite pas à rendre les dents droites : croissance, fonction, esthétique et stabilité à long terme font partie de la décision."
      intro="Chez l’enfant, l’orthodontie accompagne la croissance et l’évolution de la dentition. Chez l’adulte, elle peut corriger un alignement, préparer une restauration ou s’intégrer à un traitement global."
      image="smile"
      highlights={[
        { title: "Orthodontie enfant", text: "Surveiller la croissance, l’éruption des dents et l’évolution de l’occlusion pour intervenir au moment utile." },
        { title: "Orthodontie adulte", text: "Corriger l’alignement ou la fonction, seule ou en préparation d’un projet esthétique, restaurateur ou implantaire." },
        { title: "Stabilité", text: "Le résultat se pense avec la contention, le suivi et les évolutions naturelles de la bouche au fil des années." },
      ]}
      situationsTitle="Orthodontie"
      situationsIntro="L’indication dépend de l’âge, de la croissance, de l’alignement, de la fonction et du projet global du patient."
      situations={[
        "Enfant avec encombrement ou problème d’éruption",
        "Surveillance de la croissance et de l’occlusion",
        "Adolescent nécessitant un alignement orthodontique",
        "Adulte souhaitant corriger l’alignement de ses dents",
        "Préparation orthodontique avant restauration ou implant",
        "Récidive d’un ancien traitement orthodontique",
      ]}
      approachTitle="Le bon moment compte autant que le bon appareil."
      approachText="La stratégie orthodontique varie fortement entre un enfant en croissance et un adulte. Le diagnostic permet de choisir quand intervenir, avec quel objectif et comment stabiliser le résultat."
      steps={[
        { number: "01", title: "Observer", text: "Alignement, croissance, occlusion et fonction sont analysés." },
        { number: "02", title: "Projeter", text: "Les objectifs sont définis selon l’âge et les besoins réels du patient." },
        { number: "03", title: "Aligner", text: "La technique est choisie en fonction de la situation clinique et du projet." },
        { number: "04", title: "Stabiliser", text: "Contention et suivi permettent de limiter la récidive et d’accompagner les changements futurs." },
      ]}
      noteTitle="L’orthodontie s’intègre à la trajectoire de la bouche."
      noteText="Chez l’enfant comme chez l’adulte, l’alignement influence la fonction, l’esthétique, l’entretien et parfois la possibilité de réaliser d’autres traitements dans de bonnes conditions."
      relatedHref="/traitement-global/"
      relatedLabel="Voir notre approche du traitement global"
      ctaTitle="Orthodontie pour votre enfant ou pour vous ?"
      ctaText="Un bilan permet de déterminer les objectifs, le bon moment pour intervenir et la place du traitement dans l’évolution de la bouche."
    />
  );
}

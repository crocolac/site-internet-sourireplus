import type { Metadata } from "next";
import { TreatmentPage } from "../TreatmentPage";

export const metadata: Metadata = {
  title: "Hygiène dentaire et suivi à Neuchâtel | SourirePlus",
  description: "Pôle hygiène et suivi SourirePlus : 3 hygiénistes et 2 assistantes en prophylaxie pour enfants et adultes, prévention, maintenance et suivi dans le temps.",
  alternates: { canonical: "/hygiene-suivi/" },
  openGraph: {
    title: "Hygiène dentaire et suivi à Neuchâtel | SourirePlus",
    description: "Une équipe dédiée à la prévention et au suivi : 3 hygiénistes et 2 assistantes en prophylaxie pour enfants et adultes.",
    url: "/hygiene-suivi/",
  },
};

export default function HygieneSuiviPage() {
  return (
    <TreatmentPage
      serviceName="Hygiène dentaire, prévention et suivi"
      servicePath="/hygiene-suivi/"
      eyebrow="Hygiène dentaire & suivi · Neuchâtel · Enfants et adultes"
      title="Prévenir aujourd’hui pour"
      accent="conserver demain."
      lead="Notre pôle hygiène et suivi réunit 3 hygiénistes et 2 assistantes en prophylaxie. Enfants comme adultes bénéficient d’un suivi adapté à leur âge, à leur risque et à leur histoire dentaire."
      intro="La prévention n’est pas un rendez-vous isolé : elle accompagne la bouche dans le temps. L’objectif est de détecter tôt les changements, maîtriser les facteurs de risque et préserver le résultat des traitements réalisés."
      image="smile"
      highlights={[
        { title: "Une équipe dédiée", text: "Trois hygiénistes et deux assistantes en prophylaxie assurent les rendez-vous de prévention, d’entretien et d’éducation à l’hygiène." },
        { title: "Enfants & adultes", text: "Les besoins évoluent avec l’âge : apprentissage chez l’enfant, prévention carieuse, contrôle gingival et maintenance à l’âge adulte." },
        { title: "Un vrai suivi", text: "Les contrôles sont adaptés au niveau de risque et à l’évolution observée plutôt qu’appliqués selon un calendrier identique pour tous." },
      ]}
      situationsTitle="Hygiène & prévention"
      situationsIntro="Le suivi régulier est utile à tous, mais devient particulièrement important lorsque le risque de carie, de maladie gingivale ou de récidive augmente."
      situations={[
        "Prévention et apprentissage de l’hygiène chez l’enfant",
        "Détartrage, contrôle de plaque et entretien chez l’adulte",
        "Surveillance des gencives et prévention parodontale",
        "Maintenance après traitement orthodontique, implantaire ou restaurateur",
        "Patients ayant de nombreuses restaurations ou antécédents de caries",
        "Adaptation de la fréquence de suivi selon le risque individuel",
      ]}
      approachTitle="Suivre plutôt que recommencer."
      approachText="Le pôle hygiène prolonge les traitements dans le temps. Il permet de repérer les changements avant qu’ils ne deviennent des problèmes importants et de conserver une continuité entre prévention, soins et maintenance."
      steps={[
        { number: "01", title: "Évaluer", text: "Hygiène, gencives, habitudes et facteurs de risque sont observés à chaque étape." },
        { number: "02", title: "Prévenir", text: "Conseils, prophylaxie et nettoyage sont adaptés à l’âge et à la situation." },
        { number: "03", title: "Surveiller", text: "Les évolutions sont comparées au fil des visites afin d’intervenir plus tôt si nécessaire." },
        { number: "04", title: "Maintenir", text: "Les résultats des soins sont protégés par un programme de suivi cohérent." },
      ]}
      noteTitle="La maintenance fait partie du traitement."
      noteText="Chez SourirePlus, la prévention et le suivi ne sont pas séparés du reste de la prise en charge : ils participent directement à la trajectoire à long terme de la bouche."
      relatedHref="/methode/"
      relatedLabel="Découvrir la Méthode SourirePlus"
      ctaTitle="Votre prochain soin peut être un rendez-vous de prévention."
      ctaText="Enfant ou adulte, nous adaptons le suivi à votre situation et à vos besoins."
    />
  );
}

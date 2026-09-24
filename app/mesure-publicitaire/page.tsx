import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesure publicitaire et votre choix | SourirePlus",
  alternates: { canonical: "/mesure-publicitaire/" },
};

export default function AdMeasurementInformation() {
  return (
    <main className="section-shell" style={{maxWidth:850,paddingTop:60,paddingBottom:80,lineHeight:1.8}}>
      <a href="/">← Retour à SourirePlus</a>
      <h1 style={{marginTop:25,marginBottom:24}}>Votre choix de mesure publicitaire</h1>
      <p>Lorsque vous arrivez par notre publicité ChatGPT, nous vous proposons une mesure facultative pour comprendre si cette publicité aide à prendre rendez-vous. Refuser n’affecte ni l’accès au site ni la réservation.</p>
      <h2>Ce qui est enregistré après votre accord</h2>
      <p>Un identifiant aléatoire de visite, la date de cette visite et votre choix sont utilisés. Le choix et l’identifiant expirent après 30 minutes dans le même onglet. Si vous créez une nouvelle demande pendant cette visite, le système interne de SourirePlus peut relier cet identifiant à la première confirmation de rendez-vous dans les 30 jours suivants, y compris après ouverture du lien SMS sur votre téléphone.</p>
      <p>L’envoi du SMS n’est pas compté comme une réservation. Les déplacements de rendez-vous ne créent pas de double compte et les annulations sont distinguées.</p>
      <h2>Une mesure interne, sans pixel tiers</h2>
      <p>Ce dispositif ne transmet à OpenAI ni votre nom, ni votre téléphone, ni votre adresse email, ni le motif de consultation ou une information clinique. Les statistiques sont consultables uniquement dans l’administration privée de la clinique. Le lien avec votre demande reste pseudonyme, et non anonyme, à l’intérieur de notre système.</p>
      <h2>Conservation et changement de choix</h2>
      <p>Les associations pseudonymes de mesure âgées de plus de 90 jours sont supprimées par lots lors du prochain nettoyage du tableau de bord. Une empreinte protégée et renouvelée chaque jour de l’adresse IP sert à limiter les abus ; elle expire après 48 heures et est supprimée au prochain nettoyage. Le dossier clinique et ses règles de conservation sont distincts.</p>
      <p>Le bouton « Mesure publicitaire » en bas de la page d’accueil permet de refuser les mesures suivantes pendant la session. Ce changement n’efface pas automatiquement les statistiques déjà enregistrées. Pour toute demande relative à vos données, contactez la clinique à <a href="mailto:info@sourireplus.ch">info@sourireplus.ch</a>.</p>
      <p><a href="/protection-des-donnees/">Consulter aussi notre page Protection des données</a></p>
    </main>
  );
}

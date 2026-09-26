import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mesure des visites et votre choix | SourirePlus",
  alternates: { canonical: "/mesure-publicitaire/" },
};

export default function AdMeasurementInformation() {
  return (
    <main className="section-shell" style={{maxWidth:850,paddingTop:60,paddingBottom:80,lineHeight:1.8}}>
      <a href="/">← Retour à SourirePlus</a>
      <h1 style={{marginTop:25,marginBottom:24}}>Votre choix de mesure des visites</h1>
      <p>Sur notre site, nous proposons une mesure facultative des visites et du parcours de réservation. Elle distingue les arrivées identifiées par notre publicité ChatGPT des autres visites. Refuser n’affecte ni l’accès au site ni la réservation. Aucun suivi de ce dispositif ne commence avant votre accord.</p>
      <h2>Ce qui est enregistré après votre accord</h2>
      <p>Un identifiant aléatoire, le canal d’arrivée, la date de la visite et celle du premier clic sur un bouton de réservation sont utilisés. Les clics répétés pendant la même session ne sont pas additionnés. Le choix et l’identifiant expirent après 30 minutes dans le même onglet. Les pages consultées et les champs du formulaire ne sont pas transmis à ce dispositif de mesure.</p>
      <p>Si vous créez une nouvelle demande pendant cette visite, le système interne de SourirePlus peut relier cet identifiant à la première confirmation de rendez-vous dans les 30 jours suivants, y compris après ouverture du lien SMS sur votre téléphone. L’envoi du SMS n’est pas une réservation. Les déplacements ne créent pas de double compte et les annulations sont distinguées.</p>
      <p>Les demandes provenant du site sans rattachement fiable sont présentées comme non attribuées, jamais automatiquement comme provenant de la publicité. Les rendez-vous pris uniquement par téléphone sont hors de ce suivi.</p>
      <h2>Une mesure interne, sans pixel tiers</h2>
      <p>Ce dispositif ne transmet à OpenAI ni votre nom, ni votre téléphone, ni votre adresse email, ni le motif de consultation ou une information clinique. Les statistiques sont consultables uniquement dans l’administration privée de la clinique. Le lien avec votre demande reste pseudonyme, et non anonyme, à l’intérieur de notre système.</p>
      <h2>Conservation et changement de choix</h2>
      <p>Les associations pseudonymes âgées de plus de 90 jours sont supprimées par lots lors du prochain nettoyage du tableau de bord. Une empreinte protégée et renouvelée chaque jour de l’adresse IP limite les abus ; elle expire après 48 heures et est supprimée au prochain nettoyage. Le dossier clinique et ses règles de conservation sont distincts.</p>
      <p>Le bouton « Mesure des visites » en bas des pages permet de refuser les mesures suivantes pendant la session. Cela n’efface pas automatiquement les événements déjà enregistrés. Pour toute demande relative à vos données, contactez la clinique à <a href="mailto:info@sourireplus.ch">info@sourireplus.ch</a>.</p>
      <p><a href="/protection-des-donnees/">Consulter aussi notre page Protection des données</a></p>
    </main>
  );
}

import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageShell } from "../InfoPageShell";
import {
  ADDRESS_LINE,
  EMAIL,
  LEGAL_NAME,
  POSTAL_LOCALITY,
} from "../site-data";

export const metadata: Metadata = {
  title: "Protection des données | Clinique Dentaire SourirePlus",
  description: "Comment SourirePlus traite les données du site, du téléphone, des SMS et de la prise de rendez-vous conformément au droit suisse.",
  alternates: { canonical: "/protection-des-donnees/" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <InfoPageShell>
      <section className="info-hero section-shell legal-hero privacy-hero">
        <div>
          <Link className="back-link" href="/"><ArrowLeft aria-hidden="true" /> Retour à l’accueil</Link>
          <p className="eyebrow">Confidentialité</p>
          <h1>Protection des données</h1>
          <p className="info-lead">Une information claire sur les données utilisées pour vous renseigner et organiser votre rendez-vous.</p>
        </div>
        <p className="legal-date">Dernière mise à jour<br /><strong>29 août 2026</strong></p>
      </section>

      <article className="legal-content privacy-content section-shell">
        <section>
          <span>01</span>
          <div>
            <h2>Responsable du traitement</h2>
            <p><strong>{LEGAL_NAME}</strong><br />{ADDRESS_LINE}<br />{POSTAL_LOCALITY}<br />Suisse</p>
            <p>Pour toute question ou demande relative à vos données : <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
          </div>
        </section>

        <section>
          <span>02</span>
          <div>
            <h2>Données traitées sur le site</h2>
            <p>Lors d’une demande ou de la récupération d’un rendez-vous, nous pouvons traiter :</p>
            <ul>
              <li>votre numéro de téléphone ;</li>
              <li>le choix « urgence » ou « bilan » et l’indication que vous êtes déjà patient ou non ;</li>
              <li>le code à cinq caractères, uniquement lorsqu’il est nécessaire pour rattacher un téléphone à un accès existant ;</li>
              <li>les informations techniques nécessaires à la sécurité, comme l’adresse IP, l’heure, le résultat d’une tentative et les journaux d’erreur ;</li>
              <li>les informations que vous nous transmettez volontairement par téléphone ou e-mail.</li>
            </ul>
            <p>Le formulaire public ne demande pas de description libre de votre état de santé. Les choix liés au rendez-vous peuvent néanmoins révéler une information concernant votre santé et sont traités avec une protection renforcée.</p>
          </div>
        </section>

        <section>
          <span>03</span>
          <div>
            <h2>Pourquoi ces données sont utilisées</h2>
            <ul>
              <li>créer la demande correspondant au type de rendez-vous choisi ;</li>
              <li>vous envoyer votre lien personnel de gestion par SMS ;</li>
              <li>retrouver et renvoyer un lien déjà créé ;</li>
              <li>éviter qu’un même téléphone obtienne plusieurs liens ou rendez-vous actifs ;</li>
              <li>protéger le service contre les erreurs, les abus et les tentatives automatisées ;</li>
              <li>respecter les obligations professionnelles, administratives et légales de la clinique.</li>
            </ul>
            <p>Le traitement repose sur votre demande de rendez-vous et la préparation de la relation de soins, sur les obligations applicables à la clinique et sur son intérêt légitime à sécuriser ses services. Lorsqu’un consentement est requis par la loi, il est demandé de manière spécifique.</p>
          </div>
        </section>

        <section>
          <span>04</span>
          <div>
            <h2>Destinataires et prestataires</h2>
            <p>Les données sont accessibles uniquement aux personnes autorisées de la clinique et, dans la mesure nécessaire, aux prestataires qui assurent le fonctionnement du service :</p>
            <ul>
              <li><strong>OVHcloud</strong>, pour l’hébergement du site et des applications ;</li>
              <li><strong>ClickSend, société du groupe Sinch</strong>, pour l’acheminement des SMS ;</li>
              <li>la plateforme de rendez-vous exploitée par SourirePlus sur <strong>mydentalpass.ch</strong> ;</li>
              <li>le service de formulaires Touch, lorsqu’un formulaire est associé au type de rendez-vous sélectionné ;</li>
              <li>les autorités ou professionnels habilités, lorsqu’une obligation légale l’exige.</li>
            </ul>
            <p>Certains prestataires de messagerie peuvent traiter des données dans d’autres pays. La clinique sélectionne et configure ses prestataires afin que ces communications reposent sur un niveau de protection adéquat ou des garanties contractuelles appropriées.</p>
          </div>
        </section>

        <section>
          <span>05</span>
          <div>
            <h2>Durée de conservation</h2>
            <p>Les données sont conservées uniquement pendant la durée nécessaire à la gestion du rendez-vous, à la continuité des soins, à la sécurité du système et aux obligations légales ou professionnelles applicables.</p>
            <p>Les demandes sans suite et les journaux purement techniques sont supprimés ou anonymisés lorsqu’ils ne sont plus utiles. Les données intégrées au dossier patient suivent les règles de conservation applicables aux dossiers médicaux.</p>
          </div>
        </section>

        <section>
          <span>06</span>
          <div>
            <h2>Cookies, mesure d’audience et carte</h2>
            <p>SourirePlus n’installe actuellement aucun outil publicitaire ni outil de mesure d’audience sur ce site. Aucun bandeau de consentement n’est donc nécessaire pour le fonctionnement actuel.</p>
            <p>La page Accès charge une carte du géoportail fédéral suisse. Lors de ce chargement, le service cartographique peut recevoir des informations techniques usuelles, notamment votre adresse IP et les caractéristiques de votre navigateur. Les liens vers Google Maps ou Facebook ne transmettent des données à ces services que lorsque vous les ouvrez.</p>
            <p>La note et le nombre d’avis affichés dans le bandeau proviennent de Google Maps Platform. La demande est effectuée par le serveur de SourirePlus&nbsp;: votre navigateur ne communique directement à Google ni votre adresse IP ni une donnée de rendez-vous pour cette fonction. Ces données ne sont pas mises en cache par SourirePlus. L’utilisation de Google Maps Platform est soumise aux <a href="https://cloud.google.com/maps-platform/terms" target="_blank" rel="noreferrer">conditions de Google Maps Platform</a> et aux <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">règles de confidentialité de Google</a>.</p>
          </div>
        </section>

        <section>
          <span>07</span>
          <div>
            <h2>Sécurité</h2>
            <p>La clinique applique des mesures techniques et organisationnelles adaptées : communications chiffrées, contrôle des accès, limitation des demandes, journalisation de sécurité, stockage protégé des numéros et liens personnels non affichés publiquement.</p>
            <p>Aucun système connecté à Internet ne peut toutefois offrir une sécurité absolue. En cas d’incident présentant un risque pour les personnes, la clinique applique les mesures et notifications prévues par le droit applicable.</p>
          </div>
        </section>

        <section>
          <span>08</span>
          <div>
            <h2>Vos droits</h2>
            <p>Dans les limites prévues par la Loi fédérale sur la protection des données, vous pouvez notamment demander si nous traitons des données vous concernant, obtenir les informations prévues par la loi, faire rectifier des données inexactes et demander leur suppression ou vous opposer à certains traitements lorsqu’aucune obligation ne commande leur conservation.</p>
            <p>Nous pouvons demander une preuve d’identité afin de ne pas communiquer des informations à une autre personne. Adressez votre demande à <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
            <p>Vous pouvez également consulter le site du <a href="https://www.edoeb.admin.ch/fr" target="_blank" rel="noreferrer">Préposé fédéral à la protection des données et à la transparence</a>.</p>
          </div>
        </section>

        <section>
          <span>09</span>
          <div>
            <h2>Mise à jour de cette déclaration</h2>
            <p>Cette déclaration est adaptée lorsque les services, les prestataires ou les exigences légales évoluent. La date de la version publiée figure en haut de la page.</p>
            <p>Les autres informations juridiques sont disponibles dans nos <Link href="/mentions-legales/">mentions légales</Link>.</p>
          </div>
        </section>
      </article>
    </InfoPageShell>
  );
}

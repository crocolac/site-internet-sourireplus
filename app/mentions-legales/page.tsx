import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageShell } from "../InfoPageShell";
import {
  ADDRESS_LINE,
  EMAIL,
  LEGAL_NAME,
  PHONE_DISPLAY,
  POSTAL_LOCALITY,
} from "../site-data";

export const metadata: Metadata = {
  title: "Mentions légales | Clinique Dentaire SourirePlus",
  description: "Éditeur, responsabilité, propriété intellectuelle et conditions d’utilisation du site sourireplus.ch.",
  alternates: { canonical: "/mentions-legales/" },
  robots: { index: true, follow: true },
};

export default function LegalNoticesPage() {
  return (
    <InfoPageShell>
      <section className="info-hero section-shell legal-hero">
        <div>
          <Link className="back-link" href="/"><ArrowLeft aria-hidden="true" /> Retour à l’accueil</Link>
          <p className="eyebrow">Informations juridiques</p>
          <h1>Mentions légales</h1>
          <p className="info-lead">Les informations essentielles sur l’éditeur du site et son utilisation.</p>
        </div>
        <p className="legal-date">Dernière mise à jour<br /><strong>29 août 2026</strong></p>
      </section>

      <article className="legal-content section-shell">
        <section>
          <span>01</span>
          <div>
            <h2>Éditeur du site</h2>
            <p><strong>{LEGAL_NAME}</strong><br />{ADDRESS_LINE}<br />{POSTAL_LOCALITY}<br />Suisse</p>
            <p>Téléphone : <a href="tel:+41327244020">{PHONE_DISPLAY}</a><br />E-mail : <a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
            <p>La société est inscrite au Registre du commerce du canton de Neuchâtel. La direction de la publication est assurée par la direction de la clinique.</p>
          </div>
        </section>

        <section>
          <span>02</span>
          <div>
            <h2>Hébergement et exploitation technique</h2>
            <p>Le site et les services techniques associés sont hébergés sur une infrastructure OVHcloud. Le module de prise de rendez-vous est exploité par la clinique sur le domaine mydentalpass.ch.</p>
            <p>Les prestataires techniques n’agissent que pour fournir leurs services et selon les instructions ou la configuration de la clinique.</p>
          </div>
        </section>

        <section>
          <span>03</span>
          <div>
            <h2>Informations de santé</h2>
            <p>Les contenus publiés sur ce site ont une finalité générale, pédagogique et informative. Ils ne remplacent ni un examen clinique, ni un diagnostic, ni une recommandation personnalisée d’un médecin-dentiste.</p>
            <p>En cas de douleur importante, traumatisme, gonflement, saignement ou difficulté à respirer ou à avaler, contactez sans délai un professionnel de santé ou les services d’urgence compétents.</p>
          </div>
        </section>

        <section>
          <span>04</span>
          <div>
            <h2>Propriété intellectuelle</h2>
            <p>La structure du site, les textes, la méthode SourirePlus, les graphiques, les éléments visuels et le logo sont protégés. Toute reproduction, adaptation ou diffusion au-delà de l’usage privé nécessite l’autorisation préalable de la clinique, sauf disposition légale contraire.</p>
            <p>Les marques, contenus et services de tiers restent la propriété de leurs titulaires respectifs.</p>
          </div>
        </section>

        <section>
          <span>05</span>
          <div>
            <h2>Liens externes et disponibilité</h2>
            <p>Le site peut renvoyer vers des services externes, notamment la cartographie, Facebook ou des sources médicales. La clinique ne contrôle pas en permanence leur contenu, leur disponibilité ni leurs pratiques de confidentialité.</p>
            <p>La note moyenne et le nombre d’avis sont fournis par Google Maps Platform et affichés avec son attribution. Leur utilisation est soumise aux <a href="https://cloud.google.com/maps-platform/terms" target="_blank" rel="noreferrer">conditions de Google Maps Platform</a>.</p>
            <p>Nous faisons notre possible pour maintenir des informations exactes et un service disponible, sans pouvoir garantir l’absence totale d’interruption ou d’erreur technique.</p>
          </div>
        </section>

        <section>
          <span>06</span>
          <div>
            <h2>Droit applicable</h2>
            <p>Le site est exploité depuis la Suisse. Sous réserve des règles impératives applicables, son utilisation est régie par le droit suisse.</p>
            <p>Pour comprendre le traitement des données personnelles, consultez notre <Link href="/protection-des-donnees/">déclaration de protection des données</Link>.</p>
          </div>
        </section>
      </article>
    </InfoPageShell>
  );
}

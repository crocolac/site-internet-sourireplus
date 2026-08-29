import {
  ArrowRight,
  Building2,
  CarFront,
  MapPin,
  Phone,
  TrainFront,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageShell } from "../InfoPageShell";
import { NeighborhoodMap } from "../NeighborhoodMap";
import {
  ADDRESS_LINE,
  MAPS_URL,
  PHONE_DISPLAY,
  PHONE_INTERNATIONAL,
  POSTAL_LOCALITY,
} from "../site-data";

export const metadata: Metadata = {
  title: "Accès et parking | Dentiste près de la gare de Neuchâtel | SourirePlus",
  description:
    "SourirePlus se trouve rue du Crêt-Taconnet 8a, à 2 minutes à pied de la gare de Neuchâtel. Parking patients au niveau -2, places 91 et 92.",
  alternates: { canonical: "/acces/" },
  openGraph: {
    title: "Accès à la Clinique Dentaire SourirePlus à Neuchâtel",
    description: "À 2 minutes de la gare. Parking patients au niveau -2, places 91 et 92.",
    url: "/acces/",
    type: "website",
  },
};

export default function AccessPage() {
  return (
    <InfoPageShell>
      <section className="info-hero section-shell access-hero">
        <div>
          <p className="eyebrow">Venir à la clinique</p>
          <h1>Tout près de la gare.<br /><em>Simple aussi en voiture.</em></h1>
          <p className="info-lead">
            La clinique se situe au {ADDRESS_LINE}, à deux minutes à pied de la gare de Neuchâtel. Deux places de parking sont réservées aux patients.
          </p>
          <div className="info-hero-actions">
            <a className="primary-cta" href={MAPS_URL} target="_blank" rel="noreferrer">
              <MapPin aria-hidden="true" /> Ouvrir l’itinéraire
            </a>
            <a className="secondary-cta" href={`tel:${PHONE_INTERNATIONAL}`}>
              <Phone aria-hidden="true" /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
        <div className="access-address-card">
          <span>Adresse</span>
          <strong>{ADDRESS_LINE}</strong>
          <p>{POSTAL_LOCALITY}<br />Suisse</p>
        </div>
      </section>

      <section className="section-shell access-map-section" aria-labelledby="map-title">
        <div className="access-map-heading">
          <div>
            <p className="eyebrow">Plan du quartier</p>
            <h2 id="map-title">SourirePlus, juste au-dessus de la gare.</h2>
          </div>
          <p>Repérez la tour vitrée de l’OFS, puis suivez les pointillés depuis la gare ou depuis notre parking patients jusqu’au numéro 8a.</p>
        </div>
        <NeighborhoodMap />
      </section>

      <section className="access-options">
        <div className="section-shell access-options-grid">
          <article>
            <TrainFront aria-hidden="true" />
            <span>01</span>
            <h2>Depuis la gare</h2>
            <p>La clinique se trouve à environ deux minutes à pied de la gare de Neuchâtel, rue du Crêt-Taconnet.</p>
          </article>
          <article>
            <CarFront aria-hidden="true" />
            <span>02</span>
            <h2>Parking patients</h2>
            <p>Entrez dans le parking de la rue du Crêt-Taconnet, descendez au niveau −2 et utilisez les places 91 ou 92.</p>
          </article>
          <article>
            <Building2 aria-hidden="true" />
            <span>03</span>
            <h2>À votre arrivée</h2>
            <p>Rejoignez le numéro 8a. Si vous avez besoin d’aide pour vous orienter, appelez-nous au {PHONE_DISPLAY}.</p>
          </article>
        </div>
      </section>

      <section className="method-cta section-shell">
        <div>
          <p className="eyebrow">Votre rendez-vous</p>
          <h2>Une arrivée facile, puis un parcours bien organisé.</h2>
          <p>Urgence ou bilan : choisissez votre rendez-vous depuis votre téléphone.</p>
        </div>
        <Link className="primary-cta" href="/#rendez-vous">Prendre mon RDV <ArrowRight aria-hidden="true" /></Link>
      </section>
    </InfoPageShell>
  );
}

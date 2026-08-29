import { CalendarDays, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ADDRESS_LINE,
  EMAIL,
  PHONE_DISPLAY,
  PHONE_INTERNATIONAL,
  POSTAL_LOCALITY,
} from "./site-data";

function Brand() {
  return (
    <Link className="brand" href="/" aria-label="SourirePlus — accueil">
      <span className="brand-emblem" aria-hidden="true" />
      <span className="brand-copy">
        <strong>SourirePlus</strong>
        <small>Clinique dentaire · Neuchâtel</small>
      </span>
    </Link>
  );
}

export function InfoPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="info-page">
      <div className="topline">
        <p><span /> Clinique Dentaire SourirePlus · Depuis 2008</p>
        <div>
          <a href={`tel:${PHONE_INTERNATIONAL}`}><Phone aria-hidden="true" /> {PHONE_DISPLAY}</a>
          <Link href="/acces/"><MapPin aria-hidden="true" /> À 2 minutes de la gare</Link>
        </div>
      </div>
      <header className="site-header info-header">
        <Brand />
        <nav className="desktop-nav" aria-label="Navigation principale">
          <Link href="/methode/">La méthode</Link>
          <Link href="/#soins">Les soins</Link>
          <Link href="/proprietaires/">Les propriétaires</Link>
          <Link href="/acces/">Accès</Link>
        </nav>
        <Link className="method-appointment" href="/#rendez-vous">
          <CalendarDays aria-hidden="true" /> Prendre rendez-vous
        </Link>
      </header>
      {children}
      <footer className="info-footer">
        <div className="section-shell info-footer-main">
          <Brand />
          <div>
            <strong>{ADDRESS_LINE}</strong>
            <span>{POSTAL_LOCALITY} · Suisse</span>
            <span>Gare à 2 min · Parking patients −2, places 91–92</span>
          </div>
          <div>
            <a href={`tel:${PHONE_INTERNATIONAL}`}>{PHONE_DISPLAY}</a>
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
        </div>
        <div className="section-shell info-footer-bottom">
          <span>© 2026 Clinique Dentaire SourirePlus SA</span>
          <nav aria-label="Informations légales">
            <Link href="/acces/">Accès</Link>
            <Link href="/mentions-legales/">Mentions légales</Link>
            <Link href="/protection-des-donnees/">Protection des données</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}


import { CalendarDays } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ADDRESS_LINE, EMAIL, PHONE_DISPLAY, PHONE_INTERNATIONAL, POSTAL_LOCALITY } from "./site-data";
import { SiteHeader, type HeaderLink } from "./SiteHeader";
import { Topline } from "./Topline";

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

export function InfoPageShell({ children, secondaryLinks = [] }: { children: ReactNode; secondaryLinks?: readonly HeaderLink[] }) {
  return (
    <main className="info-page">
      <Topline />
      <SiteHeader
        action={(
          <Link className="method-appointment" href="/#rendez-vous">
            <CalendarDays aria-hidden="true" /> Prendre rendez-vous
          </Link>
        )}
        className="info-header"
        secondaryLinks={secondaryLinks}
      />
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

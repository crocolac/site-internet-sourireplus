import { Menu } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type HeaderLink = {
  href: string;
  label: string;
};

const primaryLinks: readonly HeaderLink[] = [
  { href: "/", label: "La clinique" },
  { href: "/methode/", label: "La méthode" },
  { href: "/#soins", label: "Les soins" },
  { href: "/proprietaires/", label: "Les propriétaires" },
  { href: "/#journal", label: "Le journal" },
  { href: "/acces/", label: "Accès" },
];

function HeaderBrand({ homeHref }: { homeHref: string }) {
  return (
    <Link className="brand" href={homeHref} aria-label="SourirePlus — accueil">
      <span className="brand-emblem" aria-hidden="true" />
      <span className="brand-copy">
        <strong>SourirePlus</strong>
        <small>Clinique dentaire · Neuchâtel</small>
      </span>
    </Link>
  );
}

export function SiteHeader({
  action,
  secondaryLinks = [],
  className = "",
  homeHref = "/",
}: {
  action: ReactNode;
  secondaryLinks?: readonly HeaderLink[];
  className?: string;
  homeHref?: string;
}) {
  const classes = ["site-header", "site-header-tiered", className].filter(Boolean).join(" ");

  return (
    <header className={classes}>
      <div className="site-header-main">
        <HeaderBrand homeHref={homeHref} />
        <nav className="desktop-nav site-primary-nav" aria-label="Navigation principale">
          {primaryLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
        <div className="header-actions">
          {action}
          <details className="mobile-menu">
            <summary aria-label="Ouvrir le menu"><Menu aria-hidden="true" /></summary>
            <nav aria-label="Navigation mobile">
              <span className="mobile-menu-label">Navigation générale</span>
              {primaryLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
              {secondaryLinks.length ? <span className="mobile-menu-label">Dans cette page</span> : null}
              {secondaryLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
              <Link className="mobile-appointment-link" href="/#rendez-vous">Prendre rendez-vous</Link>
            </nav>
          </details>
        </div>
      </div>
      {secondaryLinks.length ? (
        <div className="site-subnav">
          <nav className="site-subnav-links" aria-label="Navigation dans la page">
            {secondaryLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

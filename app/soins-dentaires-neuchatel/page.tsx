import { Activity, ArrowRight, CalendarDays, HeartPulse, ShieldCheck, Sparkles, ScanLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageShell } from "../InfoPageShell";
import { SITE_URL } from "../site-data";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Soins dentaires à Neuchâtel | 6 pôles | SourirePlus",
  description:
    "Dentiste à Neuchâtel : traitement global, esthétique, endodontie, hygiène, parodontologie-implantologie et orthodontie enfants/adultes, à 2 min de la gare.",
  alternates: { canonical: "/soins-dentaires-neuchatel/" },
  openGraph: {
    title: "Soins dentaires à Neuchâtel | Clinique SourirePlus",
    description:
      "Six pôles coordonnés au même endroit, de la prévention aux traitements spécialisés, à deux minutes de la gare de Neuchâtel.",
    url: "/soins-dentaires-neuchatel/",
    type: "website",
  },
};

const services = [
  {
    title: "Traitement global",
    href: "/traitement-global/",
    icon: Activity,
    text: "Bilan, priorités et coordination des soins quand plusieurs problèmes doivent être traités dans une même logique.",
  },
  {
    title: "Esthétique dentaire",
    href: "/esthetique-dentaire/",
    icon: Sparkles,
    text: "Blanchiment, restaurations, facettes et harmonisation du sourire avec une approche naturelle et conservatrice.",
  },
  {
    title: "Endodontie spécialisée",
    href: "/endodontie/",
    icon: HeartPulse,
    text: "Diagnostic des douleurs, traitement canalaire et retraitement pour conserver la dent lorsque son pronostic le permet.",
  },
  {
    title: "Hygiène dentaire & suivi",
    href: "/hygiene-suivi/",
    icon: ShieldCheck,
    text: "Trois hygiénistes et deux assistantes en prophylaxie accompagnent enfants et adultes dans la prévention et la maintenance.",
  },
  {
    title: "Parodontologie & implantologie",
    href: "/parodontologie-implantologie/",
    icon: ScanLine,
    text: "Un spécialiste en parodontologie et implantologie pour les gencives, les tissus de soutien et les solutions implantaires.",
  },
  {
    title: "Orthodontie enfants & adultes",
    href: "/orthodontie/",
    icon: Activity,
    text: "Alignement, croissance, fonction et stabilité du résultat chez l’enfant, l’adolescent et l’adulte.",
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Clinique Dentaire SourirePlus", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Soins dentaires à Neuchâtel", item: `${SITE_URL}/soins-dentaires-neuchatel/` },
      ],
    },
    {
      "@type": "CollectionPage",
      "@id": `${SITE_URL}/soins-dentaires-neuchatel/#page`,
      name: "Soins dentaires à Neuchâtel",
      url: `${SITE_URL}/soins-dentaires-neuchatel/`,
      description:
        "Les six pôles de soins de la Clinique Dentaire SourirePlus à Neuchâtel.",
      about: services.map((service) => ({
        "@type": "Service",
        name: service.title,
        url: `${SITE_URL}${service.href}`,
        provider: { "@id": `${SITE_URL}/#clinic` },
        areaServed: { "@type": "AdministrativeArea", name: "Neuchâtel, Suisse" },
      })),
    },
  ],
};

export default function SoinsDentairesNeuchatelPage() {
  return (
    <InfoPageShell
      secondaryLinks={services.map((service) => ({ href: service.href, label: service.title }))}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <section className={styles.hero}>
        <div>
          <p className="eyebrow">Dentiste à Neuchâtel · 6 pôles coordonnés</p>
          <h1>Des soins dentaires spécialisés,<br /><em>une seule équipe autour de vous.</em></h1>
          <p className={styles.lead}>
            SourirePlus réunit à Neuchâtel la prévention, l’orthodontie, l’endodontie, la parodontologie–implantologie, l’esthétique et le traitement global. L’intérêt n’est pas d’additionner les spécialités&nbsp;: c’est de les coordonner lorsqu’un même patient en a besoin.
          </p>
          <div className={styles.actions}>
            <Link className="primary-cta" href="/#rendez-vous">
              <CalendarDays aria-hidden="true" /> Prendre rendez-vous
            </Link>
            <Link className="inline-link" href="/methode/">
              Découvrir la Méthode SourirePlus <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className={styles.localCard}>
          <strong>Clinique Dentaire SourirePlus</strong>
          <span>Rue du Crêt-Taconnet 8a · 2000 Neuchâtel</span>
          <span>À 2 minutes à pied de la gare</span>
          <span>Parking patients · niveau −2 · places 91–92</span>
          <Link href="/acces/">Accès à la clinique <ArrowRight aria-hidden="true" /></Link>
        </aside>
      </section>

      <section className={styles.services} aria-labelledby="poles-title">
        <div className={styles.shell}>
          <div className={styles.heading}>
            <div>
              <p className="eyebrow">Nos soins dentaires à Neuchâtel</p>
              <h2 id="poles-title">Six pôles.<br /><em>Une prise en charge coordonnée.</em></h2>
            </div>
            <p>
              Chaque pôle possède son domaine de compétence. Le dossier, le diagnostic et les objectifs restent communs afin d’éviter les décisions contradictoires et de conserver une vision à long terme.
            </p>
          </div>
          <div className={styles.grid}>
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <article key={service.href}>
                  <div className={styles.cardTop}><span>0{index + 1}</span><Icon aria-hidden="true" /></div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <Link href={service.href}>
                    {service.title} à Neuchâtel <ArrowRight aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.guide}>
        <div className={styles.shell}>
          <div className={styles.guideIntro}>
            <p className="eyebrow">Quel rendez-vous choisir ?</p>
            <h2>Vous n’avez pas besoin de connaître<br /><em>le nom de la spécialité.</em></h2>
          </div>
          <div className={styles.guideGrid}>
            <article>
              <h3>Douleur ou infection</h3>
              <p>Une douleur aiguë peut nécessiter un rendez-vous d’urgence. Si la cause vient de l’intérieur de la dent, le pôle endodontie prend le relais.</p>
              <Link href="/endodontie/">Endodontie à Neuchâtel <ArrowRight aria-hidden="true" /></Link>
            </article>
            <article>
              <h3>Plusieurs problèmes à organiser</h3>
              <p>Lorsque plusieurs dents, restaurations, gencives ou objectifs esthétiques se croisent, le traitement global permet de hiérarchiser avant de commencer.</p>
              <Link href="/traitement-global/">Traitement global <ArrowRight aria-hidden="true" /></Link>
            </article>
            <article>
              <h3>Prévention et contrôle</h3>
              <p>Pour l’enfant comme pour l’adulte, notre équipe d’hygiène et prophylaxie adapte la fréquence et le contenu du suivi au risque individuel.</p>
              <Link href="/hygiene-suivi/">Hygiène dentaire &amp; suivi <ArrowRight aria-hidden="true" /></Link>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.local}>
        <div className={styles.shell}>
          <div>
            <p className="eyebrow">Une clinique locale, un suivi dans le temps</p>
            <h2>Dentiste à Neuchâtel depuis 2008.</h2>
          </div>
          <p>
            SourirePlus est installée à proximité immédiate de la gare de Neuchâtel. La présence de plusieurs pôles au sein de la même clinique permet de conserver une continuité entre le bilan, les soins spécialisés, la maintenance et les contrôles ultérieurs. Pour les patients qui viennent en train, la clinique est à environ deux minutes à pied&nbsp;; pour ceux qui viennent en voiture, deux places de parking sont réservées aux patients.
          </p>
        </div>
      </section>
    </InfoPageShell>
  );
}

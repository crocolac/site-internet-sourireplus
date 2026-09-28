import { ArrowRight, CalendarDays, Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { InfoPageShell } from "./InfoPageShell";
import styles from "./TreatmentPage.module.css";

type Highlight = {
  title: string;
  text: string;
};

type Step = {
  number: string;
  title: string;
  text: string;
};

export type TreatmentPageProps = {
  eyebrow: string;
  title: string;
  accent: string;
  lead: string;
  intro: string;
  image: "smile" | "digital";
  highlights: readonly Highlight[];
  situationsTitle: string;
  situationsIntro: string;
  situations: readonly string[];
  approachTitle: string;
  approachText: string;
  steps: readonly Step[];
  noteTitle: string;
  noteText: string;
  relatedHref: string;
  relatedLabel: string;
  ctaTitle: string;
  ctaText: string;
};

const expertiseLinks = [
  { href: "/traitement-global/", label: "Traitement global" },
  { href: "/esthetique-dentaire/", label: "Esthétique" },
  { href: "/endodontie/", label: "Endodontie" },
] as const;

export function TreatmentPage({
  eyebrow,
  title,
  accent,
  lead,
  intro,
  image,
  highlights,
  situationsTitle,
  situationsIntro,
  situations,
  approachTitle,
  approachText,
  steps,
  noteTitle,
  noteText,
  relatedHref,
  relatedLabel,
  ctaTitle,
  ctaText,
}: TreatmentPageProps) {
  return (
    <InfoPageShell secondaryLinks={expertiseLinks}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}<br /><em>{accent}</em></h1>
          <p className={styles.lead}>{lead}</p>
          <div className={styles.heroActions}>
            <Link className="primary-cta" href="/#rendez-vous">
              <CalendarDays aria-hidden="true" /> Prendre rendez-vous
            </Link>
            <Link className="inline-link" href="/methode/">
              Comprendre notre méthode <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={image === "smile" ? styles.smileImage : styles.digitalImage} role="img" aria-label="SourirePlus — prise en charge dentaire à Neuchâtel" />
          <div className={styles.heroBadge}>
            <Sparkles aria-hidden="true" />
            <span><strong>Voir l’ensemble</strong><small>Comprendre avant de décider</small></span>
          </div>
        </div>
      </section>

      <section className={styles.introBand}>
        <div className={styles.shell}>
          <p>{intro}</p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.shell}>
          <div className={styles.highlightGrid}>
            {highlights.map((item, index) => (
              <article key={item.title}>
                <span>0{index + 1}</span>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.altSection}>
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <p className="eyebrow">{situationsTitle}</p>
            <h2>Quand cette approche<br /><em>devient particulièrement utile.</em></h2>
            <p>{situationsIntro}</p>
          </div>
          <div className={styles.situationGrid}>
            {situations.map((item) => (
              <div key={item}><Check aria-hidden="true" /><span>{item}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.shell}>
          <div className={styles.processHeading}>
            <div>
              <p className="eyebrow">Notre façon de travailler</p>
              <h2>{approachTitle}</h2>
            </div>
            <p>{approachText}</p>
          </div>
          <div className={styles.processGrid}>
            {steps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.noteSection}>
        <div className={styles.shell}>
          <div className={styles.noteCard}>
            <div>
              <p className="eyebrow">SourirePlus</p>
              <h2>{noteTitle}</h2>
              <p>{noteText}</p>
            </div>
            <Link className="inline-link" href={relatedHref}>{relatedLabel} <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.shell}>
          <div>
            <p className="eyebrow light">Parlons de votre situation</p>
            <h2>{ctaTitle}</h2>
            <p>{ctaText}</p>
          </div>
          <Link className="primary-cta" href="/#rendez-vous">
            <CalendarDays aria-hidden="true" /> Prendre mon RDV
          </Link>
        </div>
      </section>
    </InfoPageShell>
  );
}

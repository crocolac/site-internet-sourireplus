import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Phone,
} from "lucide-react";
import Link from "next/link";
import type { JournalArticle } from "./articles";

export function JournalArticlePage({ article }: { article: JournalArticle }) {
  const Icon = article.icon;

  return (
    <main className={`journal-page journal-theme-${article.theme}`}>
      <div className="topline">
        <p><span /> Clinique Dentaire SourirePlus · Depuis 2008</p>
        <div>
          <a href="tel:+41327244020"><Phone aria-hidden="true" /> 032 724 40 20</a>
          <Link href="/acces/">Neuchâtel, à 2 minutes de la gare</Link>
        </div>
      </div>

      <header className="site-header journal-header">
        <Link className="brand" href="/" aria-label="SourirePlus — accueil">
          <span className="brand-emblem" aria-hidden="true" />
          <span className="brand-copy">
            <strong>SourirePlus</strong>
            <small>Clinique dentaire · Neuchâtel</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigation du journal">
          <Link href="/methode/">La méthode</Link>
          <Link href="/#soins">Les soins</Link>
          <Link href="/#journal">Le journal</Link>
        </nav>
        <Link className="method-appointment" href="/#rendez-vous"><CalendarDays aria-hidden="true" /> Prendre rendez-vous</Link>
      </header>

      <section className="journal-article-hero section-shell">
        <div className="journal-hero-copy">
          <Link className="back-link" href="/#journal"><ArrowLeft aria-hidden="true" /> Retour au journal</Link>
          <p className="eyebrow">{article.category}</p>
          <h1>{article.title}</h1>
          <p className="journal-hero-lead">{article.intro}</p>
          <div className="journal-reading-time"><Clock3 aria-hidden="true" /> {article.readTime} de lecture · conseils sérieux, ton léger</div>
        </div>
        <div className="journal-hero-visual">
          <div className="journal-hero-image" role="img" aria-label="Composition éditoriale SourirePlus autour de la santé dentaire" />
          <div className="journal-hero-badge" aria-hidden="true"><Icon /></div>
          <p>{article.heroLine}</p>
        </div>
      </section>

      <article className="journal-story section-shell">
        <p className="journal-opening">{article.opening}</p>

        <div className="journal-section-list">
          {article.sections.map((section) => (
            <section className="journal-story-section" key={section.number}>
              <div className="journal-section-number">{section.number}</div>
              <div className="journal-section-copy">
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => <li key={bullet}><Check aria-hidden="true" /> <span>{bullet}</span></li>)}
                  </ul>
                ) : null}
                {section.aside ? <aside><Icon aria-hidden="true" /><p>{section.aside}</p></aside> : null}
              </div>
            </section>
          ))}
        </div>

        <section className="journal-summary" aria-labelledby="journal-summary-title">
          <div>
            <p className="eyebrow light">À retenir</p>
            <h2 id="journal-summary-title">{article.summaryTitle}</h2>
          </div>
          <ul>
            {article.summary.map((item) => <li key={item}><Check aria-hidden="true" /><span>{item}</span></li>)}
          </ul>
        </section>

        {article.alert ? (
          <section className="journal-alert">
            <Icon aria-hidden="true" />
            <div><h2>{article.alert.title}</h2><p>{article.alert.text}</p></div>
          </section>
        ) : null}

        <div className="journal-story-footer">
          <div className="journal-sources">
            <span>Pour aller plus loin</span>
            {article.sources.map((source) => (
              <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}</a>
            ))}
          </div>
          <p>Ces informations sont générales et ne remplacent pas un examen clinique.</p>
        </div>
      </article>

      <section className="journal-next">
        <Link className="section-shell" href={article.next.href}>
          <span><small>Article suivant · {article.next.category}</small><strong>{article.next.title}</strong></span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section className="method-cta section-shell">
        <div>
          <p className="eyebrow">Une question moins théorique ?</p>
          <h2>Votre bouche mérite une réponse qui lui ressemble.</h2>
          <p>Un bilan permet de distinguer la petite histoire amusante du vrai sujet à surveiller.</p>
        </div>
        <Link className="primary-cta" href="/#rendez-vous"><CalendarDays aria-hidden="true" /> Prendre rendez-vous</Link>
      </section>

      <footer className="method-footer">
        <div className="section-shell">
          <Link className="brand" href="/" aria-label="SourirePlus — accueil">
            <span className="brand-emblem" aria-hidden="true" />
            <span className="brand-copy"><strong>SourirePlus</strong><small>Clinique dentaire · Neuchâtel</small></span>
          </Link>
          <p>Rue du Crêt-Taconnet 8a · 2000 Neuchâtel · 032 724 40 20</p>
          <nav className="method-footer-links" aria-label="Informations pratiques">
            <Link href="/acces/">Accès</Link>
            <Link href="/mentions-legales/">Mentions légales</Link>
            <Link href="/protection-des-donnees/">Protection des données</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

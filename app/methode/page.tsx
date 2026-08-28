import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ScanLine,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "L’âge de votre bouche | Méthode SourirePlus",
  description:
    "Découvrez la méthode SourirePlus : courbes de santé bucco-dentaire, âge de la bouche, jumeau numérique et trajectoire personnalisée.",
};

const stages = [
  { age: "20", title: "Mettre en place", text: "Construire les bons repères et une base durable." },
  { age: "30", title: "Séduire", text: "Concilier santé, confiance et esthétique naturelle." },
  { age: "40", title: "Préserver", text: "Détecter les évolutions avant qu’elles ne deviennent des problèmes." },
  { age: "50", title: "Préparer", text: "Renforcer ce qui doit l’être pour aborder la suite sereinement." },
  { age: "70", title: "Profiter", text: "Conserver une bouche confortable, fonctionnelle et facile à entretenir." },
];

export default function MethodePage() {
  return (
    <main className="method-page">
      <div className="topline">
        <p><span /> Clinique Dentaire SourirePlus · Depuis 2008</p>
        <div>
          <a href="tel:+41327244020">032 724 40 20</a>
          <Link href="/#contact">Neuchâtel, près de la gare</Link>
        </div>
      </div>

      <header className="site-header method-header">
        <Link className="brand" href="/" aria-label="SourirePlus — accueil">
          <span className="brand-emblem" aria-hidden="true" />
          <span className="brand-copy">
            <strong>SourirePlus</strong>
            <small>Clinique dentaire · Neuchâtel</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigation de la méthode">
          <a href="#principe">Le principe</a>
          <a href="#courbes">Les courbes</a>
          <a href="#jumeau">Le jumeau numérique</a>
        </nav>
        <Link className="method-appointment" href="/#rendez-vous"><CalendarDays aria-hidden="true" /> Prendre rendez-vous</Link>
      </header>

      <section className="method-hero section-shell">
        <div>
          <Link className="back-link" href="/"><ArrowLeft aria-hidden="true" /> Retour à la clinique</Link>
          <p className="eyebrow">La méthode SourirePlus</p>
          <h1>Quel âge a vraiment <em>votre bouche&nbsp;?</em></h1>
          <p className="method-lead">
            L’âge civil ne dit pas tout. Certaines bouches sont en avance, d’autres ont été remarquablement préservées. Notre méthode transforme l’examen, les images et votre jumeau numérique en trajectoires compréhensibles.
          </p>
          <div className="method-hero-points">
            <span><Check aria-hidden="true" /> Comprendre où vous en êtes</span>
            <span><Check aria-hidden="true" /> Choisir où vous voulez aller</span>
          </div>
        </div>
        <div className="curve-panel" aria-labelledby="curve-title">
          <div className="curve-panel-head">
            <span>Exemple de lecture</span>
            <strong id="curve-title">Quatre dimensions, une trajectoire</strong>
          </div>
          <svg viewBox="0 0 560 310" role="img" aria-labelledby="curve-svg-title curve-svg-desc">
            <title id="curve-svg-title">Illustration des courbes de la méthode SourirePlus</title>
            <desc id="curve-svg-desc">Quatre courbes illustratives représentent les gencives, les dents, la fonction et l’esthétique entre 20 et 70 ans.</desc>
            <g className="curve-grid">
              <line x1="58" y1="52" x2="530" y2="52" />
              <line x1="58" y1="112" x2="530" y2="112" />
              <line x1="58" y1="172" x2="530" y2="172" />
              <line x1="58" y1="232" x2="530" y2="232" />
              <line x1="58" y1="270" x2="530" y2="270" />
            </g>
            <path className="curve-line curve-one" d="M58 72 C150 64, 205 88, 292 78 S440 70, 530 94" />
            <path className="curve-line curve-two" d="M58 115 C145 95, 214 118, 292 121 S433 103, 530 130" />
            <path className="curve-line curve-three" d="M58 165 C145 180, 215 149, 292 160 S438 190, 530 173" />
            <path className="curve-line curve-four" d="M58 224 C150 204, 208 220, 292 205 S430 215, 530 190" />
            <g className="curve-now">
              <line x1="330" y1="35" x2="330" y2="270" />
              <circle cx="330" cy="75" r="6" />
              <circle cx="330" cy="117" r="6" />
              <circle cx="330" cy="169" r="6" />
              <circle cx="330" cy="199" r="6" />
              <text x="330" y="292" textAnchor="middle">aujourd’hui</text>
            </g>
            <g className="curve-ages">
              <text x="58" y="292">20</text>
              <text x="176" y="292">30</text>
              <text x="294" y="292">40</text>
              <text x="412" y="292">50</text>
              <text x="520" y="292">70</text>
            </g>
          </svg>
          <div className="curve-legend">
            <span><i className="legend-one" /> Gencives</span>
            <span><i className="legend-two" /> Dents</span>
            <span><i className="legend-three" /> Fonction</span>
            <span><i className="legend-four" /> Esthétique</span>
          </div>
          <small>Visualisation pédagogique — chaque bilan est individuel.</small>
        </div>
      </section>

      <section className="method-principle" id="principe">
        <div className="section-shell">
          <div className="method-section-title">
            <p className="eyebrow light">Un bilan qui donne une direction</p>
            <h2>Une note seule ne suffit pas.<br /><em>Il faut comprendre la courbe.</em></h2>
          </div>
          <div className="method-steps">
            <article>
              <span>01</span><ScanLine aria-hidden="true" />
              <h3>Observer</h3>
              <p>L’examen clinique, les photographies et le scan 3D donnent une représentation complète de la situation.</p>
            </article>
            <article>
              <span>02</span><Activity aria-hidden="true" />
              <h3>Situer</h3>
              <p>Chaque dimension de la bouche est comparée à des repères adaptés, sans masquer ses forces ni ses fragilités.</p>
            </article>
            <article>
              <span>03</span><ArrowRight aria-hidden="true" />
              <h3>Projeter</h3>
              <p>Les options sont évaluées selon leur effet probable à court terme, mais aussi pour les dix ou vingt prochaines années.</p>
            </article>
            <article>
              <span>04</span><ShieldCheck aria-hidden="true" />
              <h3>Suivre</h3>
              <p>Les contrôles et la maintenance vérifient que la bouche reste sur la trajectoire choisie.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="life-curves section-shell" id="courbes">
        <div className="method-section-title dark-title">
          <p className="eyebrow">Les âges de la bouche</p>
          <h2>À chaque période,<br /><em>un objectif différent.</em></h2>
          <p>La méthode adapte les priorités au moment de la vie. Elle ne promet pas de prédire l’avenir&nbsp;: elle aide à choisir une direction cohérente.</p>
        </div>
        <div className="stage-grid">
          {stages.map((stage) => (
            <article key={stage.age}>
              <strong>{stage.age}<small> ans</small></strong>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="digital-twin" id="jumeau">
        <div className="section-shell digital-twin-grid">
          <div className="twin-orbit" aria-hidden="true">
            <div className="twin-ring twin-ring-one" />
            <div className="twin-ring twin-ring-two" />
            <ScanLine />
            <span>3D</span>
          </div>
          <div>
            <p className="eyebrow light">La nouvelle dentisterie</p>
            <h2>Le jumeau numérique devient votre point de comparaison.</h2>
            <p>
              Votre bouche est enregistrée en 3D à un instant précis. Lors des contrôles, les modèles peuvent être comparés pour rendre visibles des évolutions parfois imperceptibles&nbsp;: usure, mouvements, restaurations ou changements des tissus.
            </p>
            <ul>
              <li><Check aria-hidden="true" /> Une situation de départ mémorisée</li>
              <li><Check aria-hidden="true" /> Des explications visuelles et partagées</li>
              <li><Check aria-hidden="true" /> Un suivi intégré aux courbes SourirePlus</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="method-cta section-shell">
        <div>
          <p className="eyebrow">Votre point de départ</p>
          <h2>Découvrir l’âge de votre bouche commence par un bilan.</h2>
          <p>La méthode est un outil clinique et pédagogique SourirePlus. Elle complète l’examen du praticien et ne le remplace jamais.</p>
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
        </div>
      </footer>
    </main>
  );
}

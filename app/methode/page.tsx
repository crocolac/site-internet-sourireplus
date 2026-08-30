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
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { SiteHeader } from "../SiteHeader";
import { Topline } from "../Topline";

export const metadata: Metadata = {
  title: "L’âge de votre bouche | Méthode SourirePlus",
  description:
    "Découvrez les six courbes de population concernée de la méthode SourirePlus : alignement, caries, gencives, restaurations, fonction et esthétique.",
  alternates: { canonical: "/methode/" },
  openGraph: {
    title: "L’âge de votre bouche | Méthode SourirePlus",
    description: "Six courbes pour comprendre à quels âges chaque sujet dentaire concerne le plus de personnes.",
    url: "/methode/",
    type: "article",
  },
};

type CurvePoint = readonly [age: number, population: number];

type CurveDomain = {
  number: string;
  slug: string;
  title: string;
  subtitle: string;
  color: string;
  smoothing: number;
  points: readonly CurvePoint[];
  highlights: readonly number[];
  directions: readonly { age: string; label: string }[];
  shape: string;
  meaning: string;
  question: string;
};

const stages = [
  { age: "20", title: "Mettre en place", text: "Construire les bons repères et une base durable." },
  { age: "30", title: "Séduire", text: "Concilier santé, confiance et esthétique naturelle." },
  { age: "40", title: "Préserver", text: "Détecter les évolutions avant qu’elles ne deviennent des problèmes." },
  { age: "50", title: "Préparer", text: "Renforcer ce qui doit l’être pour aborder la suite sereinement." },
  { age: "70", title: "Profiter", text: "Conserver une bouche confortable, fonctionnelle et facile à entretenir." },
];

const curveDomains: readonly CurveDomain[] = [
  {
    number: "01",
    slug: "alignement",
    title: "Alignement",
    subtitle: "Orthodontie, récidives et migrations",
    color: "#1473e6",
    smoothing: 0.35,
    points: [[10, 30], [15, 50], [20, 25], [30, 5], [41, 11], [50, 25], [60, 35], [65, 40], [70, 48], [80, 60]],
    highlights: [15, 30, 50],
    directions: [
      { age: "10–15 ans", label: "Pic orthodontique" },
      { age: "15–30 ans", label: "Fort recul" },
      { age: "Après 41 ans", label: "Remontée continue" },
    ],
    shape:
      "La population concernée culmine pendant l’orthodontie adolescente, atteint un creux chez le jeune adulte, puis augmente régulièrement à partir du milieu de vie.",
    meaning:
      "La première vague correspond aux traitements de croissance. La seconde traduit les récidives, les migrations dentaires et les nouveaux traitements réalisés plus tard dans la vie.",
    question: "Vos dents ont-elles bougé depuis votre traitement orthodontique ou depuis vos vingt ans ?",
  },
  {
    number: "02",
    slug: "caries",
    title: "Caries",
    subtitle: "Caries actives, risque, récidives et racines",
    color: "#e3262e",
    smoothing: 0.42,
    points: [[10, 35], [15, 30], [20, 15], [29, 11], [39, 41], [50, 23], [60, 26], [66, 30], [73, 39], [80, 76]],
    highlights: [29, 39, 73],
    directions: [
      { age: "10–29 ans", label: "Premier recul" },
      { age: "Vers 39 ans", label: "Seconde vague" },
      { age: "Après 73 ans", label: "Hausse accélérée" },
    ],
    shape:
      "Après une première vague chez les jeunes et un creux vers 30 ans, une seconde vague apparaît autour de 40 ans. Après un repli vers 50 ans, la proportion concernée remonte progressivement puis très fortement vers 80 ans.",
    meaning:
      "Les caries secondaires et radiculaires, la sécheresse buccale et la polymédication expliquent notamment la hausse tardive. Le risque ne disparaît donc jamais définitivement.",
    question: "Votre bouche est-elle plus sèche, vos racines plus exposées ou les récidives plus fréquentes qu’avant ?",
  },
  {
    number: "03",
    slug: "gencives",
    title: "Gencives et support",
    subtitle: "Santé parodontale, attache, os et implants",
    color: "#2ca640",
    smoothing: 0.38,
    points: [[10, 5], [15, 8], [22, 11], [29, 25], [38, 18], [50, 32], [60, 59], [66, 68], [74, 76], [80, 82]],
    highlights: [29, 38, 60],
    directions: [
      { age: "10–29 ans", label: "Première vague" },
      { age: "Vers 38 ans", label: "Repli relatif" },
      { age: "Après 50 ans", label: "Forte accélération" },
    ],
    shape:
      "La population concernée reste faible chez les jeunes, connaît une première vague vers 30 ans puis un repli autour de 40 ans. Elle augmente ensuite fortement dès 50 ans et continue d’accélérer.",
    meaning:
      "La perte d’attache et les besoins de maintenance parodontale ou implantaire deviennent plus fréquents avec l’âge. Une détection précoce permet souvent de stabiliser la situation.",
    question: "Vos gencives saignent-elles, se rétractent-elles, ou certaines dents paraissent-elles plus longues ?",
  },
  {
    number: "04",
    slug: "restaurations",
    title: "Restaurations",
    subtitle: "Entretien, réparation, remplacement et réhabilitation",
    color: "#f5820b",
    smoothing: 0.32,
    points: [[10, 2], [15, 5], [22, 8], [32, 11], [40, 32], [48, 28], [56, 51], [62, 67], [70, 80], [80, 88]],
    highlights: [40, 48, 62],
    directions: [
      { age: "Avant 32 ans", label: "Progression modérée" },
      { age: "40–48 ans", label: "Première vague" },
      { age: "Après 56 ans", label: "Hausse très forte" },
    ],
    shape:
      "La population concernée progresse modérément jusqu’à 40 ans, marque un léger repli autour de 50 ans puis augmente très fortement dès 56 ans.",
    meaning:
      "Les réparations, remplacements, réinterventions et réhabilitations deviennent plus fréquents à mesure que le patrimoine restauré s’accumule et vieillit.",
    question: "Savez-vous quel âge ont vos obturations, vos couronnes et vos implants, et comment ils évoluent ?",
  },
  {
    number: "05",
    slug: "fonction",
    title: "Fonction",
    subtitle: "Croissance, occlusion, usure, bruxisme et mastication",
    color: "#7137b9",
    smoothing: 0.3,
    points: [[10, 25], [15, 48], [20, 30], [30, 12], [40, 18], [50, 30], [60, 35], [65, 40], [70, 62], [80, 82]],
    highlights: [15, 30, 65],
    directions: [
      { age: "10–15 ans", label: "Vague de croissance" },
      { age: "15–30 ans", label: "Long recul" },
      { age: "Après 65 ans", label: "Hausse brutale" },
    ],
    shape:
      "Une première vague accompagne la croissance. Après un long creux chez l’adulte, la population concernée augmente progressivement puis brutalement dès 65 ans.",
    meaning:
      "Les usures sévères, les pertes dentaires et les déficiences masticatoires prennent une place croissante dans la seconde moitié de la vie.",
    question: "Serrez-vous les dents, ressentez-vous des tensions, ou trouvez-vous que vos dents se raccourcissent ?",
  },
  {
    number: "06",
    slug: "esthetique",
    title: "Esthétique",
    subtitle: "Couleur, forme, harmonie et rajeunissement du sourire",
    color: "#e51a78",
    smoothing: 0.4,
    points: [[10, 10], [15, 35], [20, 52], [30, 45], [38, 25], [50, 65], [60, 65], [68, 59], [75, 48], [80, 19]],
    highlights: [20, 38, 50],
    directions: [
      { age: "15–20 ans", label: "Premier sommet" },
      { age: "Vers 38 ans", label: "Creux relatif" },
      { age: "50–60 ans", label: "Second sommet" },
    ],
    shape:
      "La demande esthétique présente un premier sommet chez le jeune adulte et un creux vers 38 ans. Une seconde vague plus forte forme un plateau maximal entre 50 et 60 ans, avant de diminuer progressivement.",
    meaning:
      "Cette courbe décrit une demande, non une maladie. Les attentes liées à la couleur, à la forme, à l’harmonie et au rajeunissement du sourire varient avec les étapes de vie.",
    question: "Votre sourire correspond-il encore à votre visage et à l’image que vous voulez donner aujourd’hui ?",
  },
];

const chart = { left: 58, right: 722, top: 28, bottom: 252 };
const chartWidth = chart.right - chart.left;
const chartHeight = chart.bottom - chart.top;
const ages = [10, 20, 30, 40, 50, 60, 70, 80];
const levels = [0, 25, 50, 75, 100];

function chartX(age: number) {
  return chart.left + ((age - 10) / 70) * chartWidth;
}

function chartY(population: number) {
  return chart.bottom - (population / 100) * chartHeight;
}

function smoothPath(points: readonly CurvePoint[], smoothing: number) {
  const coordinates = points.map(([age, population]) => [chartX(age), chartY(population)] as const);

  return coordinates.reduce((path, point, index, all) => {
    if (index === 0) return `M ${point[0]} ${point[1]}`;

    const previous = all[index - 1];
    const beforePrevious = all[index - 2] ?? previous;
    const next = all[index + 1] ?? point;
    const controlOneX = previous[0] + ((point[0] - beforePrevious[0]) * smoothing) / 3;
    const controlOneY = previous[1] + ((point[1] - beforePrevious[1]) * smoothing) / 3;
    const controlTwoX = point[0] - ((next[0] - previous[0]) * smoothing) / 3;
    const controlTwoY = point[1] - ((next[1] - previous[1]) * smoothing) / 3;

    return `${path} C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${point[0]} ${point[1]}`;
  }, "");
}

function CurveChart({
  curves,
  label,
  description,
  compact = false,
}: {
  curves: readonly CurveDomain[];
  label: string;
  description: string;
  compact?: boolean;
}) {
  const singleCurve = curves.length === 1 ? curves[0] : null;
  const gradientId = singleCurve ? `curve-fill-${singleCurve.slug}` : undefined;

  return (
    <svg
      className={`method-curve-chart${compact ? " compact" : ""}`}
      viewBox="0 0 780 304"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <desc>{description}</desc>
      {singleCurve && gradientId ? (
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={singleCurve.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={singleCurve.color} stopOpacity="0" />
          </linearGradient>
        </defs>
      ) : null}
      <g className="method-chart-grid" aria-hidden="true">
        {levels.map((level) => (
          <line key={level} x1={chart.left} x2={chart.right} y1={chartY(level)} y2={chartY(level)} />
        ))}
      </g>
      <g className="method-chart-axis" aria-hidden="true">
        {ages.map((age) => (
          <g key={age}>
            <line x1={chartX(age)} x2={chartX(age)} y1={chart.bottom} y2={chart.bottom + 5} />
            <text x={chartX(age)} y="276">{age}</text>
          </g>
        ))}
        <text
          className="method-chart-population-label"
          x={-((chart.top + chart.bottom) / 2)}
          y="12"
          transform="rotate(-90)"
        >
          population concernée (%)
        </text>
        <text className="method-chart-age-label" x={chart.right} y="296">âge</text>
        {!compact ? (
          <>
            <text x="47" y={chartY(100) + 4} textAnchor="end">100 %</text>
            <text x="47" y={chartY(0) + 4} textAnchor="end">0 %</text>
          </>
        ) : null}
      </g>
      {singleCurve && gradientId ? (
        <path
          className="method-chart-area"
          d={`${smoothPath(singleCurve.points, singleCurve.smoothing)} L ${chartX(singleCurve.points.at(-1)?.[0] ?? 80)} ${chart.bottom} L ${chartX(singleCurve.points[0][0])} ${chart.bottom} Z`}
          fill={`url(#${gradientId})`}
        />
      ) : null}
      {curves.map((curve) => (
        <g key={curve.slug}>
          <path
            className="method-chart-line"
            d={smoothPath(curve.points, curve.smoothing)}
            style={{ stroke: curve.color }}
          />
          {singleCurve
            ? curve.points.filter(([age]) => curve.highlights.includes(age)).map(([age, population]) => (
                <g className="method-chart-point" key={age}>
                  <circle cx={chartX(age)} cy={chartY(population)} r="7" style={{ stroke: curve.color }} />
                  <circle cx={chartX(age)} cy={chartY(population)} r="2.5" style={{ fill: curve.color }} />
                </g>
              ))
            : null}
        </g>
      ))}
    </svg>
  );
}

export default function MethodePage() {
  return (
    <main className="method-page">
      <Topline />

      <SiteHeader
        action={<Link className="method-appointment" href="/#rendez-vous"><CalendarDays aria-hidden="true" /> Prendre rendez-vous</Link>}
        className="method-header"
        secondaryLinks={[
          { href: "#principe", label: "Le principe" },
          { href: "#courbes", label: "Les six courbes" },
          { href: "#ensemble", label: "La vision d’ensemble" },
          { href: "#jumeau", label: "Le jumeau numérique" },
        ]}
      />

      <section className="method-hero section-shell">
        <div>
          <Link className="back-link" href="/"><ArrowLeft aria-hidden="true" /> Retour à la clinique</Link>
          <p className="eyebrow">La méthode SourirePlus</p>
          <h1>Quel âge a vraiment <em>votre bouche&nbsp;?</em></h1>
          <p className="method-lead">
            L’âge civil ne dit pas tout. À chaque période, les sujets dentaires ne concernent pas la même proportion de personnes. Nos six courbes montrent quand l’alignement, les caries, les gencives, les restaurations, la fonction et l’esthétique deviennent les plus présents.
          </p>
          <div className="method-hero-points">
            <span><Check aria-hidden="true" /> Comprendre où vous en êtes</span>
            <span><Check aria-hidden="true" /> Choisir où vous voulez aller</span>
          </div>
        </div>
        <div className="curve-panel" aria-labelledby="curve-title">
          <div className="curve-panel-head">
            <span>Les trajectoires de référence</span>
            <strong id="curve-title">Six courbes, six rythmes</strong>
          </div>
          <CurveChart
            curves={curveDomains}
            compact
            label="Aperçu des six courbes de référence SourirePlus"
            description="Les six trajectoires représentent la proportion de la population concernée entre 10 et 80 ans. Une courbe haute signifie que davantage de personnes sont concernées à cet âge."
          />
          <div className="curve-legend">
            {curveDomains.map((curve) => (
              <span key={curve.slug}><i style={{ background: curve.color }} /> {curve.title}</span>
            ))}
          </div>
          <small>Estimation pédagogique de la population concernée, de 0 à 100&nbsp;% — une courbe haute signifie que le sujet concerne davantage de personnes.</small>
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

      <section className="curve-domains section-shell" id="courbes">
        <div className="method-section-title dark-title">
          <p className="eyebrow">La réalité derrière le score</p>
          <h2>Six courbes.<br /><em>Six histoires différentes.</em></h2>
          <p>Chaque courbe estime la proportion de personnes concernées par une évolution, une surveillance, un traitement potentiel ou un traitement réalisé. Elle décrit une tendance de population, jamais votre destin individuel.</p>
        </div>

        <div className="curve-story-list">
          {curveDomains.map((domain) => (
            <article className="curve-story" key={domain.slug}>
              <div className="curve-story-chart">
                <div className="curve-chart-card" style={{ "--curve-color": domain.color } as CSSProperties}>
                  <div className="curve-chart-heading">
                    <span>Population concernée</span>
                    <small>Estimation en pourcentage</small>
                  </div>
                  <CurveChart
                    curves={[domain]}
                    label={`Courbe de référence : ${domain.title}`}
                    description={`${domain.subtitle}. La courbe évolue entre 10 et 80 ans et met en évidence ses principaux changements de direction.`}
                  />
                  <div className="curve-directions" aria-label={`Changements de direction : ${domain.title}`}>
                    {domain.directions.map((direction) => (
                      <span key={direction.age}><strong>{direction.age}</strong>{direction.label}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="curve-story-copy">
                <span className="curve-number" style={{ color: domain.color }}>{domain.number}</span>
                <p className="curve-kicker" style={{ color: domain.color }}>Population concernée (%)</p>
                <h3>{domain.title}</h3>
                <p className="curve-subtitle">{domain.subtitle}</p>
                <p><strong>Le relief.</strong> {domain.shape}</p>
                <p><strong>Ce qu’il nous apprend.</strong> {domain.meaning}</p>
                <div className="curve-question" style={{ borderColor: domain.color }}>
                  <span>La question à vous poser</span>
                  <strong>{domain.question}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="combined-curves" id="ensemble">
          <div className="combined-curves-copy">
            <p className="eyebrow light">La lecture SourirePlus</p>
            <h2>Une bouche n’est jamais <em>une seule courbe.</em></h2>
            <p>
              Au même âge, une personne peut avoir des gencives très stables, d’anciennes restaurations qui entrent dans une phase de maintenance, une usure déjà installée et de nouvelles attentes esthétiques. La superposition révèle ces décalages, ces croisements et parfois des priorités contradictoires.
            </p>
            <p>
              Cette lecture ne s’improvise pas. Comprendre la complexité d’une bouche demande des praticiens expérimentés, attentifs aux interactions et conscients des limites de chaque indicateur. Il faut savoir hiérarchiser, choisir le bon moment et construire une stratégie qui reste cohérente dans le temps.
            </p>
            <div className="combined-proof">
              <strong>18 ans</strong>
              <span>d’existence de la clinique, avec la continuité et l’expérience des praticiens.</span>
            </div>
          </div>
          <div className="combined-chart-card">
            <div className="curve-chart-heading">
              <span>Les six trajectoires simultanées</span>
              <small>Population concernée (%)</small>
            </div>
            <CurveChart
              curves={curveDomains}
              label="Superposition des six courbes de référence SourirePlus"
              description="Les proportions de population concernée par l’alignement, les caries, les gencives, les restaurations, la fonction et l’esthétique sont superposées entre 10 et 80 ans."
            />
            <div className="curve-legend combined-legend">
              {curveDomains.map((curve) => (
                <span key={curve.slug}><i style={{ background: curve.color }} /> {curve.title}</span>
              ))}
            </div>
            <small>Une courbe haute signifie que davantage de personnes sont concernées. Ces repères pédagogiques ne constituent jamais un diagnostic individuel.</small>
          </div>
        </div>

        <p className="method-source">
          Modèle de référence 10–80 ans issu du fichier SourirePlus du 30 août 2026 et de l’outil <a href="https://mydentalpass.ch/courbes/" target="_blank" rel="noreferrer">MyDentalPass — Courbes</a>. Estimation épidémiologique pédagogique&nbsp;: proportion de personnes concernées par une évolution, une surveillance, un traitement potentiel ou un traitement réalisé. Les points arrondis combinent données publiées et interpolation clinique&nbsp;; ils ne constituent pas une probabilité individuelle.
        </p>
      </section>

      <section className="life-curves section-shell">
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
            <h2>Le jumeau numérique transforme la référence en suivi personnel.</h2>
            <p>
              Les courbes générales donnent des repères. Votre bouche, elle, est enregistrée en 3D à un instant précis. Lors des contrôles, les modèles peuvent être comparés pour rendre visibles des évolutions parfois imperceptibles&nbsp;: usure, mouvements, restaurations ou changements des tissus.
            </p>
            <ul>
              <li><Check aria-hidden="true" /> Une situation de départ mémorisée</li>
              <li><Check aria-hidden="true" /> Des changements mesurables dans le temps</li>
              <li><Check aria-hidden="true" /> Une lecture personnelle répartie sur les six axes</li>
            </ul>
            <Link className="twin-section-link" href="/jumeau-numerique/">
              Comprendre le jumeau numérique <ArrowRight aria-hidden="true" />
            </Link>
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

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
import { Topline } from "../Topline";

export const metadata: Metadata = {
  title: "L’âge de votre bouche | Méthode SourirePlus",
  description:
    "Découvrez les six courbes de qualité de la méthode SourirePlus : alignement, dents d’origine, support, restaurations, fonction et esthétique.",
  alternates: { canonical: "/methode/" },
  openGraph: {
    title: "L’âge de votre bouche | Méthode SourirePlus",
    description: "Six courbes de qualité pour comprendre les forces, les fragilités et la trajectoire de votre bouche.",
    url: "/methode/",
    type: "article",
  },
};

type CurvePoint = readonly [age: number, quality: number];

type CurveDomain = {
  number: string;
  slug: string;
  title: string;
  subtitle: string;
  metric: string;
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
    metric: "Degré d’alignement dentaire",
    color: "#1473e6",
    smoothing: 0.35,
    points: [[10, 70], [15, 50], [20, 75], [30, 95], [41, 89], [50, 75], [60, 65], [65, 60], [70, 52], [80, 40]],
    highlights: [15, 30, 50],
    directions: [
      { age: "10–15 ans", label: "Période orthodontique" },
      { age: "15–30 ans", label: "Alignement restauré" },
      { age: "Après 50 ans", label: "Recul progressif" },
    ],
    shape:
      "La qualité de l’alignement baisse pendant la croissance et la période orthodontique, puis remonte fortement une fois les traitements réalisés. Elle reste élevée chez le jeune adulte avant de diminuer progressivement après 50 ans.",
    meaning:
      "Un alignement obtenu n’est jamais définitivement acquis. Les récidives, les migrations et l’encombrement tardif expliquent la pente descendante et donnent tout son sens à la contention et au suivi.",
    question: "Vos dents ont-elles bougé depuis votre traitement orthodontique ou depuis vos vingt ans ?",
  },
  {
    number: "02",
    slug: "caries",
    title: "Caries",
    subtitle: "Caries actives, risque, récidives et racines",
    metric: "Quantité de dent d’origine non détruite",
    color: "#e3262e",
    smoothing: 0.42,
    points: [[10, 65], [15, 70], [20, 85], [29, 89], [39, 59], [50, 77], [60, 74], [66, 70], [73, 61], [80, 24]],
    highlights: [29, 39, 73],
    directions: [
      { age: "10–29 ans", label: "Capital consolidé" },
      { age: "Vers 40 ans", label: "Premier décrochage" },
      { age: "Après 73 ans", label: "Baisse accélérée" },
    ],
    shape:
      "La quantité de dent d’origine préservée progresse jusqu’au jeune âge adulte. Un premier décrochage apparaît autour de 40 ans, suivi d’un répit, puis d’une baisse qui s’accélère nettement après 70 ans.",
    meaning:
      "Chaque carie détruit une part de tissu qui ne repousse pas. Prévenir les récidives et intervenir de façon conservatrice protège le capital dentaire disponible pour les décennies suivantes.",
    question: "Quelle proportion de vos dents est encore constituée de tissu d’origine intact ?",
  },
  {
    number: "03",
    slug: "gencives",
    title: "Gencives et support",
    subtitle: "Santé parodontale, attache, os et implants",
    metric: "Qualité du support",
    color: "#2ca640",
    smoothing: 0.38,
    points: [[10, 95], [15, 92], [22, 89], [29, 75], [38, 82], [50, 68], [60, 41], [66, 32], [74, 24], [80, 18]],
    highlights: [29, 38, 60],
    directions: [
      { age: "10–29 ans", label: "Première érosion" },
      { age: "Vers 38 ans", label: "Rebond possible" },
      { age: "Après 50 ans", label: "Déclin plus rapide" },
    ],
    shape:
      "Le support est généralement très favorable au début de la vie. Après une première baisse, une amélioration reste possible, mais la pente devient nettement plus forte à partir de 50 ans.",
    meaning:
      "Une inflammation discrète mais répétée peut affecter la gencive, l’attache puis l’os. Détecter une perte de qualité tôt permet souvent de stabiliser le support des dents et des implants.",
    question: "Vos gencives saignent-elles, se rétractent-elles, ou certaines dents paraissent-elles plus longues ?",
  },
  {
    number: "04",
    slug: "restaurations",
    title: "Restaurations",
    subtitle: "Entretien, réparation, remplacement et réhabilitation",
    metric: "Qualité des restaurations",
    color: "#f5820b",
    smoothing: 0.32,
    points: [[10, 98], [15, 95], [22, 92], [32, 89], [40, 68], [48, 72], [56, 49], [62, 33], [70, 20], [80, 12]],
    highlights: [40, 48, 62],
    directions: [
      { age: "Avant 32 ans", label: "Qualité élevée" },
      { age: "40–48 ans", label: "Répit après reprise" },
      { age: "Après 50 ans", label: "Usure accélérée" },
    ],
    shape:
      "La qualité du patrimoine restauré reste élevée au début de la vie, puis connaît un premier décrochage autour de 40 ans. Après un léger rebond, la baisse devient beaucoup plus marquée à partir de la cinquantaine.",
    meaning:
      "Chaque obturation, couronne ou implant vieillit. Les contrôler, les entretenir et coordonner leur remplacement évite qu’une succession de reprises isolées n’affaiblisse l’ensemble.",
    question: "Savez-vous quel âge ont vos obturations, vos couronnes et vos implants, et comment ils évoluent ?",
  },
  {
    number: "05",
    slug: "fonction",
    title: "Fonction",
    subtitle: "Croissance, occlusion, usure, bruxisme et mastication",
    metric: "Qualité des fonctions",
    color: "#7137b9",
    smoothing: 0.3,
    points: [[10, 75], [15, 52], [20, 70], [30, 88], [40, 82], [50, 70], [60, 65], [65, 60], [70, 38], [80, 18]],
    highlights: [15, 30, 65],
    directions: [
      { age: "10–15 ans", label: "Creux de croissance" },
      { age: "15–30 ans", label: "Fonction optimisée" },
      { age: "Après 65 ans", label: "Baisse marquée" },
    ],
    shape:
      "La qualité fonctionnelle connaît un creux pendant la croissance, puis atteint son meilleur niveau chez l’adulte jeune. Elle diminue progressivement à partir de 40 ans et plus franchement après 65 ans.",
    meaning:
      "Occlusion, mastication, usure et bruxisme s’influencent. L’objectif n’est pas seulement de soulager un symptôme, mais de conserver des fonctions efficaces malgré les contraintes accumulées.",
    question: "Serrez-vous les dents, ressentez-vous des tensions, ou trouvez-vous que vos dents se raccourcissent ?",
  },
  {
    number: "06",
    slug: "esthetique",
    title: "Esthétique",
    subtitle: "Couleur, forme, harmonie et rajeunissement du sourire",
    metric: "Qualité du visuel",
    color: "#e51a78",
    smoothing: 0.4,
    points: [[10, 90], [15, 65], [20, 48], [30, 55], [38, 75], [50, 35], [60, 35], [68, 41], [75, 52], [80, 81]],
    highlights: [20, 38, 50],
    directions: [
      { age: "15–20 ans", label: "Premier décrochage" },
      { age: "Vers 38 ans", label: "Qualité retrouvée" },
      { age: "50–60 ans", label: "Second creux" },
    ],
    shape:
      "La qualité visuelle connaît un premier creux chez le jeune adulte, remonte autour de 40 ans, puis traverse une seconde période basse entre 50 et 60 ans avant de s’améliorer de nouveau.",
    meaning:
      "Cette trajectoire parle moins de maladie que d’identité. Le regard porté sur le sourire, les soins déjà réalisés et l’harmonie avec le visage évoluent selon les étapes de vie.",
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

function chartY(quality: number) {
  return chart.bottom - (quality / 100) * chartHeight;
}

function smoothPath(points: readonly CurvePoint[], smoothing: number) {
  const coordinates = points.map(([age, quality]) => [chartX(age), chartY(quality)] as const);

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
          className="method-chart-quality-label"
          x={-((chart.top + chart.bottom) / 2)}
          y="12"
          transform="rotate(-90)"
        >
          qualité
        </text>
        <text className="method-chart-age-label" x={chart.right} y="296">âge</text>
        {!compact ? (
          <>
            <text x="47" y={chartY(100) + 4} textAnchor="end">haute</text>
            <text x="47" y={chartY(0) + 4} textAnchor="end">basse</text>
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
            ? curve.points.filter(([age]) => curve.highlights.includes(age)).map(([age, quality]) => (
                <g className="method-chart-point" key={age}>
                  <circle cx={chartX(age)} cy={chartY(quality)} r="7" style={{ stroke: curve.color }} />
                  <circle cx={chartX(age)} cy={chartY(quality)} r="2.5" style={{ fill: curve.color }} />
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
          <a href="#courbes">Les six courbes</a>
          <a href="#ensemble">La vision d’ensemble</a>
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
            L’âge civil ne dit pas tout. Certaines bouches sont en avance, d’autres ont été remarquablement préservées. Notre méthode mesure six formes de qualité, toujours dans le même sens&nbsp;: plus la courbe est haute, meilleure est la situation.
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
            description="Les six trajectoires de qualité entre 10 et 80 ans se croisent et changent de direction à des âges différents. Une valeur haute correspond toujours à une meilleure situation."
          />
          <div className="curve-legend">
            {curveDomains.map((curve) => (
              <span key={curve.slug}><i style={{ background: curve.color }} /> {curve.title}</span>
            ))}
          </div>
          <small>Indice pédagogique de qualité, de 0 à 100 — plus la courbe est haute, meilleure est la situation.</small>
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
          <p>Chaque courbe mesure une qualité différente sur la même échelle. Une courbe de référence n’est pas votre destin&nbsp;: votre histoire, vos soins, vos habitudes et votre suivi déplacent votre propre trajectoire.</p>
        </div>

        <div className="curve-story-list">
          {curveDomains.map((domain) => (
            <article className="curve-story" key={domain.slug}>
              <div className="curve-story-chart">
                <div className="curve-chart-card" style={{ "--curve-color": domain.color } as CSSProperties}>
                  <div className="curve-chart-heading">
                    <span>Qualité</span>
                    <small>{domain.metric}</small>
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
                <p className="curve-kicker" style={{ color: domain.color }}>{domain.metric}</p>
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
              <small>Qualité relative — plus haut = meilleur</small>
            </div>
            <CurveChart
              curves={curveDomains}
              label="Superposition des six courbes de référence SourirePlus"
              description="Les courbes de qualité d’alignement, de préservation des dents d’origine, du support, des restaurations, des fonctions et du visuel sont superposées entre 10 et 80 ans."
            />
            <div className="curve-legend combined-legend">
              {curveDomains.map((curve) => (
                <span key={curve.slug}><i style={{ background: curve.color }} /> {curve.title}</span>
              ))}
            </div>
            <small>Courbes de référence&nbsp;: une valeur haute est favorable. Elles donnent un repère pédagogique, jamais un diagnostic individuel.</small>
          </div>
        </div>

        <p className="method-source">
          Modèle de référence 10–80 ans, actualisé le 30 août 2026 à partir de l’outil <a href="https://mydentalpass.ch/courbes/" target="_blank" rel="noreferrer">MyDentalPass — Courbes</a>. L’indice de qualité est normalisé&nbsp;: 100 représente la situation la plus favorable et 0 la moins favorable. Il n’exprime ni une prévalence ni une probabilité individuelle.
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
              <li><Check aria-hidden="true" /> Une trajectoire personnelle intégrée aux six courbes</li>
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

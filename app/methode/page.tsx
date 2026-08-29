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
    "Découvrez les six courbes de la méthode SourirePlus : alignement, gencives, caries, restaurations, fonction et esthétique, intégrées au jumeau numérique.",
  alternates: { canonical: "/methode/" },
  openGraph: {
    title: "L’âge de votre bouche | Méthode SourirePlus",
    description: "Six courbes pour comprendre les reliefs, les changements de direction et la trajectoire de votre bouche.",
    url: "/methode/",
    type: "article",
  },
};

type CurvePoint = readonly [age: number, need: number];

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
    points: [[10, 20], [13, 80], [17, 88], [25, 24], [40, 34], [58, 24], [80, 20]],
    highlights: [17, 25, 40],
    directions: [
      { age: "10–17 ans", label: "Montée rapide" },
      { age: "17–25 ans", label: "Retour marqué" },
      { age: "Vers 40 ans", label: "Second relief" },
    ],
    shape:
      "La courbe monte presque à la verticale pendant la croissance et la période habituelle des traitements orthodontiques. Elle redescend fortement à l’entrée dans l’âge adulte, puis dessine un relief plus discret autour de 40 ans.",
    meaning:
      "La baisse ne veut pas dire que les dents ne bougent plus. Les récidives, les migrations et l’encombrement tardif peuvent réapparaître longtemps après un traitement, d’où l’importance de la contention et du suivi.",
    question: "Vos dents ont-elles bougé depuis votre traitement orthodontique ou depuis vos vingt ans ?",
  },
  {
    number: "02",
    slug: "gencives",
    title: "Gencives et support",
    subtitle: "Santé parodontale, attache et os",
    color: "#2ca640",
    smoothing: 0.5,
    points: [[10, 5], [25, 10], [35, 20], [45, 35], [55, 55], [68, 72], [80, 85]],
    highlights: [35, 55, 68],
    directions: [
      { age: "10–35 ans", label: "Pente douce" },
      { age: "35–55 ans", label: "Accélération" },
      { age: "Après 55 ans", label: "Vigilance accrue" },
    ],
    shape:
      "D’abord basse et presque plate, la courbe s’incline progressivement. Son changement de pente devient plus net entre 35 et 55 ans, puis la montée se poursuit avec l’âge.",
    meaning:
      "Le support d’une dent se construit dans la durée. Une inflammation discrète mais répétée peut affecter la gencive, l’attache puis l’os. Détecter l’accélération tôt permet souvent de conserver une situation stable.",
    question: "Vos gencives saignent-elles, se rétractent-elles, ou certaines dents paraissent-elles plus longues ?",
  },
  {
    number: "03",
    slug: "caries",
    title: "Caries",
    subtitle: "Risque carieux, récidives et racines",
    color: "#e3262e",
    smoothing: 0.55,
    points: [[10, 35], [18, 50], [30, 40], [45, 42], [60, 55], [70, 68], [80, 78]],
    highlights: [18, 30, 60],
    directions: [
      { age: "Vers 18 ans", label: "Premier sommet" },
      { age: "30–45 ans", label: "Plateau relatif" },
      { age: "Après 45 ans", label: "Remontée" },
    ],
    shape:
      "Un premier relief apparaît chez le jeune patient. La courbe redescend ensuite vers un plateau adulte, avant de changer progressivement de direction et de remonter à partir du milieu de vie.",
    meaning:
      "Avec le temps, de nouveaux facteurs peuvent intervenir : racines exposées, bouche plus sèche, médicaments ou limites d’anciennes restaurations. Le risque carieux n’est donc jamais définitivement acquis ni définitivement écarté.",
    question: "Votre bouche est-elle plus sèche, vos racines plus exposées ou les récidives plus fréquentes qu’avant ?",
  },
  {
    number: "04",
    slug: "restaurations",
    title: "Restaurations",
    subtitle: "Entretien et remplacement des soins",
    color: "#f5820b",
    smoothing: 0.45,
    points: [[10, 2], [25, 8], [35, 20], [45, 40], [55, 60], [68, 76], [80, 82]],
    highlights: [35, 45, 68],
    directions: [
      { age: "Avant 35 ans", label: "Charge limitée" },
      { age: "35–55 ans", label: "Pente plus forte" },
      { age: "Après 68 ans", label: "Haut plateau" },
    ],
    shape:
      "La ligne reste très basse au début de la vie, puis se redresse après 35 ans. Entre 45 et 68 ans, sa pente devient franche avant de tendre vers un plateau élevé.",
    meaning:
      "Chaque obturation, couronne ou implant rejoint un patrimoine à entretenir. Plus ce patrimoine s’accumule, plus les décisions doivent être coordonnées pour éviter une succession de réparations isolées.",
    question: "Savez-vous quel âge ont vos obturations, vos couronnes et vos implants, et comment ils évoluent ?",
  },
  {
    number: "05",
    slug: "fonction",
    title: "Fonction, usure et bruxisme",
    subtitle: "Contraintes, parafonctions et mastication",
    color: "#7137b9",
    smoothing: 0.5,
    points: [[10, 8], [25, 35], [35, 65], [45, 80], [55, 75], [65, 65], [80, 58]],
    highlights: [25, 45, 65],
    directions: [
      { age: "25–45 ans", label: "Forte montée" },
      { age: "Vers 45 ans", label: "Point culminant" },
      { age: "Après 45 ans", label: "Baisse sans retour" },
    ],
    shape:
      "La courbe grimpe rapidement au cœur de la vie et atteint son sommet autour de 45 ans. Elle redescend ensuite, mais reste nettement au-dessus de son niveau de départ.",
    meaning:
      "Le serrement ou le grincement peuvent diminuer avec l’âge, mais l’usure déjà accumulée ne s’efface pas. C’est pourquoi une pente descendante peut malgré tout correspondre à une bouche qui demande encore de l’attention.",
    question: "Serrez-vous les dents, ressentez-vous des tensions, ou trouvez-vous que vos dents se raccourcissent ?",
  },
  {
    number: "06",
    slug: "esthetique",
    title: "Esthétique",
    subtitle: "Couleur, forme et harmonie du sourire",
    color: "#e51a78",
    smoothing: 0.65,
    points: [[10, 12], [18, 60], [30, 70], [42, 52], [55, 65], [68, 52], [80, 40]],
    highlights: [30, 42, 55],
    directions: [
      { age: "18–30 ans", label: "Premier relief" },
      { age: "Vers 42 ans", label: "Repli" },
      { age: "Vers 55 ans", label: "Second relief" },
    ],
    shape:
      "La courbe dessine deux reliefs : un premier sommet chez le jeune adulte, puis une nouvelle montée autour de 55 ans après un creux au milieu de la vie.",
    meaning:
      "Cette trajectoire parle moins de maladie que d’identité. Les attentes évoluent avec le visage, les étapes de vie et l’image que l’on souhaite transmettre. Elles restent personnelles à tout âge.",
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

function chartY(need: number) {
  return chart.bottom - (need / 100) * chartHeight;
}

function smoothPath(points: readonly CurvePoint[], smoothing: number) {
  const coordinates = points.map(([age, need]) => [chartX(age), chartY(need)] as const);

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
        <text className="method-chart-age-label" x={chart.right} y="296">âge</text>
        {!compact ? (
          <>
            <text x="47" y={chartY(100) + 4} textAnchor="end">fort</text>
            <text x="47" y={chartY(0) + 4} textAnchor="end">faible</text>
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
            ? curve.points.filter(([age]) => curve.highlights.includes(age)).map(([age, need]) => (
                <g className="method-chart-point" key={age}>
                  <circle cx={chartX(age)} cy={chartY(need)} r="7" style={{ stroke: curve.color }} />
                  <circle cx={chartX(age)} cy={chartY(need)} r="2.5" style={{ fill: curve.color }} />
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
            L’âge civil ne dit pas tout. Certaines bouches sont en avance, d’autres ont été remarquablement préservées. Notre méthode transforme l’examen, les images et votre jumeau numérique en six trajectoires compréhensibles.
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
            description="Les six trajectoires de besoin relatif de surveillance ou d’intervention entre 10 et 80 ans se croisent et changent de direction à des âges différents."
          />
          <div className="curve-legend">
            {curveDomains.map((curve) => (
              <span key={curve.slug}><i style={{ background: curve.color }} /> {curve.title}</span>
            ))}
          </div>
          <small>Indice pédagogique de besoin relatif de surveillance ou d’intervention — chaque bilan est individuel.</small>
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
          <p>Une courbe de référence n’est pas votre destin. Ses reliefs montrent les périodes où les priorités changent. Votre histoire, vos soins, vos habitudes et votre suivi déplacent votre propre trajectoire.</p>
        </div>

        <div className="curve-story-list">
          {curveDomains.map((domain) => (
            <article className="curve-story" key={domain.slug}>
              <div className="curve-story-chart">
                <div className="curve-chart-card" style={{ "--curve-color": domain.color } as CSSProperties}>
                  <div className="curve-chart-heading">
                    <span>Besoin relatif</span>
                    <small>Surveillance ou intervention</small>
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
                <p className="curve-kicker" style={{ color: domain.color }}>Lecture de la forme</p>
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
              <small>Besoin relatif de surveillance ou d’intervention</small>
            </div>
            <CurveChart
              curves={curveDomains}
              label="Superposition des six courbes de référence SourirePlus"
              description="Les courbes d’alignement, de gencives, de caries, de restaurations, de fonction et d’esthétique sont superposées entre 10 et 80 ans."
            />
            <div className="curve-legend combined-legend">
              {curveDomains.map((curve) => (
                <span key={curve.slug}><i style={{ background: curve.color }} /> {curve.title}</span>
              ))}
            </div>
            <small>Courbes de référence : elles donnent un repère pédagogique, jamais un diagnostic individuel.</small>
          </div>
        </div>

        <p className="method-source">
          Modèle de référence 10–80 ans issu de l’outil <a href="https://mydentalpass.ch/courbes/" target="_blank" rel="noreferrer">MyDentalPass — Courbes</a>. L’indice est normalisé&nbsp;: il n’exprime ni une prévalence ni une probabilité individuelle.
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

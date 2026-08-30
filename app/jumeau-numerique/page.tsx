import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Eye,
  Layers,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Topline } from "../Topline";

export const metadata: Metadata = {
  title: "Jumeau numérique dentaire | Méthode SourirePlus",
  description:
    "Découvrez comment le scan TRIOS 6, 3Shape Dx et les six axes SourirePlus rendent l’évolution de votre bouche visible, comparable et compréhensible.",
  alternates: { canonical: "/jumeau-numerique/" },
  openGraph: {
    title: "Le jumeau numérique SourirePlus",
    description:
      "Une mémoire 3D de votre bouche, relue dans le temps avec les six axes de la méthode SourirePlus.",
    url: "/jumeau-numerique/",
    type: "article",
  },
};

const axes = [
  {
    number: "01",
    title: "Alignement",
    color: "#1473e6",
    observed: "Déplacements dentaires et différences de position entre deux scans alignés.",
    interpreted: "La stabilité, la récidive ou une migration sont replacées dans le contexte clinique et dans la courbe de population concernée.",
    limit: "Le scan ne décide pas, à lui seul, si un traitement orthodontique est indiqué.",
  },
  {
    number: "02",
    title: "Caries",
    color: "#e3262e",
    observed: "Aide visuelle Dx Plus pour les caries de surface et visualisation des zones proximales selon les données disponibles.",
    interpreted: "Le praticien confronte ces indices à l’examen, aux radiographies utiles et au risque carieux personnel.",
    limit: "La visualisation des caries proximales n’est pas présentée par 3Shape comme une détection par IA.",
  },
  {
    number: "03",
    title: "Gencives et support",
    color: "#2ca640",
    observed: "Aide au repérage des récessions et comparaison de la forme des tissus gingivaux dans le temps.",
    interpreted: "Les mesures 3D complètent le sondage, le saignement, l’attache et l’évaluation du support osseux.",
    limit: "Un modèle de surface ne remplace ni le sondage parodontal ni l’examen radiologique lorsqu’il est indiqué.",
  },
  {
    number: "04",
    title: "Restaurations",
    color: "#f5820b",
    observed: "Mémoire datée des formes, surfaces et volumes autour des obturations, couronnes ou implants visibles au scan.",
    interpreted: "Le suivi aide à documenter une évolution et à choisir entre surveiller, réparer ou remplacer.",
    limit: "Dx n’attribue pas automatiquement une note de qualité ou de durée de vie à une restauration.",
  },
  {
    number: "05",
    title: "Fonction",
    color: "#7137b9",
    observed: "Aide visuelle sur l’usure dentaire et comparaison des changements de forme des dents.",
    interpreted: "Ces traces sont reliées à l’occlusion, aux habitudes, aux symptômes et à la qualité de mastication.",
    limit: "Le scan ne mesure ni la force musculaire, ni le bruxisme nocturne, ni toute la fonction masticatoire.",
  },
  {
    number: "06",
    title: "Esthétique",
    color: "#e51a78",
    observed: "Comparaison documentée des volumes, formes et couleurs visibles à des dates différentes.",
    interpreted: "L’équipe relie ces observations aux attentes, au visage et à la cohérence globale du sourire.",
    limit: "Il n’existe pas de score esthétique automatique capable de définir ce qui vous convient.",
  },
] as const;

const journey = [
  {
    number: "01",
    title: "Enregistrer",
    text: "Le scan intra-oral crée un modèle 3D daté. Avec TRIOS 6, l’acquisition peut réunir couleur, lumière de fluorescence et imagerie proche infrarouge dans le même parcours de scan.",
  },
  {
    number: "02",
    title: "Inspecter",
    text: "Dx organise le modèle pour l’examen. Dx Plus peut ajouter des aides visuelles assistées par IA sur certains signes : usure, récession gingivale, caries de surface et plaque.",
  },
  {
    number: "03",
    title: "Comparer",
    text: "Au contrôle suivant, deux scans peuvent être alignés, superposés et parcourus avec des cartes de différences, des mesures, un curseur ou une animation.",
  },
  {
    number: "04",
    title: "Interpréter",
    text: "SourirePlus répartit les constatations dans six axes, les confronte à l’examen clinique et les situe face aux courbes de population concernée.",
  },
  {
    number: "05",
    title: "Décider et suivre",
    text: "Le praticien hiérarchise ce qui mérite une action, ce qui peut être surveillé et ce qui doit simplement rester dans la mémoire numérique de votre bouche.",
  },
] as const;

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

function ComparisonDiagram() {
  return (
    <svg
      className="twin-comparison-diagram"
      viewBox="0 0 760 360"
      role="img"
      aria-labelledby="twin-diagram-title twin-diagram-description"
    >
      <title id="twin-diagram-title">Comparaison simplifiée de deux scans dentaires</title>
      <desc id="twin-diagram-description">
        Un scan initial et un scan de suivi sont alignés. Leur superposition met en évidence les zones stables et les zones qui ont changé.
      </desc>
      <defs>
        <linearGradient id="twin-scan-base" x1="0" x2="1">
          <stop offset="0%" stopColor="#d8e5e8" />
          <stop offset="100%" stopColor="#f7f3e9" />
        </linearGradient>
        <linearGradient id="twin-change-map" x1="0" x2="1">
          <stop offset="0%" stopColor="#1473e6" />
          <stop offset="52%" stopColor="#61a56e" />
          <stop offset="100%" stopColor="#f5820b" />
        </linearGradient>
      </defs>
      <g className="twin-diagram-labels" aria-hidden="true">
        <text x="118" y="32">SCAN INITIAL</text>
        <text x="380" y="32">SCAN DE SUIVI</text>
        <text x="642" y="32">SUPERPOSITION</text>
      </g>
      {[118, 380, 642].map((center, groupIndex) => (
        <g key={center} transform={`translate(${center - 92} 76)`} aria-hidden="true">
          <path
            d="M17 116 C28 30 155 30 167 116 C154 84 126 66 92 66 C58 66 30 84 17 116 Z"
            fill={groupIndex === 2 ? "url(#twin-change-map)" : "url(#twin-scan-base)"}
            opacity={groupIndex === 2 ? ".72" : "1"}
          />
          {[35, 55, 76, 98, 120, 141].map((x, toothIndex) => (
            <rect
              key={x}
              x={x + (groupIndex === 1 && toothIndex > 3 ? 3 : 0)}
              y={groupIndex === 1 && toothIndex === 2 ? 71 : 68}
              width="17"
              height={groupIndex === 1 && toothIndex === 2 ? "38" : "42"}
              rx="8"
              fill="#fff"
              stroke={groupIndex === 2 && toothIndex > 3 ? "#f5820b" : "#557080"}
              strokeWidth={groupIndex === 2 && toothIndex > 3 ? "2.5" : "1.2"}
            />
          ))}
          <path d="M29 126 C53 151 131 151 155 126" fill="none" stroke="#557080" strokeWidth="2" strokeDasharray={groupIndex === 2 ? "5 5" : undefined} />
          {groupIndex === 2 ? <circle cx="139" cy="91" r="20" fill="none" stroke="#f5820b" strokeWidth="2" strokeDasharray="4 4" /> : null}
        </g>
      ))}
      <g className="twin-diagram-arrows" aria-hidden="true">
        <path d="M218 157 H274" />
        <path d="M480 157 H536" />
        <path d="M266 150 L276 157 L266 164" />
        <path d="M528 150 L538 157 L528 164" />
      </g>
      <g className="twin-diagram-notes" aria-hidden="true">
        <text x="118" y="300">point de départ daté</text>
        <text x="380" y="300">nouvelle observation</text>
        <text x="642" y="300">changements rendus visibles</text>
      </g>
      <g className="twin-diagram-legend" aria-hidden="true">
        <circle cx="265" cy="334" r="4" fill="#1473e6" /><text x="276" y="338">direction A</text>
        <circle cx="380" cy="334" r="4" fill="#61a56e" /><text x="391" y="338">zone stable</text>
        <circle cx="488" cy="334" r="4" fill="#f5820b" /><text x="499" y="338">direction B</text>
      </g>
    </svg>
  );
}

export default function JumeauNumeriquePage() {
  return (
    <main className="twin-page">
      <Topline />

      <header className="site-header twin-header">
        <Brand />
        <nav className="desktop-nav" aria-label="Navigation du jumeau numérique">
          <a href="#definition">Le principe</a>
          <a href="#dx">Dx Standard et Plus</a>
          <a href="#six-axes">Les six axes</a>
          <a href="#parcours">Le parcours</a>
        </nav>
        <Link className="method-appointment" href="/#rendez-vous">
          <CalendarDays aria-hidden="true" /> Prendre rendez-vous
        </Link>
      </header>

      <section className="twin-hero section-shell">
        <div className="twin-hero-copy">
          <Link className="back-link" href="/methode/">
            <ArrowLeft aria-hidden="true" /> Retour à la méthode
          </Link>
          <p className="eyebrow">Le jumeau numérique SourirePlus</p>
          <h1>Votre bouche, enregistrée aujourd’hui. <em>Comparée demain.</em></h1>
          <p className="twin-lead">
            Un scan isolé est une image précise. Une série de scans datés devient une mémoire 3D&nbsp;: elle aide à voir ce qui reste stable, ce qui change et ce qui mérite une décision. SourirePlus relie cette mémoire aux six dimensions de votre santé dentaire.
          </p>
          <div className="twin-hero-actions">
            <a className="primary-cta" href="#definition"><ScanLine aria-hidden="true" /> Comprendre le parcours</a>
            <Link className="inline-link" href="/methode/">Voir les courbes <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
        <figure className="twin-hero-visual">
          <div className="twin-scanner-image" role="img" aria-label="Scanner intra-oral utilisé dans une salle de soins SourirePlus" />
          <figcaption>
            <span>01</span>
            <strong>Une empreinte numérique datée</strong>
            <small>Base de comparaison pour les contrôles suivants</small>
          </figcaption>
          <div className="twin-hero-signal" aria-hidden="true"><ScanLine /><span>3D</span></div>
        </figure>
      </section>

      <section className="twin-bridge">
        <div className="section-shell">
          <p>Les courbes décrivent <strong>la population concernée.</strong></p>
          <p>Le jumeau numérique raconte <strong>votre propre bouche.</strong></p>
        </div>
      </section>

      <section className="twin-definition section-shell" id="definition">
        <div className="twin-section-heading">
          <p className="eyebrow">Une mémoire, pas une boule de cristal</p>
          <h2>Ce que nous appelons réellement <em>un jumeau numérique.</em></h2>
        </div>
        <div className="twin-definition-grid">
          <div className="twin-definition-copy">
            <p className="large-copy">
              Chez SourirePlus, le jumeau numérique n’est pas une simulation autonome qui prédit votre avenir. C’est un dossier visuel vivant&nbsp;: des modèles 3D datés, des images et des mesures que l’équipe peut comparer au fil du temps.
            </p>
            <p>
              Le premier scan crée le point de départ. Les suivants montrent les écarts. La technologie rend une évolution visible&nbsp;; le praticien détermine si elle est significative, la relie à votre examen et décide avec vous de la conduite à tenir.
            </p>
            <aside>
              <ShieldCheck aria-hidden="true" />
              <span><strong>Le principe de prudence</strong>L’IA et les cartes de différences assistent l’observation. Elles ne remplacent jamais l’examen clinique, les examens complémentaires indiqués ni le jugement du praticien.</span>
            </aside>
          </div>
          <div className="twin-comparison-card">
            <div className="twin-card-heading">
              <span>Schéma explicatif SourirePlus</span>
              <small>La visualisation réelle dépend des données disponibles</small>
            </div>
            <ComparisonDiagram />
            <p className="twin-comparison-note">Les couleurs indiquent le sens d’un écart mesuré, jamais «&nbsp;mieux&nbsp;» ou «&nbsp;moins bien&nbsp;».</p>
          </div>
        </div>
      </section>

      <section className="twin-dx" id="dx">
        <div className="section-shell">
          <div className="twin-section-heading light-heading">
            <p className="eyebrow light">La couche technologique</p>
            <h2>TRIOS 6 capte. Dx organise. <em>SourirePlus donne du sens.</em></h2>
            <p>Les appellations Dx Standard et Dx Plus désignent deux niveaux d’outils 3Shape. Leur rôle doit rester distinct de la méthode clinique SourirePlus.</p>
          </div>
          <div className="dx-levels">
            <article>
              <div className="dx-level-title"><Layers aria-hidden="true" /><span>Le socle</span></div>
              <h3>Dx Standard</h3>
              <p>La continuité du suivi numérique TRIOS&nbsp;: revoir les scans, comparer deux dates, mesurer des écarts et présenter les changements au patient.</p>
              <ul>
                <li><Check aria-hidden="true" /> Comparaison chronologique des scans</li>
                <li><Check aria-hidden="true" /> Cartes de différences et superpositions</li>
                <li><Check aria-hidden="true" /> Mesures, coupes et outils de présentation</li>
              </ul>
              <small>Ces fonctions de suivi sont accessibles avec les scans TRIOS compatibles, selon la configuration logicielle.</small>
            </article>
            <article className="dx-plus-card">
              <div className="dx-level-title"><Sparkles aria-hidden="true" /><span>L’assistance avancée</span></div>
              <h3>Dx Plus</h3>
              <p>Une couche d’assistance par intelligence artificielle, réservée aux scans TRIOS&nbsp;6, pour attirer l’attention sur certains signes cliniques.</p>
              <ul>
                <li><Check aria-hidden="true" /> Usure dentaire et exposition dentinaire</li>
                <li><Check aria-hidden="true" /> Récession gingivale et niveau de sévérité</li>
                <li><Check aria-hidden="true" /> Caries de surface et plaque</li>
              </ul>
              <small>Dx Plus nécessite l’offre correspondante. Les fonctions et leur disponibilité peuvent varier selon les autorisations régionales.</small>
            </article>
          </div>
          <div className="dx-responsibility">
            <Eye aria-hidden="true" />
            <p><strong>L’IA signale une zone d’attention, pas une vérité automatique.</strong> 3Shape précise que ses résultats peuvent comporter des faux positifs ou manquer un signe. Le professionnel de santé confirme toujours l’interprétation.</p>
          </div>
        </div>
      </section>

      <section className="twin-axes section-shell" id="six-axes">
        <div className="twin-section-heading">
          <p className="eyebrow">L’intégration SourirePlus</p>
          <h2>Une seule mémoire 3D.<br /><em>Six angles de lecture.</em></h2>
          <p>Les outils Dx ne fabriquent pas les courbes SourirePlus. Ils apportent des observations personnelles que l’équipe classe et interprète selon les six axes. Les courbes restent, elles, des repères de population concernée par âge.</p>
        </div>
        <div className="twin-axis-grid">
          {axes.map((axis) => (
            <article key={axis.title} style={{ "--axis-color": axis.color } as CSSProperties}>
              <div className="twin-axis-head"><span>{axis.number}</span><i aria-hidden="true" /></div>
              <h3>{axis.title}</h3>
              <dl>
                <div><dt>Ce que le numérique peut montrer</dt><dd>{axis.observed}</dd></div>
                <div><dt>Lecture SourirePlus</dt><dd>{axis.interpreted}</dd></div>
                <div className="twin-axis-limit"><dt>La limite à connaître</dt><dd>{axis.limit}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="twin-journey" id="parcours">
        <div className="section-shell">
          <div className="twin-section-heading light-heading">
            <p className="eyebrow light">À chaque bilan</p>
            <h2>De la capture à la décision,<br /><em>cinq étapes lisibles.</em></h2>
          </div>
          <ol className="twin-journey-list">
            {journey.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="twin-result section-shell">
        <div className="twin-result-copy">
          <p className="eyebrow">Le résultat utile</p>
          <h2>Voir tôt. Comprendre ensemble. <em>Agir seulement quand il le faut.</em></h2>
          <p>Le bénéfice n’est pas d’accumuler des images. Il est de disposer d’un point de comparaison objectif, de mieux expliquer les choix et de conserver la trace de ce qui a réellement changé entre deux rendez-vous.</p>
        </div>
        <div className="twin-result-list">
          <p><Activity aria-hidden="true" /><span><strong>Stable</strong>La surveillance confirme que la situation ne justifie pas d’intervention.</span></p>
          <p><Eye aria-hidden="true" /><span><strong>À observer</strong>Une variation existe, mais doit être replacée dans son contexte avant de décider.</span></p>
          <p><ShieldCheck aria-hidden="true" /><span><strong>À protéger</strong>Une évolution confirmée peut conduire à une mesure préventive ou thérapeutique ciblée.</span></p>
        </div>
      </section>

      <section className="twin-sources section-shell">
        <h2>Technologie et transparence</h2>
        <p>
          Cette page présente l’usage clinique envisagé par SourirePlus à partir des informations publiques 3Shape consultées en août&nbsp;2026. «&nbsp;Jumeau numérique SourirePlus&nbsp;» est notre manière d’expliquer un suivi longitudinal fondé sur des scans datés&nbsp;; ce n’est pas le nom d’un produit 3Shape. TRIOS, Dx et 3Shape sont des marques de 3Shape. La disponibilité des fonctions dépend de l’équipement, de l’abonnement et des autorisations applicables.
        </p>
        <nav aria-label="Sources technologiques officielles">
          <a href="https://www.3shape.com/en/software/trios-patient-monitoring" target="_blank" rel="noreferrer">Suivi numérique TRIOS / Dx Standard</a>
          <a href="https://support.3shape.com/getting-started/navigating-the-main-functions-in-dx-diagnose-analyze-and-present-" target="_blank" rel="noreferrer">Fonctions Diagnose, Analyze et Present</a>
          <a href="https://www.3shape.com/en-gb/software/dx/plus" target="_blank" rel="noreferrer">Présentation officielle de Dx Plus</a>
          <a href="https://learn.3shape.com/en/support/all-products/trios-scanner--accessories/trios-6/frequently-asked-questions-trios-6-trios-dx-and-dentalhealth-app" target="_blank" rel="noreferrer">FAQ TRIOS 6 et limites de l’IA</a>
        </nav>
      </section>

      <section className="method-cta section-shell">
        <div>
          <p className="eyebrow">Créer votre point de départ</p>
          <h2>Votre jumeau numérique commence par un bilan complet.</h2>
          <p>Le scan complète l’entretien, l’examen clinique et les examens indiqués. Il ne les remplace pas.</p>
        </div>
        <Link className="primary-cta" href="/#rendez-vous"><CalendarDays aria-hidden="true" /> Prendre rendez-vous</Link>
      </section>

      <footer className="method-footer">
        <div className="section-shell">
          <Brand />
          <p>Rue du Crêt-Taconnet 8a · 2000 Neuchâtel · 032 724 40 20</p>
          <nav className="method-footer-links" aria-label="Informations pratiques">
            <Link href="/methode/">La méthode</Link>
            <Link href="/acces/">Accès</Link>
            <Link href="/mentions-legales/">Mentions légales</Link>
            <Link href="/protection-des-donnees/">Protection des données</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

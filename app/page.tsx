"use client";

import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  CircleCheck,
  ChevronRight,
  HeartPulse,
  Loader2,
  Menu,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NeighborhoodMap } from "./NeighborhoodMap";
import { Topline } from "./Topline";

const services = [
  {
    number: "01",
    title: "Maintenance & hygiène",
    text: "Prévenir, surveiller et intervenir tôt pour conserver vos dents le plus longtemps possible.",
    tag: "Préserver",
  },
  {
    number: "02",
    title: "Esthétique du sourire",
    text: "Blanchiment, facettes et restaurations pensées pour rester naturelles, jamais standardisées.",
    tag: "Harmoniser",
  },
  {
    number: "03",
    title: "Endodontie",
    text: "Des traitements précis pour soulager la douleur et donner une nouvelle chance à la dent.",
    tag: "Sauver",
  },
  {
    number: "04",
    title: "Orthodontie",
    text: "Aligner les dents à tout âge en conciliant esthétique, confort et stabilité du résultat.",
    tag: "Aligner",
  },
  {
    number: "05",
    title: "Implantologie",
    text: "Remplacer une ou plusieurs dents avec une planification numérique rigoureuse et lisible.",
    tag: "Reconstruire",
  },
  {
    number: "06",
    title: "Soins complets",
    text: "Diagnostic, restaurations, chirurgie et suivi coordonnés au même endroit par une équipe dédiée.",
    tag: "Accompagner",
  },
];

const articles = [
  {
    category: "Vrai ou faux ?",
    title: "Le café jaunit-il vraiment les dents ?",
    text: "La réponse courte : oui, mais ce n’est pas une raison pour renoncer à votre espresso.",
    tone: "cream",
    href: "/journal/cafe-et-dents/",
  },
  {
    category: "Mode d’emploi",
    title: "Brosse électrique : meilleure, vraiment ?",
    text: "Le bon outil aide. La bonne méthode fait presque tout le reste.",
    tone: "navy",
    href: "/journal/brosse-electrique/",
  },
  {
    category: "Les dents ont leur logique",
    title: "Pourquoi ça casse toujours le week-end",
    text: "Ce n’est pas une conspiration. Mais il existe quelques signaux à ne pas ignorer.",
    tone: "gold",
    href: "/journal/casse-du-week-end/",
  },
];

function Brand() {
  return (
    <a className="brand" href="#accueil" aria-label="SourirePlus — accueil">
      <span className="brand-emblem" aria-hidden="true" />
      <span className="brand-copy">
        <strong>SourirePlus</strong>
        <small>Clinique dentaire · Neuchâtel</small>
      </span>
    </a>
  );
}

const APPOINTMENT_API = "https://mydentalpass.ch/borne/site-api.php";

function AppointmentDialog({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<"choice" | "request" | "manage" | "success">("choice");
  const [phone, setPhone] = useState("");
  const [existingPatient, setExistingPatient] = useState("yes");
  const [need, setNeed] = useState("bilan");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const requestId = useRef<string | null>(null);

  const reset = () => {
    setMode("choice");
    setPhone("");
    setExistingPatient("yes");
    setNeed("bilan");
    setCode("");
    setPending(false);
    setError("");
    setSuccessMessage("");
    requestId.current = null;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const isRequest = mode === "request";
      if (isRequest && requestId.current === null) {
        requestId.current = crypto.randomUUID();
      }
      const response = await fetch(APPOINTMENT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRequest
          ? {
              action: "create_request",
              request_id: requestId.current,
              phone,
              need,
              existing_patient: existingPatient === "yes",
            }
          : { action: "manage_link", phone, code: code.trim() }),
      });
      const result = await response.json() as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || result.ok !== true) {
        throw new Error(result.error || "Le service est momentanément indisponible.");
      }
      setSuccessMessage(result.message || "Le lien a été envoyé par SMS.");
      setMode("success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Le service est momentanément indisponible.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && reset()}>
      <DialogTrigger asChild>
        <Button className={compact ? "nav-appointment" : "primary-cta"}>
          <CalendarDays aria-hidden="true" /> Prendre rendez-vous
        </Button>
      </DialogTrigger>
      <DialogContent className="appointment-dialog">
        <DialogHeader>
          <p className="eyebrow">Votre rendez-vous</p>
          <DialogTitle>Comment pouvons-nous vous aider&nbsp;?</DialogTitle>
          <DialogDescription>
            Une demande simple, puis votre lien personnel directement par SMS.
          </DialogDescription>
        </DialogHeader>

        {mode === "choice" ? (
          <div className="appointment-choices">
            <button className="appointment-choice" onClick={() => setMode("request")}>
              <span><Sparkles aria-hidden="true" /></span>
              <strong>Demander un rendez-vous</strong>
              <small>Urgence de 30 minutes ou bilan de 45 minutes, installation comprise.</small>
              <ChevronRight aria-hidden="true" />
            </button>
            <button className="appointment-choice" onClick={() => setMode("manage")}>
              <span><RotateCcw aria-hidden="true" /></span>
              <strong>Retrouver ou modifier mon rendez-vous</strong>
              <small>Recevoir à nouveau votre lien personnel.</small>
              <ChevronRight aria-hidden="true" />
            </button>
            <a className="appointment-choice" href="tel:+41327244020">
              <span><HeartPulse aria-hidden="true" /></span>
              <strong>Besoin d’aide immédiate ?</strong>
              <small>La clinique reste joignable au 032 724 40 20.</small>
              <ChevronRight aria-hidden="true" />
            </a>
          </div>
        ) : mode === "request" ? (
          <form className="appointment-form" onSubmit={submit}>
            <label>
              Votre numéro de téléphone
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} required inputMode="tel" autoComplete="tel" placeholder="+41 79 123 45 67" />
            </label>
            <fieldset className="appointment-fieldset">
              <legend>Êtes-vous déjà patient chez nous ?</legend>
              <RadioGroup className="choice-pills" value={existingPatient} onValueChange={setExistingPatient}>
                <label><RadioGroupItem value="yes" /> Oui</label>
                <label><RadioGroupItem value="no" /> Non</label>
              </RadioGroup>
            </fieldset>
            <fieldset className="appointment-fieldset">
              <legend>Quel rendez-vous souhaitez-vous ?</legend>
              <RadioGroup className="need-options" value={need} onValueChange={setNeed}>
                <label>
                  <RadioGroupItem value="urgence" />
                  <span><strong>Urgence</strong><small>30 minutes</small></span>
                </label>
                <label>
                  <RadioGroupItem value="bilan" />
                  <span><strong>Bilan</strong><small>45 minutes</small></span>
                </label>
              </RadioGroup>
            </fieldset>
            <p className="form-note">Notre système de prise de RDV va vous permettre de choisir votre rendez-vous via votre téléphone.</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="dialog-actions">
              <button className="text-button" type="button" onClick={() => { setMode("choice"); setError(""); }}>Retour</button>
              <Button className="primary-cta" type="submit" disabled={pending}>
                {pending ? <Loader2 className="spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                Prendre mon RDV
              </Button>
            </div>
          </form>
        ) : mode === "manage" ? (
          <form className="appointment-form" onSubmit={submit}>
            <label>
              Votre numéro de téléphone
              <Input value={phone} onChange={(event) => setPhone(event.target.value)} required inputMode="tel" autoComplete="tel" placeholder="+41 79 123 45 67" />
            </label>
            <label>
              Code à 5 caractères <span className="optional">facultatif</span>
              <Input value={code} onChange={(event) => setCode(event.target.value)} maxLength={5} autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="Seulement si aucun téléphone n’était enregistré" />
            </label>
            <p className="form-note">Si votre téléphone avait déjà été enregistré, laissez le code vide : le même lien vous sera renvoyé. Sinon, indiquez votre code et votre téléphone pour créer votre accès personnel.</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="dialog-actions">
              <button className="text-button" type="button" onClick={() => { setMode("choice"); setError(""); }}>Retour</button>
              <Button className="primary-cta" type="submit" disabled={pending}>
                {pending ? <Loader2 className="spin" aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                Renvoyer mon lien
              </Button>
            </div>
          </form>
        ) : (
          <div className="appointment-success" role="status">
            <CircleCheck aria-hidden="true" />
            <h3>C’est enregistré</h3>
            <p>{successMessage}</p>
            <p className="form-note">Aucune vérification par SMS n’est nécessaire : ouvrez simplement le lien reçu pour gérer votre rendez-vous.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  return (
    <main id="accueil">
      <Topline message="Nouveaux patients bienvenus" />

      <header className="site-header">
        <Brand />
        <nav className="desktop-nav" aria-label="Navigation principale">
          <a href="#histoire">18 ans d’existence</a>
          <a href="#approche">Notre approche</a>
          <a href="#soins">Nos soins</a>
          <a href="/proprietaires/">Les propriétaires</a>
          <a href="#journal">Le journal</a>
          <a href="/acces/">Accès</a>
        </nav>
        <div className="header-actions">
          <AppointmentDialog compact />
          <details className="mobile-menu">
            <summary aria-label="Ouvrir le menu"><Menu aria-hidden="true" /></summary>
            <nav aria-label="Navigation mobile">
              <a href="#histoire">18 ans d’existence</a>
              <a href="#approche">Notre approche</a>
              <a href="#soins">Nos soins</a>
              <a href="/proprietaires/">Les propriétaires</a>
              <a href="#journal">Le journal</a>
              <a href="/acces/">Accès</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span>Fondée en 2008</span> · 18 ans d’existence</p>
          <h1 id="hero-title">Votre sourire mérite une <em>vision à long terme.</em></h1>
          <p className="hero-lead">
            Une clinique solidement installée à Neuchâtel depuis 18 ans, portée par des praticiens qui disposent d’au moins 25 ans d’expérience et par des protocoles affinés dans la durée.
          </p>
          <div className="hero-actions">
            <AppointmentDialog />
            <a className="secondary-cta" href="#approche">Découvrir notre approche <ArrowRight aria-hidden="true" /></a>
          </div>
          <div className="hero-proof" aria-label="Points forts">
            <span><Check aria-hidden="true" /> 18 ans d’existence à Neuchâtel</span>
            <span><Check aria-hidden="true" /> Organisation et protocoles éprouvés</span>
          </div>
        </div>
        <div className="hero-visual" role="img" aria-label="Patiente souriante dans une clinique dentaire lumineuse">
          <div className="hero-image" />
          <div className="hero-card hero-card-top">
            <ScanLine aria-hidden="true" />
            <span><strong>Votre bouche en 3D</strong><small>Voir, comprendre, décider</small></span>
          </div>
          <div className="hero-card hero-card-bottom">
            <strong>18</strong><span>ans d’existence<br />depuis 2008</span>
          </div>
        </div>
      </section>

      <div className="expertise-ribbon" aria-label="Expertises">
        <span>Maintenance</span><i />
        <span>Esthétique</span><i />
        <span>Endodontie</span><i />
        <span>Orthodontie</span><i />
        <span>Implantologie</span><i />
      </div>

      <section className="legacy section-shell" id="histoire">
        <div className="legacy-number" aria-hidden="true">
          <strong>18</strong>
          <span>ans<br />d’existence</span>
        </div>
        <div className="legacy-copy">
          <p className="eyebrow">Une clinique créée il y a 18 ans</p>
          <h2>La longévité comme preuve.<br /><em>Le sérieux dans la durée.</em></h2>
          <p>
            Fondée en 2008, SourirePlus accompagne les patients de Neuchâtel depuis 18 ans. Cette longévité témoigne d’une clinique stable, fiable et capable d’assumer ses traitements dans le temps. Elle s’appuie sur des praticiens qui possèdent au minimum 25 ans d’expérience, selon leur parcours.
          </p>
        </div>
        <div className="legacy-principles">
          <article>
            <span>01</span>
            <h3>18 ans d’existence</h3>
            <p>Une clinique implantée durablement, qui suit ses patients et assume ses soins sur le long terme.</p>
          </article>
          <article>
            <span>02</span>
            <h3>25 ans d’expérience au moins</h3>
            <p>Des praticiens expérimentés, avec des parcours différents mais tous construits sur plusieurs décennies.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Une organisation sans faille</h3>
            <p>Chaque étape est préparée pour rendre le parcours plus fluide, plus ponctuel et plus efficace.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Des protocoles éprouvés</h3>
            <p>Les méthodes de soins ont été affinées année après année pour gagner en précision et en sérénité.</p>
          </article>
        </div>
      </section>

      <section className="approach section-shell" id="approche">
        <div className="section-intro">
          <p className="eyebrow">Une autre façon de soigner</p>
          <h2>Ne pas seulement réparer.<br /><em>Donner une direction.</em></h2>
        </div>
        <div className="approach-copy">
          <p className="large-copy">
            Notre méthode situe l’âge de votre bouche, mesure ses écarts et dessine sa trajectoire. Une décision dentaire se juge rarement sur six mois&nbsp;: nous regardons avec vous ce qu’elle change pour les dix ou vingt prochaines années.
          </p>
          <a className="inline-link" href="/methode/">Découvrir la méthode SourirePlus <ArrowRight aria-hidden="true" /></a>
        </div>
        <div className="journey-grid">
          <article>
            <span className="step-number">01</span>
            <ScanLine aria-hidden="true" />
            <h3>Créer le jumeau numérique</h3>
            <p>Images, scan 3D et examen clinique réunissent les données utiles de votre bouche.</p>
          </article>
          <article>
            <span className="step-number">02</span>
            <Activity aria-hidden="true" />
            <h3>Mesurer son âge</h3>
            <p>Alignement, gencives, caries, restaurations, fonction et esthétique sont analysés sur six courbes distinctes.</p>
          </article>
          <article>
            <span className="step-number">03</span>
            <ShieldCheck aria-hidden="true" />
            <h3>Choisir une trajectoire</h3>
            <p>Les soins et la maintenance visent un objectif concret pour les années à venir.</p>
          </article>
        </div>
      </section>

      <section className="services" id="soins">
        <div className="section-shell">
          <div className="services-heading">
            <div>
              <p className="eyebrow light">Nos compétences</p>
              <h2>Tout ce qu’il faut.<br /><em>Rien de superflu.</em></h2>
            </div>
            <p>Une équipe coordonnée pour les soins du quotidien comme pour les traitements les plus complets.</p>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.title}>
                <div><span>{service.number}</span><small>{service.tag}</small></div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <a href="#rendez-vous" aria-label={"En savoir plus sur " + service.title}><ArrowRight aria-hidden="true" /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="technology section-shell">
        <div className="technology-visual" role="img" aria-label="Scan dentaire numérique dans une salle de soins moderne">
          <div className="technology-image" />
          <span className="image-caption">Le numérique, pour mieux expliquer — pas pour compliquer.</span>
        </div>
        <div className="technology-copy">
          <p className="eyebrow">La nouvelle dentisterie</p>
          <h2>Votre jumeau numérique donne vie à la courbe.</h2>
          <p>
            Le scan intra-oral transforme votre bouche en modèle 3D. Intégré à la méthode SourirePlus, ce jumeau numérique permet de comparer, d’expliquer et de suivre votre trajectoire au lieu de regarder chaque soin isolément.
          </p>
          <ul>
            <li><Check aria-hidden="true" /><span><strong>Empreinte numérique</strong> plus confortable et immédiatement visible</span></li>
            <li><Check aria-hidden="true" /><span><strong>Six axes de lecture</strong> pour relier vos observations personnelles aux courbes de population concernée</span></li>
            <li><Check aria-hidden="true" /><span><strong>Suivi dans le temps</strong> pour visualiser l’effet des soins et de la maintenance</span></li>
          </ul>
          <a className="inline-link" href="/jumeau-numerique/">Découvrir le jumeau numérique <ArrowRight aria-hidden="true" /></a>
        </div>
      </section>

      <section className="team section-shell" id="equipe">
        <div className="team-heading">
          <div>
            <p className="eyebrow">L’équipe</p>
            <h2>Plusieurs regards.<br /><em>Une seule direction.</em></h2>
          </div>
          <div className="team-heading-aside">
            <p>Les traitements sont coordonnés entre praticiens pour que chaque compétence arrive au bon moment.</p>
            <a className="inline-link" href="/proprietaires/">Découvrir les deux propriétaires <ArrowRight aria-hidden="true" /></a>
          </div>
        </div>
        <div className="team-list">
          <article>
            <div className="portrait-placeholder portrait-raphael" role="img" aria-label="Portrait du Dr Raphaël Lacoste" />
            <h3>Dr Raphaël Lacoste</h3>
            <p>Endodontie · Esthétique</p>
          </article>
          <article>
            <div className="portrait-placeholder alt"><span>PE</span></div>
            <h3>Dr Philippe Elalouf</h3>
            <p>Médecin-dentiste · Implantologie</p>
          </article>
          <article>
            <div className="portrait-placeholder gold"><span>GG</span></div>
            <h3>Dr Guillaume Guilbert</h3>
            <p>Orthodontiste</p>
          </article>
          <article className="team-more">
            <span>+</span>
            <h3>Toute une équipe</h3>
            <p>Hygiène, assistance et accueil</p>
          </article>
        </div>
      </section>

      <section className="journal" id="journal">
        <div className="section-shell">
          <div className="journal-heading">
            <div>
              <p className="eyebrow">Le journal du sourire</p>
              <h2>Sérieux sur les soins.<br /><em>Pas toujours sur le ton.</em></h2>
            </div>
            <p>Des réponses utiles, quelques idées reçues malmenées et zéro leçon de morale.</p>
          </div>
          <div className="article-grid">
            {articles.map((article, index) => (
              <article className={"article-card " + article.tone} key={article.title}>
                {index === 0 && <div className="article-art" role="img" aria-label="Objets éditoriaux inspirés par la santé dentaire" />}
                <div className="article-body">
                  <p>{article.category}</p>
                  <h3>{article.title}</h3>
                  <span>{article.text}</span>
                  <a href={article.href}>Lire l’article <ArrowRight aria-hidden="true" /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="location-preview section-shell" id="acces">
        <div className="location-preview-copy">
          <p className="eyebrow">Au cœur de Neuchâtel</p>
          <h2>À deux minutes de la gare.<br /><em>Avec deux places pour vous.</em></h2>
          <p>Retrouvez-nous rue du Crêt-Taconnet 8a. En voiture, le parking patients se trouve au niveau −2, places 91 et 92.</p>
          <a className="inline-link" href="/acces/">Voir l’accès et le parking <ArrowRight aria-hidden="true" /></a>
        </div>
        <NeighborhoodMap compact />
      </section>

      <section className="appointment-band" id="rendez-vous">
        <div className="section-shell">
          <div>
            <p className="eyebrow light">Commençons simplement</p>
            <h2>Parlez-nous de votre sourire.</h2>
            <p>Premier bilan, urgence ou projet précis : nous vous orientons vers le bon rendez-vous.</p>
          </div>
          <AppointmentDialog />
        </div>
      </section>

      <footer id="contact">
        <div className="section-shell footer-main">
          <div className="footer-brand">
            <Brand />
            <p>Des choix clairs pour un sourire qui dure.</p>
            <div className="social-links">
              <a aria-label="Facebook SourirePlus" href="https://www.facebook.com/SourirePlus.CliniqueDentaire.Neuchatel.Suisse/"><b aria-hidden="true">f</b></a>
              <span aria-label="Instagram à venir"><b aria-hidden="true">ig</b></span>
            </div>
          </div>
          <div>
            <h3>Nous trouver</h3>
            <address>Rue du Crêt-Taconnet 8a<br />2000 Neuchâtel<br />Suisse</address>
            <p>Gare à 2 min · Parking patients −2, places 91–92</p>
            <a className="footer-link" href="https://www.google.com/maps/search/?api=1&query=Rue+du+Cr%C3%AAt-Taconnet+8a+2000+Neuch%C3%A2tel">Voir l’itinéraire <ArrowRight aria-hidden="true" /></a>
          </div>
          <div>
            <h3>Nous joindre</h3>
            <a href="tel:+41327244020">032 724 40 20</a>
            <a href="mailto:info@sourireplus.ch">info@sourireplus.ch</a>
            <p>Sur rendez-vous</p>
          </div>
          <div>
            <h3>Accès rapide</h3>
            <a href="#soins">Nos soins</a>
            <a href="/methode/">La méthode SourirePlus</a>
            <a href="/proprietaires/">Les propriétaires</a>
            <a href="/acces/">Accès et parking</a>
            <a href="#journal">Le journal</a>
            <a href="https://www.mydentalpass.ch/borne/">Mon rendez-vous</a>
          </div>
        </div>
        <div className="footer-bottom section-shell">
          <span>© 2026 Clinique Dentaire SourirePlus SA</span>
          <div><a href="/mentions-legales/">Mentions légales</a><a href="/protection-des-donnees/">Protection des données</a></div>
        </div>
      </footer>
    </main>
  );
}

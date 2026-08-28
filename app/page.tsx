"use client";

import {
  Activity,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  HeartPulse,
  MapPin,
  Menu,
  Phone,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  },
  {
    category: "Mode d’emploi",
    title: "Brosse électrique : meilleure, vraiment ?",
    text: "Le bon outil aide. La bonne méthode fait presque tout le reste.",
    tone: "navy",
  },
  {
    category: "Les dents ont leur logique",
    title: "Pourquoi ça casse toujours le week-end",
    text: "Ce n’est pas une conspiration. Mais il existe quelques signaux à ne pas ignorer.",
    tone: "gold",
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

function AppointmentDialog({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<"choice" | "request">("choice");

  return (
    <Dialog onOpenChange={(open) => !open && setMode("choice")}>
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
            Choisissez votre situation pour être orienté sans perdre de temps.
          </DialogDescription>
        </DialogHeader>

        {mode === "choice" ? (
          <div className="appointment-choices">
            <button className="appointment-choice" onClick={() => setMode("request")}>
              <span><Sparkles aria-hidden="true" /></span>
              <strong>Nouveau patient</strong>
              <small>Premier bilan, douleur ou projet de sourire.</small>
              <ChevronRight aria-hidden="true" />
            </button>
            <a className="appointment-choice" href="https://www.mydentalpass.ch/borne/">
              <span><CalendarDays aria-hidden="true" /></span>
              <strong>J’ai déjà mon code</strong>
              <small>Choisir ou modifier un rendez-vous avec la borne.</small>
              <ChevronRight aria-hidden="true" />
            </a>
            <a className="appointment-choice" href="tel:+41327244020">
              <span><HeartPulse aria-hidden="true" /></span>
              <strong>J’ai une urgence</strong>
              <small>Appelez-nous directement au 032 724 40 20.</small>
              <ChevronRight aria-hidden="true" />
            </a>
          </div>
        ) : (
          <form
            className="appointment-form"
            action="https://www.onedoc.ch/fr/cabinet-dentaire/neuchatel/et86/clinique-dentaire-sourire-plus"
            method="get"
          >
            <div className="field-grid">
              <label>
                Votre besoin
                <select name="motif" defaultValue="bilan">
                  <option value="bilan">Premier bilan</option>
                  <option value="douleur">Douleur ou urgence</option>
                  <option value="esthetique">Projet esthétique</option>
                  <option value="orthodontie">Orthodontie</option>
                  <option value="implantologie">Implantologie</option>
                </select>
              </label>
              <label>
                Moment préféré
                <select name="periode" defaultValue="indifferent">
                  <option value="indifferent">Peu importe</option>
                  <option value="matin">Le matin</option>
                  <option value="apres-midi">L’après-midi</option>
                </select>
              </label>
            </div>
            <p className="form-note">
              La réservation des nouveaux patients est temporairement finalisée sur OneDoc.
              La prochaine étape branchera directement ce formulaire à la borne SourirePlus.
            </p>
            <div className="dialog-actions">
              <button className="text-button" type="button" onClick={() => setMode("choice")}>Retour</button>
              <Button className="primary-cta" type="submit">
                Voir les rendez-vous <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  return (
    <main id="accueil">
      <div className="topline">
        <p><span /> Nouveaux patients bienvenus</p>
        <div>
          <a href="tel:+41327244020"><Phone aria-hidden="true" /> 032 724 40 20</a>
          <a href="#contact"><MapPin aria-hidden="true" /> Neuchâtel, près de la gare</a>
        </div>
      </div>

      <header className="site-header">
        <Brand />
        <nav className="desktop-nav" aria-label="Navigation principale">
          <a href="#histoire">18 ans</a>
          <a href="#approche">Notre approche</a>
          <a href="#soins">Nos soins</a>
          <a href="#equipe">L’équipe</a>
          <a href="#journal">Le journal</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <AppointmentDialog compact />
          <details className="mobile-menu">
            <summary aria-label="Ouvrir le menu"><Menu aria-hidden="true" /></summary>
            <nav aria-label="Navigation mobile">
              <a href="#histoire">18 ans</a>
              <a href="#approche">Notre approche</a>
              <a href="#soins">Nos soins</a>
              <a href="#equipe">L’équipe</a>
              <a href="#journal">Le journal</a>
              <a href="#contact">Contact</a>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero section-shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span>18 ans à Neuchâtel</span> · Depuis 2008</p>
          <h1 id="hero-title">Votre sourire mérite une <em>vision à long terme.</em></h1>
          <p className="hero-lead">
            Une équipe de praticiens fidèle, des protocoles affinés au fil des années et une technologie utile pour choisir aujourd’hui ce qui protégera votre bouche demain.
          </p>
          <div className="hero-actions">
            <AppointmentDialog />
            <a className="secondary-cta" href="#approche">Découvrir notre approche <ArrowRight aria-hidden="true" /></a>
          </div>
          <div className="hero-proof" aria-label="Points forts">
            <span><Check aria-hidden="true" /> Continuité des praticiens</span>
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
            <strong>18</strong><span>ans de continuité<br />à Neuchâtel</span>
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
          <span>années<br />d’expérience</span>
        </div>
        <div className="legacy-copy">
          <p className="eyebrow">Notre différence depuis 2008</p>
          <h2>La stabilité qui rassure.<br /><em>L’expérience qui fait gagner du temps.</em></h2>
          <p>
            À Neuchâtel, SourirePlus s’inscrit dans la durée. La continuité de ses praticiens permet de connaître les patients, de suivre leur bouche sur plusieurs années et de prendre des décisions avec le recul que la dentisterie exige.
          </p>
        </div>
        <div className="legacy-principles">
          <article>
            <span>01</span>
            <h3>Une équipe qui se connaît</h3>
            <p>Les compétences se coordonnent naturellement, avec une information qui circule sans rupture.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Une organisation sans faille</h3>
            <p>Chaque étape est préparée pour rendre le parcours plus fluide, plus ponctuel et plus efficace.</p>
          </article>
          <article>
            <span>03</span>
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
            <p>Gencives, dents, usure, fonction et esthétique sont situées sur des courbes lisibles.</p>
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
            <li><Check aria-hidden="true" /><span><strong>Courbes personnalisées</strong> pour situer les forces et les fragilités de votre bouche</span></li>
            <li><Check aria-hidden="true" /><span><strong>Suivi dans le temps</strong> pour visualiser l’effet des soins et de la maintenance</span></li>
          </ul>
          <a className="inline-link" href="/methode/">Comprendre les courbes <ArrowRight aria-hidden="true" /></a>
        </div>
      </section>

      <section className="team section-shell" id="equipe">
        <div className="team-heading">
          <div>
            <p className="eyebrow">L’équipe</p>
            <h2>Plusieurs regards.<br /><em>Une seule direction.</em></h2>
          </div>
          <p>Les traitements sont coordonnés entre praticiens pour que chaque compétence arrive au bon moment.</p>
        </div>
        <div className="team-list">
          <article>
            <div className="portrait-placeholder"><span>RL</span></div>
            <h3>Dr Raphaël Lacoste</h3>
            <p>Médecin-dentiste</p>
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
                  <a href="#rendez-vous">Lire bientôt <ArrowRight aria-hidden="true" /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
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
            <a href="#equipe">L’équipe</a>
            <a href="#journal">Le journal</a>
            <a href="https://www.mydentalpass.ch/borne/">Mon rendez-vous</a>
          </div>
        </div>
        <div className="footer-bottom section-shell">
          <span>© 2026 Clinique Dentaire SourirePlus SA</span>
          <div><a href="#contact">Mentions légales</a><a href="#contact">Protection des données</a></div>
        </div>
      </footer>
    </main>
  );
}

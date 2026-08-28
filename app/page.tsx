"use client";

import {
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
  Stethoscope,
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
          <p className="eyebrow"><span>Depuis 2008</span> · Clinique pluridisciplinaire</p>
          <h1 id="hero-title">Votre sourire mérite une <em>vision à long terme.</em></h1>
          <p className="hero-lead">
            Des soins précis, une technologie utile et des explications claires pour choisir aujourd’hui ce qui protégera votre bouche demain.
          </p>
          <div className="hero-actions">
            <AppointmentDialog />
            <a className="secondary-cta" href="#approche">Découvrir notre approche <ArrowRight aria-hidden="true" /></a>
          </div>
          <div className="hero-proof" aria-label="Points forts">
            <span><Check aria-hidden="true" /> Plan de traitement lisible</span>
            <span><Check aria-hidden="true" /> Équipe multidisciplinaire</span>
          </div>
        </div>
        <div className="hero-visual" role="img" aria-label="Patiente souriante dans une clinique dentaire lumineuse">
          <div className="hero-image" />
          <div className="hero-card hero-card-top">
            <ScanLine aria-hidden="true" />
            <span><strong>Votre bouche en 3D</strong><small>Voir, comprendre, décider</small></span>
          </div>
          <div className="hero-card hero-card-bottom">
            <strong>8</strong><span>salles de soins<br />au même endroit</span>
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

      <section className="approach section-shell" id="approche">
        <div className="section-intro">
          <p className="eyebrow">Une autre façon de soigner</p>
          <h2>Ne pas seulement réparer.<br /><em>Donner une direction.</em></h2>
        </div>
        <div className="approach-copy">
          <p className="large-copy">
            Une décision dentaire se juge rarement sur six mois. Nous regardons avec vous ce qu’elle change pour les dix ou vingt prochaines années.
          </p>
          <a className="inline-link" href="#soins">Explorer nos compétences <ArrowRight aria-hidden="true" /></a>
        </div>
        <div className="journey-grid">
          <article>
            <span className="step-number">01</span>
            <ScanLine aria-hidden="true" />
            <h3>Voir clairement</h3>
            <p>Images, scan 3D et examen clinique réunis dans un diagnostic compréhensible.</p>
          </article>
          <article>
            <span className="step-number">02</span>
            <Stethoscope aria-hidden="true" />
            <h3>Choisir sereinement</h3>
            <p>Les options, leurs bénéfices et leurs limites sont comparés sans pression.</p>
          </article>
          <article>
            <span className="step-number">03</span>
            <ShieldCheck aria-hidden="true" />
            <h3>Préserver longtemps</h3>
            <p>Le suivi et la maintenance protègent le résultat bien après le traitement.</p>
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
          <p className="eyebrow">Précision numérique</p>
          <h2>Vous voyez ce que nous voyons.</h2>
          <p>
            Le scan intra-oral transforme votre bouche en modèle 3D. Vous comprenez la situation, suivez son évolution et participez réellement aux décisions.
          </p>
          <ul>
            <li><Check aria-hidden="true" /><span><strong>Empreinte numérique</strong> plus confortable et immédiatement visible</span></li>
            <li><Check aria-hidden="true" /><span><strong>Suivi dans le temps</strong> pour repérer les changements subtils</span></li>
            <li><Check aria-hidden="true" /><span><strong>Projet partagé</strong> avec des objectifs et des étapes compréhensibles</span></li>
          </ul>
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
            <div className="portrait-placeholder alt"><span>DL</span></div>
            <h3>Dr Denis Liquière</h3>
            <p>Médecin-dentiste</p>
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

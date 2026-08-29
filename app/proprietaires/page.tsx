import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Microscope,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Topline } from "../Topline";

export const metadata: Metadata = {
  title: "Les propriétaires | Clinique Dentaire SourirePlus",
  description:
    "Découvrez les deux propriétaires de SourirePlus : le Dr Raphaël Lacoste, en endodontie et esthétique, et le Dr Guillaume Guilbert, orthodontiste.",
  alternates: { canonical: "/proprietaires/" },
  openGraph: {
    title: "Raphaël Lacoste et Guillaume Guilbert | SourirePlus",
    description: "Deux propriétaires, des compétences distinctes et une même responsabilité envers la continuité de la clinique.",
    url: "/proprietaires/",
    type: "profile",
  },
};

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

export default function ProprietairesPage() {
  return (
    <main className="owners-page">
      <Topline message="Nouveaux patients bienvenus" />

      <header className="site-header method-header owners-header">
        <Brand />
        <nav className="owners-nav" aria-label="Navigation de la page">
          <a href="#histoire">Notre histoire</a>
          <a href="#raphael">Raphaël Lacoste</a>
          <a href="#guillaume">Guillaume Guilbert</a>
        </nav>
        <Link className="method-appointment" href="/#rendez-vous">
          <CalendarDays aria-hidden="true" /> Prendre rendez-vous
        </Link>
      </header>

      <section className="owners-hero section-shell">
        <div className="owners-hero-copy">
          <Link className="back-link" href="/"><ArrowLeft aria-hidden="true" /> Retour à l’accueil</Link>
          <p className="eyebrow">Les deux propriétaires de SourirePlus</p>
          <h1>Une clinique a besoin d’une vision.<br /><em>Elle a surtout besoin de visages.</em></h1>
          <p className="owners-lead">
            Raphaël Lacoste et Guillaume Guilbert portent aujourd’hui la continuité de SourirePlus. La clinique existe depuis 18 ans&nbsp;; leurs parcours de praticiens sont encore plus longs.
          </p>
          <div className="owners-proof">
            <span><strong>2008</strong><small>Création de la clinique</small></span>
            <span><strong>18 ans</strong><small>D’existence à Neuchâtel</small></span>
            <span><strong>25 ans +</strong><small>De pratique selon les parcours</small></span>
          </div>
        </div>

        <figure className="owners-archive">
          <Image
            src="/images/proprietaires-archive.webp"
            alt="Les docteurs Raphaël Lacoste et Guillaume Guilbert devant la clinique SourirePlus"
            width={1230}
            height={500}
            priority
          />
          <figcaption>
            <span>Archives SourirePlus</span>
            <p>Une photographie d’hier devant la clinique. Les années passent, l’engagement demeure.</p>
          </figcaption>
          <div className="owners-archive-seal" aria-hidden="true"><strong>18</strong><span>ans<br />ensemble</span></div>
        </figure>
      </section>

      <section className="owners-story" id="histoire">
        <div className="section-shell owners-story-grid">
          <div>
            <p className="eyebrow light">Une histoire qui continue</p>
            <h2>La confiance ne se décrète pas.<br /><em>Elle se construit.</em></h2>
          </div>
          <div className="owners-story-copy">
            <p>
              Depuis sa création en 2008, SourirePlus grandit sans perdre son fil conducteur&nbsp;: suivre les patients dans le temps, rendre les décisions compréhensibles et assumer les soins bien au-delà du rendez-vous qui les a fait naître.
            </p>
            <p>
              Cette longévité est un gage de sérieux. Elle a permis d’affiner une organisation interne, des protocoles de soins et une coordination d’équipe qui rendent le parcours plus fluide, plus précis et plus serein.
            </p>
            <ul>
              <li><Check aria-hidden="true" /> Une clinique présente depuis 18 ans</li>
              <li><Check aria-hidden="true" /> Une continuité entre les praticiens</li>
              <li><Check aria-hidden="true" /> Des décisions pensées pour durer</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="owner-profile section-shell" id="raphael">
        <figure className="owner-portrait owner-portrait-raphael">
          <Image src="/images/raphael-lacoste-portrait-2026.webp" alt="Portrait professionnel récent du Dr Raphaël Lacoste" width={1122} height={1402} />
          <figcaption>Dr Raphaël Lacoste · Médecin-dentiste</figcaption>
        </figure>
        <div className="owner-profile-copy">
          <p className="eyebrow">Deux pôles de compétence</p>
          <h2>Dr Raphaël Lacoste</h2>
          <p className="owner-role">Endodontie &amp; esthétique</p>
          <p className="owner-intro">
            Deux domaines qui pourraient sembler opposés, mais qui répondent à la même exigence&nbsp;: préserver la dent quand cela est possible, puis retrouver une harmonie naturelle et cohérente avec le visage.
          </p>

          <div className="skill-poles">
            <article>
              <div><Microscope aria-hidden="true" /><span>01</span></div>
              <h3>Endodontie</h3>
              <p>Comprendre l’origine d’une douleur, traiter l’intérieur de la dent avec précision et lui donner une nouvelle chance plutôt que la remplacer trop vite.</p>
              <strong>Diagnostiquer · Soulager · Préserver</strong>
            </article>
            <article>
              <div><Sparkles aria-hidden="true" /><span>02</span></div>
              <h3>Esthétique</h3>
              <p>Travailler la couleur, les formes et les proportions sans fabriquer un sourire standard. L’objectif reste que le résultat vous ressemble.</p>
              <strong>Observer · Harmoniser · Rester naturel</strong>
            </article>
          </div>

          <p className="owner-method-note">
            Ces deux regards s’intègrent à la méthode SourirePlus&nbsp;: situer l’âge de la bouche, comprendre ses six courbes et choisir une trajectoire plutôt qu’une succession de gestes isolés.
          </p>
          <Link className="inline-link" href="/methode/">Découvrir la méthode SourirePlus <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>

      <section className="owner-profile owner-profile-alt" id="guillaume">
        <div className="section-shell owner-profile-alt-grid">
          <div className="owner-profile-copy">
            <p className="eyebrow light">Le mouvement dans le temps</p>
            <h2>Dr Guillaume Guilbert</h2>
            <p className="owner-role">Orthodontiste</p>
            <p className="owner-intro">
              L’orthodontie ne consiste pas seulement à aligner des dents. Elle accompagne une croissance, un équilibre et une évolution qui se poursuivent bien après la fin d’un traitement.
            </p>
            <div className="guillaume-focus">
              <ShieldCheck aria-hidden="true" />
              <div>
                <strong>Aligner avec une vision durable</strong>
                <p>Prendre en compte la fonction, la stabilité et les changements futurs pour inscrire le résultat dans la vie du patient.</p>
              </div>
            </div>
            <p className="owner-method-note light-note">
              Son regard complète celui de Raphaël Lacoste&nbsp;: deux propriétaires, des compétences distinctes et une même responsabilité envers la continuité de la clinique.
            </p>
          </div>
          <figure className="owner-portrait owner-portrait-pending">
            <div aria-hidden="true"><span>GG</span><i /></div>
            <figcaption>
              <strong>Nouveau portrait à venir</strong>
              <span>Dr Guillaume Guilbert · Orthodontiste</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="owners-together section-shell">
        <div className="owners-together-heading">
          <p className="eyebrow">Deux propriétaires, une direction commune</p>
          <h2>Ce qui fait durer une clinique<br /><em>se joue aussi en coulisses.</em></h2>
        </div>
        <div className="owners-values">
          <article><span>01</span><h3>Se parler</h3><p>Partager les observations et confronter les points de vue avant les décisions importantes.</p></article>
          <article><span>02</span><h3>S’organiser</h3><p>Des protocoles rodés pour que la bonne information et le bon matériel soient disponibles au bon moment.</p></article>
          <article><span>03</span><h3>Suivre</h3><p>Conserver un fil dans le temps grâce à la maintenance, au jumeau numérique et à la connaissance du patient.</p></article>
          <article><span>04</span><h3>Assumer</h3><p>Être encore là demain pour comprendre, contrôler et accompagner les soins réalisés aujourd’hui.</p></article>
        </div>
      </section>

      <section className="owners-cta">
        <div className="section-shell">
          <div>
            <p className="eyebrow light">Faire connaissance</p>
            <h2>Votre histoire dentaire mérite d’être entendue.</h2>
            <p>Urgence ou bilan&nbsp;: notre système vous permet de choisir votre rendez-vous depuis votre téléphone.</p>
          </div>
          <Link className="primary-cta" href="/#rendez-vous"><CalendarDays aria-hidden="true" /> Prendre mon RDV</Link>
        </div>
      </section>

      <footer className="method-footer">
        <div className="section-shell">
          <Brand />
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

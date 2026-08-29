import { Building2, CarFront, ExternalLink, TrainFront } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MAPS_URL, SWISS_AERIAL_IMAGE_URL } from "./site-data";
import styles from "./NeighborhoodMap.module.css";

export function NeighborhoodMap({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`neighborhood-map ${styles.neighborhoodMap}${compact ? ` ${styles.compact}` : ""}`}>
      <div className={styles.stage}>
        <figure className={styles.frame}>
          {/* Une orthophoto est préférable ici à un fond cartographique stylisé : les bâtiments restent reconnaissables. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.aerialImage}
            src={SWISS_AERIAL_IMAGE_URL}
            alt="Vue aérienne couleur du quartier de la gare de Neuchâtel, avec la clinique SourirePlus et le parking patients"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className={styles.aerialShade} aria-hidden="true" />

          <svg className={styles.routes} viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
            <path className={styles.routeShadow} d="M 510 505 C 660 510, 825 485, 1035 438" />
            <path className={`${styles.route} ${styles.routeStation}`} d="M 510 505 C 660 510, 825 485, 1035 438" />
            <path className={styles.routeShadow} d="M 1288 324 C 1220 355, 1135 402, 1035 438" />
            <path className={`${styles.route} ${styles.routeParking}`} d="M 1288 324 C 1220 355, 1135 402, 1035 438" />
          </svg>

          <div className={`${styles.landmark} ${styles.station}`}>
            <span className={styles.landmarkIcon}><TrainFront aria-hidden="true" /></span>
            <span><strong>Gare de Neuchâtel</strong><small>2 minutes à pied</small></span>
          </div>

          <div className={`${styles.landmark} ${styles.ofs}`}>
            <span className={styles.landmarkIcon}><Building2 aria-hidden="true" /></span>
            <span><strong>Tour vitrée de l’OFS</strong><small>Le grand repère du quartier</small></span>
          </div>

          <div className={styles.clinicPin} aria-label="Clinique Dentaire SourirePlus">
            <span className={styles.clinicLogo}>
              <Image
                src="/images/logo-sourireplus-original.png"
                alt=""
                width={72}
                height={72}
              />
            </span>
            <span className={styles.clinicLabel}><strong>SourirePlus</strong><small>Clinique · numéro 8a</small></span>
          </div>

          <div className={`${styles.landmark} ${styles.parking}`}>
            <span className={styles.landmarkIcon}><CarFront aria-hidden="true" /></span>
            <span><strong>Parking · numéro 14</strong><small>Niveau −2 · places 91–92</small></span>
          </div>

          <figcaption className={styles.attribution}>Vue aérienne © swisstopo</figcaption>
        </figure>
      </div>
      <div className={styles.actions}>
        <Link href="/acces/">Toutes les informations d’accès</Link>
        <a href={MAPS_URL} target="_blank" rel="noreferrer">
          Ouvrir l’itinéraire <ExternalLink aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

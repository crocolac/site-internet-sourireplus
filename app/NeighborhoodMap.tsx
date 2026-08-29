import { CarFront, ExternalLink, TrainFront } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MAPS_URL, SWISS_MAP_EMBED_URL } from "./site-data";

export function NeighborhoodMap({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`neighborhood-map${compact ? " neighborhood-map-compact" : ""}`}>
      <div className="neighborhood-map-stage">
        <div className="neighborhood-map-frame">
          <iframe
            src={SWISS_MAP_EMBED_URL}
            title="Plan du quartier de la Clinique Dentaire SourirePlus à Neuchâtel"
            loading="lazy"
            referrerPolicy="no-referrer"
            tabIndex={-1}
          />
          <div className="map-tint" aria-hidden="true" />
          <div className="map-clinic-pin" aria-label="Clinique Dentaire SourirePlus">
            <span className="map-clinic-logo">
              <Image
                src="/images/logo-sourireplus-original.png"
                alt=""
                width={72}
                height={72}
              />
            </span>
            <strong>SourirePlus</strong>
          </div>
          <div className="map-note map-note-station">
            <TrainFront aria-hidden="true" />
            <span><strong>Gare de Neuchâtel</strong><small>2 minutes à pied</small></span>
          </div>
          <div className="map-note map-note-parking">
            <CarFront aria-hidden="true" />
            <span><strong>Parking patients</strong><small>Niveau −2 · places 91–92</small></span>
          </div>
        </div>
      </div>
      <div className="map-actions">
        <Link href="/acces/">Toutes les informations d’accès</Link>
        <a href={MAPS_URL} target="_blank" rel="noreferrer">
          Ouvrir l’itinéraire <ExternalLink aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}


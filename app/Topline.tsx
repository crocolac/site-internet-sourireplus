import { MapPin, Phone } from "lucide-react";
import Link from "next/link";
import {
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  PHONE_DISPLAY,
  PHONE_INTERNATIONAL,
} from "./site-data";

export function Topline({ message = "Clinique Dentaire SourirePlus · Depuis 2008" }: { message?: string }) {
  return (
    <div className="topline">
      <p><span /> {message}</p>
      <div className="topline-actions">
        <span
          className="google-rating-badge"
          aria-label={`Avis Google : ${GOOGLE_RATING} sur 5, ${GOOGLE_REVIEW_COUNT} avis`}
        >
          <strong>Google</strong>
          <span className="google-stars" aria-hidden="true">★★★★★</span>
          <b>{GOOGLE_RATING}/5</b>
          <span>{GOOGLE_REVIEW_COUNT} avis</span>
        </span>
        <a className="topline-contact" href={`tel:${PHONE_INTERNATIONAL}`}>
          <Phone aria-hidden="true" /> {PHONE_DISPLAY}
        </a>
        <Link className="topline-contact" href="/acces/">
          <MapPin aria-hidden="true" /> À 2 minutes de la gare
        </Link>
      </div>
    </div>
  );
}

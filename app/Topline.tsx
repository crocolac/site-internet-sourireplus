"use client";

import { MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { type CSSProperties, useEffect, useState } from "react";
import {
  GOOGLE_RATING,
  GOOGLE_REVIEW_COUNT,
  PHONE_DISPLAY,
  PHONE_INTERNATIONAL,
} from "./site-data";

type GoogleRating = {
  rating: number;
  reviewCount: number;
};

function isGoogleRating(value: unknown): value is GoogleRating {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GoogleRating>;
  return (
    typeof candidate.rating === "number" &&
    Number.isFinite(candidate.rating) &&
    candidate.rating >= 0 &&
    candidate.rating <= 5 &&
    typeof candidate.reviewCount === "number" &&
    Number.isInteger(candidate.reviewCount) &&
    candidate.reviewCount >= 0
  );
}

export function Topline({ message = "Clinique Dentaire SourirePlus · Depuis 2008" }: { message?: string }) {
  const [googleRating, setGoogleRating] = useState<GoogleRating>({
    rating: GOOGLE_RATING,
    reviewCount: GOOGLE_REVIEW_COUNT,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function refreshGoogleRating() {
      try {
        const response = await fetch("/google-rating.php", {
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok) return;

        const payload: unknown = await response.json();
        if (isGoogleRating(payload)) setGoogleRating(payload);
      } catch {
        // La valeur vérifiée reste visible si Google ou le réseau est indisponible.
      }
    }

    void refreshGoogleRating();
    return () => controller.abort();
  }, []);

  const ratingLabel = googleRating.rating.toLocaleString("fr-CH", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const starStyle = {
    "--google-rating-fill": `${googleRating.rating * 20}%`,
  } as CSSProperties;

  return (
    <div className="topline">
      <p><span /> {message}</p>
      <div className="topline-actions">
        <span
          className="google-rating-badge"
          aria-label={`Avis Google Maps : ${ratingLabel} sur 5, ${googleRating.reviewCount} avis`}
          aria-live="polite"
        >
          <span className="google-maps-attribution" translate="no">Google Maps</span>
          <span className="google-stars" style={starStyle} aria-hidden="true">★★★★★</span>
          <b>{ratingLabel}/5</b>
          <span>{googleRating.reviewCount} avis</span>
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

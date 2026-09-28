import type { Metadata } from "next";
import "./globals.css";
import { SiteAcquisition } from "./AdAttribution";
import {
  ADDRESS_LINE,
  CLINIC_GEO,
  EMAIL,
  FACEBOOK_URL,
  LEGAL_NAME,
  MAPS_URL,
  PHONE_INTERNATIONAL,
  POSTAL_LOCALITY,
  SITE_NAME,
  SITE_URL,
} from "./site-data";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Clinique Dentaire SourirePlus | Dentiste à Neuchâtel",
  description:
    "Clinique dentaire à Neuchâtel : traitement global, esthétique du sourire, endodontie spécialisée et méthode SourirePlus fondée sur une vision à long terme.",
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: LEGAL_NAME,
  category: "Santé dentaire",
  keywords: [
    "dentiste Neuchâtel",
    "clinique dentaire Neuchâtel",
    "dentiste gare Neuchâtel",
    "urgence dentaire Neuchâtel",
    "traitement global dentaire Neuchâtel",
    "réhabilitation orale Neuchâtel",
    "implantologie Neuchâtel",
    "orthodontie Neuchâtel",
    "endodontie Neuchâtel",
    "esthétique dentaire Neuchâtel",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_CH",
    url: "/",
    siteName: SITE_NAME,
    title: "Clinique Dentaire SourirePlus | Dentiste à Neuchâtel",
    description:
      "À deux minutes de la gare de Neuchâtel, SourirePlus développe trois axes forts : traitement global, esthétique du sourire et endodontie spécialisée.",
  },
  twitter: {
    card: "summary",
    title: "Clinique Dentaire SourirePlus | Neuchâtel",
    description: "Traitement global, esthétique du sourire, endodontie spécialisée et vision à long terme à Neuchâtel.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/manifest.webmanifest",
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": ["Dentist", "MedicalClinic"],
    "@id": `${SITE_URL}/#clinic`,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-sourireplus-original.png`,
    image: `${SITE_URL}/images/hero-premium.webp`,
    telephone: PHONE_INTERNATIONAL,
    email: EMAIL,
    foundingDate: "2008",
    priceRange: "CHF",
    sameAs: [FACEBOOK_URL],
    hasMap: MAPS_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: ADDRESS_LINE,
      postalCode: "2000",
      addressLocality: POSTAL_LOCALITY.replace("2000 ", ""),
      addressRegion: "Neuchâtel",
      addressCountry: "CH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: CLINIC_GEO.latitude,
      longitude: CLINIC_GEO.longitude,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Canton de Neuchâtel",
    },
    medicalSpecialty: [
      "Dentistry",
      "Orthodontics",
      "Endodontics",
      "Implant dentistry",
      "Aesthetic dentistry",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "fr-CH",
    publisher: { "@id": `${SITE_URL}/#clinic` },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <style>{`
          .team-list .portrait-placeholder.team-portrait-frame {
            background: #d9e0e4 !important;
            display: block;
          }
          .team-list .team-portrait-frame > img {
            display: block;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            width: 100%;
          }
          .team-list .team-portrait-frame > img.team-portrait-raphael {
            object-position: center 22%;
          }
          .team-list .team-portrait-frame > img.team-portrait-philippe {
            object-position: center 18%;
          }
          .team-list .team-portrait-frame > img.team-portrait-guillaume {
            object-position: center center;
          }
        `}</style>
        <SiteAcquisition />
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}

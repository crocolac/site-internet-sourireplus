import type { Metadata } from "next";
import "./globals.css";
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
    "Fondée en 2008, SourirePlus célèbre 18 ans d’existence à Neuchâtel avec des praticiens ayant au moins 25 ans d’expérience et une méthode fondée sur six courbes.",
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
      "À deux minutes de la gare de Neuchâtel, SourirePlus associe 18 ans d’existence, praticiens expérimentés et méthode fondée sur six courbes.",
  },
  twitter: {
    card: "summary",
    title: "Clinique Dentaire SourirePlus | Neuchâtel",
    description: "18 ans d’existence, une équipe expérimentée et une vision à long terme du sourire.",
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

const philippePortrait = "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";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <style>{`
          .team-list article:nth-child(2) .portrait-placeholder.alt {
            background: #d9e0e4 url("data:image/jpeg;base64,${philippePortrait}") center 20% / cover no-repeat;
          }
          .team-list article:nth-child(2) .portrait-placeholder.alt > span {
            display: none;
          }
        `}</style>
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

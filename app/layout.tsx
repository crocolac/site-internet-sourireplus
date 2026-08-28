import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinique Dentaire SourirePlus | Dentiste à Neuchâtel",
  description:
    "Fondée en 2008, SourirePlus célèbre 18 ans d’existence à Neuchâtel avec des praticiens ayant au moins 25 ans d’expérience et une méthode fondée sur six courbes.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

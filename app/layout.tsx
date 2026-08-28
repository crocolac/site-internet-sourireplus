import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinique Dentaire SourirePlus | Dentiste à Neuchâtel",
  description:
    "Depuis 18 ans à Neuchâtel, SourirePlus réunit une équipe stable, des protocoles éprouvés et une méthode fondée sur l’âge de la bouche et le jumeau numérique.",
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

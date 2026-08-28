import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinique Dentaire SourirePlus | Dentiste à Neuchâtel",
  description:
    "Clinique dentaire pluridisciplinaire à Neuchâtel : maintenance, esthétique, endodontie, orthodontie, implantologie et soins numériques.",
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

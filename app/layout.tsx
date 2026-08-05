import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klayer — Assistant découverte client",
  description: "Analyse structurée des notes d'entretien de découverte client",
  icons: {
    icon: "/klayer-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}

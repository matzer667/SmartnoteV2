import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. CONFIGURATION VIEWPORT (Pour le style App Native sur mobile)
export const viewport: Viewport = {
  themeColor: "#020617", // La couleur de la barre de statut (Bleu nuit)
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Empêche le zoom pour faire "App"
};

// 2. METADATA (SEO & Partage)
export const metadata: Metadata = {
  metadataBase: new URL("https://smartnote.fr"), // Ton vrai nom de domaine

  title: {
    default: "SmartNote - L'excellence Académique",
    template: "%s | SmartNote",
  },
  description: "Simulez vos notes, calculez votre moyenne et validez votre semestre. L'outil indispensable pour les étudiants. Développé par Roméo & Mathis.",
  
  keywords: ["calculateur moyenne", "étudiant", "simulateur notes", "université", "smartnote"],
  
  authors: [{ name: "Roméo" }, { name: "Mathis" }],
  
  icons: {
    icon: "/icon.png",        // Assure-toi d'avoir ce fichier dans /app ou /public
    apple: "/apple-icon.png", // Idem
  },

  openGraph: {
    title: "SmartNote - L'excellence Académique",
    description: "Arrêtez de stresser. Simulez votre réussite dès maintenant.",
    url: "/",
    siteName: "SmartNote",
    images: [
      {
        url: "/smartnote_preview.png", // ⚠️ CORRECTION : Pas de "/public", juste "/"
        width: 1200,
        height: 630,
        alt: "Aperçu de l'interface SmartNote",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "SmartNote",
    description: "Le calculateur de moyenne intelligent.",
    images: ["/smartnote_preview.png"], // ⚠️ CORRECTION ICI AUSSI
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
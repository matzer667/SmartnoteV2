import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smartnote.fr"), 

  title: "SmartNote",
  description: "Calcule ta moyenne en un clic. Développé par Roméo & Mathis.",
  
  openGraph: {
    title: "SmartNote - Calculateur de Moyenne",
    description: "L'outil indispensable pour les étudiants.",
    url: "/", 
    siteName: "SmartNote",
    images: [
      {
        url: "/smartnote_preview.png", 
        width: 1200,
        height: 630,
        alt: "Aperçu de SmartNote",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
return (
  <html lang="fr">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      {children}
    </body>
  </html>
);
}

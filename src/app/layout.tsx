import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import FloatingCart from "@/components/FloatingCart";
import CookieBanner from "@/components/CookieBanner";
import LiveChat from "@/components/LiveChat";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-banner",
  subsets: ["latin"],
  weight: ["400","500","600","700","800","900"],
});

const baseUrl = "https://www.cheotnun.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "CHEOTNUN K-BEAUTY | Cosméticos Coreanos Premium",
    template: "%s | CHEOTNUN K-BEAUTY",
  },
  description: "Cosméticos coreanos autênticos para cada etapa do seu cuidado facial. Fórmulas botânicas que revelam sua luminosidade natural. Envios para toda América Latina e Espanha.",
  keywords: [
    "K-Beauty",
    "Cosméticos Coreanos",
    "Skincare Coreano",
    "Rutina Coreana",
    "Skincare Premium",
    "Cheotnun",
    "Belleza Coreana",
    "Korean Cosmetics",
    "Korean Skincare",
    "Cuidado Facial",
    "Skincare Internacional",
  ],
  authors: [{ name: "Cheotnun K-Beauty", url: baseUrl }],
  creator: "Cheotnun K-Beauty",
  publisher: "Cheotnun K-Beauty",
  verification: {
    google: "fwcjoRIRoX966r_rXvFgPvvcsoWSFwytgqzj2YIcGOU",
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      "es": `${baseUrl}/es`,
      "pt": `${baseUrl}/pt`,
      "en": `${baseUrl}/en`,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    alternateLocale: ["pt_BR", "en_US"],
    url: baseUrl,
    siteName: "CHEOTNUN K-BEAUTY",
    title: "CHEOTNUN K-BEAUTY | Cosméticos Coreanos Premium",
    description: "Cosméticos coreanos autênticos para cada etapa do seu cuidado facial. Envios internacionais.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CHEOTNUN K-BEAUTY - Cosméticos Coreanos Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CHEOTNUN K-BEAUTY | Cosméticos Coreanos Premium",
    description: "Cosméticos coreanos autênticos para cada etapa do seu cuidado facial.",
    images: ["/images/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "beauty",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${cormorant.variable} ${playfair.variable} h-full antialiased overflow-x-hidden`}
    >
      <head>
        <meta name="msvalidate.01" content="BE206678019BB93C1BF74506BE356F3D" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans overflow-x-hidden">
        <ThemeProvider>
          <LanguageProvider>
            {children}
            <FloatingCart />
            <CookieBanner />
            <LiveChat />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
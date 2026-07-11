import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

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

export const metadata: Metadata = {
  title: "YEDAM K-BEAUTY | Cosmética Coreana Premium e Internacional",
  description: "Tu belleza. Tu ritual. Tu momento. Cosméticos coreanos auténticos seleccionados para cada etapa de tu cuidado facial y corporal.",
  keywords: ["K-Beauty España", "Cosméticos Coreanos", "Rutina Coreana", "Skincare Coreano Premium", "Yedam"],
  verification: {
    google: "eXHmuLNMDThcGcALh0xpBDXXtJSNyKHHza5ZIfiYsx0",
  },
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
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans overflow-x-hidden">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

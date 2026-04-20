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
  title: "XiraX AI — Soluciones de IA end-to-end",
  description:
    "Diseñamos, construimos y operamos productos de IA. Automatización, análisis de datos, reportería ejecutiva y productos digitales. Entregados en semanas.",
  metadataBase: new URL("https://xiraxai.com"),
  openGraph: {
    title: "XiraX AI — Soluciones de IA end-to-end",
    description:
      "Soluciones de IA end-to-end, entregadas en semanas. Sin agencias intermedias.",
    url: "https://xiraxai.com",
    siteName: "XiraX AI",
    locale: "es_CO",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

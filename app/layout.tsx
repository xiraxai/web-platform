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
  title: "XiraX AI — Fábrica de productos con IA",
  description:
    "Fábrica de productos con IA para empresas B2B. Mockup en 48 horas, prototipo iterable, producto en producción con monitoreo. Sin agencias intermedias.",
  metadataBase: new URL("https://xiraxai.com"),
  openGraph: {
    title: "XiraX AI — Fábrica de productos con IA",
    description:
      "Mockup en 48 horas. Prototipo iterable. Producto en producción con monitoreo. Cada fase aprueba la siguiente.",
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

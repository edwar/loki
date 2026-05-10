import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://loki.app'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Loki - Plataforma de Gestión Empresarial",
    template: "%s | Loki",
  },
  description: "Sistema integral de gestión empresarial para emprendedores. Control de inventario, ventas, producción, gastos, clientes y reportes PDF en una sola plataforma.",
  keywords: [
    "gestión empresarial",
    "sistema de ventas",
    "control de inventario",
    "software para negocios",
    "emprendedores",
    "facturación",
    "reportes PDF",
    "dashboard empresarial",
  ],
  authors: [{ name: "Loki Systems" }],
  creator: "Loki Systems",
  publisher: "Loki Systems",
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
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: baseUrl,
    siteName: "Loki",
    title: "Loki - Plataforma de Gestión Empresarial",
    description: "Sistema integral de gestión empresarial para emprendedores. Control de inventario, ventas, producción, gastos y reportes PDF.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Loki - Plataforma de Gestión Empresarial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Loki - Plataforma de Gestión Empresarial",
    description: "Sistema integral de gestión empresarial para emprendedores.",
    images: ["/og-image.png"],
    creator: "@lokisystems",
  },
  alternates: {
    canonical: baseUrl,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Loki",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${outfit.variable} min-h-full antialiased font-sans overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
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

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  return "https://loki.app";
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "Loki - Gestión Empresarial Completa para Emprendedores",
    template: "%s | Loki",
  },
  description: "Plataforma de gestión integral para tu negocio. Controla inventario, ventas, producción, gastos, clientes y genera reportes PDF automáticos.",
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
    url: getBaseUrl(),
    siteName: "Loki",
    title: "Loki - Gestión Empresarial Completa para Emprendedores",
    description: "Plataforma de gestión integral para tu negocio. Controla inventario, ventas, producción, gastos, clientes y genera reportes PDF automáticos.",
    images: [
      {
        url: `${getBaseUrl()}/og.webp`,
        width: 1200,
        height: 630,
        alt: "Loki - Plataforma de Gestión Empresarial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Loki - Gestión Empresarial Completa para Emprendedores",
    description: "Controla inventario, ventas, producción, gastos y reportes PDF en una sola plataforma.",
    images: [`${getBaseUrl()}/og.webp`],
    creator: "@lokisystems",
  },
  alternates: {
    canonical: getBaseUrl(),
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Loki",
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
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
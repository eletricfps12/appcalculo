import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { ScriptInline } from "@/components/script-inline";
import { SincronizadorTema } from "@/components/tema";
import { CONFIG } from "@/lib/config";
import { SCRIPT_TEMA } from "@/lib/tema";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: CONFIG.sistema,
  description: "Sistema de ajuste de receitas para produção de embutidos",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ef" },
    { media: "(prefers-color-scheme: dark)", color: "#111316" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o script do tema troca data-tema antes da hidratação,
    // e extensões do navegador (ex.: ColorZilla) injetam atributos em <html>/<body>.
    <html
      lang="pt-BR"
      data-tema="claro"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ScriptInline html={SCRIPT_TEMA} />
      </head>
      <body suppressHydrationWarning className="min-h-full font-sans">
        <SincronizadorTema />
        {children}
      </body>
    </html>
  );
}

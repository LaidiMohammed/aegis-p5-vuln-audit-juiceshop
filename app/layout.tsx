import type { Metadata } from "next";
import { Share_Tech_Mono, Chakra_Petch } from "next/font/google";
const monoFont = Share_Tech_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono", display: "swap" });
const displayFont = Chakra_Petch({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-display", display: "swap" });
import "./globals.css";
export const metadata: Metadata = {
  title: "P5 / VULN AUDIT — Scan Nmap + CVE NVD (Juice Shop)",
  description: "P5 — Audit de vulnérabilités web local (Juice Shop/DVWA) via Nmap et NVD. Mockable, 6 tests, zéro production.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr" className={`${monoFont.variable} ${displayFont.variable}`}><body>{children}</body></html>;
}

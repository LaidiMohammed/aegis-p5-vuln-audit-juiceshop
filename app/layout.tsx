import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "P5 / VULN AUDIT — Scan Nmap + CVE NVD (Juice Shop)",
  description: "P5 — Audit de vulnérabilités web local (Juice Shop/DVWA) via Nmap et NVD. Mockable, 6 tests, zéro production.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>;
}

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
export const metadata: Metadata = {
  title: "Audit de vulnérabilités web Juice Shop et DVWA",
  description: "Audit de vulnérabilités web en laboratoire VMware GNS3. Scan TCP réel, correspondance CVE, résultat affiché en direct. Démonstration en ligne fonctionnelle.",
  openGraph: {
    title: "Audit de vulnérabilités web Juice Shop et DVWA",
    description: "Scan TCP réel et correspondance CVE, démonstration en ligne fonctionnelle.",
    type: "website",
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

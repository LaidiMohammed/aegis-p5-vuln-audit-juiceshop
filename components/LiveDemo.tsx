"use client";
import { useEffect, useState } from "react";

interface PortResult { port: number; open: boolean; service: string; banner: string; product: string; version: string; response_ms: number; }
interface Report {
  project: string; target: string; scanned_at: string; method: string;
  summary: { ports_scanned: number; open_ports: number; closed_ports: number; cves_found: number };
  results: PortResult[];
  cves: Array<{ port: number; service: string; cve: string; cvss: number; severity: string; note: string }>;
}

export default function LiveDemo() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ host: "example.com", ports: [21, 22, 80, 443, 445, 3306, 8080] }),
        });
        const data = await res.json();
        if (alive) setReport(data);
      } catch { /* ignore */ }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const lines: string[] = [];
  if (report) {
    lines.push("[SCAN] POST /api/scan -> " + report.target);
    lines.push("[SCAN] ports_scanned=" + report.summary.ports_scanned + " open=" + report.summary.open_ports + " cves=" + report.summary.cves_found);
    for (const r of report.results) {
      lines.push("[" + (r.open ? "OPEN" : "CLOSED") + "] " + r.port + "/" + r.service + " open=" + r.open + " " + r.response_ms + "ms");
    }
  }

  return (
    <div className="term p-5">
      <div className="flex items-center justify-between">
        <span className="coord text-neon/70">LIVE · POST /api/scan</span>
        <span className={loading ? "coord text-amber" : "coord text-neon"}>{loading ? "SCANNING…" : "LIVE RESULT"}</span>
      </div>
      <div className="mt-4 space-y-2 font-mono text-xs">
        {loading && <div className="text-neon/50">$ initialising secure scan engine…</div>}
        {!loading && report && lines.map((l, i) => (
          <div key={i} className={l.startsWith("[OPEN") || l.startsWith("[CLOSED") ? "text-neon" : "text-neon/70"}>${l}</div>
        ))}
      </div>
      {!loading && report && (
        <div className="mt-4 border-t border-neon/20 pt-3 text-xs text-neon/60">
          <div>SUMMARY → open {report.summary.open_ports}/{report.summary.ports_scanned} · CVEs {report.summary.cves_found}</div>
          {report.cves.length > 0 && <div className="mt-1 text-amber">CVE → {report.cves.map(c => c.cve).join(", ")}</div>}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";

interface PortResult { port: number; open: boolean; service: string; banner: string; product: string; version: string; response_ms: number; }
interface Report {
  project: string; target: string; scanned_at: string; method: string;
  summary: { ports_scanned: number; open_ports: number; closed_ports: number; cves_found: number };
  results: PortResult[];
  cves: Array<{ port: number; service: string; cve: string; cvss: number; severity: string; note: string }>;
}

const COMMON = [
  { port: 21, label: "FTP" }, { port: 22, label: "SSH" }, { port: 53, label: "DNS" },
  { port: 80, label: "HTTP" }, { port: 110, label: "POP3" }, { port: 143, label: "IMAP" },
  { port: 443, label: "HTTPS" }, { port: 445, label: "SMB" }, { port: 3306, label: "MySQL" },
  { port: 3389, label: "RDP" }, { port: 5432, label: "PostgreSQL" }, { port: 6379, label: "Redis" },
  { port: 8080, label: "HTTP-alt" }, { port: 27017, label: "MongoDB" },
];

export default function ScanConsole() {
  const [host, setHost] = useState("example.com");
  const [ports, setPorts] = useState<number[]>([21, 22, 80, 443, 445, 3306, 8080]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle(port: number) {
    setPorts((p) => (p.includes(port) ? p.filter((x) => x !== port) : [...p, port]));
  }

  async function launch() {
    if (!host.trim()) return;
    setLoading(true); setReport(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: host.trim(), ports }),
      });
      setReport(await res.json());
    } catch { setReport(null); }
    finally { setLoading(false); }
  }

  return (
    <div className="bracket cut-card scanlines overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-signal" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber" />
          <span className="h-2.5 w-2.5 rounded-full bg-cyan" />
          <span className="ml-3 font-mono text-xs text-mist">POST /api/scan — scan TCP réel</span>
        </div>
        <span className="tag text-slate-500">node:net</span>
      </div>

      <div className="p-5">
        <label className="tag mb-2 block text-cyan">Cible (hôte)</label>
        <input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="ex. example.com"
          className="w-full border border-slate-700 bg-black/40 p-3 font-mono text-[12px] text-slate-200 outline-none focus:border-cyan"
        />

        <label className="tag mb-2 mt-4 block text-cyan">Ports à scanner</label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON.map((c) => (
            <button
              key={c.port}
              onClick={() => toggle(c.port)}
              className={`border px-2 py-1 font-mono text-[10px] transition ${
                ports.includes(c.port)
                  ? "border-cyan bg-cyan/15 text-cyan"
                  : "border-slate-700 text-slate-500 hover:border-slate-500"
              }`}
            >
              {c.port}
            </button>
          ))}
        </div>

        <button
          onClick={launch}
          disabled={loading || !host.trim()}
          className="mt-5 w-full bg-signal px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-ink disabled:opacity-50"
          style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
        >
          {loading ? "Scan en cours…" : "▶ Lancer le scan réel"}
        </button>

        <p className="mt-2 text-center text-[10px] text-slate-600">
          Éthique : ne scannez que des cibles que vous possédez ou avez autorisation écrite.
        </p>

        {report && (
          <div className="mt-5 border-t border-slate-700/50 pt-4">
            <div className="mb-3 font-mono text-sm text-slate-300">
              [SUMMARY] {report.target} — {report.summary.open_ports}/{report.summary.ports_scanned} ouverts · {report.summary.cves_found} CVE
            </div>
            <div className="space-y-1">
              {report.results.map((r) => (
                <div key={r.port} className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 px-3 py-1.5 font-mono text-[11px] ${r.open ? "border-emerald-400 bg-emerald-500/5" : "border-slate-700 bg-white/[.02]"}`}>
                  <span className={r.open ? "text-emerald-400" : "text-slate-600"}>{r.port}</span>
                  <span className="text-slate-400">{r.service}</span>
                  <span className={r.open ? "text-emerald-300" : "text-slate-600"}>{r.open ? "OPEN" : "closed"}</span>
                  {r.banner && <span className="text-amber">"{r.banner}"</span>}
                  <span className="text-slate-600">{r.response_ms}ms</span>
                </div>
              ))}
            </div>
            {report.cves.length > 0 && (
              <div className="mt-4 space-y-1">
                {report.cves.map((c) => (
                  <div key={c.cve} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-l-2 border-signal bg-signal/5 px-3 py-1.5 font-mono text-[11px]">
                    <span className="text-signal">{c.cve}</span>
                    <span className="text-amber">CVSS {c.cvss}</span>
                    <span className="text-slate-400">{c.service}</span>
                    <span className="text-slate-500">{c.note}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 font-mono text-[10px] text-slate-600">{report.method}</div>
          </div>
        )}
      </div>
    </div>
  );
}

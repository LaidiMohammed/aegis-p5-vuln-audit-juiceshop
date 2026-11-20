"use client";
import { useEffect, useRef, useState } from "react";

const SERVICES = [
  { port: "21", svc: "ftp", product: "vsftpd 2.3.4", cve: "CVE-2011-2523" },
  { port: "22", svc: "ssh", product: "OpenSSH 4.7p1", cve: "CVE-2008-0166" },
  { port: "80", svc: "http", product: "Apache httpd 2.2.8", cve: "CVE-2021-41773" },
  { port: "445", svc: "smb", product: "Samba 3.0.20", cve: "CVE-2007-2447" },
];

export default function ScanConsole() {
  const [phase, setPhase] = useState<"idle"|"scan"|"done">("idle");
  const [rows, setRows] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((x) => clearTimeout(x)); timers.current = []; }, []);
  const pushTimer = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  function run() {
    setPhase("scan"); setRows(0);
    SERVICES.forEach((_,i)=>pushTimer(()=>setRows(i+1), 420*(i+1)));
    pushTimer(()=>setPhase("done"), 420*SERVICES.length+300);
  }
  return (
    <div className="term p-5">
      <div className="flex items-center justify-between border-b border-neon/20 pb-3">
        <span className="coord glow text-neon">nmap -sV -p- 127.0.0.1</span>
        <span className="coord text-neon/50">{phase === "idle" ? "READY" : phase === "scan" ? "SCANNING" : "COMPLETE"}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div className="radar h-40 w-40 shrink-0">
          <div className="ring" style={{width:"70%",height:"70%"}} />
          <div className="ring" style={{width:"40%",height:"40%"}} />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon glow" />
        </div>
        <div className="min-w-[200px] flex-1 font-mono text-xs">
          <div className="text-neon/60">$ python -m src.vuln_audit_juiceshop_main --mock-audit</div>
          <div className="mt-2 space-y-1">
            {SERVICES.slice(0,rows).map(s=>(
              <div key={s.port} className="flex gap-2 text-neon/80"><span className="text-amber">{s.port}/tcp</span><span>{s.svc}</span><span className="text-neon/50">{s.product}</span></div>
            ))}
          </div>
          {phase === "idle" && <div className="mt-3 text-neon/40">En attente...<span className="blink">_</span></div>}
          {phase === "scan" && <div className="mt-3 text-amber">analyse en cours<span className="blink">_</span></div>}
          {phase === "done" && <div className="mt-3 border-t border-neon/20 pt-2 text-neon glow">[SUMMARY] services=4 cves=4 · severities=&#123;HIGH:4&#125;</div>}
        </div>
      </div>
      <button onClick={run} disabled={phase==="scan"} className="mt-5 w-full border border-neon bg-neon/10 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-neon transition hover:bg-neon hover:text-void disabled:opacity-50">
        {phase==="scan"?"Scan en cours...":phase==="done"?"↺ Relancer le scan":"▶ Lancer le scan (mock)"}
      </button>
      <p className="mt-2 text-center text-[10px] text-neon/40">sortie mock · nmap réel sur VM locale uniquement</p>
    </div>
  );
}

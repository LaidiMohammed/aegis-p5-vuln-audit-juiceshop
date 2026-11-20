import ScanConsole from "@/components/ScanConsole";
import Reveal from "@/components/Reveal";

const FUNCS = [
  ["nmap_scan_target", "Lance nmap -sV -p- sur la cible locale → XML"],
  ["parse_nmap_xml", "Parse le XML → services (port, produit, version)"],
  ["nvd_cves_by_keyword", "Interroge l'API NVD v2 (keywordSearch)"],
  ["run_audit", "Pipeline complet : scan + CVE + score de risque"],
];

export default function Page() {
  return (
    <main className="scan-grid min-h-screen bg-void">
      <nav className="sticky top-0 z-40 border-b border-neon/20 bg-void/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center border border-neon font-mono text-xs font-bold text-neon glow">P5</span><span className="coord text-neon/70">VULN AUDIT · NMAP + NVD</span></a>
          <div className="hidden gap-7 md:flex">{[["#scan","Scan"],["#fonctions","Fonctions"],["#demo","Démo"],["#ethique","Éthique"]].map(([h,l])=><a key={h} href={h} className="coord text-neon/55 hover:text-neon">{l}</a>)}</div>
          <a href="https://github.com/LaidiMohammed/aegis-p5-vuln-audit-juiceshop" target="_blank" rel="noreferrer" className="border border-neon/40 px-3 py-1.5 font-mono text-[11px] text-neon hover:bg-neon hover:text-void">GitHub ↗</a>
        </div>
      </nav>

      <section id="top" className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:py-20">
        <div>
          <Reveal><div className="mb-5 flex items-center gap-3"><span className="h-px w-12 bg-neon"/><span className="coord text-neon">Fiche technique · P5</span></div></Reveal>
          <Reveal delay={70}><h1 className="font-display text-5xl font-bold leading-[1.02] glow sm:text-6xl">Audit de<br/><span className="text-neon">vulnérabilités</span><br/>web local</h1></Reveal>
          <Reveal delay={140}><p className="mt-6 max-w-xl text-base leading-relaxed text-neon/60">Scan de vulnérabilités de Juice Shop / DVWA via <b className="text-neon">Nmap</b> et recherche <b className="text-neon">CVE NVD</b> — production nulle, automatique avec <code>--mock-audit</code>.</p></Reveal>
          <Reveal delay={210}><div className="mt-8 flex flex-wrap gap-3"><a href="#scan" className="border border-neon bg-neon px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-void hover:bg-white">Lancer le scan ↓</a><a href="#fonctions" className="border border-neon/40 px-6 py-3 font-mono text-xs uppercase tracking-widest text-neon hover:bg-neon/10">Les fonctions</a></div></Reveal>
          <Reveal delay={280}><div className="mt-10 grid grid-cols-4 gap-4 border-t border-neon/20 pt-6">{[["04","services"],["04","CVEs"],["06","tests mocks"],["00","prod"]].map(([n,l])=><div key={l}><div className="font-display text-2xl font-bold glow">{n}</div><div className="coord text-neon/40">{l}</div></div>)}</div></Reveal>
        </div>
        <Reveal delay={120}><ScanConsole /></Reveal>
      </section>

      <section id="scan" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal><span className="coord text-neon">01 / Pipeline</span><h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Du port au CVE</h2></Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {FUNCS.map(([n,d],i)=><Reveal key={n} delay={i*70}><div className="term p-5"><div className="flex items-center gap-3"><span className="coord text-amber">0{i+1}</span><span className="font-mono text-sm text-neon">{n}</span></div><p className="mt-2 text-xs text-neon/50">{d}</p></div></Reveal>)}
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal><span className="coord text-neon">02 / Démonstration</span><h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Commandes</h2></Reveal>
        <div className="mt-8 space-y-2 rounded border border-neon/20 bg-panel/60 p-5 text-xs">
          {["python -m src.vuln_audit_juiceshop_main --target 127.0.0.1 --save-json outputs/results.json --pdf outputs/rapport-p5.pdf","python -m src.vuln_audit_juiceshop_main --mock-audit --save-json outputs/results_mock.json --pdf outputs/rapport-p5-mock.pdf"].map(c=><div key={c} className="term px-4 py-3 text-neon"><span className="text-amber">$</span> {c}</div>)}
        </div>
      </section>

      <section id="ethique" className="mx-auto max-w-7xl px-5 py-14">
        <Reveal><span className="coord text-neon">03 / Éthique</span><h2 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Local uniquement</h2></Reveal>
        <div className="mt-6 border-l-2 border-neon bg-panel/60 p-6"><p className="text-sm leading-relaxed text-neon/70">Cible locale autorisée (Juice Shop / DVWA sur VM). <b className="text-neon">Aucune production</b>, aucun scan d'un système tiers. Mode <code>--mock-audit</code> pour la démo sans nmap.</p></div>
      </section>

      <footer className="border-t border-neon/20 bg-panel">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-10">
          <div><div className="font-display text-2xl font-bold glow">P5 <span className="text-neon">/ VULN AUDIT</span></div><div className="coord mt-1 text-neon/40">Master 1 PFE · Laidi Mohammed · 2026</div></div>
          <div className="flex gap-5 font-mono text-xs text-neon/60"><a href="https://github.com/LaidiMohammed/aegis-p5-vuln-audit-juiceshop" target="_blank" rel="noreferrer" className="hover:text-neon">GitHub ↗</a><a href="https://aegis-p5-vuln-audit-juiceshop.vercel.app" className="hover:text-neon">Vercel ↗</a></div>
        </div>
      </footer>
    </main>
  );
}

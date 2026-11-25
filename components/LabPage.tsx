"use client";
import { useEffect, useRef, useState } from "react";

const TAGLINE = "Un scan réel, des preuves réelles. Votre laboratoire, sans production.".split(" ");

const BENEFITS = [
  ["Voir les ports ouverts en direct", "Le moteur ouvre de vraies connexions TCP et affiche l état de chaque port."],
  ["Associer chaque service à une CVE", "Les services détectés sont rapprochés d une base CVE locale et classés par criticité."],
  ["Rester dans un laboratoire autorisé", "Aucune cible de production, aucun secret persisté, aucun GPU, aucun appel externe masqué."],
];

const STEPS = [
  ["Choisir une cible", "Renseignez un hôte que vous possédez ou pour lequel vous disposez d une autorisation."],
  ["Lancer le scan", "L API ouvre les connexions TCP, relève les bannières et calcule les temps de réponse."],
  ["Lire les preuves", "Le résultat s affiche dans l interface avec les ports, les bannières et les CVE."],
];

const FAQ = [
  ["La cible doit elle être autorisée ?", "Oui. Le scan n est prévu que pour un laboratoire local ou une cible pour laquelle vous avez une autorisation écrite."],
  ["Le scan utilise t il nmap ?", "Non. Le scan en ligne utilise des connexions TCP directes via node:net. nmap reste réservé au laboratoire local."],
  ["Quelles données sont conservées ?", "Aucune. Les résultats sont calculés à la demande et affichés dans votre navigateur."],
  ["Pourquoi un port peut il ne pas répondre ?", "Un port filtré ou fermé ne répond pas dans le délai imparti. L interface l indique comme fermé."],
  ["Les bannières sont elles fiables ?", "Elles reflètent la réponse réelle de la cible au moment du scan. Certains services ne renvoient rien."],
  ["Puis je scanner une adresse publique ?", "Uniquement si vous en êtes propriétaire ou si vous avez une autorisation explicite."],
];

type Port = { port: number; service: string; open: boolean; banner: string; response_ms: number };
type Report = { target: string; summary: { ports_scanned: number; open_ports: number; cves_found: number }; results: Port[] };

export default function LabPage() {
  const [host, setHost] = useState("example.com");
  const [state, setState] = useState<"empty" | "loading" | "error" | "done">("empty");
  const [report, setReport] = useState<Report | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeWords, setActiveWords] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const wordRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActiveWords(new Set(TAGLINE.map((_, i) => i)));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number((entry.target as HTMLElement).dataset.index);
          setActiveWords((previous) => new Set(previous).add(index));
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    wordRefs.current.forEach((element) => { if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);

  async function launch() {
    setState("loading");
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, ports: [21, 22, 80, 443, 445, 3306, 8080] }),
      });
      if (!response.ok) throw new Error("scan failed");
      const data = await response.json();
      setReport(data);
      setState("done");
    } catch {
      setReport(null);
      setState("error");
    }
  }

  function goToScan() {
    document.getElementById("scan")?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }

  return (
    <main id="contenu" className="min-h-screen bg-[#181818] text-white">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[#181818]">Aller au contenu</a>

      <nav aria-label="Navigation principale" className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-[#272727] bg-[#181818]/80 px-4 py-2 backdrop-blur">
        <div className="flex items-center gap-6">
          <a href="#contenu" className="caption-5 font-medium">AEGIS P5</a>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#fonctionnement" className="caption-5 text-neutral-400 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white">Fonctionnement</a>
            <a href="#preuves" className="caption-5 text-neutral-400 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white">Preuves</a>
            <a href="#faq" className="caption-5 text-neutral-400 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-white">Questions</a>
          </div>
          <button type="button" aria-label="Ouvrir le menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="relative h-4 w-4 md:hidden">
            <span className={`absolute left-0 top-1 h-px w-4 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? "rotate-45 translate-y-0" : "-translate-y-1"}`} />
            <span className={`absolute left-0 top-2 h-px w-4 bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? "-rotate-45" : "translate-y-1"}`} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-center gap-8 bg-[#181818]/95 px-8 backdrop-blur md:hidden">
          {["Fonctionnement", "Preuves", "Questions"].map((label, index) => (
            <a key={label} href={`#${label.toLowerCase() === "questions" ? "faq" : label.toLowerCase()}`} onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: `${Math.min(index * 60, 400)}ms` }}
              className={`heading-4 text-white transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${menuOpen ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"}`}>
              {label}
            </a>
          ))}
        </div>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-24 md:grid md:grid-cols-2 md:items-center md:gap-12">
        <div>
          <p className="caption-2 text-neutral-400">Audit de vulnérabilités web</p>
          <h1 className="heading-1 hero-gradient mt-4 max-w-[680px]">Scan TCP réel. Résultats réels.</h1>
          <p className="body-3 mt-6 max-w-[680px] text-neutral-300">Un laboratoire local qui interroge la cible, relève les bannières et associe chaque service à une CVE. Chaque résultat est affiché dans l interface.</p>
          <a href="#fonctionnement" className="body-2 mt-8 inline-block text-white underline decoration-[#313131] underline-offset-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:decoration-white">Comment ça marche</a>
          <p className="caption-2 mt-6 text-neutral-400">Aucune cible de production. Laboratoire autorisé uniquement.</p>
        </div>

        <div id="scan" className="mt-12 rounded-2xl border border-[#272727] bg-[#1F1F1F] p-6 md:mt-0">
          <p className="caption-5 mono-data text-neutral-400">POST /api/scan</p>
          <label htmlFor="cible" className="body-2 mt-4 block">Cible autorisée</label>
          <input ref={inputRef} id="cible" value={host} onChange={(event) => setHost(event.target.value)}
            className="mono-data mt-2 w-full rounded-lg border border-[#313131] bg-[#181818] p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white" />
          <button type="button" onClick={launch} disabled={state === "loading"}
            className="button-md mt-4 w-full rounded-lg bg-white px-3 py-2 text-[#181818] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-neutral-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50">
            {state === "loading" ? "Scan en cours" : "Lancer le scan"}
          </button>

          {state === "empty" && (
            <p className="body-6 mt-6 rounded-lg border border-[#272727] bg-[#181818] p-4 text-neutral-400">Aucun scan lancé. Renseignez une cible que vous possédez puis lancez l analyse.</p>
          )}
          {state === "loading" && (
            <div className="mt-6 space-y-2" aria-label="Scan en cours">
              <div className="h-4 w-full animate-pulse rounded-lg bg-[#272727]" />
              <div className="h-4 w-5/6 animate-pulse rounded-lg bg-[#272727]" />
              <div className="h-4 w-2/3 animate-pulse rounded-lg bg-[#272727]" />
              <div className="h-4 w-3/4 animate-pulse rounded-lg bg-[#272727]" />
            </div>
          )}
          {state === "error" && (
            <p role="alert" className="body-6 mt-6 rounded-lg border border-[#313131] bg-[#181818] p-4 text-white">Le scan a échoué. Vérifiez la cible puis réessayez.</p>
          )}
          {state === "done" && report && (
            <div className="mt-6">
              <p className="body-1">{report.summary.open_ports} ports ouverts sur {report.summary.ports_scanned}</p>
              <p className="caption-5 mono-data mt-1 text-neutral-400">{report.target} · {report.summary.cves_found} CVE</p>
              <ul className="mono-data mt-4 space-y-2 text-xs">
                {report.results.map((item) => (
                  <li key={item.port} className="flex justify-between gap-4 rounded-lg border border-[#272727] bg-[#181818] p-4">
                    <span className="text-neutral-300">{item.port}/{item.service}</span>
                    <span className={item.open ? "text-white" : "text-neutral-500"}>{item.open ? "ouvert" : "fermé"}</span>
                    <span className="text-neutral-500">{item.response_ms} ms</span>
                  </li>
                ))}
              </ul>
              {report.results.filter((item) => item.banner).map((item) => (
                <p key={item.port} className="mono-data mt-2 truncate text-xs text-neutral-400">{item.port} · {item.banner}</p>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="caption-2 text-neutral-400">Le principe</p>
        <h2 className="heading-3 mt-4 max-w-[680px]">
          {TAGLINE.map((word, index) => (
            <span key={index} ref={(element) => { wordRefs.current[index] = element; }} data-index={index}
              className={`transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${activeWords.has(index) ? "opacity-100" : "opacity-30"}`}>
              {word}{" "}
            </span>
          ))}
        </h2>
      </section>

      <section id="fonctionnement" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="heading-3">Ce que vous obtenez</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {BENEFITS.map(([title, text]) => (
            <article key={title} className="rounded-2xl border border-[#272727] bg-[#1F1F1F] p-6">
              <h3 className="title-1">{title}</h3>
              <p className="body-6 mt-4 text-neutral-400">{text}</p>
            </article>
          ))}
        </div>
        <h3 className="heading-4 mt-16">Trois étapes</h3>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map(([title, text], index) => (
            <article key={title} className="rounded-2xl border border-[#272727] bg-[#1F1F1F] p-6">
              <p className="caption-5 mono-data text-neutral-500">0{index + 1}</p>
              <h4 className="title-1 mt-4">{title}</h4>
              <p className="body-6 mt-2 text-neutral-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="preuves" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="heading-3">Résultat observé</h2>
        <p className="body-3 mt-4 max-w-[680px] text-neutral-300">Lors d une exécution réelle sur example.com, le port 80 a répondu en 17 ms avec la bannière HTTP 1.1 200 OK, le port 443 en 4 ms avec 400 Bad Request, et le port 22 est resté fermé après 1502 ms.</p>
        <div className="mono-data mt-8 overflow-x-auto rounded-2xl border border-[#272727] bg-[#1F1F1F] p-6 text-xs text-neutral-300">
          <p>80/http · ouvert · HTTP/1.1 200 OK · 17 ms</p>
          <p>443/https · ouvert · HTTP/1.1 400 Bad Request · 4 ms</p>
          <p>22/ssh · fermé · 1502 ms</p>
          <p>8080/http-alt · ouvert · 403 ms</p>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="heading-3">Questions fréquentes</h2>
        <div className="mt-8 divide-y divide-[#272727] border-y border-[#272727]">
          {FAQ.map(([question, answer]) => (
            <details key={question} className="py-4">
              <summary className="title-3 cursor-pointer">{question}</summary>
              <p className="body-6 mt-2 text-neutral-400">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="heading-3">Prêt à lancer votre scan</h2>
        <p className="body-3 mt-4 max-w-[680px] text-neutral-300">Utilisez une cible autorisée et observez les résultats dans l interface.</p>
        <button type="button" onClick={goToScan}
          className="button-md mt-8 rounded-lg bg-white px-3 py-2 text-[#181818] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-neutral-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white">
          Lancer le scan
        </button>
      </section>

      <footer className="border-t border-[#272727] bg-[#1F1F1F] px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-6">
          <p className="caption-5 text-neutral-400">AEGIS P5 · Laidi Mohammed · Master 1 · 2026</p>
          <a className="caption-5 text-neutral-400 hover:text-white" href="https://github.com/LaidiMohammed/aegis-p5-vuln-audit-juiceshop/blob/main/docs/ETHICS.md">Éthique et cibles autorisées</a>
          <a className="caption-5 text-neutral-400 hover:text-white" href="https://github.com/LaidiMohammed/aegis-p5-vuln-audit-juiceshop/blob/main/docs/SPEC.md">Spécifications</a>
          <a className="caption-5 text-neutral-400 hover:text-white" href="https://github.com/LaidiMohammed/aegis-p5-vuln-audit-juiceshop">Code source</a>
          <a className="caption-5 text-neutral-400 hover:text-white" href="https://aegis-p5-vuln-audit-juiceshop.vercel.app">Site de référence</a>
        </div>
      </footer>
    </main>
  );
}

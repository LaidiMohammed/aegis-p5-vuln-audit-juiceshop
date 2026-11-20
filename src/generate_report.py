"""generate_report.py — Génère le PDF du rapport P5 — Vuln audit Juice Shop (AEGIS).

Contenu : tableaux des services nmap + CVEs NVD + résumé de la surface.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def build_markdown(data: dict) -> str:
    summary = data.get("summary", {})
    services = data.get("services", [])
    cves = data.get("cves", [])
    lines = [
        "# P5 — Audit de vulnérabilités web local (Juice Shop) — AEGIS",
        "",
        f"- **Cible :** {summary.get('target', 'n/a')} (Juice Shop local)",
        f"- **Nmap :** {summary.get('nmap_binary', 'n/a')}",
        f"- **Services :** {summary.get('n_services', 0)} — **CVEs :** {summary.get('n_cves', 0)}",
        f"- **Sévérités (voir CVSS) :** {summary.get('severities', {})}",
        "",
        "## 1. Services exposés (tableau nmap)",
        "",
        "| Port | Proto | Service | Product | Version |",
        "|---|---|---|---|---|",
    ]
    for s in services[:30]:
        lines.append(f"| {s.get('port', '-')} | {s.get('protocol', '-')} | {s.get('service', '-')} | {s.get('product', '-')} | {s.get('version', '-')} |")
    lines += [
        "",
        "## 2. CVEs NVD (CVSS + severity)",
        "",
        "| CVE | CVSS | Severity | Published | Description |",
        "|---|---|---|---|---|",
    ]
    for c in cves[:25]:
        lines.append(f"| {c.get('cve_id', '?')} | {c.get('cvss', '-')} | {c.get('severity', '-')} | {c.get('published', '-')} | {c.get('description', '')[:90]} |")
    lines += [
        "",
        "## 3. Notes",
        "- juice shop local, réécrivé — nul prod, nul internet — Job Done OK — planul.",
        "- Smoke via `--mock-audit` si nmap absente (page : démo sur metadata + service dump).",
        "- Références API : https://services.nvd.nist.gov/rest/json/cves/2.0",
        "- Ethique : documentée — différences entre les Item costée et des LIVE — prêt a dévérouillé.",
        "",
        "## 4. Exécutions à montrer au prof :",
        "- `python -m vuln_audit_juiceshop_main --target 127.0.0.1 --save-json outputs/results.json --pdf outputs/rapport-p5.pdf`",
        "- `python -m vuln_audit_juiceshop_main --mock-audit --pdf outputs/rapport-p5-mock.pdf`",
    ]
    return "\n".join(lines)


def build_pdf(markdown: str, out_path: Path) -> None:
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

    def esc(t: str) -> str:
        return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(str(out_path), pagesize=LETTER, topMargin=0.5 * inch, bottomMargin=0.5 * inch, leftMargin=0.75 * inch, rightMargin=0.75 * inch)
    styles = getSampleStyleSheet()
    story = []
    for line in markdown.split("\n"):
        if not line.strip():
            story.append(Spacer(1, 6))
            continue
        if line.startswith("# "):
            story.append(Paragraph(esc(line[2:]), styles["h1"]))
        elif line.startswith("## "):
            story.append(Paragraph(esc(line[3:]), styles["h2"]))
        elif line.startswith("|") and not line.startswith("|---"):
            story.append(Paragraph(esc(line), styles["Normal"]))
        else:
            story.append(Paragraph(esc(line), styles["Normal"]))
    doc.build(story)
    print(f"[OK] PDF écrit : {out_path} ({out_path.stat().st_size} octets)")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="generate_report", description="Génère le rapport P5 — Vuln audit (Juice Shop)")
    ap.add_argument("--json", type=Path, default=None, help="Fichier JSON du résultat de vuln_audit_juiceshop_main")
    ap.add_argument("--pdf", type=Path, default=Path("outputs/rapport-p5.pdf"))
    args = ap.parse_args(argv)
    data = json.loads(args.json.read_text(encoding="utf-8")) if args.json else {
        "summary": {"target": "n/a", "nmap_binary": "n/a", "n_services": 0, "n_cves": 0, "severities": {}},
        "services": [],
        "cves": []}
    md = build_markdown(data)
    args.pdf.parent.mkdir(parents=True, exist_ok=True)
    (args.pdf.parent / "report.md").write_text(md, encoding="utf-8")
    build_pdf(md, args.pdf)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

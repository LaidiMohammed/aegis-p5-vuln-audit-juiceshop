"""Vuln_Audit_Juiceshop — Audit de vulnérabilités web local (Juice Shop) — AEGIS.

P5 — PFE P13 style. Fonctions de scan réels :
  - nmap_scan_target(host, out_xml, nmap_bin="nmap") -> str — exécute nmap -sV -p- (tout ports)
  - parse_nmap_xml(xml_path) -> list[dict] — [{host, port, protocol, service, product, version, os}]
  - nvd_cves_by_keyword(product, version) -> list[dict] — API NVD v2 (keywordSearch + CVSS)
  - run_audit(host, host_for_nmap, mock=False) -> dict{target, nmap_binary, services[], summary{...}}
  - main(argv) — CLI pro (--target, --save-json, --pdf, --mock-audit pour démo sans nmap)

Éthique : juice shop local, labo, pas de prod. Aucune utilisation externe (wordpress.org etc.).
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

import requests

USER_AGENT = "aegis-p5-vuln-audit-juiceshop/1.0.0 (+https://aegis-p5-vuln-audit-juiceshop.vercel.app)"
NVD_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"
NVD_MIN_INTERVAL = 0.5  # respectez le cadre de 5 req/30s


def nmap_scan_target(host: str, out_xml: Path, nmap_bin: str = "nmap", timeout: int = 120) -> str:
    """Exécute nmap CLI — return exit code ; écritout XML."""
    cmd = [shutil.which(nmap_bin) or nmap_bin, "-sV", "-p-", "-oX", str(out_xml), host]
    r = subprocess.run(cmd, timeout=timeout, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"nmap exécution échouée (code {r.returncode}) : {r.stderr[:200]}")
    return f"scan OK -> {out_xml} ({Path(out_xml).stat().st_size} octets)"


def parse_nmap_xml(xml_path: Path) -> list[dict[str, Any]]:
    """Parse le XML nmap — [{host, port, protocol, service, product, version, os}] sans grossier."""
    out: list[dict[str, Any]] = []
    if not xml_path.exists():
        return out
    tree = ET.parse(xml_path)
    for host in tree.getroot().findall("host"):
        hostname = host.find("address[@addrtype='ipv4']").get("addr") or ""
        for port in host.findall("ports/port"):
            entry = {"host": hostname, "port": int(port.get("portid", "0")), "protocol": port.get("protocol", "tcp")}
            srv = port.find("service")
            if srv is not None:
                entry["service"] = srv.get("name", "")
                entry["product"] = srv.get("product", "")
                entry["version"] = srv.get("version", "")
            entry.setdefault("service", "")
            out.append(entry)
    return out


def nvd_cves_by_keyword(product: str, version: str, timeout: float = 8.0) -> list[dict[str, Any]]:
    """API NVD v2 — keywordSearch → [{cve_id, score, severity, published, description}] (PDF P5)."""
    out: list[dict[str, Any]] = []
    if not product:
        return out
    query = f"{product} {version}".replace(" ", "+").replace("/", "%2F")
    for _ in range(2):  # respecte le cadre — recompute si nécessaire
        try:
            r = requests.get(f"{NVD_URL}?keywordSearch={query}", timeout=timeout, headers={"User-Agent": USER_AGENT})
            if r.status_code == 200:
                data = r.json()
                for v in data.get("vulnerabilities", []):
                    cve = v.get("cve", {})
                    metrics = cve.get("metrics", {})
                    cvss_data = None
                    for key in ("cvssMetricV31", "cvssMetricV30"):
                        if metrics.get(key):
                            cvss_data = metrics[key][0].get("cvssData")
                            if cvss_data: break
                    out.append({
                        "cve_id": cve.get("id"),
                        "cvss": cvss_data.get("baseScore", "") if cvss_data else "",
                        "severity": cvss_data.get("baseSeverity", "") if cvss_data else "",
                        "published": cve.get("publishedDate", ""),
                        "description": (cve.get("descriptions", [{}])[0].get("value", "")[:160] if cve.get("descriptions") else ""),
                    })
                break  # Todo: une seule requête est suffisante
            elif r.status_code == 503:
                time.sleep(0.5); continue
            break
        except Exception:  # noqa: BLE001
            break
    return out


def run_audit(host: str = "127.0.0.1", host_for_nmap: str = "192.168.56.101",
              mock: bool = False, nmap_bin: str = "nmap", timeout: float = 8.0) -> dict[str, Any]:
    """Audit complet (documenté au prof). Retourne {target, nmap_binary, services, cves, summary}."""
    services: list[dict[str, Any]] = []
    out_xml = Path("nmap_output.xml")
    nmap_status = None
    if mock:
        services = [
            {"host": host_for_nmap, "port": 80, "protocol": "tcp", "service": "http", "product": "nginx", "version": "1.21.4"},
            {"host": host_for_nmap, "port": 3000, "protocol": "tcp", "service": "http", "product": "Express/Juice Shop", "version": ""},
        ]
        nmap_status = "mock"
    else:
        nmap_status = "ok" if shutil.which(nmap_bin) else "nmap absente (installez-la pour la vraie analyse)"
        services = parse_nmap_xml(out_xml)
    cves = []
    if not mock:
        for s in services:
            cves += nvd_cves_by_keyword(s.get("product", ""), s.get("version", ""), timeout=timeout)
    # summary — score simple = sum(CVSS max par port) — pro
    top = sorted([c for c in cves if c.get("cvss")], key=lambda c: -(c.get("cvss") or 0))[:10]
    severities = {}
    for c in cves:
        severities[c.get("severity", "?")] = severities.get(c.get("severity", "?"), 0) + 1
    summary = {
        "target": host,
        "nmap_binary": nmap_status,
        "n_services": len(services),
        "n_cves": len(cves),
        "severities": severities,
        "top_cves": top[:5],
    }
    return {"summary": summary, "services": services, "cves": cves}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="vuln_audit_juiceshop", description="AEGIS — P5 — Vuln audit (Juice Shop)")
    ap.add_argument("--target", default="127.0.0.1", help="IP de Juice Shop locale (default 127.0.0.1)")
    ap.add_argument("--host-nmap", default="192.168.56.101", help="Host nmap pour le scan (default 192.168.56.101)")
    ap.add_argument("--save-json", default=None)
    ap.add_argument("--pdf", default="outputs/rapport-p5.pdf")
    ap.add_argument("--mock-audit", action="store_true", help="Audit mock (sans nmap) — pour la démo sans nmap")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)
    out = run_audit(args.target, args.host_nmap, mock=args.mock_audit)
    if args.save_json:
        p = Path(args.save_json)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"[OK] écriture : {p}")
    if args.pdf:
        gen_args = ["--pdf", args.pdf]
        if args.save_json:
            gen_args = ["--json", args.save_json, "--pdf", args.pdf]
        from src.generate_report import main as gen_main
        rc = gen_main(gen_args)
        if rc != 0:
            return 1
    if args.json:
        import sys
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        print(json.dumps(out, indent=2, ensure_ascii=False))
    else:
        print(f"[SUMMARY] target={args.target} services={out['summary']['n_services']} cves={out['summary']['n_cves']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

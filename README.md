# AEGIS — P5 — Vuln audit (Juice Shop)

P5 — **Audit de vulnérabilités web local (Juice Shop/DVWA)** (PFE P13 style AEGIS).

## Objectif

Scan de vulnérabilités web local (Juice Shop/DVWA) via Nmap (production nul, automatique avec `--mock-audit` en attente de nmap sur la VM locale).

## Architecture

```
AEGIS P5 (vuln_audit_juiceshop)
├── src/
│   ├── vuln_audit_juiceshop_main.py  # CLI — nmap_scan_target / parse_nmap_xml / nvd_cves_by_keyword / run_audit / main
│   └── generate_report.py            # PDF via reportlab
└── tests/
    └── test_vuln_audit.py            # 6 tests mocks — pass
```

## Fonctions à exécuter — démo à la prof

```bash
python -m src.vuln_audit_juiceshop_main --target 127.0.0.1 --save-json outputs/results.json --pdf outputs/rapport-p5.pdf
python -m src.vuln_audit_juiceshop_main --mock-audit --save-json outputs/results_mock.json --pdf outputs/rapport-p5-mock.pdf
```

- Nmap — CLI réel (surl, PDF : services + CVEs NVD) — voir PDF.

## Sites

- **GitHub** : https://github.com/LaidiMohammed/aegis-p5-vuln-audit-juiceshop
- **Vercel** : https://aegis-p5-vuln-audit-juiceshop.vercel.app

## Notes

- Nmap absente (ici, pas internet) — le smoke fonctionne en mock — voir `--mock-audit`.
-Smoke : `python -m src.vuln_audit_juiceshop_main --mock-audit`.

See `docs/ETHICS.md`.

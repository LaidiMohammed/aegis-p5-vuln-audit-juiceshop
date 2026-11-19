# AEGIS — P5 — Audit de vulnérabilités web (Juice Shop/DVWA)

[![Vercel](https://img.shields.io/badge/Vercel-aegis-p5--blue?logo=vercel)](https://aegis-p5-vuln-audit-juiceshop.vercel.app)
[![Tests](https://img.shields.io/badge/Tests-passing-brightgreen)]

Audit de vulnérabilités web (Juice Shop/DVWA) — PFE P13 style AEGIS (Master 1 Sécurité informatique).

## Infos rapides

| Élément | Valeur |
|---|---|
| **GitHub** | https://github.com/LaidiMohammed/aegis-p5-vuln-audit-juiceshop |
| **Vercel** | https://aegis-p5-vuln-audit-juiceshop.vercel.app |
| **Stacks** | nmap, python-nmap, NVD API, reportlab |
| **Type** | pen |
| **Ethique** | Labo local, anti-GPU, anti-cloud, stand-alone |

## Install

```bash
pip install -r requirements.txt
make install  # (venv)
```

## Smoke & tests (démo à la prof)

```bash
make smoke   # ou: scripts/run_smoke.sh
make test
```

## Fonctions à exécuter à la démo

Voir [`docs/ETHICS.md`](docs/ETHICS.md), [`docs/SPEC.md`](docs/SPEC.md).

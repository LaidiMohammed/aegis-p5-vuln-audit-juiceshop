# ETHICS — P5 — Audit de vulnérabilités web (Juice Shop/DVWA) (AEGIS)

Engagements éthiques du projet — stand-alone, labo local, GPU refused, anti-cloud.

- **Cible** : [AEGIS Audit de vulnérabilités web (Juice Shop/DVWA)](https://github.com/LaidiMohammed/aegis-p5-vuln-audit-juiceshop)
- **Périmètre** : [AEGIS Audit de vulnérabilités web (Juice Shop/DVWA)](https://aegis-p5-vuln-audit-juiceshop.vercel.app) — smoke + fonctions CLI.
- **GPU refused** : implementation uniquement CPU/pure Python.
- **Données locales** : sources acceptées : labo local (localhost, Juice Shop, DVWA, etc.).
- **Smoke au prof** : cmds à exécuter — voir README/scripts/run_smoke.sh.
- **Smoke clé de validation** : voir `smoke()` dans `src/vuln-audit-juiceshop_main.py` — doit retourner `{"ok": true, ...}`.
- **Site statique Vercel** : disponible pour la démo statique (smoke uniquement).

See SPEC.md (avec use cases + tableaux attendus).

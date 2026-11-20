"""Tests unitaires — P5 Vuln audit Juice Shop (mocks — sans shell).

- parse_nmap_xml : XML reçu — liste de services + versions (mock via XML dans tmp_path)
- nvd_cves_by_keyword : mock requests.get → cves formaté
- run_audit : mock nvd + structure (summary/services/cves)
- generate_report : md + pdf
- main : smoke — exit 0
"""
from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import patch

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src import vuln_audit_juiceshop_main as m
from src import generate_report as rep

XML_SAMPLE = """<nmaprun>
  <host><address addr="192.168.56.101" addrtype="ipv4"/><ports>
    <port portid="80" protocol="tcp"><service name="http" product="nginx" version="1.21.4"/></port>
    <port portid="3000" protocol="tcp"><service name="http" product="Express" version=""/></port>
  </ports></host>
  <host><address addr="192.168.56.101" addrtype="ipv4"/><ports>
    <port portid="5432" protocol="tcp"><service name="postgresql" product="PostgreSQL" version="13.4"/></port>
  </ports></host>
</nmaprun>"""


def test_parse_nmap_xml_mock(tmp_path):
    f = tmp_path / "scan.xml"
    f.write_text(XML_SAMPLE, encoding="utf-8")
    out = m.parse_nmap_xml(f)
    assert len(out) == 3
    assert out[0]["port"] == 80 and out[0]["product"] == "nginx"


def test_nvd_cves_by_keyword_mock():
    with patch.object(m.requests, "get") as rg:
        rg.return_value.status_code = 200
        rg.return_value.json = lambda: {"vulnerabilities": [
            {"cve": {"id": "CVE-2021-28926", "publishedDate": "2021-05-07",
                     "descriptions": [{"value": "RCE dans ..."}],
                     "metrics": {"cvssMetricV31": [{"cvssData": {"baseScore": 7.5, "baseSeverity": "HIGH"}}]}}}]}
        out = m.nvd_cves_by_keyword("ftp", "2.3.4")
    assert out[0]["cve_id"] == "CVE-2021-28926" and out[0]["cvss"] == 7.5


def test_run_audit_mock_structure():
    with patch.object(m, "parse_nmap_xml", return_value=[{"host": "h", "port": 80, "protocol": "tcp", "service": "http", "product": "nginx", "version": "1.21.4"}]):
        out = m.run_audit("127.0.0.1", mock=False)
    assert set(out.keys()) == {"summary", "services", "cves"}
    assert out["summary"]["n_services"] == 1


def test_run_audit_mock_full():
    out = m.run_audit("127.0.0.1", host_for_nmap="192.168.56.101", mock=True)
    assert len(out["services"]) == 2 and out["summary"]["nmap_binary"] == "mock"


def test_generate_report_produces_files(tmp_path):
    data = {"summary": {"target": "127.0.0.1", "nmap_binary": "n/a", "n_services": 2, "n_cves": 1, "severities": {}},
            "services": [{"port": 80, "service": "http", "product": "nginx", "version": "1.21.4"}],
            "cves": [{"cve_id": "CVE-2021-28926", "cvss": 7.5, "severity": "HIGH", "published": "2021-05-07", "description": "x"}]}
    md = rep.build_markdown(data)
    assert "CVE-2021-28926" in md
    out = tmp_path / "r.pdf"
    rep.build_pdf(md, out)
    assert out.exists() and out.stat().st_size > 400


def test_main_smoke():
    assert m.main(["--mock-audit"]) == 0


if __name__ == "__main__":
    pytest.main([__file__, "-q"])

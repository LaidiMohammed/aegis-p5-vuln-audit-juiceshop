import { NextRequest, NextResponse } from "next/server";
import { scanHost, matchCves } from "@/lib/scanner";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/scan — scan TCP RÉEL.
 * body: { host: string, ports?: number[] }
 * N'envoie que des connexions TCP vers la cible fournie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const host: string = typeof body.host === "string" ? body.host.trim() : "";
    const ports: number[] = Array.isArray(body.ports)
      ? body.ports.filter((n: any) => Number.isInteger(n) && n > 0 && n < 65536)
      : undefined as any;
    if (!host) {
      return NextResponse.json({ error: "Cible (host) requise" }, { status: 400 });
    }
    const results = await scanHost(host, ports);
    const open = results.filter((r) => r.open);
    const cves = matchCves(results);
    return NextResponse.json({
      project: "P5",
      target: host,
      scanned_at: new Date().toISOString(),
      method: "Scan TCP réel (connexions directes) — éthique : cible autorisée uniquement",
      summary: {
        ports_scanned: results.length,
        open_ports: open.length,
        closed_ports: results.length - open.length,
        cves_found: cves.length,
      },
      results,
      cves,
    });
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}

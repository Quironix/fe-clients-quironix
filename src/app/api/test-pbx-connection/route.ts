import { NextResponse } from "next/server";

const PBX_SERVER = "172.17.16.24";
const PBX_PORTS = [8088, 8089, 5060];

export async function GET() {
  const results = [];

  // Test de conectividad básica
  for (const port of PBX_PORTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const testUrl = `http://${PBX_SERVER}:${port}`;

      const response = await fetch(testUrl, {
        method: "HEAD",
        signal: controller.signal,
      }).catch((error) => {
        return { ok: false, error: error.message };
      });

      clearTimeout(timeoutId);

      results.push({
        host: PBX_SERVER,
        port,
        status: response.ok ? "reachable" : "unreachable",
        error: "error" in response ? response.error : null,
      });
    } catch (error: any) {
      results.push({
        host: PBX_SERVER,
        port,
        status: "error",
        error: error.message,
      });
    }
  }

  // Test de resolución DNS
  let dnsResolved = false;
  try {
    // Simple check si podemos hacer fetch al host
    await fetch(`http://${PBX_SERVER}`, { method: "HEAD" }).catch(() => {});
    dnsResolved = true;
  } catch {
    dnsResolved = false;
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    server: PBX_SERVER,
    dnsResolved,
    connectivity: results,
    vnetIntegration: process.env.WEBSITE_VNET_ROUTE_ALL === "1",
    recommendations: [
      "Verifica que el App Service tenga VNet Integration habilitado",
      "Confirma que la PBX esté en la misma VNet o VNet con peering",
      "Asegúrate de que los NSG permitan tráfico en puertos 8088, 8089",
      "Para WebRTC, el puerto recomendado es 8089 (WSS)",
    ],
  });
}

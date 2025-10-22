/**
 * Script de prueba para verificar conectividad WebRTC
 *
 * Cómo usar:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega este script completo
 * 3. Presiona Enter
 * 4. Revisa los resultados en la consola
 */

(function testWebRTCConnection() {
  console.log("=".repeat(60));
  console.log("🧪 TEST DE CONEXIÓN WEBRTC - ISSABEL PBX");
  console.log("=".repeat(60));

  const WS_URI = "wss://172.17.16.24:8089/ws";
  const SIP_DOMAIN = "172.17.16.24";

  console.log("\n📋 Configuración:");
  console.log(`   WebSocket URI: ${WS_URI}`);
  console.log(`   SIP Domain: ${SIP_DOMAIN}`);

  // Test 1: Verificar soporte WebSocket
  console.log("\n1️⃣ Verificando soporte WebSocket...");
  if (typeof WebSocket === 'undefined') {
    console.error("❌ WebSocket no está soportado en este navegador");
    return;
  }
  console.log("✅ WebSocket soportado");

  // Test 2: Intentar conectar al WebSocket
  console.log("\n2️⃣ Intentando conectar al WebSocket...");
  console.log(`   Conectando a: ${WS_URI}`);

  const ws = new WebSocket(WS_URI);

  const timeout = setTimeout(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      console.error("❌ Timeout: No se pudo conectar al WebSocket en 10 segundos");
      console.error("   Posibles causas:");
      console.error("   - El servidor no está accesible");
      console.error("   - Problemas de firewall");
      console.error("   - Certificado SSL bloqueado");
      console.error("\n   💡 Solución sugerida:");
      console.error("   1. Navega a https://172.17.16.24:8089");
      console.error("   2. Acepta el certificado SSL");
      console.error("   3. Vuelve a ejecutar este test");
      ws.close();
    }
  }, 10000);

  ws.onopen = (event) => {
    clearTimeout(timeout);
    console.log("✅ WebSocket conectado exitosamente!");
    console.log("   ReadyState:", ws.readyState);
    console.log("   URL:", ws.url);
    console.log("   Protocol:", ws.protocol);

    console.log("\n3️⃣ Estado de la conexión:");
    console.log("   ✓ Conexión establecida");
    console.log("   ✓ Listo para enviar mensajes SIP");

    console.log("\n=".repeat(60));
    console.log("✅ RESULTADO: Conexión WebRTC OK");
    console.log("=".repeat(60));
    console.log("\n💡 La conexión funciona correctamente.");
    console.log("   Si aún tienes problemas, revisa:");
    console.log("   - Las credenciales SIP (usuario/contraseña)");
    console.log("   - Los logs de JsSIP en la consola");
    console.log("   - La pestaña Network → WS para mensajes SIP");

    // Cerrar después de verificar
    setTimeout(() => {
      console.log("\n🔌 Cerrando conexión de prueba...");
      ws.close();
    }, 2000);
  };

  ws.onerror = (error) => {
    clearTimeout(timeout);
    console.error("❌ Error al conectar WebSocket");
    console.error("   Error:", error);
    console.error("\n   Posibles causas:");
    console.error("   - Certificado SSL auto-firmado bloqueado");
    console.error("   - Servidor no accesible");
    console.error("   - Puerto 8089 bloqueado por firewall");
    console.error("\n   💡 Soluciones:");
    console.error("   1. Acepta el certificado SSL:");
    console.error("      → https://172.17.16.24:8089");
    console.error("   2. Verifica conectividad:");
    console.error("      → ping 172.17.16.24");
    console.error("   3. Verifica que el puerto esté abierto:");
    console.error("      → nc -zv 172.17.16.24 8089");
  };

  ws.onclose = (event) => {
    console.log("\n🔌 WebSocket cerrado");
    console.log(`   Code: ${event.code}`);
    console.log(`   Reason: ${event.reason || 'Sin razón específica'}`);
    console.log(`   Clean: ${event.wasClean ? 'Sí' : 'No'}`);

    // Interpretar código de cierre
    const closeCodes = {
      1000: "✅ Cierre normal - Todo OK",
      1001: "⚠️ El servidor se fue",
      1006: "❌ Conexión cerrada anormalmente (sin handshake)",
      1015: "❌ Error de TLS/SSL - Certificado rechazado"
    };

    console.log(`   Interpretación: ${closeCodes[event.code] || 'Código desconocido'}`);

    if (event.code === 1006) {
      console.error("\n   ⚠️ PROBLEMA DETECTADO: No se pudo establecer conexión");
      console.error("   El código 1006 indica que el navegador rechazó la conexión");
      console.error("   antes de completar el handshake WebSocket.");
      console.error("\n   💡 SOLUCIÓN:");
      console.error("   1. Abre en una nueva pestaña: https://172.17.16.24:8089");
      console.error("   2. Acepta el certificado SSL (clic en Avanzado → Continuar)");
      console.error("   3. Vuelve aquí y ejecuta el test de nuevo");
    }

    if (event.code === 1015) {
      console.error("\n   ⚠️ PROBLEMA DETECTADO: Certificado SSL rechazado");
      console.error("   💡 SOLUCIÓN: Acepta el certificado SSL del servidor");
    }
  };

  console.log("\n⏳ Esperando respuesta del servidor...");
  console.log("   (máximo 10 segundos)");
})();

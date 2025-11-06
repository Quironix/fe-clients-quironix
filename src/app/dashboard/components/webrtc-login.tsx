"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWebRTCContext } from "@/context/WebRTCContext";
import { TEST_CREDENTIALS, createDirectWebRTCConfig } from "@/services/webrtc";
import { Activity, Phone, PhoneOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const WebRTCLogin = () => {
  const { config, setConfig, isRegistered } = useWebRTCContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Usuario y contraseña requeridos");
      return;
    }

    setLoading(true);

    try {
      const credentials = createDirectWebRTCConfig(username, password);
      setConfig(credentials);
      toast.success("Conectando a la central telefónica...");
      setOpen(false);
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("Error en configuración WebRTC:", error);
      toast.error("Error al configurar la conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (anexo: keyof typeof TEST_CREDENTIALS) => {
    setLoading(true);
    const creds = TEST_CREDENTIALS[anexo];

    try {
      const credentials = createDirectWebRTCConfig(
        creds.username,
        creds.password
      );
      setConfig(credentials);
      toast.success(`Conectando con anexo ${anexo}...`);
      setOpen(false);
    } catch (error) {
      console.error("Error en login rápido:", error);
      toast.error("Error al conectar con el anexo");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConfig(null);
    toast.info("Desconectado de la central telefónica");
  };

  const handleTestConnection = () => {
    console.log("=".repeat(60));
    console.log("🧪 TEST DE CONEXIÓN WEBRTC - ISSABEL PBX");
    console.log("=".repeat(60));

    const WS_URI = "wss://webrtc.quironix.com:8089/ws";
    const SIP_DOMAIN = "webrtc.quironix.com";

    console.log("\n📋 Configuración:");
    console.log(`   WebSocket URI: ${WS_URI}`);
    console.log(`   SIP Domain: ${SIP_DOMAIN}`);

    console.log("\n1️⃣ Verificando soporte WebSocket...");
    if (typeof WebSocket === "undefined") {
      console.error("❌ WebSocket no está soportado en este navegador");
      toast.error("WebSocket no soportado en este navegador");
      return;
    }
    console.log("✅ WebSocket soportado");
    toast.info("Probando conexión WebSocket...", { duration: 10000 });

    console.log("\n2️⃣ Intentando conectar al WebSocket...");
    console.log(`   Conectando a: ${WS_URI}`);

    const ws = new WebSocket(WS_URI);

    const timeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.error(
          "❌ Timeout: No se pudo conectar al WebSocket en 10 segundos"
        );
        console.error("   Posibles causas:");
        console.error("   - El servidor no está accesible");
        console.error("   - Problemas de firewall o VPN");
        console.error("   - Certificado SSL bloqueado");
        console.error("\n   💡 Solución sugerida:");
        console.error("   1. Navega a https://webrtc.quironix.com:8089");
        console.error("   2. Acepta el certificado SSL");
        console.error("   3. Vuelve a ejecutar este test");
        toast.error("Timeout: No se pudo conectar. Revisa la consola (F12)");
        ws.close();
      }
    }, 10000);

    ws.onopen = () => {
      clearTimeout(timeout);
      console.log("✅ WebSocket conectado exitosamente!");
      console.log("   ReadyState:", ws.readyState);
      console.log("   URL:", ws.url);
      console.log("   Protocol:", ws.protocol);

      console.log("\n3️⃣ Estado de la conexión:");
      console.log("   ✓ Conexión establecida");
      console.log("   ✓ Listo para enviar mensajes SIP");

      console.log("\n" + "=".repeat(60));
      console.log("✅ RESULTADO: Conexión WebRTC OK");
      console.log("=".repeat(60));
      console.log("\n💡 La conexión funciona correctamente.");
      console.log("   Si aún tienes problemas, revisa:");
      console.log("   - Las credenciales SIP (usuario/contraseña)");
      console.log("   - Los logs de JsSIP en la consola");
      console.log("   - La pestaña Network → WS para mensajes SIP");

      toast.success("✅ Conexión WebSocket exitosa! Revisa la consola (F12)");

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
      console.error("   - Servidor no accesible (VPN requerida)");
      console.error("   - Puerto 8089 bloqueado por firewall");
      console.error("\n   💡 Soluciones:");
      console.error("   1. Acepta el certificado SSL:");
      console.error("      → https://webrtc.quironix.com:8089");
      console.error("   2. Verifica que estés conectado a la VPN");
      console.error("   3. Verifica conectividad:");
      console.error("      → ping webrtc.quironix.com");
      toast.error("❌ Error de conexión. Revisa la consola (F12)");
    };

    ws.onclose = (event) => {
      console.log("\n🔌 WebSocket cerrado");
      console.log(`   Code: ${event.code}`);
      console.log(`   Reason: ${event.reason || "Sin razón específica"}`);
      console.log(`   Clean: ${event.wasClean ? "Sí" : "No"}`);

      const closeCodes: Record<number, string> = {
        1000: "✅ Cierre normal - Todo OK",
        1001: "⚠️ El servidor se fue",
        1006: "❌ Conexión cerrada anormalmente (sin handshake)",
        1015: "❌ Error de TLS/SSL - Certificado rechazado",
      };

      console.log(
        `   Interpretación: ${closeCodes[event.code] || "Código desconocido"}`
      );

      if (event.code === 1006) {
        console.error(
          "\n   ⚠️ PROBLEMA DETECTADO: No se pudo establecer conexión"
        );
        console.error(
          "   El código 1006 indica que el navegador rechazó la conexión"
        );
        console.error("   antes de completar el handshake WebSocket.");
        console.error("\n   💡 SOLUCIÓN:");
        console.error("   1. Verifica que estés conectado a la VPN");
        console.error(
          "   2. Abre en una nueva pestaña: https://webrtc.quironix.com:8089"
        );
        console.error(
          "   3. Acepta el certificado SSL (clic en Avanzado → Continuar)"
        );
        console.error("   4. Vuelve aquí y ejecuta el test de nuevo");
        toast.error("Error 1006: Certificado SSL o VPN. Revisa consola (F12)");
      }

      if (event.code === 1015) {
        console.error("\n   ⚠️ PROBLEMA DETECTADO: Certificado SSL rechazado");
        console.error("   💡 SOLUCIÓN: Acepta el certificado SSL del servidor");
        toast.error("Certificado SSL rechazado. Revisa consola (F12)");
      }
    };

    console.log("\n⏳ Esperando respuesta del servidor...");
    console.log("   (máximo 10 segundos)");
  };

  if (config || isRegistered) {
    return (
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleTestConnection}
          className="gap-2"
        >
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline">Test</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="gap-2"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">Desconectar</span>
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">Conectar PBX</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar a Central Telefónica</DialogTitle>
          <DialogDescription>
            Ingresa tus credenciales WebRTC para habilitar las llamadas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Usuario (Anexo)</Label>
            <Input
              id="username"
              placeholder="6170"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Conectando..." : "Conectar"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O usa un anexo de prueba
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(
            Object.keys(TEST_CREDENTIALS) as Array<
              keyof typeof TEST_CREDENTIALS
            >
          ).map((anexo) => (
            <Button
              key={anexo}
              variant="outline"
              size="sm"
              onClick={() => handleQuickLogin(anexo)}
              disabled={loading}
            >
              Anexo {anexo}
            </Button>
          ))}
        </div>

        <div className="pt-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-full gap-2"
            onClick={handleTestConnection}
          >
            <Activity className="w-4 h-4" />
            Probar Conexión WebSocket
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Ejecuta un test de diagnóstico y revisa la consola (F12)
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Servidor: webrtc.quironix.com | Puerto: 8089 (WSS)
        </p>
      </DialogContent>
    </Dialog>
  );
};

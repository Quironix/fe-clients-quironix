"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Phone, PhoneOff } from "lucide-react";
import { useWebRTCContext } from "@/context/WebRTCContext";
import { provisionWebRTC, TEST_CREDENTIALS } from "@/services/webrtc";
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
      const credentials = await provisionWebRTC({ username, password });
      setConfig(credentials);
      toast.success("Conectando a la central telefónica...");
      setOpen(false);
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("Error en login WebRTC:", error);
      toast.error("Credenciales inválidas o error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (anexo: keyof typeof TEST_CREDENTIALS) => {
    setLoading(true);
    const creds = TEST_CREDENTIALS[anexo];

    try {
      const credentials = await provisionWebRTC(creds);
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

  if (config || isRegistered) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleDisconnect}
        className="gap-2"
      >
        <PhoneOff className="w-4 h-4" />
        <span className="hidden sm:inline">Desconectar PBX</span>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
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
          {(Object.keys(TEST_CREDENTIALS) as Array<keyof typeof TEST_CREDENTIALS>).map(
            (anexo) => (
              <Button
                key={anexo}
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin(anexo)}
                disabled={loading}
              >
                Anexo {anexo}
              </Button>
            )
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Servidor: 172.17.16.24 | Puerto: 8089 (WSS)
        </p>
      </DialogContent>
    </Dialog>
  );
};

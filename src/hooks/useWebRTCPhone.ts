"use client";

import { useEffect, useRef, useCallback } from "react";
import { useWebRTCContext } from "@/context/WebRTCContext";
import { toast } from "sonner";

// Importar JsSIP de forma dinámica para evitar problemas con SSR
let JsSIP: any = null;
if (typeof window !== "undefined") {
  JsSIP = require("jssip");
}

export const useWebRTCPhone = () => {
  const {
    config,
    isRegistered,
    callStatus,
    currentNumber,
    setIsRegistered,
    setCallStatus,
    setCurrentNumber,
  } = useWebRTCContext();

  const uaRef = useRef<any>(null);
  const currentSessionRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar audio remoto
  useEffect(() => {
    if (typeof window !== "undefined" && !remoteAudioRef.current) {
      remoteAudioRef.current = new Audio();
      remoteAudioRef.current.autoplay = true;
    }
  }, []);

  // Inicializar micrófono
  const initMedia = useCallback(async () => {
    if (localStreamRef.current) return;

    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    } catch (err) {
      console.error("Error al capturar micrófono:", err);
      toast.error("Debes permitir acceso al micrófono");
      throw err;
    }
  }, []);

  // Registrar el User Agent
  const register = useCallback(() => {
    if (!config || !JsSIP) {
      toast.error("Configuración de WebRTC no disponible");
      return;
    }

    if (uaRef.current) {
      console.log("User Agent ya registrado");
      return;
    }

    try {
      setCallStatus("registering");

      const socket = new JsSIP.WebSocketInterface(config.wsUri);
      const configuration = {
        sockets: [socket],
        uri: `sip:${config.sipUser}@${config.sipDomain}`,
        password: config.sipPass,
        register: true,
        session_timers: false,
        register_expires: 300,
        contact_uri: `sip:${config.sipUser}@${config.sipDomain}`,
      };

      uaRef.current = new JsSIP.UA(configuration);

      // Event: Registrado exitosamente
      uaRef.current.on("registered", () => {
        console.log("✅ Registrado en PBX");
        setIsRegistered(true);
        setCallStatus("registered");
        toast.success("Conectado a la central telefónica");
      });

      // Event: Fallo en el registro
      uaRef.current.on("registrationFailed", (e: any) => {
        console.error("❌ Registro fallido:", e);
        setIsRegistered(false);
        setCallStatus("failed");
        toast.error("Error al conectar con la central telefónica");
      });

      // Event: Nueva sesión RTC (llamada entrante)
      uaRef.current.on("newRTCSession", (e: any) => {
        console.log("Nueva sesión RTC:", e);
      });

      uaRef.current.start();
    } catch (error) {
      console.error("Error al registrar UA:", error);
      setCallStatus("failed");
      toast.error("Error al inicializar el softphone");
    }
  }, [config, setIsRegistered, setCallStatus]);

  // Realizar llamada
  const makeCall = useCallback(
    async (phoneNumber: string) => {
      if (!uaRef.current) {
        toast.error("Primero debes conectarte a la central telefónica");
        return;
      }

      if (!isRegistered) {
        toast.error("No estás registrado en la central");
        return;
      }

      if (!phoneNumber || phoneNumber.trim() === "") {
        toast.error("Ingresa un número válido");
        return;
      }

      try {
        await initMedia();

        const numberToCall = phoneNumber.trim();
        setCurrentNumber(numberToCall);

        const targetUri = `sip:${numberToCall}@${config?.sipDomain}`;
        console.log("Llamando a:", targetUri);

        const options = {
          mediaConstraints: { audio: true, video: false },
          eventHandlers: {
            progress: () => {
              console.log("☎ Sonando...");
              setCallStatus("ringing");
              toast.info(`Llamando a ${numberToCall}...`);
            },
            failed: (e: any) => {
              console.error("❌ Llamada fallida:", e);
              setCallStatus("failed");
              toast.error("Llamada fallida");
              setTimeout(() => setCallStatus("registered"), 3000);
            },
            ended: () => {
              console.log("📴 Llamada finalizada");
              setCallStatus("ended");
              toast.info("Llamada finalizada");
              currentSessionRef.current = null;
              setTimeout(() => setCallStatus("registered"), 2000);
            },
            confirmed: () => {
              console.log("✅ En llamada");
              setCallStatus("in-call");
              toast.success("Llamada conectada");
            },
          },
        };

        currentSessionRef.current = uaRef.current.call(targetUri, options);
        setCallStatus("calling");

        // Captura de audio remoto
        currentSessionRef.current.connection.addEventListener(
          "track",
          (e: any) => {
            if (e.track.kind === "audio" && remoteAudioRef.current) {
              if (!remoteAudioRef.current.srcObject) {
                remoteAudioRef.current.srcObject = new MediaStream();
              }
              remoteAudioRef.current.srcObject.addTrack(e.track);
              remoteAudioRef.current
                .play()
                .catch((err) => console.warn("Autoplay bloqueado:", err));
            }
          }
        );
      } catch (error) {
        console.error("Error al realizar llamada:", error);
        setCallStatus("failed");
        toast.error("Error al realizar la llamada");
      }
    },
    [
      config,
      isRegistered,
      initMedia,
      setCallStatus,
      setCurrentNumber,
    ]
  );

  // Colgar llamada
  const hangup = useCallback(() => {
    if (currentSessionRef.current) {
      currentSessionRef.current.terminate();
      setCallStatus("ended");
      setCurrentNumber("");
      toast.info("Llamada finalizada");
    }
  }, [setCallStatus, setCurrentNumber]);

  // Poner en espera / Reanudar
  const toggleHold = useCallback(() => {
    if (!currentSessionRef.current) return;

    if (callStatus === "on-hold") {
      currentSessionRef.current.unhold();
      setCallStatus("in-call");
      toast.info("Llamada reanudada");
    } else if (callStatus === "in-call") {
      currentSessionRef.current.hold();
      setCallStatus("on-hold");
      toast.info("Llamada en espera");
    }
  }, [callStatus, setCallStatus]);

  // Desconectar
  const unregister = useCallback(() => {
    if (uaRef.current) {
      uaRef.current.stop();
      uaRef.current = null;
      setIsRegistered(false);
      setCallStatus("idle");
      toast.info("Desconectado de la central telefónica");
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
  }, [setIsRegistered, setCallStatus]);

  // Auto-registro cuando hay configuración
  useEffect(() => {
    if (config && !uaRef.current) {
      register();
    }

    return () => {
      // Cleanup al desmontar
      if (uaRef.current) {
        unregister();
      }
    };
  }, [config, register, unregister]);

  return {
    isRegistered,
    callStatus,
    currentNumber,
    makeCall,
    hangup,
    toggleHold,
    register,
    unregister,
  };
};

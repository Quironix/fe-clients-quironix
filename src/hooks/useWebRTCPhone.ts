"use client";

import { useWebRTCContext } from "@/context/WebRTCContext";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

// Importar JsSIP de forma dinámica para evitar problemas con SSR
let JsSIP: any = null;

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
  const t = useTranslations("webrtc");

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
      toast.error(t("microphoneAccess"));
      throw err;
    }
  }, []);

  // Registrar el User Agent
  const register = useCallback(async () => {
    if (!config) {
      toast.error(t("configNotAvailable"));
      return;
    }

    if (uaRef.current) {
      return;
    }

    try {
      setCallStatus("registering");

      // Cargar JsSIP dinámicamente
      if (!JsSIP && typeof window !== "undefined") {
        JsSIP = await import("jssip");

        // Habilitar debug de JsSIP para ver todos los logs
        JsSIP.debug.enable("JsSIP:*");
      }

      if (!JsSIP) {
        toast.error(t("jssipLoadError"));
        return;
      }

      const socket = new JsSIP.WebSocketInterface(config.wsUri);

      const configuration = {
        sockets: [socket],
        uri: `sip:${config.sipUser}@${config.sipDomain}`,
        password: config.sipPass,
        register: true,
        session_timers: false,
        register_expires: 300,
        contact_uri: `sip:${config.sipUser}@${config.sipDomain}`,
        ice_servers: config.iceServers || [],
      };

      uaRef.current = new JsSIP.UA(configuration);

      // Event: WebSocket conectado
      uaRef.current.on("connected", () => {
        console.log("🔗 [WebRTC] WebSocket conectado");
      });

      // Event: WebSocket desconectado
      uaRef.current.on("disconnected", () => {
        console.warn("⚠️ [WebRTC] WebSocket desconectado");
      });

      // Event: Registrado exitosamente
      uaRef.current.on("registered", () => {
        setIsRegistered(true);
        setCallStatus("registered");
        toast.success(t("connected"));
      });

      // Event: Fallo en el registro
      uaRef.current.on("registrationFailed", (e: any) => {
        setIsRegistered(false);
        setCallStatus("failed");
        toast.error(t("connectionError"));
      });

      // Event: Nueva sesión RTC (llamada entrante)
      uaRef.current.on("newRTCSession", (e: any) => {
        console.log("📞 [WebRTC] Nueva sesión RTC:", e);
      });

      uaRef.current.start();
    } catch (error) {
      setCallStatus("failed");
      toast.error(t("initError"));
    }
  }, [config, setIsRegistered, setCallStatus]);

  // Realizar llamada
  const makeCall = useCallback(
    async (phoneNumber: string) => {
      if (!uaRef.current) {
        toast.error(t("connectFirst"));
        return;
      }

      if (!isRegistered) {
        toast.error(t("notRegistered"));
        return;
      }

      if (!phoneNumber || phoneNumber.trim() === "") {
        toast.error(t("invalidNumber"));
        return;
      }

      try {
        await initMedia();

        const numberToCall = phoneNumber.trim();
        setCurrentNumber(numberToCall);

        const targetUri = `sip:${numberToCall}@${config?.sipDomain}`;

        const options = {
          mediaConstraints: { audio: true, video: false },
          eventHandlers: {
            progress: () => {
              setCallStatus("ringing");
              toast.info(t("calling", { number: numberToCall }));
            },
            failed: (e: any) => {
              setCallStatus("failed");
              toast.error(t("callFailed"));
              if (localStreamRef.current) {
                localStreamRef.current
                  .getTracks()
                  .forEach((track) => track.stop());
                localStreamRef.current = null;
              }
              setTimeout(() => setCallStatus("registered"), 3000);
            },
            ended: () => {
              setCallStatus("ended");
              toast.info(t("callEnded"));
              if (localStreamRef.current) {
                localStreamRef.current
                  .getTracks()
                  .forEach((track) => track.stop());
                localStreamRef.current = null;
              }
              currentSessionRef.current = null;
              setTimeout(() => setCallStatus("registered"), 2000);
            },
            confirmed: () => {
              setCallStatus("in-call");
              toast.success(t("callConnected"));
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
              const srcObject = remoteAudioRef.current.srcObject;
              if (srcObject instanceof MediaStream) {
                srcObject.addTrack(e.track);
                remoteAudioRef.current
                  .play()
                  .catch((err) => console.warn("Autoplay bloqueado:", err));
              }
            }
          },
        );
      } catch (error) {
        setCallStatus("failed");
        toast.error(t("callError"));
      }
    },
    [config, isRegistered, initMedia, setCallStatus, setCurrentNumber],
  );

  // Colgar llamada
  const hangup = useCallback(() => {
    if (currentSessionRef.current) {
      currentSessionRef.current.terminate();
      setCallStatus("ended");
      setCurrentNumber("");
      toast.info(t("callEnded"));
    }
  }, [setCallStatus, setCurrentNumber, t]);

  // Poner en espera / Reanudar
  const toggleHold = useCallback(() => {
    if (!currentSessionRef.current) return;

    if (callStatus === "on-hold") {
      currentSessionRef.current.unhold();
      setCallStatus("in-call");
      toast.info(t("callResumed"));
    } else if (callStatus === "in-call") {
      currentSessionRef.current.hold();
      setCallStatus("on-hold");
      toast.info(t("callOnHold"));
    }
  }, [callStatus, setCallStatus]);

  // Desconectar
  const unregister = useCallback(() => {
    if (uaRef.current) {
      uaRef.current.stop();
      uaRef.current = null;
      setIsRegistered(false);
      setCallStatus("idle");
      toast.info(t("disconnected"));
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

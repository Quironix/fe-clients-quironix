"use client";

import { useWebRTCContext } from "@/context/WebRTCContext";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

const TURN_URL = process.env.NEXT_PUBLIC_TURN_URL || "";
const TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME || "";
const TURN_CREDENTIAL = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "";

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

        JsSIP.debug.disable("JsSIP:*");
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
        pcConfig: {
          iceServers: [
            {
              urls: TURN_URL,
              username: TURN_USERNAME,
              credential: TURN_CREDENTIAL,
            },
          ],
          iceTransportPolicy: "relay" as RTCIceTransportPolicy,
        },
      };

      uaRef.current = new JsSIP.UA(configuration);

      uaRef.current.on("connected", () => {
        console.log("🔗 [WebRTC] WS conectado →", config.wsUri);
      });

      uaRef.current.on("disconnected", () => {
        console.warn("⚠️ [WebRTC] WS desconectado");
      });

      uaRef.current.on("registered", () => {
        console.log("✅ [WebRTC] Registrado como", `sip:${config.sipUser}@${config.sipDomain}`);
        setIsRegistered(true);
        setCallStatus("registered");
        toast.success(t("connected"));
      });

      uaRef.current.on("registrationFailed", (e: any) => {
        console.error("❌ [WebRTC] Registro fallido →", e?.cause, e?.response?.status_code);
        setIsRegistered(false);
        setCallStatus("failed");
        toast.error(t("connectionError"));
      });

      uaRef.current.on("newRTCSession", (e: any) => {
        console.log("📞 [WebRTC] Nueva sesión →", e?.originator, e?.request?.ruri?.toString());
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
          pcConfig: {
            iceServers: [
              {
                urls: TURN_URL,
                username: TURN_USERNAME,
                credential: TURN_CREDENTIAL,
              },
            ],
            iceTransportPolicy: "relay" as RTCIceTransportPolicy,
          },
          eventHandlers: {
            peerconnection: (data: any) => {
              const pc = data.peerconnection;
              console.log("🔌 [WebRTC] PeerConnection creado | signalingState:", pc.signalingState);

              let gatheringForced = false;
              pc.addEventListener("icecandidate", (ev: any) => {
                if (ev.candidate) {
                  console.log(`🧊 [ICE] Candidato: type=${ev.candidate.type} | proto=${ev.candidate.protocol} | addr=${ev.candidate.address}:${ev.candidate.port}`);
                  if (ev.candidate.type === "relay" && !gatheringForced) {
                    gatheringForced = true;
                    console.log("🧊 [ICE] Relay encontrado — forzando gatheringState=complete en 500ms");
                    setTimeout(() => {
                      if (pc.iceGatheringState !== "complete") {
                        Object.defineProperty(pc, "iceGatheringState", {
                          get: () => "complete" as RTCIceGatheringState,
                          configurable: true,
                        });
                        pc.dispatchEvent(new Event("icegatheringstatechange"));
                        setTimeout(() => {
                          try { delete (pc as any).iceGatheringState; } catch (_) {}
                        }, 0);
                      }
                    }, 500);
                  }
                } else {
                  console.log("🧊 [ICE] Gathering completo (null candidate)");
                }
              });

              pc.addEventListener("icegatheringstatechange", () => {
                console.log("🧊 [ICE] gatheringState →", pc.iceGatheringState);
              });

              pc.addEventListener("iceconnectionstatechange", () => {
                console.log("🧊 [ICE] connectionState →", pc.iceConnectionState);
              });

              pc.addEventListener("connectionstatechange", () => {
                console.log("🔌 [PC] connectionState →", pc.connectionState);
              });

              pc.addEventListener("track", (ev: any) => {
                console.log("🔊 [WebRTC] Track recibido:", ev.track.kind);
                if (ev.track.kind === "audio" && remoteAudioRef.current) {
                  remoteAudioRef.current.srcObject = new MediaStream([ev.track]);
                  remoteAudioRef.current
                    .play()
                    .catch((err: any) => console.warn("⚠️ [WebRTC] Autoplay bloqueado:", err));
                }
              });
            },
            progress: (e: any) => {
              console.log("📶 [SIP] Progress →", e?.response?.status_code, e?.response?.reason_phrase);
              setCallStatus("ringing");
              toast.info(t("calling", { number: numberToCall }));
            },
            failed: (e: any) => {
              console.error("❌ [SIP] Llamada fallida →", {
                cause: e?.cause,
                status: e?.response?.status_code,
                reason: e?.response?.reason_phrase,
              });
              setCallStatus("failed");
              toast.error(t("callFailed"));
              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
                localStreamRef.current = null;
              }
              setTimeout(() => setCallStatus("registered"), 3000);
            },
            ended: (e: any) => {
              console.log("📴 [SIP] Llamada terminada →", e?.cause);
              setCallStatus("ended");
              toast.info(t("callEnded"));
              if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
                localStreamRef.current = null;
              }
              currentSessionRef.current = null;
              setTimeout(() => setCallStatus("registered"), 2000);
            },
            confirmed: () => {
              console.log("✅ [SIP] Llamada confirmada (200 OK)");
              setCallStatus("in-call");
              toast.success(t("callConnected"));
            },
          },
        };

        console.log("📲 [SIP] Iniciando llamada →", targetUri);
        currentSessionRef.current = uaRef.current.call(targetUri, options);
        setCallStatus("calling");
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

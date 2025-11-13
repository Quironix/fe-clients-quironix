import { useProfileContext } from "@/context/ProfileContext";
import { useWebRTCContext } from "@/context/WebRTCContext";
import { createDirectWebRTCConfig } from "@/services/webrtc";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "retrying"
  | "failed";

export interface WebRTCAutoConnectOptions {
  maxRetries?: number;
  autoConnect?: boolean;
  reconnectDelay?: number;
}

export interface WebRTCAutoConnectReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  retryAttempt: number;
}

const defaultOptions: Required<WebRTCAutoConnectOptions> = {
  maxRetries: 3,
  autoConnect: true,
  reconnectDelay: 2000,
};

export const useWebRTCAutoConnect = (
  options?: WebRTCAutoConnectOptions
): WebRTCAutoConnectReturn => {
  const hookConfig = { ...defaultOptions, ...options };
  const { config, setConfig, isRegistered } = useWebRTCContext();
  const { profile } = useProfileContext();
  const [retryCount, setRetryCount] = useState(0);
  const [userDisconnected, setUserDisconnected] = useState(false);
  const isConnecting = useRef(false);
  const sipWebRTCPassword = process.env.NEXT_PUBLIC_WEBRTC_SIP_PASSWORD || "";

  const attemptConnection = async () => {
    if (isConnecting.current) return;

    const sipCodeProfile = profile?.sip_code || "";
    if (!sipCodeProfile || !sipWebRTCPassword) return;

    isConnecting.current = true;

    try {
      const credentials = createDirectWebRTCConfig(
        sipCodeProfile,
        sipWebRTCPassword
      );
      setConfig(credentials);
      setRetryCount(0);
      setUserDisconnected(false);
    } catch (error) {
      console.error("Error en auto-conexión WebRTC:", error);

      if (retryCount < hookConfig.maxRetries - 1) {
        setRetryCount((prev) => prev + 1);
        setTimeout(
          () => {
            isConnecting.current = false;
            attemptConnection();
          },
          1000 * (retryCount + 1)
        );
      } else {
        toast.error("No se pudo conectar a la central telefónica");
        setRetryCount(0);
        isConnecting.current = false;
      }
      return;
    }

    isConnecting.current = false;
  };

  const connect = async () => {
    setUserDisconnected(false);
    setRetryCount(0);
    await attemptConnection();
  };

  const disconnect = () => {
    setUserDisconnected(true);
    setConfig(null);
    toast.info("Desconectado de la central telefónica");
  };

  useEffect(() => {
    if (
      hookConfig.autoConnect &&
      profile?.sip_code &&
      sipWebRTCPassword &&
      !config &&
      !isRegistered &&
      !userDisconnected
    ) {
      attemptConnection();
    }
  }, [profile?.sip_code]);

  useEffect(() => {
    if (
      !isRegistered &&
      !userDisconnected &&
      profile?.sip_code &&
      retryCount === 0 &&
      config
    ) {
      const timer = setTimeout(() => {
        attemptConnection();
      }, hookConfig.reconnectDelay);

      return () => clearTimeout(timer);
    }
  }, [isRegistered, userDisconnected]);

  const getStatus = (): ConnectionStatus => {
    const connected = !!(config || isRegistered);

    if (connected) return "connected";
    if (isConnecting.current && retryCount === 0) return "connecting";
    if (isConnecting.current && retryCount > 0) return "retrying";
    if (retryCount >= hookConfig.maxRetries) return "failed";
    return "disconnected";
  };

  return {
    status: getStatus(),
    isConnected: !!(config || isRegistered),
    connect,
    disconnect,
    retryAttempt: retryCount,
  };
};

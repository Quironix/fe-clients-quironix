"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type CallStatus =
  | "idle"
  | "registering"
  | "registered"
  | "calling"
  | "ringing"
  | "in-call"
  | "on-hold"
  | "ended"
  | "failed";

interface WebRTCConfig {
  sipUser: string;
  sipPass: string;
  sipDomain: string;
  wsUri: string;
}

interface WebRTCContextType {
  isRegistered: boolean;
  callStatus: CallStatus;
  currentNumber: string;
  config: WebRTCConfig | null;
  setConfig: (config: WebRTCConfig) => void;
  setCallStatus: (status: CallStatus) => void;
  setCurrentNumber: (number: string) => void;
  setIsRegistered: (registered: boolean) => void;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

export const WebRTCProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [currentNumber, setCurrentNumber] = useState("");
  const [config, setConfig] = useState<WebRTCConfig | null>(null);

  return (
    <WebRTCContext.Provider
      value={{
        isRegistered,
        callStatus,
        currentNumber,
        config,
        setConfig,
        setCallStatus,
        setCurrentNumber,
        setIsRegistered,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTCContext = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error("useWebRTCContext must be used within WebRTCProvider");
  }
  return context;
};

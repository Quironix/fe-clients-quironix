"use client";
import { createContext, ReactNode, useContext, useState } from "react";

interface QuironContextValue {
  enabled: boolean;
  isOpen: boolean;
  topic: string | null;
  open: () => void;
  close: () => void;
  openWithTopic: (topic: string) => void;
}

const QuironContext = createContext<QuironContextValue | null>(null);

export const QuironProvider = ({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const openWithTopic = (t: string) => {
    setTopic(t);
    setIsOpen(true);
  };

  return (
    <QuironContext.Provider
      value={{ enabled, isOpen, topic, open, close, openWithTopic }}
    >
      {children}
    </QuironContext.Provider>
  );
};

export const useQuiron = () => {
  const ctx = useContext(QuironContext);
  if (!ctx) {
    throw new Error("useQuiron must be used within a QuironProvider");
  }
  return ctx;
};

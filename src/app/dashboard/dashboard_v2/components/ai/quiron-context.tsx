"use client";
import { createContext, ReactNode, useContext, useState } from "react";

interface QuironContextValue {
  enabled: boolean;
  isOpen: boolean;
  topic: string | null;
  /** Increments on every openWithTopic() call, even if the topic is unchanged.
   * Consumers use it to know a fresh "analyze this" request was just made and
   * should auto-ask a question, as opposed to just reopening an existing chat. */
  askToken: number;
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
  const [askToken, setAskToken] = useState(0);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const openWithTopic = (t: string) => {
    setTopic(t);
    setIsOpen(true);
    setAskToken((n) => n + 1);
  };

  return (
    <QuironContext.Provider
      value={{ enabled, isOpen, topic, askToken, open, close, openWithTopic }}
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

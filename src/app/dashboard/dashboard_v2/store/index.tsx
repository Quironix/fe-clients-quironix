"use client";
import { create } from "zustand";

interface QuironThreadState {
  threadId: string | null;
  messages: unknown;
}

interface QuironChatStore {
  threads: Record<string, QuironThreadState>;
  getChatThreadId: (topic: string) => string | null;
  setChatThreadId: (topic: string, threadId: string) => void;
  getChatMessages: (topic: string) => unknown;
  setChatMessages: (topic: string, messages: unknown) => void;
}

export const useQuironChatStore = create<QuironChatStore>((set, get) => ({
  threads: {},

  getChatThreadId: (topic) => get().threads[topic]?.threadId ?? null,

  setChatThreadId: (topic, threadId) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [topic]: { ...state.threads[topic], threadId },
      },
    })),

  getChatMessages: (topic) => get().threads[topic]?.messages ?? null,

  setChatMessages: (topic, messages) =>
    set((state) => ({
      threads: {
        ...state.threads,
        [topic]: { ...state.threads[topic], messages },
      },
    })),
}));

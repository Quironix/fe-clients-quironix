"use client";

import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAssistantState,
} from "@assistant-ui/react";
import { BotIcon, SendIcon, UserIcon } from "lucide-react";
import type { FC } from "react";

const suggestedQuestions = [
  "¿Cuáles son mis KPIs críticos?",
  "¿Cómo mejorar el % CEI?",
  "Explica el indicador DSO",
];

export const KPIThread: FC = () => {
  return (
    <ThreadPrimitive.Root className="flex h-full flex-col">
      <ThreadPrimitive.Viewport className="flex h-full flex-col overflow-y-scroll scroll-smooth p-4">
        <div className="space-y-4">
          <ThreadPrimitive.Messages
            components={{
              UserMessage: UserMessage,
              AssistantMessage: AssistantMessage,
            }}
          />

          <ThreadPrimitive.If running>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <BotIcon className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          </ThreadPrimitive.If>
        </div>

        <ThreadPrimitive.If empty={false}>
          <div className="min-h-8 flex-grow" />
        </ThreadPrimitive.If>

        <div className="sticky bottom-0 mt-3 flex flex-col">
          <SuggestedQuestions />
          <Composer />
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="flex gap-3 justify-end mb-4">
      <div className="max-w-[80%] rounded-lg p-3 bg-blue-600 text-white">
        <div className="text-xs">
          <MessagePrimitive.Content />
        </div>
        <span className="text-[10px] text-blue-100">
          {new Date().toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
        <UserIcon className="h-4 w-4 text-white" />
      </div>
    </MessagePrimitive.Root>
  );
};

const AssistantMessage: FC = () => {
  return (
    <MessagePrimitive.Root className="flex gap-3 justify-start mb-4">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center flex-shrink-0">
        <BotIcon className="h-4 w-4 text-white" />
      </div>
      <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-900">
        <div className="text-xs">
          <MessagePrimitive.Content />
        </div>
        <span className="text-[10px] text-gray-500">
          {new Date().toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </MessagePrimitive.Root>
  );
};

const SuggestedQuestions: FC = () => {
  const messageCount = useAssistantState(
    ({ thread }) => thread.messages.length
  );

  if (messageCount !== 1) return null;

  return (
    <div className="px-4 pb-3 border-t border-gray-200 pt-3">
      <p className="text-xs text-gray-600 mb-2 font-medium">
        Preguntas sugeridas:
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => {
              const input = document.querySelector(
                'textarea[placeholder="Escribe tu pregunta..."]'
              ) as HTMLTextAreaElement;
              if (input) {
                input.value = question;
                input.dispatchEvent(new Event("input", { bubbles: true }));
                const form = input.closest("form");
                if (form) {
                  form.requestSubmit();
                }
              }
            }}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

const Composer: FC = () => {
  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <ComposerPrimitive.Root className="flex gap-2">
        <ComposerPrimitive.Input
          autoFocus
          placeholder="Escribe tu pregunta..."
          className="flex-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
        />
        <ThreadPrimitive.If running={false}>
          <ComposerPrimitive.Send asChild>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-orange-500 hover:bg-orange-600 text-white h-10 px-4">
              <SendIcon className="h-4 w-4" />
            </button>
          </ComposerPrimitive.Send>
        </ThreadPrimitive.If>
        <ThreadPrimitive.If running>
          <button
            disabled
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-orange-500 text-white h-10 px-4 opacity-50 cursor-not-allowed"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </ThreadPrimitive.If>
      </ComposerPrimitive.Root>
    </div>
  );
};

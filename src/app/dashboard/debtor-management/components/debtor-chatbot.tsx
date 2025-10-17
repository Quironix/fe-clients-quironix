"use client";

import { useState, useCallback } from "react";
import {
  ThreadMessageLike,
  AppendMessage,
  AssistantRuntimeProvider,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { useProfileContext } from "@/context/ProfileContext";

interface DebtorChatbotProps {
  debtorId: string;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function DebtorChatbot({ debtorId }: DebtorChatbotProps) {
  const { profile, session } = useProfileContext();
  const [messages, setMessages] = useState<readonly ThreadMessageLike[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const onNew = useCallback(
    async (message: AppendMessage) => {
      if (message.content.length !== 1 || message.content[0]?.type !== "text") {
        throw new Error("Only text content is supported");
      }

      const userMessage: ThreadMessageLike = {
        role: "user",
        content: [{ type: "text", text: message.content[0].text }],
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setIsStreaming(true);

      try {
        // Preparar mensajes para el API
        const apiMessages: ChatMessage[] = [
          {
            role: "system",
            content: `Eres un asistente de IA para gestión de deudores. Estás ayudando con el deudor ID: ${debtorId}. Proporciona información útil y profesional.`,
          },
          ...messages.map((msg) => {
            const firstContent = msg.content[0];
            let contentText = "";

            if (typeof firstContent === "string") {
              contentText = firstContent;
            } else if (
              firstContent &&
              typeof firstContent === "object" &&
              "type" in firstContent &&
              firstContent.type === "text" &&
              "text" in firstContent
            ) {
              contentText = firstContent.text;
            }

            return {
              role: msg.role as "user" | "assistant",
              content: contentText,
            };
          }),
          {
            role: "user",
            content: message.content[0].text,
          },
        ];

        const clientId = profile?.client?.id;
        const token = session?.token;

        if (!clientId || !token) {
          throw new Error("No client ID or token available");
        }

        const response = await fetch(
          `${API_URL}/v2/clients/${clientId}/ai-engines/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ messages: apiMessages }),
          },
        );

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }

        // Leer el stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body available");
        }

        let assistantText = "";
        let done = false;
        let buffer = "";

        // Crear mensaje temporal del asistente
        const assistantMessage: ThreadMessageLike = {
          role: "assistant",
          content: [{ type: "text", text: "" }],
        };

        setMessages((currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ]);

        // Procesar tokens línea por línea
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Dividir por saltos de línea (considerar \n y \r\n)
            const lines = buffer.split(/\r?\n/);

            // Guardar la última línea (puede estar incompleta) en el buffer
            buffer = lines.pop() || '';

            // Procesar cada línea completa
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine) {
                // Regex más flexible: captura contenido entre 0:" y la comilla de cierre
                // Usa non-greedy (.*?) para manejar comillas internas correctamente
                const match = trimmedLine.match(/^0:"((?:[^"\\]|\\.)*)"/);
                if (match) {
                  let token = match[1];

                  // Decodificar secuencias de escape en el orden correcto
                  token = token
                    .replace(/\\\\/g, '\\')  // \\ → \
                    .replace(/\\"/g, '"')    // \" → "
                    .replace(/\\n/g, '\n')   // \n → newline
                    .replace(/\\t/g, '\t')   // \t → tab
                    .replace(/\\r/g, '\r');  // \r → carriage return

                  assistantText += token;
                } else {
                  // Log para debug si una línea no matchea
                  console.log('Line did not match pattern:', trimmedLine);
                }
              }
            }

            // Actualizar el mensaje del asistente después de procesar cada chunk
            if (assistantText) {
              setMessages((currentMessages) => {
                const newMessages = [...currentMessages];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === "assistant") {
                  return [
                    ...newMessages.slice(0, -1),
                    {
                      role: "assistant",
                      content: [{ type: "text", text: assistantText }],
                    },
                  ];
                }
                return newMessages;
              });
            }
          }
        }
      } catch (error) {
        console.error("Error calling chat API:", error);

        const errorMessage: ThreadMessageLike = {
          role: "assistant",
          content: [
            {
              type: "text",
              text: "Lo siento, ocurrió un error al procesar tu mensaje. Por favor, inténtalo de nuevo.",
            },
          ],
        };

        setMessages((currentMessages) => [...currentMessages, errorMessage]);
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, debtorId, profile?.client?.id, session?.token],
  );

  const convertMessage = useCallback((message: ThreadMessageLike) => {
    return message;
  }, []);

  const runtime = useExternalStoreRuntime<ThreadMessageLike>({
    messages,
    setMessages,
    onNew,
    convertMessage,
    isRunning: isStreaming,
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-[400px] w-full flex flex-col bg-[#f9fcff] rounded-md border p-2 overflow-y-auto">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}

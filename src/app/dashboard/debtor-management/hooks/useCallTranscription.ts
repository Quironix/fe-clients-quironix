"use client";

import { useWebRTCContext } from "@/context/WebRTCContext";
import { useEffect, useState } from "react";
import { getSttToken } from "../services/call-copilot";
import type { TranscriptSpeaker, TranscriptTurn } from "../types/call-copilot";

const DEEPGRAM_URL =
  "wss://api.deepgram.com/v1/listen?model=nova-3&language=es&smart_format=true&interim_results=false&endpointing=400";
const CLOSE_GRACE_MS = 1500;
const MAX_TURN_CHARS = 1500;

export type TranscriptionStatus = "idle" | "connecting" | "live" | "error";

interface Params {
  enabled: boolean;
  accessToken: string;
  clientId: string;
}

export const useCallTranscription = ({
  enabled,
  accessToken,
  clientId,
}: Params) => {
  const { callStreams } = useWebRTCContext();
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const [status, setStatus] = useState<TranscriptionStatus>("idle");

  useEffect(() => {
    if (!enabled || !callStreams || !accessToken || !clientId) return;

    let cancelled = false;
    const cleanups: Array<() => void> = [];
    setTurns([]);
    setStatus("connecting");

    const append = (speaker: TranscriptSpeaker, text: string) =>
      setTurns((prev) => {
        const last = prev[prev.length - 1];
        if (
          last?.speaker === speaker &&
          last.text.length + text.length < MAX_TURN_CHARS
        ) {
          return [...prev.slice(0, -1), { speaker, text: `${last.text} ${text}` }];
        }
        return [...prev, { speaker, text }];
      });

    const open = (
      speaker: TranscriptSpeaker,
      stream: MediaStream,
      token: string
    ) =>
      new Promise<void>((resolve) => {
        const socket = new WebSocket(DEEPGRAM_URL, ["bearer", token]);
        let recorder: MediaRecorder | null = null;
        let ownStream: MediaStream | null = null;

        const record = (source: MediaStream) => {
          const mimeType = "audio/webm;codecs=opus";
          recorder = new MediaRecorder(
            source,
            MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : undefined
          );
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
              socket.send(event.data);
            }
          };
          recorder.start(250);
        };

        socket.onopen = async () => {
          try {
            record(stream);
          } catch (error) {
            console.warn(
              "[call-copilot] recorder failed",
              speaker,
              stream.getAudioTracks().map((track) => track.readyState),
              error
            );
            if (speaker === "EXECUTIVE") {
              try {
                ownStream = await navigator.mediaDevices.getUserMedia({
                  audio: true,
                });
                record(ownStream);
              } catch {
                if (!cancelled) setStatus("error");
              }
            } else if (!cancelled) {
              setStatus("error");
            }
          }
          resolve();
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type !== "Results" || !message.is_final) return;
            const text = message.channel?.alternatives?.[0]?.transcript?.trim();
            if (text) append(speaker, text);
          } catch {}
        };

        socket.onerror = () => {
          if (!cancelled) setStatus("error");
          resolve();
        };
        socket.onclose = () => resolve();

        cleanups.push(() => {
          try {
            if (recorder && recorder.state !== "inactive") recorder.stop();
          } catch {}
          ownStream?.getTracks().forEach((track) => track.stop());
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "CloseStream" }));
          }
          setTimeout(() => socket.close(), CLOSE_GRACE_MS);
        });
      });

    (async () => {
      try {
        const { token } = await getSttToken(accessToken, clientId);
        if (cancelled) return;
        await Promise.all([
          open("EXECUTIVE", callStreams.local, token),
          open("DEBTOR", callStreams.remote, token),
        ]);
        if (!cancelled) setStatus((prev) => (prev === "error" ? prev : "live"));
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      cleanups.forEach((cleanup) => cleanup());
      setStatus("idle");
    };
  }, [enabled, callStreams, accessToken, clientId]);

  return { turns, status };
};

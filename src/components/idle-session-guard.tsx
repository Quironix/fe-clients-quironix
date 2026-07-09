"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { useIdleTimeout } from "@/hooks/use-idle-timeout";
import { logout } from "@/lib/logout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";

const SESSION_STORAGE_KEY = "session_active";
const TIMEOUT_MS = 600_000;
const WARNING_MS = 420_000;
const COUNTDOWN_SECONDS = Math.round((TIMEOUT_MS - WARNING_MS) / 1000);

export function IdleSessionGuard(): React.ReactNode | null {
  const { status } = useSession();
  const t = useTranslations("idleSession");
  const [showModal, setShowModal] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(COUNTDOWN_SECONDS);
  const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect tab close: sessionStorage dies with the tab automatically.
  // On mount, if the key is missing and the user is authenticated, the tab
  // was previously closed — sign out immediately.
  React.useEffect(() => {
    if (status !== "authenticated") return;

    const isSessionActive = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!isSessionActive) {
      logout();
      return;
    }
  }, [status]);

  // Start/stop countdown when modal opens or closes.
  React.useEffect(() => {
    if (showModal) {
      setSecondsLeft(COUNTDOWN_SECONDS);
      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setSecondsLeft(COUNTDOWN_SECONDS);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showModal]);

  const { resetTimer } = useIdleTimeout({
    timeoutMs: TIMEOUT_MS,
    warningMs: WARNING_MS,
    onWarning: () => setShowModal(true),
    onExpire: () => logout(),
  });

  if (status !== "authenticated") return null;

  const handleStayLoggedIn = () => {
    resetTimer();
    setShowModal(false);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime =
    minutes > 0
      ? `${minutes}:${String(seconds).padStart(2, "0")}`
      : `${seconds}s`;

  const isUrgent = secondsLeft <= 10;

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogPrimitive.Portal>
        <DialogOverlay />
        <DialogPrimitive.Content
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 py-2">
            <span
              className="text-base font-bold tabular-nums text-foreground"
            >
              {formattedTime}
            </span>
            <p className="text-muted-foreground text-sm text-center">
              {t("description")}
            </p>
          </div>

          <DialogFooter>
            <Button onClick={handleStayLoggedIn}>{t("stayLoggedIn")}</Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

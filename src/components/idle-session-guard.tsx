"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useSession } from "next-auth/react";

import { useIdleTimeout } from "@/hooks/use-idle-timeout";
import { logout } from "@/lib/logout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";

export function IdleSessionGuard(): React.ReactNode | null {
  const { status } = useSession();
  const [showModal, setShowModal] = React.useState(false);

  const { resetTimer } = useIdleTimeout({
    timeoutMs: 600_000,
    warningMs: 420_000,
    onWarning: () => setShowModal(true),
    onExpire: () => logout(),
  });

  if (status !== "authenticated") return null;

  const handleStayLoggedIn = () => {
    resetTimer();
    setShowModal(false);
  };

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
            <DialogTitle>Your session is about to expire</DialogTitle>
            <DialogDescription>
              You have 3 minutes before being automatically logged out.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleStayLoggedIn}>Stay logged in</Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}

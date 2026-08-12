"use client";

import { Button } from "@/components/ui/button";
import { useWebRTCAutoConnect } from "@/hooks/useWebRTCAutoConnect";
import { Phone, PhoneOff } from "lucide-react";
import { useTranslations } from "next-intl";

export const WebRTCLogin = () => {
  const { isConnected, connect, disconnect } = useWebRTCAutoConnect();
  const tCommon = useTranslations("common");

  if (isConnected) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="gap-2"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="hidden sm:inline">{tCommon("labels.disconnect")}</span>
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" className="gap-2" onClick={connect}>
      <Phone className="w-4 h-4" />
      <span className="hidden sm:inline">{tCommon("labels.connectPbx")}</span>
    </Button>
  );
};

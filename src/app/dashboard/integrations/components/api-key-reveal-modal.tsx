"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ApiKeyRevealModalProps {
  plainKey: string;
  onClose: () => void;
}

const ApiKeyRevealModal = ({ plainKey, onClose }: ApiKeyRevealModalProps) => {
  const t = useTranslations("integrations");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(plainKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[50vw] [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-extrabold">
            {t("apiKeys.reveal.title")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <p className="text-sm text-amber-800">{t("apiKeys.reveal.warning")}</p>
          </div>
          <div className="space-y-2">
            <Input
              readOnly
              value={plainKey}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopy}
            >
              {copied ? t("apiKeys.reveal.copied") : t("apiKeys.reveal.copy")}
            </Button>
            <Button
              type="button"
              className="bg-blue-700 text-white"
              onClick={onClose}
            >
              {t("apiKeys.reveal.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyRevealModal;

"use client";

import { Button } from "@/components/ui/button";
import { useEmailOriginal } from "@/hooks/useInboundInvoiceEmails";
import type { EmailChannel } from "@/services/inbound-email-replies";
import { useTranslations } from "next-intl";
import { useState } from "react";

const cspImageSource = (url: string) => {
  try {
    const { origin, pathname } = new URL(url);
    const source = origin + pathname;
    return /[\s;,"']/.test(source) ? null : source;
  } catch {
    return null;
  }
};

export const emailOriginalSrcDoc = (
  html: string,
  inlineImageUrls: string[],
  showExternalImages: boolean,
) => {
  const imageSources = showExternalImages
    ? ["data:", "https:", "http:"]
    : ["data:", ...inlineImageUrls.map(cspImageSource).filter(Boolean)];

  const doctype = /^\s*<!doctype/i.test(html) ? "<!doctype html>" : "";

  return `${doctype}<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src ${imageSources.join(" ")}"><base target="_blank">${html}`;
};

interface EmailOriginalProps {
  accessToken: string;
  clientId: string;
  channel: EmailChannel;
  emailId: string;
  attachments: { storage_url: string }[];
}

export const EmailOriginal = ({
  accessToken,
  clientId,
  channel,
  emailId,
  attachments,
}: EmailOriginalProps) => {
  const t = useTranslations("dashboard.invoice_inbox.original");
  const [showImages, setShowImages] = useState(false);
  const { data, isLoading } = useEmailOriginal(
    accessToken,
    clientId,
    channel,
    emailId,
  );

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (!data?.html) {
    return (
      <div className="rounded-md border bg-gray-50/50 p-3 text-sm break-words whitespace-pre-wrap">
        {data?.text || (
          <span className="text-muted-foreground">{t("unavailable")}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {data.has_external_images && !showImages && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setShowImages(true)}
        >
          {t("show_images")}
        </Button>
      )}
      <iframe
        title={t("title")}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
        srcDoc={emailOriginalSrcDoc(
          data.html,
          attachments.map((attachment) => attachment.storage_url),
          showImages,
        )}
        className="h-[28rem] w-full rounded-md border bg-white"
      />
    </div>
  );
};

"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import { ErrorScreen } from "@/components/error-screen";
import { reloadOnceOnChunkLoadError } from "@/lib/chunk-load-error";

interface ErrorPageProps {
  error: Error & { digest?: string };
}

export default function ErrorPage({ error }: ErrorPageProps) {
  const t = useTranslations("errorScreen");

  React.useEffect(() => {
    reloadOnceOnChunkLoadError(error);
  }, [error]);

  return (
    <ErrorScreen
      title={t("title")}
      description={t("description")}
      reloadLabel={t("reload")}
    />
  );
}

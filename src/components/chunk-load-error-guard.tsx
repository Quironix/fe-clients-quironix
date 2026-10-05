"use client";

import * as React from "react";

import { reloadOnceOnChunkLoadError } from "@/lib/chunk-load-error";

export function ChunkLoadErrorGuard(): null {
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reloadOnceOnChunkLoadError(event.error);
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      reloadOnceOnChunkLoadError(event.reason);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}

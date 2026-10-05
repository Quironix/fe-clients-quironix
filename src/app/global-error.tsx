"use client";

import * as React from "react";

import { ErrorScreen } from "@/components/error-screen";
import { reloadOnceOnChunkLoadError } from "@/lib/chunk-load-error";
import "./globals.css";

interface GlobalErrorProps {
  error: Error & { digest?: string };
}

export default function GlobalError({ error }: GlobalErrorProps) {
  React.useEffect(() => {
    reloadOnceOnChunkLoadError(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="antialiased">
        <ErrorScreen
          title="Algo salió mal"
          description="Ocurrió un error inesperado al cargar la página. Recárgala para continuar."
          reloadLabel="Recargar página"
        />
      </body>
    </html>
  );
}

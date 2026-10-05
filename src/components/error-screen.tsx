"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorScreenProps {
  title: string;
  description: string;
  reloadLabel: string;
}

export function ErrorScreen({
  title,
  description,
  reloadLabel,
}: ErrorScreenProps) {
  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
        <TriangleAlert className="text-primary size-8" />
      </div>

      <div className="flex max-w-md flex-col gap-2">
        <h1 className="text-foreground text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <Button onClick={() => window.location.reload()}>
        <RefreshCw className="size-4" />
        {reloadLabel}
      </Button>
    </main>
  );
}

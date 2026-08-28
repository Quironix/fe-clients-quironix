"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AssignableCollector,
  getAssignable,
  setCollectorActivation,
} from "../services";

interface QuironixCollectorsPanelProps {
  token?: string;
  clientId?: string;
}

const QuironixCollectorsPanel = ({
  token,
  clientId,
}: QuironixCollectorsPanelProps) => {
  const [items, setItems] = useState<AssignableCollector[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !clientId) return;
    setLoading(true);
    getAssignable(token, clientId)
      .then((data) => setItems(data.filter((c) => c.type === "TEMPLATE")))
      .catch(() =>
        toast.error("No se pudieron cargar los Collectors de Quironix")
      )
      .finally(() => setLoading(false));
  }, [token, clientId]);

  const handleToggle = async (collector: AssignableCollector, next: boolean) => {
    if (!token || !clientId) return;
    setSavingId(collector.id);
    const previous = items;
    setItems((curr) =>
      curr.map((c) => (c.id === collector.id ? { ...c, enabled: next } : c))
    );
    try {
      await setCollectorActivation(token, collector.id, next, clientId);
      toast.success(
        next
          ? `"${collector.name}" activado para tu cartera`
          : `"${collector.name}" desactivado para tu cartera`
      );
    } catch {
      setItems(previous);
      toast.error("No se pudo actualizar el interruptor");
    } finally {
      setSavingId(null);
    }
  };

  if (!loading && items.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collectors Quironix</CardTitle>
        <CardDescription>
          Campañas globales de Quironix. Puedes activarlas o desactivarlas para
          tu propia cartera; el contenido lo administra Quironix.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <p className="text-sm text-gray-500">Cargando…</p>}
        {items.map((collector) => (
          <div
            key={collector.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                {collector.name}
              </p>
              {collector.description && (
                <p className="text-xs text-gray-500">{collector.description}</p>
              )}
              <p className="text-xs text-gray-400">{collector.channel}</p>
            </div>
            <Switch
              checked={collector.enabled}
              disabled={savingId === collector.id}
              onCheckedChange={(value) => handleToggle(collector, value)}
              className="data-[state=checked]:bg-orange-500"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default QuironixCollectorsPanel;

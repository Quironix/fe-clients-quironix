"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormLabel } from "@/components/ui/form";
import { getClientId, useProfileContext } from "@/context/ProfileContext";
import { useEffect, useState } from "react";
import { getAssignable, type AssignableCollector } from "../collectors/services";

interface ContactCollectorSubscriptionsProps {
  /** Ids de los Collectors a los que el contacto está suscrito. */
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

/**
 * PRD_contactos_vigentes_y_targeting_collector.md O2/O5.
 *
 * Lista dinámica de checkboxes — uno por Collector activo del cliente
 * (plantillas de Quironix + los propios), traída de
 * GET /v2/clients/:clientId/collectors/assignable. Un Collector nuevo aparece
 * solo, sin tocar código.
 */
export default function ContactCollectorSubscriptions({
  value,
  onChange,
  label = "Suscripción a Collectors",
}: ContactCollectorSubscriptionsProps) {
  const { session, profile } = useProfileContext();
  const clientId = getClientId(profile);
  const [collectors, setCollectors] = useState<AssignableCollector[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.token || !clientId) return;
    let cancelled = false;
    setLoading(true);
    getAssignable(session.token, clientId)
      .then((items) => {
        if (!cancelled) setCollectors(items.filter((c) => c.enabled));
      })
      .catch(() => {
        if (!cancelled) setCollectors([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session?.token, clientId]);

  const selected = new Set(value ?? []);

  const toggle = (id: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    onChange(Array.from(next));
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3">
      <FormLabel className="text-sm font-medium text-gray-700">
        {label}
      </FormLabel>
      {loading ? (
        <span className="text-xs text-gray-500">Cargando…</span>
      ) : collectors.length === 0 ? (
        <span className="text-xs text-gray-500">
          No hay Collectors disponibles.
        </span>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {collectors.map((collector) => (
            <label
              key={collector.id}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Checkbox
                checked={selected.has(collector.id)}
                onCheckedChange={(checked) =>
                  toggle(collector.id, checked === true)
                }
              />
              <span className="truncate">
                {collector.name}
                {collector.type === "TEMPLATE" ? (
                  <span className="ml-1 text-xs text-gray-400">(Quironix)</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, Mail, MessageSquare, Phone, Send } from "lucide-react";
import { CollectorResponse } from "../services/types";

interface CreateColumnsParams {
  onExecute?: (collector: CollectorResponse) => void;
  executingId?: string | null;
  t?: (key: string) => string;
  isActive?: (collector: CollectorResponse) => boolean;
  onToggleActive?: (collector: CollectorResponse, next: boolean) => void;
  togglingId?: string | null;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getChannelIcon = (channel: string) => {
  const iconMap = {
    EMAIL: <Mail className="h-5 w-5 text-gray-800" color="#bbb" />,
    WHATSAPP: <MessageSquare className="h-5 w-5 text-gray-600" color="#bbb" />,
    SMS: <Phone className="h-5 w-5 text-gray-600" color="#bbb" />,
  };

  return (
    iconMap[channel as keyof typeof iconMap] || (
      <Mail className="h-5 w-5 text-gray-600" />
    )
  );
};

export const createColumns = (
  params?: CreateColumnsParams
): ColumnDef<CollectorResponse>[] => {
  const { onExecute, executingId, t, isActive, onToggleActive, togglingId } =
    params ?? {};
  const tr = t || ((key: string) => key);
  return [
    {
      accessorKey: "name",
      header: tr("name"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "description",
      header: tr("description"),
      cell: ({ row }) => (
        <div className="font-medium text-sm max-w-[300px] truncate">
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "channel",
      header: tr("channels"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getChannelIcon(row.original.channel)}
        </div>
      ),
    },
    {
      accessorKey: "frequency",
      header: tr("frequency"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">{row.original.frequency}</div>
      ),
    },
    {
      accessorKey: "subject",
      header: tr("subject"),
      cell: ({ row }) => (
        <div className="font-medium text-sm max-w-[200px] truncate">
          {row.original.subject || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: tr("createdAt"),
      cell: ({ row }) => (
        <div className="font-medium text-sm">
          {row.original.createdAt ? formatDate(row.original.createdAt) : "N/A"}
        </div>
      ),
    },
    {
      id: "active",
      header: tr("active"),
      cell: ({ row }) => {
        const collector = row.original;
        if (collector.type !== "TEMPLATE") {
          return <span className="text-gray-300">—</span>;
        }
        const checked = isActive
          ? isActive(collector)
          : collector.status ?? true;
        return (
          <Switch
            checked={checked}
            disabled={togglingId === collector.id || !onToggleActive}
            onCheckedChange={(next) => onToggleActive?.(collector, next)}
            className="data-[state=checked]:bg-orange-500"
          />
        );
      },
    },
    {
      id: "actions",
      header: tr("actions"),
      cell: ({ row }) => {
        const collector = row.original;
        const isExecuting = executingId === collector.id;
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isExecuting}
            onClick={() => onExecute?.(collector)}
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <Send className="h-4 w-4 text-blue-600" />
            )}
          </Button>
        );
      },
    },
  ];
};

export const columns = createColumns();

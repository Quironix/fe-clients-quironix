"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Mail, MessageSquare, Phone, Send, Trash2 } from "lucide-react";
import { CollectorResponse } from "../services/types";

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
  onViewDetails?: (collector: CollectorResponse) => void,
  onToggleStatus?: (collector: CollectorResponse) => void,
  onEdit?: (collector: CollectorResponse) => void,
  onDelete?: (collector: CollectorResponse) => void
): ColumnDef<CollectorResponse>[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => (
      <div className="font-medium text-sm max-w-[300px] truncate">
        {row.original.description}
      </div>
    ),
  },
  {
    accessorKey: "channel",
    header: "Canales",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {getChannelIcon(row.original.channel)}
      </div>
    ),
  },
  {
    accessorKey: "frequency",
    header: "Frecuencia",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.frequency}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <Switch
        checked={row.original.status}
        onCheckedChange={() => onToggleStatus?.(row.original)}
      />
    ),
  },
  {
    accessorKey: "subject",
    header: "Asunto",
    cell: ({ row }) => (
      <div className="font-medium text-sm max-w-[200px] truncate">
        {row.original.subject || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Fecha Creación",
    cell: ({ row }) => (
      <div className="font-medium text-sm">
        {row.original.createdAt ? formatDate(row.original.createdAt) : "N/A"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const collector = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              console.log("Enviar collector");
            }}
          >
            <Send className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit?.(collector)}
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete?.(collector)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      );
    },
  },
];

export const columns = createColumns();

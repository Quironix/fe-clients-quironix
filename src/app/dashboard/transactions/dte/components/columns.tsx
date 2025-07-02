"use client";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { INVOICE_TYPES } from "@/app/dashboard/data";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { formatDate } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDTEStore } from "../store";
import { DTE } from "../types";

const AcctionsCellComponent = ({ row }: { row: Row<DTE> }) => {
  const router = useRouter();
  const { deleteDTE } = useDTEStore();
  const { session, profile } = useProfileContext();

  return (
    <div className="flex justify-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          router.push(
            `/dashboard/transactions/dte/create?id=${row.original.id}`
          )
        }
        title="Editar"
        className="hover:bg-amber-500 hover:text-white text-primary"
      >
        <Edit />
      </Button>
      <DialogConfirm
        title="¿Eliminar deudor?"
        description={`¿Estás seguro que deseas eliminar el DTE "${row.original.number}"? Esta acción no se puede deshacer.`}
        triggerButton={
          <Button
            variant="ghost"
            size="icon"
            title="Eliminar"
            className="hover:bg-red-500 hover:text-white text-primary"
          >
            <Trash2 />
          </Button>
        }
        cancelButtonText="Cancelar"
        confirmButtonText="Sí, eliminar"
        onConfirm={() => {
          if (session?.token && profile?.client?.id) {
            deleteDTE(session.token, profile.client.id, row.original.id!);
          }
        }}
        type="danger"
      />
    </div>
  );
};

export const columns: ColumnDef<DTE>[] = [
  {
    accessorKey: "number",
    header: "Número de Documento",
    cell: ({ row }) => {
      const number = row.getValue("number") as string;
      return <div className="font-medium">{number || "-"}</div>;
    },
  },
  {
    accessorKey: "type",
    header: "Tipo de Documento",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const typeLabel = INVOICE_TYPES.find((t) =>
        t.types.find((t) => t.value === type)
      )?.types.find((t) => t.value === type)?.label;
      return <div>{typeLabel || "-"}</div>;
    },
  },
  {
    accessorKey: "issue_date",
    header: "Fecha de Emisión",
    cell: ({ row }) => {
      const date = row.getValue("issue_date") as string;
      if (!date) return <div>-</div>;
      return <div>{formatDate(date)}</div>;
    },
  },
  {
    accessorKey: "due_date",
    header: "Fecha de Vencimiento",
    cell: ({ row }) => {
      const date = row.getValue("due_date") as string;
      if (!date) return <div>-</div>;
      return <div>{formatDate(date)}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      if (isNaN(amount)) return <div>-</div>;
      const formatted = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      return <AcctionsCellComponent row={row} />;
    },
  },
];

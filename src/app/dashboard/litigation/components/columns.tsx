"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Flag } from "lucide-react";

import { cn } from "@/lib/utils";
import BulletMenu, { BulletMenuItem } from "../../components/bullet-menu";

import { format } from "date-fns";
import { useState } from "react";
import DialogForm from "../../components/dialog-form";
import { disputes } from "../../data";
import { LitigationItem } from "../types";
import LitigationDetail from "./modals/litigation-detail";
import LitigationEditModal from "./modals/litigation-edit";
import NormalizationFormId from "./modals/normalization-id-form";

// Funciones helper para mapear códigos a etiquetas
const getMotivoLabel = (code: string) => {
  const dispute = disputes.find((d) => d.code === code);
  return dispute ? dispute.label : code || "-";
};

const getSubmotivoLabel = (motivoCode: string, submotivoCode: string) => {
  const dispute = disputes.find((d) => d.code === motivoCode);
  if (dispute) {
    const submotivo = dispute.submotivo.find((s) => s.code === submotivoCode);
    return submotivo ? submotivo.label : submotivoCode || "-";
  }
  return submotivoCode || "-";
};

// Componente wrapper para manejar el estado del modal de edición
const EditModalWrapper = ({
  row,
  onRefetch,
}: {
  row: LitigationItem;
  onRefetch?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogForm
      title="Editar factura"
      description={`Factura N° ${row?.invoice.number}`}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <div className="flex items-center gap-3 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm">
          <Edit className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="whitespace-nowrap">Editar factura</span>
        </div>
      }
    >
      <LitigationEditModal
        litigation={row}
        open={open}
        onOpenChange={setOpen}
        onRefetch={onRefetch}
      />
    </DialogForm>
  );
};

const NormalizeModalWrapper = ({
  row,
  onRefetch,
}: {
  row: LitigationItem;
  onRefetch?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DialogForm
      title="Normalizar litigio"
      description={`Litigio N° ${row?.invoice.number}`}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <div className="flex items-center gap-3 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm">
          <Flag className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="whitespace-nowrap">Normalizar</span>
        </div>
      }
    >
      <NormalizationFormId
        open={open}
        onOpenChange={setOpen}
        litigation={row}
        onRefetch={onRefetch}
      />
    </DialogForm>
  );
};

const createMenuItems = (
  row: LitigationItem,
  onRefetch?: () => void
): BulletMenuItem[] => {
  const items: BulletMenuItem[] = [
    {
      id: "detail",
      label: "Ver detalle",
      icon: Eye,
      component: (
        <DropdownMenuItem
          asChild
          key={row.id + "edit"}
          disabled={false}
          className={cn(
            "flex items-center gap-3 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm",
            "text-black focus:text-black focus:bg-primary/10 dark:focus:bg-primary/20"
          )}
        >
          <DialogForm
            title="Detalle del litigio"
            description={`Factura N° ${row?.invoice.number}`}
            trigger={
              <div className="flex items-center gap-3 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm">
                <Eye className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="whitespace-nowrap">Ver detalle</span>
              </div>
            }
          >
            <LitigationDetail litigation={row} />
          </DialogForm>
        </DropdownMenuItem>
      ),
    },
    {
      id: "edit",
      label: "Editar factura",
      icon: Edit,
      component: (
        <DropdownMenuItem
          asChild
          key={row.id + "edit"}
          disabled={false}
          className={cn(
            "flex items-center gap-3 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm",
            "text-black focus:text-black focus:bg-primary/10 dark:focus:bg-primary/20"
          )}
        >
          <EditModalWrapper row={row} onRefetch={onRefetch} />
        </DropdownMenuItem>
      ),
    },
    {
      id: "normalize",
      label: "Normalizar",
      icon: Flag,
      component: (
        <DropdownMenuItem
          asChild
          key={row.id + "edit"}
          disabled={false}
          className={cn(
            "flex items-center gap-3 cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm",
            "text-black focus:text-black focus:bg-primary/10 dark:focus:bg-primary/20"
          )}
        >
          <NormalizeModalWrapper row={row} onRefetch={onRefetch} />
        </DropdownMenuItem>
      ),
    },
  ];

  return items;
};

// Columnas de la tabla
export const getColumns = (
  onRefetch?: () => void
): ColumnDef<LitigationItem>[] => [
  {
    accessorKey: "invoice_number",
    header: "N° Factura",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.invoice.number || "-"}</div>
    ),
  },
  {
    accessorKey: "debtor_name",
    header: "Deudor",
    cell: ({ row }) => (
      <div className="font-medium max-w-[150px] truncate">
        {row.original.debtor.name || "-"}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Ingreso de litigio",
    cell: ({ row }) => (
      <div>{format(row.original.created_at, "dd/MM/yyyy HH:mm") || "-"}</div>
    ),
  },
  {
    accessorKey: "client_code",
    header: "Días de disputa",
    cell: ({ row }) => {
      // Función para calcular los días desde created_at hasta hoy
      const calcularDiasDesde = (fecha: string) => {
        if (!fecha) return "-";
        const fechaCreacion = new Date(fecha);
        const hoy = new Date();
        // Limpiar horas para comparar solo fechas
        fechaCreacion.setHours(0, 0, 0, 0);
        hoy.setHours(0, 0, 0, 0);
        const diferenciaMs = hoy.getTime() - fechaCreacion.getTime();
        const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
        return dias >= 0 ? dias : "-";
      };

      return <div>{calcularDiasDesde(row.original.created_at)}</div>;
    },
  },
  {
    accessorKey: "dispute_amount",
    header: "Monto de litigio",
    cell: ({ row }) => {
      return (
        <div className="truncate max-w-[150px]">
          {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(row.original.litigation_amount || 0)}
        </div>
      );
    },
  },
  {
    accessorKey: "invoice_balance",
    header: "Saldo factura",
    cell: ({ row }) => {
      return (
        <div className="truncate max-w-[150px]">
          {new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(Number(row.original.invoice.balance) || 0)}
        </div>
      );
    },
  },
  {
    accessorKey: "approver",
    header: "Aprobador",
    cell: ({ row }) => {
      const value = row.getValue("approver");
      return (
        <div className="truncate max-w-[150px]">
          {row.original?.approver ? (
            <>
              {row.original?.approver?.first_name +
                " " +
                row.original?.approver?.last_name || "-"}
            </>
          ) : (
            "Pendiente"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ row }) => {
      return (
        <div className="truncate max-w-[150px]">
          {getMotivoLabel(row.original?.motivo)}
        </div>
      );
    },
  },
  {
    accessorKey: "sub_reason",
    header: "Submotivo",
    cell: ({ row }) => {
      return (
        <div className="truncate max-w-[150px]">
          {getSubmotivoLabel(row.original?.motivo, row.original?.submotivo)}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acción",
    cell: ({ row }) => (
      <BulletMenu items={createMenuItems(row.original, onRefetch)} />
    ),
  },
];

// Exportar también las columnas sin refetch para compatibilidad hacia atrás
export const columns: ColumnDef<LitigationItem>[] = getColumns();

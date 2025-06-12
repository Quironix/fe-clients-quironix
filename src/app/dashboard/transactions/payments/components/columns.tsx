"use client";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePaymentStore } from "../store";
import { Payments } from "../types";

const AcctionsCellComponent = ({ row }: { row: Row<Payments> }) => {
  const router = useRouter();
  const { session, profile } = useProfileContext();
  const { deletePayment } = usePaymentStore();

  const handleDelete = async (payment: Payments) => {
    console.log(payment);
    try {
      await deletePayment(
        session?.token || "",
        profile?.client?.id || "",
        payment?.id as string
      );
      toast.success("Pago eliminado correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar el pago");
    }
  };

  return (
    <div className="flex justify-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          router.push(
            `/dashboard/transactions/payments/create?id=${row.original.id}`
          )
        }
        title="Editar"
        className="hover:bg-amber-500 hover:text-white text-primary"
      >
        <Edit />
      </Button>
      <DialogConfirm
        title="¿Eliminar pago?"
        description={`¿Estás seguro que deseas eliminar el pago? Esta acción no se puede deshacer.`}
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
        onConfirm={() => handleDelete(row.original)}
        type="danger"
      />
    </div>
  );
};

export const columns: ColumnDef<Payments>[] = [
  {
    accessorKey: "payment_number",
    header: "Número de Documento",
    cell: ({ row }) => {
      const number = row.getValue("payment_number") as string;
      return <div className="font-medium">{number || "-"}</div>;
    },
  },
  {
    accessorKey: "document_type",
    header: "Tipo de Documento",
    cell: ({ row }) => {
      const type = row.getValue("document_type") as string;
      return <div>{type || "-"}</div>;
    },
  },
  {
    accessorKey: "deposit_at",
    header: "Fecha de Depósito",
    cell: ({ row }) => {
      const date = row.getValue("deposit_at") as string;
      if (!date) return <div>-</div>;
      return <div>{format(new Date(date), "dd/MM/yyyy")}</div>;
    },
  },
  {
    accessorKey: "debtor.name",
    header: "Deudor",
    cell: ({ row }) => {
      const debtor = row.original.debtor;
      if (!debtor) return <div>-</div>;
      return <div>{debtor.name}</div>;
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
    accessorKey: "balance",
    header: "Saldo",
    cell: ({ row }) => {
      const balance = parseFloat(row.getValue("balance"));
      if (isNaN(balance)) return <div>-</div>;
      const formatted = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
      }).format(balance);
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

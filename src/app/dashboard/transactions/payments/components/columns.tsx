"use client";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { formatDate } from "@/lib/utils";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePaymentStore } from "../store";
import { Payments } from "../types";

const AcctionsCellComponent = ({ row }: { row: Row<Payments> }) => {
  const router = useRouter();
  const { session, profile } = useProfileContext();
  const { deletePayment } = usePaymentStore();
  const t = useTranslations("transactions.payments");
  const tCommon = useTranslations("common.buttons");

  const handleDelete = async (payment: Payments) => {
    try {
      await deletePayment(
        session?.token || "",
        profile?.client?.id || "",
        payment?.id as string
      );
      toast.success(t("toast.deleteSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("toast.deleteError"));
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
        title={tCommon("edit")}
        className="hover:bg-amber-500 hover:text-white text-primary"
      >
        <Edit />
      </Button>
      <DialogConfirm
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        triggerButton={
          <Button
            variant="ghost"
            size="icon"
            title={tCommon("delete")}
            className="hover:bg-red-500 hover:text-white text-primary"
          >
            <Trash2 />
          </Button>
        }
        cancelButtonText={tCommon("cancel")}
        confirmButtonText={tCommon("yesDelete")}
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
      return <div>{formatDate(date)}</div>;
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

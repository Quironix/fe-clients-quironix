"use client";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { typeDocuments } from "@/app/dashboard/data";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCompaniesStore } from "../store";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import { Litigation } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AcctionsCellComponent = ({ row }: { row: Row<Litigation> }) => {
  const router = useRouter();

  const { session, profile } = useProfileContext();
  const { deleteCompany } = useCompaniesStore();
  const [litigios, setLitigios] = useState([]);

  const fetchLitigios = async () => {
    const res = await fetch( `${API_URL}/v2/clients/${profile.clientId}/litigations`);
    const data = await res.json();
    setLitigios(data);
  };

  useEffect(() => {
    fetchLitigios();

    const handler = () => fetchLitigios();
    window.addEventListener("litigation:created", handler);

    return () => {
      window.removeEventListener("litigation:created", handler);
    };
  }, []);

  return (
    <div className="flex justify-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          router.push(`/dashboard/companies/create?id=${row.original.debtor_id}`)
        }
        title="Editar"
        className="hover:bg-amber-500 hover:text-white text-primary"
      >
        <Edit />
      </Button>
      <DialogConfirm
        title="¿Eliminar compañía?"
        description={`¿Estás seguro que deseas eliminar número factura "${row.original.invoice_number}"? Esta acción no se puede deshacer.`}
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
            deleteCompany(session.token, profile.client.id, row.original.debtor_id!);
            toast.success("Compañía eliminada correctamente");
          }
        }}
        type="danger"
      />
    </div>
  );
};

export const columns: ColumnDef<Litigation>[] = [
  {
    accessorKey: "invoice_number",
    header: "N° Factura",
    cell: ({ row }) => {
      const invoiceNumber = row.getValue("invoice_number") as string;
      return <div className="font-medium">{invoiceNumber || "-"}</div>;
    },
  },
  {
    accessorKey: "debtor_name",
    header: "Deudor",
    cell: ({ row }) => {
      const debtorName = row.getValue("debtor_name") as string;
      return <div className="font-medium">{ debtorName || "-"}</div>;
    },
  },  
  {
    accessorKey: "dispute_entry",
    header: "Ingreso de litigio",
    cell: ({ row }) => {
      const dniNumber = row.getValue("created_at") as string;
      if (!dniNumber) return <div>-</div>;
      return <div>{dniNumber}</div>;
    },
  },
  {
    accessorKey: "client_code",
    header: "Dias de disputa",
    cell: ({ row }) => {
      const clientCode = row.getValue("client_code") as string;
      if (!clientCode) return <div>-</div>;
      return <div>{clientCode}</div>;
    },
  },
  {
    accessorKey: "dispute_amount",
    header: "Monto de litigio",
    cell: ({ row }) => {
      const category = row.getValue("dispute_amount") as string;
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {category || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "invoice_balance",
    header: "Saldo factura",
    cell: ({ row }) => {
      const category = row.getValue("invoice_balance") as string;
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {category || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "approver",
    header: "Aprobador",
    cell: ({ row }) => {
      const category = row.getValue("approver") as string;
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {category || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ row }) => {
      const category = row.getValue("reason") as string;
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {category || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "sub_reason",
    header: "Submotivo",
    cell: ({ row }) => {
      const category = row.getValue("sub_reason") as string;
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {category || "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acción",
    cell: ({ row }) => {
      return  <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Editar factura
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Normalizar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    },
  },
];

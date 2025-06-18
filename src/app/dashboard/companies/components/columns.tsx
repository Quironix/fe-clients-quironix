"use client";
import DialogConfirm from "@/app/dashboard/components/dialog-confirm";
import { typeDocuments } from "@/app/dashboard/data";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCompaniesStore } from "../store";
import { Company } from "../types";

const AcctionsCellComponent = ({ row }: { row: Row<Company> }) => {
  const router = useRouter();

  const { session, profile } = useProfileContext();
  const { deleteCompany } = useCompaniesStore();

  return (
    <div className="flex justify-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() =>
          router.push(`/dashboard/companies/create?id=${row.original.id}`)
        }
        title="Editar"
        className="hover:bg-amber-500 hover:text-white text-primary"
      >
        <Edit />
      </Button>
      <DialogConfirm
        title="¿Eliminar compañía?"
        description={`¿Estás seguro que deseas eliminar la compañía "${row.original.name}"? Esta acción no se puede deshacer.`}
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
            deleteCompany(session.token, profile.client.id, row.original.id!);
            toast.success("Compañía eliminada correctamente");
          }
        }}
        type="danger"
      />
    </div>
  );
};

export const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name || "-"}</div>;
    },
  },
  {
    accessorKey: "dni_type",
    header: "Tipo de Documento",
    cell: ({ row }) => {
      const type = row.getValue("dni_type") as string;
      const typeLabel = typeDocuments.find((t) => t === type);
      return <div>{typeLabel || "-"}</div>;
    },
  },
  {
    accessorKey: "dni_number",
    header: "Número de documento",
    cell: ({ row }) => {
      const dniNumber = row.getValue("dni_number") as string;
      if (!dniNumber) return <div>-</div>;
      return <div>{dniNumber}</div>;
    },
  },
  {
    accessorKey: "client_code",
    header: "Código de cliente",
    cell: ({ row }) => {
      const clientCode = row.getValue("client_code") as string;
      if (!clientCode) return <div>-</div>;
      return <div>{clientCode}</div>;
    },
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      return (
        <div className="capitalize truncate max-w-[150px]" title={category}>
          {category || "-"}
        </div>
      );
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

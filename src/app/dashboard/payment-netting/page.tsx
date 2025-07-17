"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { RowSelectionState, VisibilityState } from "@tanstack/react-table";
import { Archive, Eye, FileCheck2, Trash2 } from "lucide-react";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../components/data-table-dynamic-columns";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { columns } from "./components/columns";
import { usePaymentNetting } from "./hooks/usePaymentNetting";
import { updateReconciliationTableProfile } from "./services";

export default function PaymentNettingPage() {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const {
    data,
    isLoading,
    isServerSideLoading,
    pagination,
    handlePaginationChange,
    handleSearchChange,
    refetch,
  } = usePaymentNetting(session?.token, profile?.client_id, false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  useEffect(() => {
    if (profile?.profile?.reconciliation_table.length > 0) {
      setColumnVisibility(profile.profile.reconciliation_table[0]);
    } else {
      setColumnVisibility({
        id: false,
        status: true,
        amount: true,
        bank: true,
        account_number: true,
        code: true,
        description: true,
        comment: true,
        actions: true,
      });
    }
  }, [profile?.profile]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columnLabels = useMemo(
    () => ({
      id: "ID",
      status: "Estado",
      amount: "Importe",
      bank: "Banco",
      account_number: "Nº de cuenta",
      code: "Código",
      description: "Descripción",
      comment: "Comentario",
      actions: "Acciones",
    }),
    []
  );

  const bulkActions = useMemo(
    () => [
      {
        label: "Ver detalles",
        onClick: (selectedRows: any[]) => {
          console.log("Ver detalles de elementos seleccionados:", selectedRows);
        },
        variant: "outline" as const,
        icon: <Eye className="h-4 w-4" />,
      },
      {
        label: "Archivar",
        onClick: (selectedRows: any[]) => {
          console.log("Archivar elementos seleccionados:", selectedRows);
        },
        variant: "secondary" as const,
        icon: <Archive className="h-4 w-4" />,
      },
      {
        label: "Eliminar",
        onClick: (selectedRows: any[]) => {
          console.log("Eliminar elementos seleccionados:", selectedRows);
          // Aquí se podría mostrar un modal de confirmación
        },
        variant: "destructive" as const,
        icon: <Trash2 className="h-4 w-4" />,
      },
    ],
    []
  );

  const handleUpdateColumns = async () => {
    const response = await updateReconciliationTableProfile({
      accessToken: session?.token,
      clientId: profile?.client_id,
      userId: profile?.id,
      reconciliationTable: [columnVisibility],
    });
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Compensación de pagos"
          description="En esta sección podrás realizar la compensación de pagos entre tus clientes y proveedores."
          icon={<FileCheck2 color="white" />}
          subDescription="Compensación de pagos"
        />

        {/* DataTable with Dynamic Columns */}
        <Card>
          <CardContent>
            <DataTableDynamicColumns
              columns={columns}
              data={data}
              isLoading={isLoading}
              isServerSideLoading={isServerSideLoading}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearchChange}
              enableGlobalFilter={true}
              searchPlaceholder="Buscar"
              enableColumnFilter={true}
              initialColumnVisibility={columnVisibility}
              onColumnVisibilityChange={setColumnVisibility}
              columnLabels={columnLabels}
              ctaNode={
                <>
                  <Button
                    className="bg-orange-400 text-white hover:bg-orange-400/90"
                    onClick={() => {
                      console.log("Asignar deudor");
                    }}
                  >
                    Asignar deudor
                  </Button>
                  <Button
                    className="bg-orange-400 text-white hover:bg-orange-400/90"
                    onClick={() => {
                      console.log("Generar pago");
                    }}
                  >
                    Generar pago
                  </Button>
                </>
              }
              // Nuevas props para selección de filas
              enableRowSelection={true}
              initialRowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              bulkActions={bulkActions}
              emptyMessage="No se encontraron conciliaciones"
              className="rounded-lg"
              title="Historial de pagos"
              handleSuccessButton={handleUpdateColumns}
            />
          </CardContent>
        </Card>
      </Main>
    </>
  );
}

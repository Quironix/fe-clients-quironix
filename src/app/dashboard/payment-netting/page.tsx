"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Language from "@/components/ui/language";
import { RowSelectionState, VisibilityState } from "@tanstack/react-table";
import {
  Archive,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { DataTableDynamicColumns } from "../components/data-table-dynamic-columns";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { columns } from "./components/columns";
import { usePaymentNetting } from "./hooks/usePaymentNetting";

export default function PaymentNettingPage() {
  const {
    data,
    isLoading,
    isServerSideLoading,
    pagination,
    handlePaginationChange,
    handleSearchChange,
    refetch,
  } = usePaymentNetting();

  // Estado para la visibilidad de columnas (memoizado para evitar re-renders)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => ({
      description: false, // Ocultar descripción por defecto
    })
  );

  // Estado para la selección de filas
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Labels amigables para las columnas (memoizado)
  const columnLabels = useMemo(
    () => ({
      reference: "Referencia",
      date: "Fecha",
      company: "Empresa",
      debtor: "Deudor",
      amount: "Monto",
      status: "Estado",
      paymentMethod: "Método de Pago",
      description: "Descripción",
      actions: "Acciones",
    }),
    []
  );

  // Manejar creación de nuevo payment netting (memoizado)
  const handleCreate = useCallback(() => {
    console.log("Crear nuevo Payment Netting");
    // Aquí iría la lógica para abrir modal o navegar a página de creación
  }, []);

  // Manejar exportación (memoizado)
  const handleExport = useCallback(() => {
    console.log("Exportar Payment Nettings");
    // Aquí iría la lógica para exportar datos
  }, []);

  // Manejar generación de reporte (memoizado)
  const handleGenerateReport = useCallback(() => {
    console.log("Generar reporte");
    // Aquí iría la lógica para generar reporte
  }, []);

  // Acciones masivas para elementos seleccionados
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

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Roles"
          description="Aquí puedes ver un resumen de tus roles."
          icon={<FileCheck2 color="white" />}
          subDescription="Usuarios"
        />
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Payment Netting
              </h1>
              <p className="text-muted-foreground">
                Gestiona y visualiza las compensaciones de pagos entre empresas
                y deudores.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button variant="outline" onClick={handleGenerateReport}>
                <FileText className="mr-2 h-4 w-4" />
                Reporte
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Netting
              </Button>
            </div>
          </div>

          {/* DataTable with Dynamic Columns */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Payment Nettings</CardTitle>
              <CardDescription>
                Visualiza y gestiona las compensaciones de pagos. Puedes
                personalizar las columnas visibles y su orden.
              </CardDescription>
            </CardHeader>
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
                searchPlaceholder="Buscar por empresa, deudor, referencia..."
                enableColumnFilter={true}
                initialColumnVisibility={columnVisibility}
                onColumnVisibilityChange={setColumnVisibility}
                columnLabels={columnLabels}
                ctaButton={useMemo(
                  () => ({
                    label: "Refrescar",
                    onClick: refetch,
                    variant: "outline" as const,
                  }),
                  [refetch]
                )}
                // Nuevas props para selección de filas
                enableRowSelection={true}
                initialRowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                bulkActions={bulkActions}
                emptyMessage="No se encontraron payment nettings"
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  );
}

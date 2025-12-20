"use client";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import { Button } from "@/components/ui/button";
import Language from "@/components/ui/language";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import { FileStack } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import { columns } from "./components/columns";
import DTEUploadSection from "./components/dte-upload-section";
import { useDTEs } from "./hooks/useDTEs";
import { updateTableProfile } from "./services/profile";
import { DTE } from "./types";

const PageDTE = () => {
  const { session, profile } = useProfileContext();

  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >([
    { name: "number", is_visible: true },
    { name: "type", is_visible: true },
    { name: "issue_date", is_visible: true },
    { name: "due_date", is_visible: true },
    { name: "amount", is_visible: true },
    { name: "actions", is_visible: true },
  ]);

  const columnVisibility = useMemo(() => {
    const visibility: VisibilityState = {};
    columnConfiguration.forEach((col) => {
      visibility[col.name] = col.is_visible;
    });
    return visibility;
  }, [columnConfiguration]);

  const columnLabels = useMemo(
    () => ({
      number: "Número de Documento",
      type: "Tipo de Documento",
      issue_date: "Fecha de Emisión",
      due_date: "Fecha de Vencimiento",
      amount: "Monto",
      actions: "Acciones",
    }),
    []
  );

  useEffect(() => {
    if (profile?.profile?.invoices_table?.length > 0) {
      const savedConfig = profile.profile.invoices_table;
      if (Array.isArray(savedConfig)) {
        setColumnConfiguration(savedConfig);
      }
    }
  }, [profile?.profile]);

  const {
    dtes,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    handlePaginationChange,
    handleSearchChange,
    currentPage,
    currentLimit,
  } = useDTEs({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    initialPage: 1,
    initialLimit: 15,
  });

  useEffect(() => {
    refetch();
  }, []);

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    try {
      const configToSave = config || columnConfiguration;

      const response = await updateTableProfile({
        accessToken: session?.token,
        clientId: profile?.client_id,
        userId: profile?.id,
        invoicesTable: configToSave,
      });

      if (response.success) {
        if (config) {
          setColumnConfiguration(config);
        }

        if (typeof window !== "undefined") {
          const storedProfile = localStorage.getItem("profile");
          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);
            if (parsedProfile?.profile) {
              parsedProfile.profile.invoices_table = configToSave;
              localStorage.setItem("profile", JSON.stringify(parsedProfile));
            }
          }
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error al actualizar configuración de columnas:", error);
      toast.error("Error al guardar la configuración de columnas");
    }
  };

  const TableSkeleton = () => (
    <>
      {Array.from({ length: currentLimit }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell className="flex justify-center gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  // Manejo de errores
  if (isError) {
    return (
      <>
        <Header fixed>
          <Language />
        </Header>
        <Main>
          <TitleSection
            title="Carga de DTE"
            description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
            icon={<FileStack color="white" />}
            subDescription="Transacciones"
          />
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600 font-medium mb-2">
                  Error al cargar los DTEs
                </p>
                <p className="text-red-500 text-sm mb-4">
                  {error?.message || "Error desconocido"}
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Carga de DTE"
          description="Completa esta sección para configurar los datos operativos de tu empresa y personalizar tu experiencia en la plataforma."
          icon={<FileStack color="white" />}
          subDescription="Transacciones"
        />
        <DTEUploadSection />
        <div className="mt-5 border border-gray-200 rounded-md p-3">
          <DataTableDynamicColumns
            columns={columns}
            data={dtes}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearchChange}
            isServerSideLoading={isLoading}
            loadingComponent={<TableSkeleton />}
            emptyMessage="No se encontraron DTEs"
            pageSize={currentLimit}
            pageSizeOptions={[15, 20, 25, 30, 40, 50]}
            enableGlobalFilter={true}
            searchPlaceholder="Buscar por N° de Documento"
            showPagination={true}
            enableColumnFilter={true}
            initialColumnVisibility={columnVisibility}
            columnLabels={columnLabels}
            handleSuccessButton={handleUpdateColumns}
            initialColumnConfiguration={columnConfiguration}
            title="DTEs"
            description="Selecciona las columnas que deseas mostrar en la tabla."
            rowClassName={(dte: DTE) =>
              dte.type === "CREDIT_NOTE" ? "bg-red-50" : ""
            }
          />
        </div>
      </Main>
    </>
  );
};

export default PageDTE;

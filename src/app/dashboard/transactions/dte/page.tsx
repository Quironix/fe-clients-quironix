"use client";

import TitleSection from "@/app/dashboard/components/title-section";
import { FileStack } from "lucide-react";
import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { DataTable } from "../../components/data-table";
import LoaderTable from "../../components/loader-table";
import { columns } from "./components/columns";
import DTEUploadSection from "./components/dte-upload-section";
import { useDTEs } from "./hooks/useDTEs";
import { Button } from "@/components/ui/button";

const PageDTE = () => {
  const { session, profile } = useProfileContext();

  // Usar el nuevo hook useDTEs con paginación del servidor
  const {
    dtes,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    handlePaginationChange,
    currentPage,
    currentLimit,
  } = useDTEs({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    initialPage: 1,
    initialLimit: 15,
  });

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
          <DataTable
            columns={columns}
            data={dtes}
            // Configuración para paginación del servidor (requerida)
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            isServerSideLoading={isLoading}
            // Configuración de carga
            loadingComponent={<LoaderTable cols={7} />}
            emptyMessage="No se encontraron DTEs"
            // Configuración de paginación
            pageSize={currentLimit}
            pageSizeOptions={[15, 20, 25, 30, 40, 50]}
          />
        </div>
      </Main>
    </>
  );
};

export default PageDTE;

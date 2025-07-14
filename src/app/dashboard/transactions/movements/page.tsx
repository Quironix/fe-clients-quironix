"use client";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Suspense } from "react";
import { DataTable } from "../../components/data-table";
import Header from "../../components/header";
import LoaderTable from "../../components/loader-table";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import { useDataTableByClientType } from "../../hooks/use-data-table-by-client-type";
import BulkMovements from "./components/bulk-movements";
import { columns } from "./components/columns";
import { useMovements } from "./hooks/useMovements";
import { Button } from "@/components/ui/button";

const MovementsContent = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();

  // Usar el nuevo hook useMovements con paginación del servidor
  const {
    movements,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    handlePaginationChange,
    currentPage,
    currentLimit,
  } = useMovements({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    initialPage: 1,
    initialLimit: 15,
  });

  const columnsByClientType = useDataTableByClientType(columns);

  // Manejo de errores
  if (isError) {
    return (
      <>
        <Header fixed>
          <Language />
        </Header>
        <Main>
          <TitleSection
            title="Carga de cartolas"
            description="Carga la cartola de tu empresa para que la plataforma pueda procesar los datos."
            icon={<FileText color="white" />}
            subDescription="Transacciones"
          />
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600 font-medium mb-2">
                  Error al cargar los movimientos
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
          title="Carga de cartolas"
          description="Carga la cartola de tu empresa para que la plataforma pueda procesar los datos."
          icon={<FileText color="white" />}
          subDescription="Transacciones"
        />
        <div className="flex justify-between items-start gap-5 p-3 border border-gray-200 rounded-md h-[320px]">
          <div className="w-1/3 h-full">
            <Image
              src="/img/debtors-image.svg"
              alt="Deudores"
              className="w-full h-full object-cover rounded-md"
              width={100}
              height={100}
            />
          </div>
          <div className="w-2/3 h-full">
            <BulkMovements />
          </div>
        </div>
        <div className="mt-5">
          <DataTable
            columns={columnsByClientType}
            data={movements}
            // Configuración para paginación del servidor (requerida)
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            isServerSideLoading={isLoading}
            // Configuración de carga
            loadingComponent={<LoaderTable cols={7} />}
            emptyMessage="No se encontraron movimientos"
            // Configuración de paginación
            pageSize={currentLimit}
            pageSizeOptions={[15, 20, 25, 30, 40, 50]}
          />
        </div>
      </Main>
    </>
  );
};

const MovementsPage = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <MovementsContent />
    </Suspense>
  );
};

export default MovementsPage;

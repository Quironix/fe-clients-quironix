"use client";
import Language from "@/components/ui/language";
import { useProfileContext } from "@/context/ProfileContext";
import { FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Suspense, useEffect } from "react";
import { DataTable } from "../../components/data-table";
import Header from "../../components/header";
import LoaderTable from "../../components/loader-table";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import BulkMovements from "./components/bulk-movements";
import { columns } from "./components/columns";
import { useMovementStore } from "./store";

const MovementsContent = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const { getAllMovements, isLoading, movements } = useMovementStore();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      getAllMovements(session.token, profile.client.id);
    }
  }, [session?.token, profile?.client?.id]);

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
          <div className="w-[25%] h-full">
            <Image
              src="/img/debtors-image.svg"
              alt="Deudores"
              className="w-full h-full object-cover rounded-md"
              width={100}
              height={100}
            />
          </div>
          <div className="w-[100%] h-full">
            <BulkMovements />
          </div>
        </div>
        <div className="mt-5">
          <DataTable
            columns={columns}
            data={movements}
            isLoading={isLoading}
            loadingComponent={<LoaderTable cols={7} />}
            emptyMessage="No se encontraron movimientos"
            pageSize={15}
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

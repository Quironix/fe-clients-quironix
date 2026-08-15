"use client";

import Header from "@/app/dashboard/components/header";
import { Main } from "@/app/dashboard/components/main";
import TitleSection from "@/app/dashboard/components/title-section";
import { Button } from "@/components/ui/button";
import { ExportExcelModal } from "@/components/ui/export-excel-modal";
import Language from "@/components/ui/language";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import { FileDown, Wallet } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import { columns } from "./components/columns";
import { useAccountStatement } from "./hooks/useAccountStatement";
import { updateCurrentAccountTableProfile } from "./services/profile";
import { AccountStatementRow, AccountStatementStatus } from "./services/types";

const CurrentAccountPage = () => {
  const { session, profile } = useProfileContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const debtorId = searchParams.get("debtorId") || "";
  const [exportOpen, setExportOpen] = useState(false);

  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >([
    { name: "row_type", is_visible: true },
    { name: "document", is_visible: true },
    { name: "date", is_visible: true },
    { name: "amount", is_visible: true },
    { name: "applied", is_visible: true },
    { name: "balance", is_visible: true },
    { name: "status", is_visible: true },
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
      row_type: "Tipo",
      document: "Documento / Nº",
      date: "Fecha",
      amount: "Monto",
      applied: "Aplicado",
      balance: "Saldo",
      status: "Estatus",
    }),
    []
  );

  useEffect(() => {
    if (profile?.profile?.current_account_table?.length > 0) {
      const savedConfig = profile.profile.current_account_table;
      if (Array.isArray(savedConfig)) {
        setColumnConfiguration(savedConfig);
      }
    }
  }, [profile?.profile]);

  const {
    rows,
    pagination,
    isLoading,
    isError,
    error,
    refetch,
    handlePaginationChange,
    handleSearchChange,
    status,
    handleStatusChange,
    currentLimit,
  } = useAccountStatement({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    debtorId,
    initialPage: 1,
    initialLimit: 15,
  });

  useEffect(() => {
    if (debtorId) refetch();
  }, [debtorId]);

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    try {
      const configToSave = config || columnConfiguration;

      const response = await updateCurrentAccountTableProfile({
        accessToken: session?.token,
        clientId: profile?.client_id,
        userId: profile?.id,
        currentAccountTable: configToSave,
      });

      if (response.success) {
        if (config) setColumnConfiguration(config);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      console.error("Error al actualizar configuración de columnas:", err);
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
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  if (!debtorId) {
    return (
      <>
        <Header fixed>
          <Language />
        </Header>
        <Main>
          <TitleSection
            title="Cuenta Corriente"
            description="Consulta de documentos, aplicaciones de pago y pagos no conciliados por deudor."
            icon={<Wallet color="white" />}
            subDescription="Transacciones"
          />
          <div className="flex justify-center items-center h-64">
            <div className="text-center bg-amber-50 border border-amber-200 rounded-lg p-6">
              <p className="text-amber-700 font-medium mb-3">
                No se especificó un deudor para consultar.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  router.push("/dashboard/debtor-management/managements-list")
                }
              >
                Ir a Listado de Deudores
              </Button>
            </div>
          </div>
        </Main>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header fixed>
          <Language />
        </Header>
        <Main>
          <TitleSection
            title="Cuenta Corriente"
            description="Consulta de documentos, aplicaciones de pago y pagos no conciliados por deudor."
            icon={<Wallet color="white" />}
            subDescription="Transacciones"
          />
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600 font-medium mb-2">
                  Error al cargar la cuenta corriente
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
          title="Cuenta Corriente"
          description="Consulta de documentos, aplicaciones de pago y pagos no conciliados por deudor."
          icon={<Wallet color="white" />}
          subDescription="Transacciones"
        />
        <div className="mt-5 border border-gray-200 rounded-md p-3">
          <DataTableDynamicColumns<AccountStatementRow, unknown>
            columns={columns}
            data={rows}
            pagination={pagination}
            onPaginationChange={handlePaginationChange}
            onSearchChange={handleSearchChange}
            isServerSideLoading={isLoading}
            loadingComponent={<TableSkeleton />}
            emptyMessage="No hay movimientos para este deudor."
            pageSize={currentLimit}
            pageSizeOptions={[15, 20, 25, 30, 40, 50]}
            enableGlobalFilter={true}
            searchPlaceholder="Buscar por número de documento o pago"
            showPagination={true}
            enableColumnFilter={true}
            initialColumnVisibility={columnVisibility}
            columnLabels={columnLabels}
            handleSuccessButton={handleUpdateColumns}
            initialColumnConfiguration={columnConfiguration}
            title="Cuenta Corriente"
            description="Documentos con sus aplicaciones de pago y pagos no conciliados"
            rowClassName={(row: AccountStatementRow) =>
              row.row_type === "APPLICATION"
                ? "bg-gray-50"
                : row.row_type === "INVOICE" && row.is_credit_or_debit_note
                  ? "bg-red-50"
                  : ""
            }
            filterInputs={
              <Select
                value={status}
                onValueChange={(value) =>
                  handleStatusChange(value as AccountStatementStatus)
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Estatus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="open">Abiertas</SelectItem>
                  <SelectItem value="closed">Cerradas</SelectItem>
                </SelectContent>
              </Select>
            }
            ctaNode={
              <Button variant="outline" onClick={() => setExportOpen(true)}>
                <FileDown className="h-4 w-4 mr-2 text-orange-400" />
                Exportar
              </Button>
            }
          />
        </div>
        <ExportExcelModal
          open={exportOpen}
          onOpenChange={setExportOpen}
          schema="CURRENT_ACCOUNT"
          accessToken={session?.token || ""}
          clientId={profile?.client?.id || ""}
          debtorId={debtorId}
        />
      </Main>
    </>
  );
};

export default CurrentAccountPage;

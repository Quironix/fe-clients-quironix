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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableCell, TableRow } from "@/components/ui/table";
import { getClientId, useProfileContext } from "@/context/ProfileContext";
import { VisibilityState } from "@tanstack/react-table";
import { FileDown, Wallet } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import { allDebtorsColumns } from "./components/columns-all-debtors";
import { columns } from "./components/columns";
import { useAccountStatement } from "./hooks/useAccountStatement";
import { useAccountStatementAllDebtors } from "./hooks/useAccountStatementAllDebtors";
import {
  clearStoredAllDebtorsColumns,
  mergeColumnPreferences,
  readStoredAllDebtorsColumns,
} from "./services/column-preferences";
import {
  CURRENT_ACCOUNT_ALL_DEBTORS_TABLE_KEY,
  CURRENT_ACCOUNT_TABLE_KEY,
  updateTablePreferences,
} from "./services/profile";
import {
  AccountStatementRow,
  AccountStatementStatus,
} from "./services/types";

/**
 * QUI-17 §5 — visibilidad por defecto.
 *
 * 19 columnas encendidas de golpe hacen la grilla ilegible. Nacen visibles las
 * de hoy mas las cuatro que motivan el pedido — Mora, Fase, Analista y
 * Litigio. Las otras siete (codigos y razon social de cliente, codigo y RUT de
 * deudor, fecha de vencimiento, numero interno y fecha de carga) nacen apagadas
 * y se encienden desde el selector. El Excel las trae todas igual (O3).
 */
const DEFAULT_ALL_DEBTORS_COLUMNS: Array<{ name: string; is_visible: boolean }> =
  [
    { name: "company_client_code", is_visible: false },
    { name: "company_name", is_visible: false },
    { name: "debtor_code", is_visible: false },
    { name: "debtor", is_visible: true },
    { name: "debtor_dni", is_visible: false },
    { name: "document_type", is_visible: true },
    { name: "number", is_visible: true },
    { name: "date", is_visible: true },
    { name: "due_date", is_visible: false },
    { name: "amount", is_visible: true },
    { name: "balance", is_visible: true },
    { name: "days_overdue", is_visible: true },
    { name: "external_number", is_visible: false },
    { name: "order_number", is_visible: true },
    { name: "phase", is_visible: true },
    { name: "analyst", is_visible: true },
    { name: "litigation", is_visible: true },
    { name: "created_at", is_visible: false },
    { name: "status", is_visible: true },
  ];

const DEFAULT_SINGLE_DEBTOR_COLUMNS: Array<{
  name: string;
  is_visible: boolean;
}> = [
  { name: "row_type", is_visible: true },
  { name: "document", is_visible: true },
  { name: "date", is_visible: true },
  { name: "amount", is_visible: true },
  { name: "applied", is_visible: true },
  { name: "balance", is_visible: true },
  { name: "status", is_visible: true },
];

const CurrentAccountPage = () => {
  const { session, profile } = useProfileContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const debtorId = searchParams.get("debtorId") || "";
  const [exportOpen, setExportOpen] = useState(false);
  const [viewTab, setViewTab] = useState<"single" | "all">(
    debtorId ? "single" : "all"
  );

  const [columnConfiguration, setColumnConfiguration] = useState<
    Array<{ name: string; is_visible: boolean }>
  >(DEFAULT_SINGLE_DEBTOR_COLUMNS);

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

  // QUI-17 §8 — la preferencia vive en table_preferences. Se cae al campo
  // viejo `current_account_table` solo por si algun perfil lo trae: el backend
  // nunca lo guardo (lo descartaba en silencio), asi que en la practica viene
  // vacio.
  useEffect(() => {
    const saved =
      profile?.profile?.table_preferences?.[CURRENT_ACCOUNT_TABLE_KEY] ??
      profile?.profile?.current_account_table;
    if (Array.isArray(saved) && saved.length > 0) {
      setColumnConfiguration(
        mergeColumnPreferences(DEFAULT_SINGLE_DEBTOR_COLUMNS, saved)
      );
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
    clientId: getClientId(profile) || "",
    debtorId,
    initialPage: 1,
    initialLimit: 15,
  });

  useEffect(() => {
    if (debtorId) refetch();
  }, [debtorId]);

  useEffect(() => {
    if (!debtorId) setViewTab("all");
  }, [debtorId]);

  // QUI-17 §8 — la preferencia de esta grilla ya no vive en el navegador: viaja
  // con el usuario en su perfil de backend.
  const [allDebtorsColumnConfiguration, setAllDebtorsColumnConfiguration] =
    useState<Array<{ name: string; is_visible: boolean }>>(
      DEFAULT_ALL_DEBTORS_COLUMNS
    );

  useEffect(() => {
    const saved =
      profile?.profile?.table_preferences?.[
        CURRENT_ACCOUNT_ALL_DEBTORS_TABLE_KEY
      ];

    if (Array.isArray(saved) && saved.length > 0) {
      setAllDebtorsColumnConfiguration(
        mergeColumnPreferences(DEFAULT_ALL_DEBTORS_COLUMNS, saved)
      );
      return;
    }

    // Rescate de una sola pasada: lo que el usuario habia configurado cuando
    // esto vivia en localStorage se usa una ultima vez, se sube al perfil y la
    // clave del navegador se borra (§8.5).
    const legacy = readStoredAllDebtorsColumns();
    if (!legacy || legacy.length === 0) return;

    const merged = mergeColumnPreferences(DEFAULT_ALL_DEBTORS_COLUMNS, legacy);
    setAllDebtorsColumnConfiguration(merged);

    if (!session?.token || !getClientId(profile) || !profile?.id) return;
    void updateTablePreferences({
      accessToken: session.token,
      clientId: getClientId(profile),
      userId: profile.id,
      tableName: CURRENT_ACCOUNT_ALL_DEBTORS_TABLE_KEY,
      columns: merged,
    }).then((response) => {
      if (response.success) clearStoredAllDebtorsColumns();
    });
  }, [profile?.profile, profile?.id, session?.token]);

  const allDebtorsColumnVisibility = useMemo(() => {
    const visibility: VisibilityState = {};
    allDebtorsColumnConfiguration.forEach((col) => {
      visibility[col.name] = col.is_visible;
    });
    return visibility;
  }, [allDebtorsColumnConfiguration]);

  // Mismas etiquetas que el Excel de Facturas (O4): "Mora", "Numero interno",
  // "Fase" y "Fecha de carga en sistema" significan lo mismo en los dos lados.
  const allDebtorsColumnLabels = useMemo(
    () => ({
      company_client_code: "Código cliente",
      company_name: "Razón social cliente",
      debtor_code: "Código deudor",
      debtor: "Razón social deudor",
      debtor_dni: "RUT deudor",
      document_type: "Tipo de documento",
      number: "Número de documento",
      date: "Fecha emisión",
      due_date: "Fecha vencimiento",
      amount: "Monto documento",
      balance: "Saldo documento",
      days_overdue: "Mora",
      external_number: "Número interno",
      order_number: "OC",
      phase: "Fase",
      analyst: "Analista",
      litigation: "Litigio",
      created_at: "Fecha de carga en sistema",
      status: "Estatus",
    }),
    []
  );

  const handleUpdateAllDebtorsColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    if (!config) return;

    const response = await updateTablePreferences({
      accessToken: session?.token || "",
      clientId: getClientId(profile),
      userId: profile?.id || "",
      tableName: CURRENT_ACCOUNT_ALL_DEBTORS_TABLE_KEY,
      columns: config,
    });

    // §8.5 — si el guardado falla se lo decimos, y no movemos la grilla: nadie
    // vuelve a ver "guardado" sobre algo que se perdio.
    if (!response.success) {
      toast.error(response.message);
      return;
    }

    setAllDebtorsColumnConfiguration(config);
  };

  const {
    rows: allDebtorsRows,
    pagination: allDebtorsPagination,
    isLoading: isAllDebtorsLoading,
    isError: isAllDebtorsError,
    error: allDebtorsError,
    refetch: refetchAllDebtors,
    handlePaginationChange: handleAllDebtorsPaginationChange,
    handleSearchChange: handleAllDebtorsSearchChange,
    status: allDebtorsStatus,
    handleStatusChange: handleAllDebtorsStatusChange,
    currentLimit: allDebtorsCurrentLimit,
  } = useAccountStatementAllDebtors({
    accessToken: session?.token || "",
    clientId: getClientId(profile) || "",
    initialPage: 1,
    initialLimit: 15,
  });

  const handleUpdateColumns = async (
    config?: Array<{ name: string; is_visible: boolean }>
  ) => {
    try {
      const configToSave = config || columnConfiguration;

      const response = await updateTablePreferences({
        accessToken: session?.token || "",
        clientId: getClientId(profile),
        userId: profile?.id || "",
        tableName: CURRENT_ACCOUNT_TABLE_KEY,
        columns: configToSave,
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

  const TableSkeleton = ({ limit }: { limit: number }) => (
    <>
      {Array.from({ length: limit }).map((_, index) => (
        <TableRow key={index}>
          {Array.from({ length: 7 }).map((__, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-5 w-24" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  const ViewTabs = (
    <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as "single" | "all")}>
      <TabsList>
        <TabsTrigger value="all">Todos los deudores</TabsTrigger>
        <TabsTrigger value="single">Un deudor</TabsTrigger>
      </TabsList>
    </Tabs>
  );

  if (isError && viewTab === "single" && debtorId) {
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
          {debtorId && ViewTabs}
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
          description="Consulta de documentos, aplicaciones de pago y pagos no conciliados."
          icon={<Wallet color="white" />}
          subDescription="Transacciones"
        />
        {debtorId && ViewTabs}

        {viewTab === "single" && !debtorId && (
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
        )}

        {viewTab === "single" && debtorId && (
          <div className="mt-5 border border-gray-200 rounded-md p-3">
            <DataTableDynamicColumns<AccountStatementRow, unknown>
              columns={columns}
              data={rows}
              pagination={pagination}
              onPaginationChange={handlePaginationChange}
              onSearchChange={handleSearchChange}
              isServerSideLoading={isLoading}
              loadingComponent={<TableSkeleton limit={currentLimit} />}
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
            <ExportExcelModal
              open={exportOpen}
              onOpenChange={setExportOpen}
              schema="CURRENT_ACCOUNT"
              accessToken={session?.token || ""}
              clientId={getClientId(profile) || ""}
              debtorId={debtorId}
            />
          </div>
        )}

        {viewTab === "all" && (
          <div className="mt-5 border border-gray-200 rounded-md p-3">
            {isAllDebtorsError ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-600 font-medium mb-2">
                      Error al cargar la cuenta corriente consolidada
                    </p>
                    <p className="text-red-500 text-sm mb-4">
                      {allDebtorsError?.message || "Error desconocido"}
                    </p>
                    <Button
                      onClick={() => refetchAllDebtors()}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Reintentar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <DataTableDynamicColumns<AccountStatementRow, unknown>
                  columns={allDebtorsColumns}
                  data={allDebtorsRows}
                  pagination={allDebtorsPagination}
                  onPaginationChange={handleAllDebtorsPaginationChange}
                  onSearchChange={handleAllDebtorsSearchChange}
                  isServerSideLoading={isAllDebtorsLoading}
                  loadingComponent={
                    <TableSkeleton limit={allDebtorsCurrentLimit} />
                  }
                  emptyMessage="No hay documentos para los deudores de este cliente."
                  pageSize={allDebtorsCurrentLimit}
                  pageSizeOptions={[15, 20, 25, 30, 40, 50]}
                  enableGlobalFilter={true}
                  searchPlaceholder="Buscar por deudor, código, RUT, documento o pago"
                  showPagination={true}
                  enableColumnFilter={true}
                  initialColumnVisibility={allDebtorsColumnVisibility}
                  columnLabels={allDebtorsColumnLabels}
                  handleSuccessButton={handleUpdateAllDebtorsColumns}
                  initialColumnConfiguration={allDebtorsColumnConfiguration}
                  title="Cuenta Corriente - Todos los deudores"
                  description="Documentos de todos los deudores del cliente"
                  filterInputs={
                    <Select
                      value={allDebtorsStatus}
                      onValueChange={(value) =>
                        handleAllDebtorsStatusChange(
                          value as AccountStatementStatus
                        )
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
                <ExportExcelModal
                  open={exportOpen}
                  onOpenChange={setExportOpen}
                  schema="CURRENT_ACCOUNT_ALL_DEBTORS"
                  accessToken={session?.token || ""}
                  clientId={getClientId(profile) || ""}
                />
              </>
            )}
          </div>
        )}
      </Main>
    </>
  );
};

export default CurrentAccountPage;

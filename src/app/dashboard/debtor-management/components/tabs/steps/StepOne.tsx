"use client";

import { DataTableDynamicColumns } from "@/app/dashboard/components/data-table-dynamic-columns";
import DocumentTypeBadge from "@/app/dashboard/payment-netting/components/document-type-badge";
import { getInvoices } from "@/app/dashboard/payment-netting/services";
import { Invoice } from "@/app/dashboard/payment-plans/store";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { differenceInDays, format } from "date-fns";
import { FileText, Mail } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface StepOneProps {
  dataDebtor: any;
  selectedInvoices?: Invoice[];
  onInvoicesSelected?: (invoices: Invoice[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const StepOne = ({ dataDebtor, selectedInvoices = [], onInvoicesSelected, onValidationChange }: StepOneProps) => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");

  // Usar refs para evitar recrear handleRowSelectionChange
  const onInvoicesSelectedRef = useRef(onInvoicesSelected);
  const onValidationChangeRef = useRef(onValidationChange);
  const paginatedDataRef = useRef<Invoice[]>([]);

  useEffect(() => {
    onInvoicesSelectedRef.current = onInvoicesSelected;
  }, [onInvoicesSelected]);

  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  useEffect(() => {
    const isValid = selectedInvoices && selectedInvoices.length > 0;
    onValidationChangeRef.current?.(isValid);
  }, [selectedInvoices]);

  // Fetch invoices using TanStack Query
  const { data: invoicesResponse, isLoading } = useQuery({
    queryKey: ["debtor-invoices", dataDebtor?.id, profile?.client_id],
    queryFn: async () =>
      await getInvoices({
        accessToken: session?.token as string,
        clientId: profile?.client_id as string,
        debtorId: dataDebtor?.id as string,
      }),
    enabled: !!(dataDebtor?.id && session?.token && profile?.client_id),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const invoices: Invoice[] = invoicesResponse?.data?.data || [];

  // Filtrar facturas por búsqueda
  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;

    const lowerSearch = searchTerm.toLowerCase();
    return invoices.filter((invoice) => {
      return (
        invoice.number?.toLowerCase().includes(lowerSearch) ||
        invoice.folio?.toLowerCase().includes(lowerSearch) ||
        invoice.type?.toLowerCase().includes(lowerSearch) ||
        invoice.amount?.toString().includes(lowerSearch)
      );
    });
  }, [invoices, searchTerm]);

  // Calcular días de atraso
  const calculateDelay = (dueDate: string) => {
    if (!dueDate) return 0;
    try {
      const due = new Date(dueDate);
      const today = new Date();
      const days = differenceInDays(today, due);
      return days > 0 ? days : 0;
    } catch {
      return 0;
    }
  };

  // Definir columnas para la tabla
  const columns: ColumnDef<Invoice>[] = useMemo(
    () => [
      {
        accessorKey: "number",
        header: "Nº Documento",
        cell: ({ row }) => {
          const number = row.getValue("number") as string;
          return (
            <div className="font-bold">
              {number || row.original.folio || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => {
          const type = row.original.type;
          return <DocumentTypeBadge type={type} />;
        },
      },
      {
        accessorKey: "issue_date",
        header: "Emisión",
        cell: ({ row }) => {
          const issueDate = row.getValue("issue_date") as string;
          if (!issueDate) return <div>-</div>;
          try {
            return <div>{format(new Date(issueDate), "dd-MM-yyyy")}</div>;
          } catch {
            return <div>{issueDate}</div>;
          }
        },
      },
      {
        accessorKey: "due_date",
        header: "Vencimiento",
        cell: ({ row }) => {
          const dueDate = row.getValue("due_date") as string;
          if (!dueDate) return <div>-</div>;
          try {
            return <div>{format(new Date(dueDate), "dd-MM-yyyy")}</div>;
          } catch {
            return <div>{dueDate}</div>;
          }
        },
      },
      {
        accessorKey: "amount",
        header: "Monto",
        cell: ({ row }) => {
          const amount = row.getValue("amount");
          if (amount == null) return <div>-</div>;

          const numericAmount =
            typeof amount === "string"
              ? parseFloat(amount)
              : (amount as number);

          if (isNaN(numericAmount)) return <div>-</div>;

          return (
            <div className="font-medium">
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                minimumFractionDigits: 0,
              }).format(numericAmount)}
            </div>
          );
        },
      },
      {
        accessorKey: "balance",
        header: "Saldo",
        cell: ({ row }) => {
          const balance = row.getValue("balance");
          if (balance == null) return <div>-</div>;

          const numericBalance =
            typeof balance === "string"
              ? parseFloat(balance)
              : (balance as number);

          if (isNaN(numericBalance)) return <div>-</div>;

          return (
            <div className="font-medium">
              {new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                minimumFractionDigits: 0,
              }).format(numericBalance)}
            </div>
          );
        },
      },
      {
        id: "delay",
        header: "Atraso",
        cell: ({ row }) => {
          const dueDate = row.original.due_date;
          const delay = calculateDelay(dueDate);
          return (
            <div
              className={`font-medium ${delay > 0 ? "text-red-600" : "text-gray-600"}`}
            >
              {delay > 0 ? `${delay} días` : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "phases",
        header: "Fase",
        cell: ({ row }) => {
          const phasesArray = row.original.phases;
          const lastPhase =
            Array.isArray(phasesArray) && phasesArray.length > 0
              ? phasesArray[phasesArray.length - 1]
              : null;
          if (!lastPhase) {
            return <div>-</div>;
          }
          return <div>{(lastPhase as any).phase ?? 0}</div>;
        },
      },
      {
        id: "document",
        header: "Documento",
        cell: ({ row }) => {
          const file = row.original.file;
          return (
            <div className="flex justify-center">
              {file ? (
                <a
                  href={file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FileText className="w-5 h-5" />
                </a>
              ) : (
                <FileText className="w-5 h-5 text-gray-400" />
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  // Calcular paginación manual (lado del cliente)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredInvoices.slice(startIndex, endIndex);
  }, [filteredInvoices, currentPage, pageSize]);

  // Calcular initialRowSelection basado en las facturas seleccionadas
  const initialRowSelection = useMemo(() => {
    if (!selectedInvoices || selectedInvoices.length === 0) return {};

    const selection: RowSelectionState = {};
    selectedInvoices.forEach((selectedInvoice) => {
      if (!selectedInvoice?.id) return;

      const index = paginatedData.findIndex((invoice) =>
        invoice?.id && invoice.id === selectedInvoice.id
      );
      if (index !== -1) {
        selection[index] = true;
      }
    });
    return selection;
  }, [selectedInvoices, paginatedData]);

  // Actualizar ref de paginatedData
  useEffect(() => {
    paginatedDataRef.current = paginatedData;
  }, [paginatedData]);

  // Manejar cambios en la selección de filas - Esta función NUNCA cambia
  const handleRowSelectionChange = useCallback(
    (selection: RowSelectionState) => {
      const selectedIndices = Object.keys(selection).filter(
        (key) => selection[key]
      );
      const selectedInvoices = selectedIndices.map(
        (index) => paginatedDataRef.current[parseInt(index)]
      );
      onInvoicesSelectedRef.current?.(selectedInvoices);
    },
    [] // Sin dependencias - la función nunca cambia
  );

  const pagination = useMemo(() => {
    const totalPages = Math.ceil(filteredInvoices.length / pageSize);
    return {
      page: currentPage,
      limit: pageSize,
      total: filteredInvoices.length,
      totalPages: totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
    };
  }, [filteredInvoices.length, currentPage, pageSize]);

  const handlePaginationChange = (page: number, newPageSize: number) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset a la primera página cuando busque
  };

  const TableSkeleton = () => (
    <>
      {Array.from({ length: pageSize }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell className="flex justify-center">
            <Skeleton className="h-5 w-5" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="space-y-4">
      <DataTableDynamicColumns
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        loadingComponent={<TableSkeleton />}
        emptyMessage="No se encontraron facturas para este deudor"
        pageSize={pageSize}
        pageSizeOptions={[15, 20, 25, 30, 40, 50]}
        showPagination={true}
        enableRowSelection={true}
        initialRowSelection={initialRowSelection}
        onRowSelectionChange={handleRowSelectionChange}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        enableGlobalFilter={true}
        searchPlaceholder="Buscar facturas..."
        onSearchChange={handleSearchChange}
        initialSearchValue={searchTerm}
        enableColumnFilter={true}
        title={
          <TitleStep title="Documentos" icon={<Mail className="w-5 h-5" />} />
        }
        description="Selecciona las columnas que deseas mostrar en la tabla de facturas."
      />
    </div>
  );
};

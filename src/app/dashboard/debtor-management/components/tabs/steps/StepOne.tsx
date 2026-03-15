"use client";

import { DataTableDynamicColumns } from "@/app/dashboard/components/data-table-dynamic-columns";
import DocumentTypeBadge from "@/app/dashboard/payment-netting/components/document-type-badge";
import { getInvoices } from "@/app/dashboard/payment-netting/services";
import { Invoice } from "@/app/dashboard/payment-plans/store";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { differenceInDays, format } from "date-fns";
import { FileText, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface StepOneProps {
  dataDebtor: any;
  selectedInvoices?: Invoice[];
  onInvoicesSelected?: (invoices: Invoice[]) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const StepOne = ({ dataDebtor, selectedInvoices = [], onInvoicesSelected, onValidationChange }: StepOneProps) => {
  const t = useTranslations("debtorManagement.stepOne");
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);

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

  const columns: ColumnDef<Invoice>[] = useMemo(
    () => [
      {
        accessorKey: "number",
        header: t("documentNumber"),
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
        header: t("type"),
        cell: ({ row }) => {
          const type = row.original.type;
          return <DocumentTypeBadge type={type} />;
        },
      },
      {
        accessorKey: "issue_date",
        header: t("issueDate"),
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
        header: t("dueDate"),
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
        header: t("amount"),
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
        header: t("balance"),
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
        header: t("delay"),
        cell: ({ row }) => {
          const dueDate = row.original.due_date;
          const delay = calculateDelay(dueDate);
          return (
            <div
              className={`font-medium ${delay > 0 ? "text-red-600" : "text-gray-600"}`}
            >
              {delay > 0 ? t("delayDays", { days: delay }) : "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "phases",
        header: t("phase"),
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
        header: t("document"),
        cell: ({ row }) => {
          const file = row.original.file;
          const isValidUrl =
            typeof file === "string" &&
            (file.startsWith("http://") || file.startsWith("https://"));
          return (
            <div className="flex justify-center">
              {isValidUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    setPreviewFile({
                      url: file,
                      name: row.original.number || row.original.folio || t("document"),
                    })
                  }
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <FileText className="w-5 h-5" />
                </button>
              ) : (
                <FileText className="w-5 h-5 text-gray-400 cursor-not-allowed" />
              )}
            </div>
          );
        },
      },
    ],
    [t]
  );

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredInvoices.slice(startIndex, endIndex);
  }, [filteredInvoices, currentPage, pageSize]);

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

  useEffect(() => {
    paginatedDataRef.current = paginatedData;
  }, [paginatedData]);

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
    []
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
    setCurrentPage(1);
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
        emptyMessage={t("emptyMessage")}
        pageSize={pageSize}
        pageSizeOptions={[15, 20, 25, 30, 40, 50]}
        showPagination={true}
        enableRowSelection={true}
        initialRowSelection={initialRowSelection}
        onRowSelectionChange={handleRowSelectionChange}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        enableGlobalFilter={true}
        searchPlaceholder={t("searchPlaceholder")}
        onSearchChange={handleSearchChange}
        initialSearchValue={searchTerm}
        enableColumnFilter={true}
        title={
          <TitleStep title={t("title")} icon={<Mail className="w-5 h-5" />} />
        }
        description={t("columnFilterDescription")}
      />

      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-[80vw]! h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6 min-h-0">
            {previewFile?.url && (
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
                className="w-full h-full rounded-md border border-gray-200"
                title={`Preview ${previewFile.name}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

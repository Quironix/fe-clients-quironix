"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { getDebtors } from "@/app/dashboard/debtors/services";

interface DebtorRow {
  id: string;
  name: string;
  debtor_code: string;
  dni?: {
    dni: string;
    type: string;
  };
}

interface DebtorsTableProps {
  selectedCompanyId: string | null;
}

const DebtorsTable = ({ selectedCompanyId }: DebtorsTableProps) => {
  const t = useTranslations("debtorManagement.managementsList");
  const router = useRouter();
  const { data: session } = useSession();
  const { profile } = useProfileContext();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: [
      "debtors-managements-list",
      currentPage,
      itemsPerPage,
      selectedCompanyId,
    ],
    queryFn: () =>
      getDebtors(session?.token ?? "", profile?.client_id ?? "", {
        page: currentPage,
        limit: itemsPerPage,
      }),
    enabled: !!session?.token && !!profile?.client_id,
  });

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToPreviousPage = () =>
    handlePageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () =>
    handlePageChange(
      Math.min(data?.pagination?.totalPages || 1, currentPage + 1)
    );
  const goToLastPage = () =>
    handlePageChange(data?.pagination?.totalPages || 1);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="w-full space-y-6">
          <Card className="w-full">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50/50">
                      <TableHead className="font-bold text-blue-700 text-center px-4 py-3">
                        {t("columnName")}
                      </TableHead>
                      <TableHead className="font-bold text-blue-700 text-center px-4 py-3">
                        {t("columnCode")}
                      </TableHead>
                      <TableHead className="font-bold text-blue-700 text-center px-4 py-3">
                        {t("columnRut")}
                      </TableHead>
                      <TableHead className="font-bold text-blue-700 text-center px-4 py-3">
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data && data.data.length > 0 ? (
                      (data.data as DebtorRow[]).map((debtor, index) => (
                        <TableRow
                          key={debtor.id}
                          className={index % 2 === 0 ? "bg-gray-50/30" : "bg-white"}
                        >
                          <TableCell className="text-center py-3 px-4 font-medium text-gray-900">
                            {debtor.name}
                          </TableCell>
                          <TableCell className="text-center py-3 px-4 text-gray-700">
                            {debtor.debtor_code}
                          </TableCell>
                          <TableCell className="text-center py-3 px-4 text-gray-700">
                            {debtor.dni?.dni ?? "-"}
                          </TableCell>
                          <TableCell className="text-center py-3 px-4">
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/debtor-management/${debtor.id}/managements-list`
                                )
                              }
                            >
                              {t("viewHistory")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center py-6 text-gray-500"
                        >
                          {t("emptyState")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">{t("rowsPerPage")}</div>
                <div className="flex items-center gap-4">
                  <select
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                  </select>
                  <div className="text-sm text-gray-600">
                    {t("page", {
                      current: currentPage,
                      total: data?.pagination?.totalPages || 1,
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1 || isLoading}
                      onClick={goToFirstPage}
                    >
                      {"<<"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1 || isLoading}
                      onClick={goToPreviousPage}
                    >
                      {"<"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        currentPage === (data?.pagination?.totalPages || 1) ||
                        isLoading
                      }
                      onClick={goToNextPage}
                    >
                      {">"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        currentPage === (data?.pagination?.totalPages || 1) ||
                        isLoading
                      }
                      onClick={goToLastPage}
                    >
                      {">>"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtorsTable;

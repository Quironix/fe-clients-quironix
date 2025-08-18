"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProfileContext } from "@/context/ProfileContext";
import { cn, formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Edit, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useDebounce from "../../../hooks/useDebounce";
import { getAllDebtors } from "../../services";

// Tipos para los datos de la tabla mensual

const MonthlyTable = ({ period_month }: { period_month: string }) => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para la búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms de debounce

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "debtors",
      period_month,
      currentPage,
      itemsPerPage,
      debouncedSearchTerm,
    ],
    queryFn: () =>
      getAllDebtors(
        session?.token,
        profile?.client_id,
        debouncedSearchTerm || null,
        period_month,
        currentPage,
        itemsPerPage
      ),
    enabled: !!session?.token && !!profile?.client_id && !!period_month,
  });

  // Funciones para manejar la paginación
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newItemsPerPage = parseInt(event.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Resetear a la primera página
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Resetear a la primera página cuando se busque
  };

  const goToFirstPage = () => handlePageChange(1);
  const goToPreviousPage = () => handlePageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () =>
    handlePageChange(
      Math.min(data?.data?.pagination?.totalPages || 1, currentPage + 1)
    );
  const goToLastPage = () =>
    handlePageChange(data?.data?.pagination?.totalPages || 1);

  // Renderizar la celda de cada semana
  const renderWeekCell = (weekData: any) => {
    return (
      <TableCell className="text-center py-3 px-2 min-w-[120px]">
        <div className="space-y-2">
          <div className="text-sm">
            <div className="text-gray-600 text-xs mb-1">Estimado:</div>
            <div className="font-medium text-gray-900">
              {formatNumber(weekData.total_weekly_estimated)}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-gray-600 text-xs mb-1">Recaudado:</div>
            <div
              className={cn(
                "font-medium",
                parseInt(weekData.total_weekly_collected) >
                  parseInt(weekData.total_weekly_estimated)
                  ? "text-green-600"
                  : parseInt(weekData.total_weekly_collected) <
                      parseInt(weekData.total_weekly_estimated)
                    ? "text-red-600"
                    : "text-gray-900"
              )}
            >
              {formatNumber(parseInt(weekData.total_weekly_collected))}
            </div>
          </div>
        </div>
      </TableCell>
    );
  };

  // Renderizar badge de estado basado en el porcentaje
  const renderStatusBadge = (percentage: number) => {
    if (percentage === 0) {
      return (
        <Badge
          variant="outline"
          className="border-yellow-300 text-yellow-700 bg-yellow-50 text-xs px-2 py-1"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          0,0%
        </Badge>
      );
    }

    if (percentage > 0) {
      return (
        <Badge
          variant="outline"
          className="border-green-300 text-green-700 bg-green-50 text-xs px-2 py-1"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          {percentage.toFixed(1)}%
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="border-red-300 text-red-700 bg-red-50 text-xs px-2 py-1"
      >
        <TrendingDown className="w-3 h-3 mr-1" />
        {Math.abs(percentage).toFixed(1)}%
      </Badge>
    );
  };

  return isLoading ? (
    <Card className="w-full">
      <CardHeader className="p-0"></CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  ) : period_month && !isLoading ? (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="w-full space-y-6">
          <div className="bg-blue-100/30 p-5 rounded-lg flex items-center justify-around">
            <div className="flex flex-col justify-center items-center">
              <span className="text-xs text-black">Total estimado</span>
              <span className="text-3xl font-bold text-black">
                {formatNumber(data?.data?.total_projection_period || 0)}
              </span>
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="text-xs text-black">Total real</span>
              <span className="text-3xl font-bold text-green-700">
                {formatNumber(data?.data?.total_real_period || 0)}
              </span>
            </div>
          </div>

          {/* Campo de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar por código, nombre del deudor..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-full max-w-md"
            />
          </div>

          <Card className="w-full">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50/50">
                      <TableHead className="font-bold text-blue-700 text-center px-4 py-3 min-w-[100px]">
                        Código
                        <br />
                        Deudor
                      </TableHead>
                      <TableHead className="font-bold text-blue-700 text-center px-4 py-3 min-w-[120px]">
                        Deudor
                      </TableHead>
                      <TableHead className="font-bold text-blue-700 text-center px-4 py-3 min-w-[120px]">
                        Deuda
                        <br />
                        vencido
                      </TableHead>
                      <TableHead className="font-bold text-blue-700 text-center px-4 py-3 min-w-[120px]">
                        Por vencer
                        <br />
                        en período
                      </TableHead>
                      {data?.data?.data[0].weekly_projections.map((item) => (
                        <TableHead
                          key={item.week_number}
                          className="font-bold text-blue-700 text-center px-4 py-3 min-w-[120px]"
                        >
                          Semana {item.week_number}
                          <br />
                          <span className="text-xs font-normal text-blue-700">
                            {format(item.week_start, "dd MMM")} -{" "}
                            {format(item.week_end, "dd MMM")}
                          </span>
                        </TableHead>
                      ))}

                      <TableHead className="font-bold text-blue-700 text-center px-4 py-3 min-w-[100px]">
                        Acción
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.data.map((row, index) => (
                      <TableRow
                        key={index}
                        className={
                          index % 2 === 0 ? "bg-gray-50/30" : "bg-white"
                        }
                      >
                        <TableCell className="text-center py-3 px-4 font-medium text-gray-900">
                          {row.debtor_code}
                        </TableCell>

                        <TableCell className="text-center py-3 px-4 font-medium max-w-[120px] text-gray-900 truncate">
                          <abbr className="no-underline" title={row.name}>
                            {row.name}
                          </abbr>
                        </TableCell>

                        <TableCell className="text-center py-3 px-4">
                          <span className="font-medium text-red-600">
                            {formatNumber(row.overdue_debt)}
                          </span>
                        </TableCell>

                        <TableCell className="text-center py-3 px-4">
                          <span className="font-medium text-orange-600">
                            {formatNumber(row.period_debt)}
                          </span>
                        </TableCell>

                        {renderWeekCell(row.weekly_projections[0])}
                        {renderWeekCell(row.weekly_projections[1])}
                        {renderWeekCell(row.weekly_projections[2])}
                        {renderWeekCell(row.weekly_projections[3])}
                        {renderWeekCell(row.weekly_projections[4])}

                        <TableCell className="text-center py-3 px-4">
                          {row.action ? (
                            <div className="flex flex-col items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 border-blue-300 text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                alert(row.debtor_code);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-600">Filas por página</div>
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
                    Página {currentPage} de{" "}
                    {data?.data?.pagination?.totalPages || 1}
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
                        currentPage ===
                          (data?.data?.pagination?.totalPages || 1) || isLoading
                      }
                      onClick={goToNextPage}
                    >
                      {">"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        currentPage ===
                          (data?.data?.pagination?.totalPages || 1) || isLoading
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
  ) : null;
};

export default MonthlyTable;

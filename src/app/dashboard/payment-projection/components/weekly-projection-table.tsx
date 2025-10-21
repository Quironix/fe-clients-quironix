"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format, parseISO } from "date-fns";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { getReportsByDebtor } from "../services";
import { usePaymentProjectionStore } from "../store";

export interface WeeklyProjectionData {
  week: number;
  dateRange: string;
  invoiceNumber: string | null;
  projected: number;
  real: number;
  variation: number;
  variationPercentage: number;
  status: "positive" | "negative" | "neutral";
}

interface WeeklyProjectionTableProps {
  data?: WeeklyProjectionData[];
  isLoading?: boolean;
}

const WeeklyProjectionTable = () => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { debtorId } = usePaymentProjectionStore();

  const { data, isLoading } = useQuery({
    queryKey: ["debtors", debtorId],
    queryFn: () =>
      getReportsByDebtor(
        session?.token,
        profile?.client_id,
        debtorId.toString()
      ),
    enabled: !!session?.token && !!profile?.client_id && !!debtorId,
  });

  // Datos de ejemplo basados en la imagen
  const defaultData: WeeklyProjectionData[] = [
    {
      week: 1,
      dateRange: "22 Jul - 28 Jul",
      invoiceNumber: null,
      projected: 0,
      real: 0,
      variation: 0,
      variationPercentage: 0,
      status: "neutral",
    },
    {
      week: 2,
      dateRange: "29 Jul - 04 Ago",
      invoiceNumber: null,
      projected: 0,
      real: 0,
      variation: 0,
      variationPercentage: 0,
      status: "neutral",
    },
    {
      week: 3,
      dateRange: "05 Ago - 11 Ago",
      invoiceNumber: "1234567889",
      projected: 50000,
      real: 0,
      variation: -50000,
      variationPercentage: -100,
      status: "negative",
    },
    {
      week: 4,
      dateRange: "12 Ago - 18 Ago",
      invoiceNumber: null,
      projected: 0,
      real: 0,
      variation: 0,
      variationPercentage: 0,
      status: "neutral",
    },
    {
      week: 5,
      dateRange: "19 Ago - 25 Ago",
      invoiceNumber: null,
      projected: 0,
      real: 0,
      variation: 0,
      variationPercentage: 0,
      status: "neutral",
    },
  ];

  const tableData = data?.data.length > 0 ? data?.data : defaultData;

  // Calcular totales
  const totals = tableData.reduce(
    (acc, item) => ({
      projected: acc.projected + item.projected,
      real: acc.real + item.real,
      variation: acc.variation + item.variation,
    }),
    { projected: 0, real: 0, variation: 0 }
  );

  const totalVariationPercentage =
    totals.projected > 0 ? (totals.variation / totals.projected) * 100 : 0;

  const renderStatusBadge = (status: string, percentage: number) => {
    if (percentage === 0) {
      return (
        <Badge
          variant="outline"
          className="border-yellow-300 text-yellow-700 bg-yellow-50"
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
          className="border-green-300 text-green-700 bg-green-50"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          {percentage.toFixed(1)}%
        </Badge>
      );
    }

    return (
      <Badge
        variant="outline"
        className="border-red-300 text-red-700 bg-red-50"
      >
        <TrendingDown className="w-3 h-3 mr-1" />
        {Math.abs(percentage).toFixed(1)}%
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Proyección detallada</CardTitle>
        </CardHeader>
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
    <div className="w-full space-y-6">
      {/* Tabla principal */}
      <Card className="w-full">
        <CardContent className="p-0">
          {/* <pre>{JSON.stringify(data?.data?.weekly_projections, null, 2)}</pre> */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700 text-left px-6 py-4 w-32">
                  {/* Columna de etiquetas */}
                </TableHead>
                <TableHead className="font-bold text-blue-700 text-center px-6 py-4">
                  Semana 1
                </TableHead>
                <TableHead className="font-bold text-blue-700 text-center px-6 py-4">
                  Semana 2
                </TableHead>
                <TableHead className="font-bold text-blue-700 text-center px-6 py-4">
                  Semana 3
                </TableHead>
                <TableHead className="font-bold text-blue-700 text-center px-6 py-4">
                  Semana 4
                </TableHead>
                <TableHead className="font-bold text-blue-700 text-center px-6 py-4">
                  Semana 5
                </TableHead>
              </TableRow>
              <TableRow className="border-b-2">
                <TableHead className="text-left text-gray-600 text-sm px-6 py-2 w-32">
                  {/* Espacio para etiquetas */}
                </TableHead>
                {data?.data?.weekly_projections.map((item) => (
                  <TableHead
                    key={item.week_number}
                    className="text-center text-gray-600 text-sm px-6 py-2"
                  >
                    {format(parseISO(item.week_start), "dd MMM")} -{" "}
                    {format(parseISO(item.week_end), "dd MMM")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* <pre>{JSON.stringify(data?.data, null, 2)}</pre> */}
              {/* Fila N° Facturas */}
              <TableRow>
                <TableCell className="text-left py-4 px-6 font-bold text-gray-700 w-32">
                  N° Facturas
                </TableCell>
                {data?.data?.weekly_projections.map((item, index) => (
                  <TableCell
                    key={`invoice-${item.week_number}`}
                    className="text-center py-4 px-6"
                  >
                    <span className="text-gray-600">
                      {item?.metadata?.totalInvoices || "0"}
                    </span>
                  </TableCell>
                ))}
              </TableRow>

              {/* Fila Proyectado */}
              <TableRow className="bg-gray-50/30">
                <TableCell className="text-left py-4 px-6 font-bold text-gray-700 w-32">
                  Proyectado
                </TableCell>
                {data?.data?.weekly_projections.map((item, index) => (
                  <TableCell
                    key={`projected-${item.week_number}`}
                    className="text-center py-4 px-6"
                  >
                    <span className="text-gray-900 font-medium">
                      {formatNumber(item.total_weekly_estimated)}
                    </span>
                  </TableCell>
                ))}
              </TableRow>

              {/* Fila Real */}
              <TableRow>
                <TableCell className="text-left py-4 px-6 font-bold text-gray-700 w-32">
                  Real
                </TableCell>
                {data?.data?.weekly_projections.map((item, index) => (
                  <TableCell
                    key={`real-${item.week_number}`}
                    className="text-center py-4 px-6"
                  >
                    <span className="text-gray-900 font-medium">
                      {formatNumber(item.total_weekly_collected)}
                    </span>
                  </TableCell>
                ))}
              </TableRow>

              {/* Fila Variación */}
              <TableRow className="bg-gray-50/30">
                <TableCell className="text-left py-4 px-6 font-bold text-gray-700 w-32">
                  Variación
                </TableCell>
                {data?.data?.weekly_projections.map((item, index) => (
                  <TableCell
                    key={`variation-${item.week_number}`}
                    className="text-center py-4 px-6"
                  >
                    <span
                      className={cn(
                        "font-medium",
                        item.variation < 0
                          ? "text-red-600"
                          : item.variation > 0
                            ? "text-green-600"
                            : "text-gray-900"
                      )}
                    >
                      {formatNumber(
                        item.total_weekly_estimated -
                          item.total_weekly_collected
                      )}
                    </span>
                  </TableCell>
                ))}
              </TableRow>

              {/* Fila Estado */}
              <TableRow>
                <TableCell className="text-left py-4 px-6 font-bold text-gray-700 w-32">
                  Estado
                </TableCell>
                {data?.data?.weekly_projections.map((item, index) => (
                  <TableCell
                    key={`status-${index}`}
                    className="text-center py-4 px-6"
                  >
                    {renderStatusBadge(item.status, 0)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>

          <div className="grid grid-cols-2 gap-8 p-5 bg-blue-100/30 rounded-lg m-4">
            {/* Columna izquierda */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">$</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total proyectado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(data?.data?.total_monthly_estimated)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Variación</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      data?.data?.total_monthly_estimated -
                        (data?.data?.total_monthly_estimated -
                          data?.data?.total_monthly_estimated * 0.3) <
                        0
                        ? "text-red-600"
                        : data?.data?.total_monthly_estimated -
                              (data?.data?.total_monthly_estimated -
                                data?.data?.total_monthly_estimated * 0.3) >
                            0
                          ? "text-green-600"
                          : "text-gray-900"
                    )}
                  >
                    {formatNumber(
                      data?.data?.total_monthly_estimated -
                        (data?.data?.total_monthly_estimated -
                          data?.data?.total_monthly_estimated * 0.3)
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">$</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total real:</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(
                      data?.data?.total_monthly_estimated -
                        data?.data?.total_monthly_estimated * 0.3
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">% de variación</p>
                  {/*
                    Calcula el porcentaje de variación basado en el monto real y la variación.
                    Porcentaje = (variación / monto real) * 100
                  */}
                  {(() => {
                    // Calcula el monto real y la variación
                    const montoReal = data?.data?.total_monthly_estimated
                      ? data.data.total_monthly_estimated -
                        data.data.total_monthly_estimated * 0.3
                      : 0;
                    const variacion = data?.data?.total_monthly_estimated
                      ? data.data.total_monthly_estimated -
                        (data.data.total_monthly_estimated -
                          data.data.total_monthly_estimated * 0.3)
                      : 0;
                    // Calcula el porcentaje de variación
                    const porcentaje =
                      montoReal !== 0 ? (variacion / montoReal) * 100 : 0;

                    return (
                      <p
                        className={cn(
                          "text-2xl font-bold",
                          porcentaje < 0
                            ? "text-red-600"
                            : porcentaje > 0
                              ? "text-green-600"
                              : "text-gray-900"
                        )}
                      >
                        {porcentaje.toFixed(1)}%
                      </p>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyProjectionTable;

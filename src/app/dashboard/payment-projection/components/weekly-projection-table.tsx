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
import { useTranslations } from "next-intl";
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
  const t = useTranslations("paymentProjection");
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { debtorId } = usePaymentProjectionStore();

  const { data, isLoading } = useQuery({
    queryKey: ["debtors", debtorId],
    queryFn: () =>
      getReportsByDebtor(
        session?.token,
        profile?.client_id,
        debtorId.toString(),
      ),
    enabled: !!session?.token && !!profile?.client_id && !!debtorId,
  });

  const rawWeeklyProjections: any[] = data?.data?.weekly_projections ?? [];
  const weeklyProjections = rawWeeklyProjections.filter(
    (item, index, self) =>
      self.findIndex((w) => w.week_number === item.week_number) === index,
  );

  const getComplianceColor = (estimated: number, collected: number) => {
    if (estimated <= 0)
      return {
        text: "text-gray-900",
        badge: "border-gray-300 text-gray-700 bg-gray-50",
        icon: TrendingUp,
      };
    const pct = (collected / estimated) * 100;
    if (pct >= 100)
      return {
        text: "text-green-600",
        badge: "border-green-300 text-green-700 bg-green-50",
        icon: TrendingUp,
      };
    if (pct >= 95)
      return {
        text: "text-yellow-600",
        badge: "border-yellow-300 text-yellow-700 bg-yellow-50",
        icon: TrendingUp,
      };
    return {
      text: "text-red-600",
      badge: "border-red-300 text-red-700 bg-red-50",
      icon: TrendingDown,
    };
  };

  const renderStatusBadge = (estimated: number, collected: number) => {
    const { badge, icon: Icon } = getComplianceColor(estimated, collected);
    const pct = estimated > 0 ? (collected / estimated) * 100 : 0;
    return (
      <Badge variant="outline" className={badge}>
        <Icon className="w-3 h-3 mr-1" />
        {pct.toFixed(1)}%
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("detailedProjection")}</CardTitle>
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
          {/* <pre>{JSON.stringify(weeklyProjections, null, 2)}</pre> */}
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700 text-left px-6 py-4 w-32">
                  {/* Columna de etiquetas */}
                </TableHead>
                {weeklyProjections.map((item, index) => (
                  <TableHead
                    key={`week-header-${index}`}
                    className="font-bold text-blue-700 text-center px-6 py-4"
                  >
                    {t("week", { number: item.week_number ?? item.week })}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow className="border-b-2">
                <TableHead className="text-left text-gray-600 text-sm px-6 py-2 w-32">
                  {/* Espacio para etiquetas */}
                </TableHead>
                {weeklyProjections.map((item, index) => (
                  <TableHead
                    key={`week-dates-${index}`}
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
                  {t("invoiceCount")}
                </TableCell>
                {weeklyProjections.map((item, index) => (
                  <TableCell
                    key={`invoice-${index}`}
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
                  {t("projected")}
                </TableCell>
                {weeklyProjections.map((item, index) => (
                  <TableCell
                    key={`projected-${index}`}
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
                  {t("real")}
                </TableCell>
                {weeklyProjections.map((item, index) => (
                  <TableCell
                    key={`real-${index}`}
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
                  {t("variation")}
                </TableCell>
                {weeklyProjections.map((item, index) => (
                  <TableCell
                    key={`variation-${index}`}
                    className="text-center py-4 px-6"
                  >
                    <span
                      className={cn(
                        "font-medium",
                        getComplianceColor(
                          item.total_weekly_estimated,
                          item.total_weekly_collected,
                        ).text,
                      )}
                    >
                      {formatNumber(
                        item.total_weekly_estimated -
                          item.total_weekly_collected,
                      )}
                    </span>
                  </TableCell>
                ))}
              </TableRow>

              {/* Fila Estado */}
              <TableRow>
                <TableCell className="text-left py-4 px-6 font-bold text-gray-700 w-32">
                  {t("status")}
                </TableCell>
                {weeklyProjections.map((item, index) => (
                  <TableCell
                    key={`status-${index}`}
                    className="text-center py-4 px-6"
                  >
                    {renderStatusBadge(
                      item.total_weekly_estimated,
                      item.total_weekly_collected,
                    )}
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
                  <p className="text-sm text-gray-600">{t("totalProjected")}</p>
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
                  <p className="text-sm text-gray-600">{t("variation")}</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      getComplianceColor(
                        data?.data?.total_monthly_estimated ?? 0,
                        data?.data?.total_monthly_collected ?? 0,
                      ).text,
                    )}
                  >
                    {formatNumber(
                      (data?.data?.total_monthly_estimated ?? 0) -
                        (data?.data?.total_monthly_collected ?? 0),
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
                  <p className="text-sm text-gray-600">{t("totalReal")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(data?.data?.total_monthly_collected)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {t("variationPercentage")}
                  </p>
                  {/*
                    Calcula el porcentaje de variación basado en el monto real y la variación.
                    Porcentaje = (variación / monto real) * 100
                  */}
                  {(() => {
                    const estimated = data?.data?.total_monthly_estimated ?? 0;
                    const collected = data?.data?.total_monthly_collected ?? 0;
                    const pct =
                      estimated > 0 ? (collected / estimated) * 100 : 0;
                    return (
                      <p
                        className={cn(
                          "text-2xl font-bold",
                          getComplianceColor(estimated, collected).text,
                        )}
                      >
                        {pct.toFixed(1)}%
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

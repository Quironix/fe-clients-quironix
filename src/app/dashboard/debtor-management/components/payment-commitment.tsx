import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { PaymentCommitment as PaymentCommitmentType } from "../types";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatNumber } from "@/lib/utils";

interface PaymentCommitmentProps {
  data: PaymentCommitmentType;
}

const PaymentCommitment = ({ data }: PaymentCommitmentProps) => {
  const t = useTranslations("debtorManagement.paymentCommitmentCard");
  const { complete, incomplete, percentage } = data.credibility;

  const chartData = [
    { name: t("unfulfilled"), value: incomplete || 0 },
    { name: t("fulfilled"), value: complete || 0 },
  ];

  const COLORS = {
    incomplete: "#EF4444", // red-500
    complete: "#E5E7EB", // gray-200
  };

  const latestCommitments = data.latest_commitments || [];

  const getStatusBadge = (status: "completed" | "incomplete") => {
    return status === "completed" ? (
      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
        {t("fulfilledBadge")}
      </span>
    ) : (
      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
        {t("unfulfilledBadge")}
      </span>
    );
  };

  return (
    <div className="flex flex-col justify-center items-center gap-1 flex-1">
      <span className="text-xs font-medium">{t("credibility")}</span>
      <div className="flex justify-center items-center text-[11px] gap-1">
        <span className="text-gray-600">{complete} {t("fulfilled")}</span>
        <span className="text-gray-400">-</span>
        <span className="text-gray-600">{incomplete} {t("unfulfilled")}</span>
      </div>

      {/* Gráfico circular */}
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={45}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
            >
              <Cell fill={COLORS.incomplete} />
              <Cell fill={COLORS.complete} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-red-500">{percentage.toFixed(1)}%</span>
        </div>
      </div>

      {/* Accordion de compromisos */}
      {latestCommitments.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          className="border border-gray-200 p-1 rounded-sm w-full"
        >
          <AccordionItem value="item-1" className="border-0">
            <AccordionTrigger className="px-2 text-xs">
              {t("latestCommitments", { count: latestCommitments.length })}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 px-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">{t("date")}</TableHead>
                      <TableHead>{t("amount")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead className="text-right">
                        {t("observations")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestCommitments.map((commitment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {formatDate(commitment.date)}
                        </TableCell>
                        <TableCell>{formatNumber(commitment.amount)}</TableCell>
                        <TableCell>{getStatusBadge(commitment.status)}</TableCell>
                        <TableCell className="text-right">
                          {commitment.invoice_number && (
                            <span className="block text-xs font-medium mb-1">
                              {commitment.invoice_number}
                            </span>
                          )}
                          {commitment.description && (
                            <span className="text-xs text-gray-600">
                              {commitment.description}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="w-full text-center py-2">
          <p className="text-xs text-gray-500">{t("noCommitments")}</p>
        </div>
      )}
    </div>
  );
};

export default PaymentCommitment;

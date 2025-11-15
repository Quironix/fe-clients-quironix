"use client";

import { disputes, PAYMENT_FREQUENCY, DEBTOR_PAYMENT_METHODS } from "@/app/dashboard/data";
import {
  DEBTOR_COMMENTS,
  EXECUTIVE_COMMENTS,
  getManagementCombination,
} from "@/app/dashboard/debtor-management/config/management-types";
import { getTrackById } from "@/app/dashboard/debtor-management/services/tracks";
import { getLitigationById } from "@/app/dashboard/litigation/services";
import { getPaymentPlanById } from "@/app/dashboard/payment-plans/services";
import DocumentTypeBadge from "@/app/dashboard/payment-netting/components/document-type-badge";
import IconDescription from "@/app/dashboard/payment-netting/components/icon-description";
import DialogForm from "@/app/dashboard/components/dialog-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { differenceInDays, format } from "date-fns";
import {
  BookUser,
  Calendar,
  Clock,
  CogIcon,
  DollarSign,
  FileText,
  History,
  MessageCircle,
  ThermometerSnowflake,
} from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TrackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId: string | null;
  accessToken: string | null;
  clientId: string | null;
}

export const TrackDetailModal = ({
  isOpen,
  onClose,
  trackId,
  accessToken,
  clientId,
}: TrackDetailModalProps) => {
  const [trackData, setTrackData] = useState<any>(null);
  const [litigationsData, setLitigationsData] = useState<any[]>([]);
  const [paymentPlanData, setPaymentPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrackDetails = async () => {
      if (!isOpen || !trackId || !accessToken || !clientId) {
        setTrackData(null);
        setLitigationsData([]);
        setPaymentPlanData(null);
        return;
      }

      setLoading(true);
      try {
        const data = await getTrackById(accessToken, clientId, trackId);
        setTrackData(data);

        if (data?.caseData?.litigationIds && data.caseData.litigationIds.length > 0) {
          const litigationPromises = data.caseData.litigationIds.map((litigationId: string) =>
            getLitigationById(accessToken, clientId, litigationId)
          );

          const litigationResults = await Promise.all(litigationPromises);
          const litigations = litigationResults
            .filter((result) => result.success && result.data)
            .map((result) => result.data);

          setLitigationsData(litigations);
        }

        if (data?.caseData?.paymentPlanData) {
          setPaymentPlanData(data.caseData.paymentPlanData);
        } else if (data?.caseData?.paymentPlanIds && data.caseData.paymentPlanIds.length > 0) {
          const paymentPlanId = data.caseData.paymentPlanIds[0];
          const paymentPlanResponse = await getPaymentPlanById(
            accessToken,
            clientId,
            paymentPlanId
          );

          if (paymentPlanResponse.success && paymentPlanResponse.data) {
            setPaymentPlanData(paymentPlanResponse.data);
          }
        } else if (data?.caseData?.paymentPlanId) {
          const paymentPlanResponse = await getPaymentPlanById(
            accessToken,
            clientId,
            data.caseData.paymentPlanId
          );

          if (paymentPlanResponse.success && paymentPlanResponse.data) {
            setPaymentPlanData(paymentPlanResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching track details:", error);
        setTrackData(null);
        setLitigationsData([]);
        setPaymentPlanData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackDetails();
  }, [isOpen, trackId, accessToken, clientId]);

  const invoices = trackData?.invoices || [];
  const hasInvoices = invoices.length > 0;

  const selectedConfig = useMemo(() => {
    if (
      trackData?.managementType &&
      trackData?.debtorComment &&
      trackData?.executiveComment
    ) {
      return getManagementCombination(
        trackData.managementType,
        trackData.debtorComment,
        trackData.executiveComment
      );
    }
    return null;
  }, [
    trackData?.managementType,
    trackData?.debtorComment,
    trackData?.executiveComment,
  ]);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string | Date, formatType = "dd/MM/yyyy") => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), formatType);
    } catch {
      return typeof dateString === "string" ? dateString : "-";
    }
  };

  const formatDateTime = (dateString: string | Date) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return typeof dateString === "string" ? dateString : "-";
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "-";
    return timeString;
  };

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

  const getDisputeLabels = (reasonCode: string, subreasonCode: string) => {
    const reason = disputes.find((d) => d.code === reasonCode);
    const reasonLabel = reason?.label || reasonCode;
    const subreasonLabel =
      reason?.submotivo.find((s) => s.code === subreasonCode)?.label ||
      subreasonCode;
    return { reasonLabel, subreasonLabel };
  };

  const getDebtorCommentLabel = (debtorComment: string) => {
    const comment = DEBTOR_COMMENTS.find((c) => c.value === debtorComment);
    return comment?.label || debtorComment;
  };

  const getExecutiveCommentLabel = (executiveComment: string) => {
    const comment = EXECUTIVE_COMMENTS.find(
      (c) => c.value === executiveComment
    );
    return comment?.label || executiveComment;
  };

  const getCurrentPhase = (invoice: any) => {
    const currentPhase = invoice?.phases?.find(
      (phase: any) => phase.is_current
    );
    return currentPhase?.phase || "-";
  };

  const renderCaseDataFields = () => {
    if (!selectedConfig || !trackData?.caseData) return null;

    const fields = selectedConfig.fields;
    if (fields.length === 0) return null;

    const caseData = trackData.caseData;

    if (
      selectedConfig.executive_comment === "DOCUMENT_IN_LITIGATION" &&
      litigationsData.length > 0
    ) {
      return (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <BookUser className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              Litigios ({litigationsData.length})
            </h3>
          </div>
          <div className="space-y-3">
            {litigationsData.map((litigation: any, index: number) => {
              const { reasonLabel, subreasonLabel } = getDisputeLabels(
                litigation.motivo,
                litigation.submotivo
              );

              return (
                <div
                  key={litigation.id || index}
                  className="border border-gray-200 rounded p-3"
                >
                  <p className="font-semibold text-sm mb-2">
                    Litigio {index + 1}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Monto:</span>{" "}
                      <span className="font-medium">
                        {formatCurrency(litigation.litigation_amount || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Estado:</span>{" "}
                      <span className="font-medium">
                        {litigation.status || "-"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Motivo:</span>{" "}
                      <span className="font-medium">{reasonLabel}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Submotivo:</span>{" "}
                      <span className="font-medium">{subreasonLabel}</span>
                    </div>
                    {litigation.comment && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Comentario:</span>{" "}
                        <span className="font-medium">{litigation.comment}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (
      selectedConfig.executive_comment === "PAYMENT_PLAN_APPROVAL_REQUEST" &&
      paymentPlanData
    ) {
      const planData = paymentPlanData;

      const totalAmount = invoices.reduce((sum: number, inv: any) => {
        const amount = typeof inv.balance === "string" ? parseFloat(inv.balance) : inv.balance;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      const downPayment = planData.downPayment || 0;
      const amountToFinance = totalAmount - downPayment;
      const downPaymentPercentage = totalAmount > 0 ? ((downPayment / totalAmount) * 100).toFixed(1) : "0";

      const frequencyLabel = PAYMENT_FREQUENCY.find((f: any) => f.code === planData.paymentFrequency)?.label || planData.paymentFrequency;
      const methodLabel = DEBTOR_PAYMENT_METHODS.find((m: any) => m.value === planData.paymentMethod)?.label || planData.paymentMethod;

      const getFrequencyFactor = (frequency: string) => {
        switch (frequency) {
          case "FREQ_7_DAYS": return 52;
          case "FREQ_15_DAYS": return 24;
          case "FREQ_30_DAYS": return 12;
          case "FREQ_45_DAYS": return 4;
          case "FREQ_60_DAYS": return 2;
          default: return 12;
        }
      };

      let installment = 0;
      let totalInterest = 0;

      if (amountToFinance > 0) {
        if (planData.annualInterestRate === 0) {
          installment = amountToFinance / planData.numberOfInstallments;
        } else {
          const frequencyFactor = getFrequencyFactor(planData.paymentFrequency);
          const periodRate = planData.annualInterestRate / 100 / frequencyFactor;
          installment = (amountToFinance * periodRate * Math.pow(1 + periodRate, planData.numberOfInstallments)) /
            (Math.pow(1 + periodRate, planData.numberOfInstallments) - 1);
          totalInterest = (installment * planData.numberOfInstallments) - amountToFinance;
        }
      }

      const totalToPay = amountToFinance + totalInterest;

      return (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-base text-gray-800">
              Resumen del Plan de Pago
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Configuración</h4>
                <div className="space-y-3">
                  <IconDescription
                    icon={<DollarSign className="w-5 h-5 text-blue-600" />}
                    description="Colocación total"
                    value={formatCurrency(totalAmount)}
                  />
                  <IconDescription
                    icon={<DollarSign className="w-5 h-5 text-blue-600" />}
                    description={`Pago contado (${downPaymentPercentage}%)`}
                    value={formatCurrency(downPayment)}
                  />
                  <IconDescription
                    icon={<FileText className="w-5 h-5 text-blue-600" />}
                    description="Número de cuotas"
                    value={planData.numberOfInstallments?.toString() || "0"}
                  />
                  <IconDescription
                    icon={<FileText className="w-5 h-5 text-blue-600" />}
                    description="Tasa de interés anual"
                    value={`${planData.annualInterestRate || 0}%`}
                  />
                  <IconDescription
                    icon={<Clock className="w-5 h-5 text-blue-600" />}
                    description="Frecuencia de pago"
                    value={frequencyLabel}
                  />
                  <IconDescription
                    icon={<FileText className="w-5 h-5 text-blue-600" />}
                    description="Forma de pago"
                    value={methodLabel}
                  />
                  <IconDescription
                    icon={<Calendar className="w-5 h-5 text-blue-600" />}
                    description="Fecha de inicio"
                    value={formatDate(planData.startDate)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
                <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Resumen Financiero
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-blue-300">
                    <span className="text-sm text-gray-700">Monto a financiar:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(amountToFinance)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">Cuota {frequencyLabel.toLowerCase()}:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(installment)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Total intereses:</span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatCurrency(totalInterest)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t-2 border-blue-400 bg-blue-200/50 -mx-6 px-6 py-3 -mb-6 mt-4 rounded-b-lg">
                    <span className="text-sm font-bold text-gray-800">Total a pagar:</span>
                    <span className="text-2xl font-bold text-blue-900">
                      {formatCurrency(totalToPay)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <BookUser className="w-4 h-4 text-gray-700" />
          <h3 className="font-semibold text-sm text-gray-700">
            {selectedConfig.label}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field: any) => {
            const value = (caseData as any)[field.name];

            if (field.type === "component") {
              return null;
            }

            if (
              value &&
              typeof value === "object" &&
              !Array.isArray(value) &&
              !(value instanceof Date)
            ) {
              return null;
            }

            let displayValue = value || "-";
            let icon = <FileText className="w-6 h-6 text-blue-600" />;

            if (field.type === "number" && value) {
              icon = <DollarSign className="w-6 h-6 text-blue-600" />;
              displayValue = formatCurrency(value);
            } else if (field.type === "date" && value) {
              icon = <Calendar className="w-6 h-6 text-blue-600" />;
              displayValue = formatDate(value);
            } else if (field.type === "time" && value) {
              icon = <Clock className="w-6 h-6 text-blue-600" />;
              displayValue = formatTime(value);
            } else if (field.type === "select" && field.options) {
              icon = <ThermometerSnowflake className="w-6 h-6 text-blue-600" />;
              const option = field.options.find((o: any) => o.value === value);
              displayValue = option?.label || value || "-";
            }

            return (
              <div key={field.name} className="flex items-start gap-2">
                <IconDescription
                  icon={icon}
                  description={field.label}
                  value={displayValue}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <DialogForm
      open={isOpen}
      onOpenChange={onClose}
      title="Detalle de Gestión"
      description=""
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !trackData ? (
        <div className="p-4 text-center text-gray-500">
          No se encontraron datos del track
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-gray-700" />
              <h3 className="font-semibold text-sm text-gray-700">
                Facturas asociadas ({invoices.length})
              </h3>
            </div>
            {hasInvoices ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Nº Doc.</TableHead>
                      <TableHead className="text-xs">Tipo</TableHead>
                      <TableHead className="text-xs">Emisión</TableHead>
                      <TableHead className="text-xs">Vto.</TableHead>
                      <TableHead className="text-xs">Monto</TableHead>
                      <TableHead className="text-xs">Saldo</TableHead>
                      <TableHead className="text-xs">Atraso</TableHead>
                      <TableHead className="text-xs">Fase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice: any, index: number) => (
                      <TableRow key={invoice.id || index}>
                        <TableCell className="text-xs font-medium">
                          {invoice.number || invoice.external_number || "-"}
                        </TableCell>
                        <TableCell className="text-xs">
                          <DocumentTypeBadge type={invoice.type} />
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatDate(invoice.issue_date)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatDate(invoice.due_date)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-red-600 font-medium">
                          {formatCurrency(invoice.balance)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {calculateDelay(invoice.due_date)} días
                        </TableCell>
                        <TableCell className="text-xs">
                          {getCurrentPhase(invoice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay facturas asociadas a este track
              </p>
            )}
          </div>

          {selectedConfig && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col gap-3">
              <div className="flex flex-col gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CogIcon className="w-4 h-4 text-gray-700" />
                    <h3 className="font-semibold text-sm text-gray-700">
                      Gestión
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <IconDescription
                      icon={<FileText className="w-6 h-6 text-blue-600" />}
                      description="Tipo de gestión"
                      value={
                        trackData.managementType === "CALL_OUT"
                          ? "Llamada saliente"
                          : trackData.managementType
                      }
                    />
                    <IconDescription
                      icon={<FileText className="w-6 h-6 text-blue-600" />}
                      description="Comentario del deudor"
                      value={getDebtorCommentLabel(
                        trackData.debtorComment
                      )}
                    />
                    <IconDescription
                      icon={<FileText className="w-6 h-6 text-blue-600" />}
                      description="Comentario del ejecutivo"
                      value={getExecutiveCommentLabel(
                        trackData.executiveComment
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-5">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-700" />
                      <h3 className="font-semibold text-sm text-gray-700">
                        Observación
                      </h3>
                    </div>
                    <p className="text-xs italic text-gray-600">
                      {trackData.observation
                        ? trackData.observation
                            .charAt(0)
                            .toUpperCase() +
                          trackData.observation.slice(1)
                        : "-"}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <History className="w-4 h-4 text-gray-700" />
                    <h3 className="font-semibold text-sm text-gray-700">
                      Información de la gestión
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <IconDescription
                      icon={<FileText className="w-6 h-6 text-blue-600" />}
                      description="Ejecutivo"
                      value={`${trackData.executive.first_name} ${trackData.executive.last_name}`}
                    />
                    <IconDescription
                      icon={<FileText className="w-6 h-6 text-blue-600" />}
                      description="Contacto"
                      value={trackData.contact.value}
                    />
                    <IconDescription
                      icon={<Calendar className="w-6 h-6 text-blue-600" />}
                      description="Fecha de gestión"
                      value={formatDateTime(trackData.createdAt)}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <History className="w-4 h-4 text-gray-700" />
                    <h3 className="font-semibold text-sm text-gray-700">
                      Próxima gestión
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <IconDescription
                      icon={<Calendar className="w-6 h-6 text-blue-600" />}
                      description="Fecha y hora"
                      value={formatDateTime(
                        trackData.nextManagementDate
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {renderCaseDataFields()}
        </div>
      )}
    </DialogForm>
  );
};

/* eslint-disable @typescript-eslint/no-require-imports */
"use client";

import { disputes } from "@/app/dashboard/data";
import { SavedManagement } from "@/app/dashboard/debtor-management/components/tabs/add-management-tab";
import {
  DEBTOR_COMMENTS,
  EXECUTIVE_COMMENTS,
  getManagementCombination,
} from "@/app/dashboard/debtor-management/config/management-types";
import DocumentTypeBadge from "@/app/dashboard/payment-netting/components/document-type-badge";
import IconDescription from "@/app/dashboard/payment-netting/components/icon-description";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
  Clock1,
  CogIcon,
  DollarSign,
  FileText,
  History,
  MessageCircle,
  ThermometerSnowflake,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";

interface SavedManagementCardProps {
  management: SavedManagement;
  index: number;
  onDelete: (id: string) => void;
}

export const SavedManagementCard = ({
  management,
  index,
  onDelete,
}: SavedManagementCardProps) => {
  const selectedConfig = useMemo(() => {
    if (
      management.formData.managementType &&
      management.formData.debtorComment &&
      management.formData.executiveComment
    ) {
      return getManagementCombination(
        management.formData.managementType,
        management.formData.debtorComment,
        management.formData.executiveComment
      );
    }
    return null;
  }, [
    management.formData.managementType,
    management.formData.debtorComment,
    management.formData.executiveComment,
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

  const renderCaseDataFields = () => {
    if (!selectedConfig || !management.formData.caseData) return null;

    const fields = selectedConfig.fields;
    if (fields.length === 0) return null;

    // Caso especial: Litigios
    if (
      selectedConfig.executive_comment === "DOCUMENT_IN_LITIGATION" &&
      management.formData.caseData?.litigationData?.litigations
    ) {
      return (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <BookUser className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              Litigios (
              {management.formData.caseData.litigationData.litigations.length})
            </h3>
          </div>
          <div className="space-y-3">
            {management.formData.caseData.litigationData.litigations.map(
              (litigation: any, index: number) => {
                const { reasonLabel, subreasonLabel } = getDisputeLabels(
                  litigation.reason,
                  litigation.subreason
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
                        <span className="text-gray-500">Facturas:</span>{" "}
                        <span className="font-medium">
                          {litigation.selectedInvoiceIds?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Monto:</span>{" "}
                        <span className="font-medium">
                          {formatCurrency(litigation.litigationAmount || 0)}
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
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      );
    }

    // Caso especial: Plan de Pago
    if (
      selectedConfig.executive_comment === "PAYMENT_PLAN_APPROVAL_REQUEST" &&
      management.formData.caseData?.paymentPlanData
    ) {
      const planData = management.formData.caseData.paymentPlanData;
      const {
        PAYMENT_FREQUENCY,
        DEBTOR_PAYMENT_METHODS,
      } = require("@/app/dashboard/data");

      const totalAmount = management.selectedInvoices.reduce((sum, inv) => {
        const amount =
          typeof inv.balance === "string"
            ? parseFloat(inv.balance)
            : inv.balance;
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      const downPayment = planData.downPayment || 0;
      const amountToFinance = totalAmount - downPayment;
      const downPaymentPercentage =
        totalAmount > 0 ? ((downPayment / totalAmount) * 100).toFixed(1) : "0";

      const frequencyLabel =
        PAYMENT_FREQUENCY.find((f: any) => f.code === planData.paymentFrequency)
          ?.label || planData.paymentFrequency;
      const methodLabel =
        DEBTOR_PAYMENT_METHODS.find(
          (m: any) => m.value === planData.paymentMethod
        )?.label || planData.paymentMethod;

      const getFrequencyFactor = (frequency: string) => {
        switch (frequency) {
          case "FREQ_7_DAYS":
            return 52;
          case "FREQ_15_DAYS":
            return 24;
          case "FREQ_30_DAYS":
            return 12;
          case "FREQ_45_DAYS":
            return 4;
          case "FREQ_60_DAYS":
            return 2;
          default:
            return 12;
        }
      };

      let installment = 0;
      let totalInterest = 0;

      if (amountToFinance > 0) {
        if (planData.annualInterestRate === 0) {
          installment = amountToFinance / planData.numberOfInstallments;
        } else {
          const frequencyFactor = getFrequencyFactor(planData.paymentFrequency);
          const periodRate =
            planData.annualInterestRate / 100 / frequencyFactor;
          installment =
            (amountToFinance *
              periodRate *
              Math.pow(1 + periodRate, planData.numberOfInstallments)) /
            (Math.pow(1 + periodRate, planData.numberOfInstallments) - 1);
          totalInterest =
            installment * planData.numberOfInstallments - amountToFinance;
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
                <h4 className="text-sm font-semibold text-blue-900 mb-3">
                  Configuración
                </h4>
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
                    <span className="text-sm text-gray-700">
                      Monto a financiar:
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(amountToFinance)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">
                      Cuota {frequencyLabel.toLowerCase()}:
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(installment)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      Total intereses:
                    </span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatCurrency(totalInterest)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t-2 border-blue-400 bg-blue-200/50 -mx-6 px-6 py-3 -mb-6 mt-4 rounded-b-lg">
                    <span className="text-sm font-bold text-gray-800">
                      Total a pagar:
                    </span>
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

    // Caso especial: Normalización de Litigios
    if (
      selectedConfig.executive_comment === "LITIGATION_NORMALIZATION" &&
      management.formData.caseData?.litigationData
    ) {
      const normalizationData = management.formData.caseData.litigationData;
      const { NORMALIZATION_REASONS } = require("@/app/dashboard/data");
      const normalizationReason = NORMALIZATION_REASONS.find(
        (r: any) => r.code === normalizationData.reason
      );

      // Obtener facturas seleccionadas para mostrar detalles
      const selectedInvoicesForNormalization =
        management.selectedInvoices.filter((inv) =>
          normalizationData.selectedInvoiceIds?.includes(inv.id)
        );

      return (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <BookUser className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              Normalización de Litigios
            </h3>
          </div>
          <div className="space-y-3">
            {/* Resumen General */}
            <div className="border border-gray-200 rounded p-3 bg-blue-50">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Litigios normalizados:</span>{" "}
                  <span className="font-bold text-blue-700">
                    {normalizationData.litigationIds?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Monto total litigios:</span>{" "}
                  <span className="font-bold text-blue-700">
                    {formatCurrency(normalizationData.totalAmount || 0)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Razón de normalización:</span>{" "}
                  <span className="font-medium">
                    {normalizationReason?.label || normalizationData.reason}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Comentario:</span>{" "}
                  <span className="font-medium">
                    {normalizationData.comment || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Detalle de Facturas - Usar misma tabla completa */}
            {selectedInvoicesForNormalization.length > 0 && (
              <div className="border border-gray-200 rounded p-3">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-gray-700" />
                  <h3 className="font-semibold text-sm text-gray-700">
                    Facturas seleccionadas (
                    {selectedInvoicesForNormalization.length})
                  </h3>
                </div>
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
                      {selectedInvoicesForNormalization.map((invoice, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs font-medium">
                            {invoice.number || invoice.folio || "-"}
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
                            {Array.isArray(invoice.phases) &&
                            invoice.phases.length > 0
                              ? ((
                                  invoice.phases[
                                    invoice.phases.length - 1
                                  ] as any
                                ).phase ?? 0)
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Campos normales
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
            const value = (management.formData.caseData as any)[field.name];

            // Skip campos de tipo component (como litigationData)
            if (field.type === "component") {
              return null;
            }

            // Skip if value is an object (defensive check)
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
    <Accordion
      type="single"
      collapsible
      className="border border-gray-200 rounded-md"
    >
      <AccordionItem value="item-1" className="border-0">
        <div className="flex items-center justify-between pr-4 min-h-[60px]">
          <AccordionTrigger className="flex-1 hover:no-underline px-4">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-blue-600">
                Gestión -{" "}
                {getDebtorCommentLabel(management.formData.debtorComment)}
                {" / "}
                {getExecutiveCommentLabel(management.formData.executiveComment)}
              </h3>

              {/* {management.id && (
                <span className="text-xs text-gray-500 font-mono">
                  ID: {management.id.slice(0, 8)}...
                </span>
              )} */}
            </div>
          </AccordionTrigger>
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(management.id);
            }}
            title="Eliminar gestión de la lista"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </Button>
        </div>

        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Facturas seleccionadas - Ocultar para normalización de litigios */}
            {management.selectedInvoices.length > 0 &&
              selectedConfig?.executive_comment !==
                "LITIGATION_NORMALIZATION" && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-gray-700" />
                    <h3 className="font-semibold text-sm text-gray-700">
                      Facturas seleccionadas (
                      {management.selectedInvoices.length})
                    </h3>
                  </div>
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
                        {management.selectedInvoices.map((invoice, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs font-medium">
                              {invoice.number || invoice.folio || "-"}
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
                              {Array.isArray(invoice.phases) &&
                              invoice.phases.length > 0
                                ? ((
                                    invoice.phases[
                                      invoice.phases.length - 1
                                    ] as any
                                  ).phase ?? 0)
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

            {/* Tipo de Gestión */}
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
                        value="Llamada saliente"
                      />
                      <IconDescription
                        icon={<FileText className="w-6 h-6 text-blue-600" />}
                        description="Comentario del deudor"
                        value={selectedConfig.description}
                      />
                      <IconDescription
                        icon={<FileText className="w-6 h-6 text-blue-600" />}
                        description="Comentario del ejecutivo"
                        value={selectedConfig.label}
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
                        {management.formData.observation
                          ? management.formData.observation
                              .charAt(0)
                              .toUpperCase() +
                            management.formData.observation.slice(1)
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-gray-700" />
                      <h3 className="font-semibold text-sm text-gray-700">
                        Próxima gestión
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-5">
                      <IconDescription
                        icon={<Calendar className="w-6 h-6 text-blue-600" />}
                        description="Fecha"
                        value={formatDate(
                          management.formData.nextManagementDate
                        )}
                      />
                      <IconDescription
                        icon={<Clock1 className="w-6 h-6 text-blue-600" />}
                        description="Hora"
                        value={
                          formatTime(management.formData.nextManagementTime) +
                          " hrs"
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Datos del Caso (Dinámico) */}
            {renderCaseDataFields()}

            {/* Comentario adicional */}
            {management.formData.comment && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-gray-700" />
                  <h4 className="text-sm font-semibold text-gray-700">
                    Comentario adicional
                  </h4>
                </div>
                <p className="text-sm text-gray-900">
                  {management.formData.comment}
                </p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

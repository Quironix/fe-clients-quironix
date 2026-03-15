/* eslint-disable @typescript-eslint/no-require-imports */
"use client";

import { ManagementFormData } from "@/app/dashboard/debtor-management/components/tabs/add-management-tab";
import { CONTACT_TYPE_OPTIONS } from "@/app/dashboard/debtor-management/config/management-types";
import DocumentTypeBadge from "@/app/dashboard/payment-netting/components/document-type-badge";
import IconDescription from "@/app/dashboard/payment-netting/components/icon-description";
import { Invoice } from "@/app/dashboard/payment-plans/store";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { differenceInDays, format } from "date-fns";
import {
  BookUser,
  Calendar,
  Clock,
  Clock1,
  CogIcon,
  DollarSign,
  Eye,
  FileText,
  HashIcon,
  History,
  Mail,
  MessageCircle,
  Phone,
  ThermometerSnowflake,
  Upload,
  User2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";
import { disputes } from "@/app/dashboard/data";

interface StepThreeProps {
  dataDebtor: any;
  formData: ManagementFormData;
  onFormChange: (data: Partial<ManagementFormData>) => void;
  selectedInvoices: Invoice[];
}

export const StepThree = ({
  dataDebtor,
  formData,
  onFormChange,
  selectedInvoices,
}: StepThreeProps) => {
  const t = useTranslations("debtorManagement.stepThree");
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const [isDragging, setIsDragging] = useState(false);

  const selectedConfig = useMemo(() => {
    if (
      formData.managementType &&
      formData.debtorComment &&
      formData.executiveComment
    ) {
      const {
        getManagementCombination,
      } = require("@/app/dashboard/debtor-management/config/management-types");
      return getManagementCombination(
        formData.managementType,
        formData.debtorComment,
        formData.executiveComment
      );
    }
    return null;
  }, [
    formData.managementType,
    formData.debtorComment,
    formData.executiveComment,
  ]);

  const contactTypeLabel = useMemo(() => {
    const type = CONTACT_TYPE_OPTIONS.find(
      (t) => t.value === formData.contactType
    );
    return type?.label || formData.contactType;
  }, [formData.contactType]);

  useEffect(() => {
    if (formData.sendEmail === undefined || formData.sendEmail === false) {
      onFormChange({ sendEmail: true });
    }
  }, []);

  const handleFileChange = (file: File | null) => {
    onFormChange({ file });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      handleFileChange(file);
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string, formatType = "dd/MM/yyy") => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), formatType);
    } catch {
      return dateString;
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

  const InfoCard = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <div className="flex items-start gap-2">
      <div className="text-blue-600 mt-0.5">{icon}</div>
      <div className="flex flex-col">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}</span>
      </div>
    </div>
  );

  const getDisputeLabels = (reasonCode: string, subreasonCode: string) => {
    const reason = disputes.find((d) => d.code === reasonCode);
    const reasonLabel = reason?.label || reasonCode;
    const subreasonLabel = reason?.submotivo.find((s) => s.code === subreasonCode)?.label || subreasonCode;
    return { reasonLabel, subreasonLabel };
  };

  const renderCaseDataFields = () => {
    if (!selectedConfig || !formData.caseData) return null;

    const fields = selectedConfig.fields;
    if (fields.length === 0) return null;

    console.log("Selected Config:", selectedConfig);
    console.log("Executive Comment:", selectedConfig.executive_comment);
    console.log("Case Data:", formData.caseData);

    if (selectedConfig.executive_comment === "DOCUMENT_IN_LITIGATION" &&
        formData.caseData?.litigationData?.litigations) {
      return (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <BookUser className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              {t("litigationsTitle")} ({formData.caseData.litigationData.litigations.length})
            </h3>
          </div>
          <div className="space-y-3">
            {formData.caseData.litigationData.litigations.map(
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
                      {t("litigationItem", { index: index + 1 })}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">{t("invoicesLabel")}</span>{" "}
                        <span className="font-medium">
                          {litigation.selectedInvoiceIds?.length || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">{t("amountLabel")}</span>{" "}
                        <span className="font-medium">
                          {formatCurrency(litigation.litigationAmount || 0)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">{t("reasonLabel")}</span>{" "}
                        <span className="font-medium">
                          {reasonLabel}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">{t("subreasonLabel")}</span>{" "}
                        <span className="font-medium">
                          {subreasonLabel}
                        </span>
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

    if (selectedConfig.executive_comment === "PAYMENT_PLAN_APPROVAL_REQUEST") {
      console.log("ENTRANDO AL CASO DE PAYMENT PLAN");
      console.log("Case Data:", formData.caseData);
      console.log("Payment Plan Data:", formData.caseData?.paymentPlanData);

      if (!formData.caseData?.paymentPlanData) {
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              {t("noPaymentPlanData")}
            </p>
          </div>
        );
      }

      const planData = formData.caseData.paymentPlanData;

      console.log("Plan Data:", planData);
      console.log("Full Case Data:", formData.caseData);
      const { PAYMENT_FREQUENCY, DEBTOR_PAYMENT_METHODS } = require("@/app/dashboard/data");

      const totalAmount = selectedInvoices.reduce((sum, inv) => {
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
              {t("paymentPlanSummary")}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">{t("configuration")}</h4>
                <div className="space-y-3">
                  <IconDescription
                    icon={<DollarSign className="w-5 h-5 text-blue-600" />}
                    description={t("totalPlacement")}
                    value={formatCurrency(totalAmount)}
                  />
                  <IconDescription
                    icon={<DollarSign className="w-5 h-5 text-blue-600" />}
                    description={t("downPayment", { percentage: downPaymentPercentage })}
                    value={formatCurrency(downPayment)}
                  />
                  <IconDescription
                    icon={<HashIcon className="w-5 h-5 text-blue-600" />}
                    description={t("numberOfInstallments")}
                    value={planData.numberOfInstallments?.toString() || "0"}
                  />
                  <IconDescription
                    icon={<FileText className="w-5 h-5 text-blue-600" />}
                    description={t("annualInterestRate")}
                    value={`${planData.annualInterestRate || 0}%`}
                  />
                  <IconDescription
                    icon={<Clock className="w-5 h-5 text-blue-600" />}
                    description={t("paymentFrequency")}
                    value={frequencyLabel}
                  />
                  <IconDescription
                    icon={<FileText className="w-5 h-5 text-blue-600" />}
                    description={t("paymentMethod")}
                    value={methodLabel}
                  />
                  <IconDescription
                    icon={<Calendar className="w-5 h-5 text-blue-600" />}
                    description={t("startDate")}
                    value={formatDate(planData.startDate)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-200">
                <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {t("financialSummary")}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-blue-300">
                    <span className="text-sm text-gray-700">{t("amountToFinance")}</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(amountToFinance)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">{t("installment", { frequency: frequencyLabel.toLowerCase() })}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(installment)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{t("totalInterest")}</span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatCurrency(totalInterest)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t-2 border-blue-400 bg-blue-200/50 -mx-6 px-6 py-3 -mb-6 mt-4 rounded-b-lg">
                    <span className="text-sm font-bold text-gray-800">{t("totalToPay")}</span>
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

    if (selectedConfig.executive_comment === "LITIGATION_NORMALIZATION" &&
        formData.caseData?.litigationData) {
      const normalizationData = formData.caseData.litigationData;
      const normalizationReason = require("@/app/dashboard/data").NORMALIZATION_REASONS.find(
        (r: any) => r.code === normalizationData.reason
      );

      const selectedInvoicesForNormalization = selectedInvoices.filter((inv) =>
        normalizationData.selectedInvoiceIds?.includes(inv.id)
      );

      return (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <BookUser className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              {t("litigationNormalization")}
            </h3>
          </div>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded p-3 bg-blue-50">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">{t("litigationsToNormalize")}</span>{" "}
                  <span className="font-bold text-blue-700">
                    {normalizationData.litigationIds?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">{t("totalLitigationAmount")}</span>{" "}
                  <span className="font-bold text-blue-700">
                    {formatCurrency(normalizationData.totalAmount || 0)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">{t("normalizationReason")}</span>{" "}
                  <span className="font-medium">
                    {normalizationReason?.label || normalizationData.reason}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">{t("commentLabel")}</span>{" "}
                  <span className="font-medium">
                    {normalizationData.comment || "-"}
                  </span>
                </div>
              </div>
            </div>

            {selectedInvoicesForNormalization.length > 0 && (
              <div className="border border-gray-200 rounded p-3">
                <p className="font-semibold text-xs mb-2 text-gray-700">
                  {t("selectedInvoices", { count: selectedInvoicesForNormalization.length })}
                </p>
                <div className="space-y-2">
                  {selectedInvoicesForNormalization.filter(invoice => invoice).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-xs border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <DocumentTypeBadge type={invoice.type} />
                        <span className="font-medium">{invoice.number || invoice.folio || "-"}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">
                          {t("balanceLabel")} <span className="font-medium text-gray-700">{formatCurrency(invoice.balance || 0)}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          {invoice.operation_date
                            ? format(new Date(invoice.operation_date), "dd/MM/yyyy")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    let icon = <FileText className="w-6 h-6 text-blue-600" />;

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
            const value = (formData.caseData as any)[field.name];

            if (field.type === "component") {
              return null;
            }

            if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
              return null;
            }

            let displayValue = value || "-";

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
    <div className="space-y-4">
      <TitleStep
        icon={<Eye className="w-6 h-6" />}
        title={t("preview")}
      />

      <div className="bg-blue-50 rounded-lg p-4 flex flex-col gap-5">
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">
            {t("debtorData")}
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
            <IconDescription
              icon={<HashIcon className="w-6 h-6 text-blue-600" />}
              description={t("documentLabel")}
              value={dataDebtor?.debtor_code || "-"}
            />
            <IconDescription
              icon={<FileText className="w-6 h-6 text-blue-600" />}
              description={t("businessName")}
              value={dataDebtor?.name || "-"}
            />
            <IconDescription
              icon={<FileText className="w-6 h-6 text-blue-600" />}
              description={t("contactLabel")}
              value={formData.selectedContact?.name || "-"}
            />
            {formData.contactType === "EMAIL" && (
              <IconDescription
                icon={<Mail className="w-6 h-6 text-blue-600" />}
                description={t("emailLabel")}
                value={formData.contactValue || "-"}
              />
            )}
            {formData.contactType === "PHONE" && (
              <IconDescription
                icon={<Phone className="w-6 h-6 text-blue-600" />}
                description={t("phoneLabel")}
                value={formData.contactValue || "-"}
              />
            )}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-sm text-gray-700 mb-2">
            {t("managementData")}
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
            <IconDescription
              icon={<Calendar className="w-6 h-6 text-blue-600" />}
              description={t("dateLabel")}
              value={formatDate(new Date().toISOString())}
            />
            <IconDescription
              icon={<Clock1 className="w-6 h-6 text-blue-600" />}
              description={t("timeLabel")}
              value={formatDate(new Date().toLocaleString(), "HH:mm") + " " + t("hours")}
            />
            <IconDescription
              icon={<User2 className="w-6 h-6 text-blue-600" />}
              description={t("analyst")}
              value={t("analystName")}
            />
          </div>
        </div>
      </div>

      {selectedInvoices.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-700" />
            <h3 className="font-semibold text-sm text-gray-700">
              {t("selectedInvoices", { count: selectedInvoices.length })}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">{t("docNumber")}</TableHead>
                  <TableHead className="text-xs">{t("type")}</TableHead>
                  <TableHead className="text-xs">{t("issueDate")}</TableHead>
                  <TableHead className="text-xs">{t("dueDate")}</TableHead>
                  <TableHead className="text-xs">{t("amount")}</TableHead>
                  <TableHead className="text-xs">{t("balance")}</TableHead>
                  <TableHead className="text-xs">{t("delay")}</TableHead>
                  <TableHead className="text-xs">{t("phase")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedInvoices.filter(invoice => invoice).map((invoice, index) => (
                  <TableRow key={invoice?.id || index}>
                    <TableCell className="text-xs font-medium">
                      {invoice?.number || invoice?.folio || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <DocumentTypeBadge type={invoice?.type} />
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(invoice?.issue_date)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatDate(invoice?.due_date)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {formatCurrency(invoice?.amount || 0)}
                    </TableCell>
                    <TableCell className="text-xs text-red-600 font-medium">
                      {formatCurrency(invoice?.balance || 0)}
                    </TableCell>
                    <TableCell className="text-xs">
                      {calculateDelay(invoice?.due_date)} {t("days")}
                    </TableCell>
                    <TableCell className="text-xs">
                      {Array.isArray(invoice?.phases) &&
                      invoice.phases.length > 0
                        ? ((invoice.phases[invoice.phases.length - 1] as any)
                            .phase ?? 0)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {selectedConfig && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 flex flex-col gap-3">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CogIcon className="w-4 h-4 text-gray-700" />
                <h3 className="font-semibold text-sm text-gray-700">{t("managementLabel")}</h3>
              </div>
              <div className="grid grid-cols-3 gap-5">
                <IconDescription
                  icon={<FileText className="w-6 h-6 text-blue-600" />}
                  description={t("managementType")}
                  value={t("outboundCall")}
                />{" "}
                <IconDescription
                  icon={<FileText className="w-6 h-6 text-blue-600" />}
                  description={t("debtorCommentLabel")}
                  value={selectedConfig.description}
                />
                <IconDescription
                  icon={<FileText className="w-6 h-6 text-blue-600" />}
                  description={t("executiveCommentLabel")}
                  value={selectedConfig.label}
                />
              </div>
              <div className="flex flex-col gap-2 mt-5">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-700" />
                  <h3 className="font-semibold text-sm text-gray-700">
                    {t("observation")}
                  </h3>
                </div>
                <p className="text-xs italic  text-gray-600">
                  {formData.observation.charAt(0).toUpperCase() +
                    formData.observation.slice(1)}
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-gray-700" />
                <h3 className="font-semibold text-sm text-gray-700">
                  {t("nextManagement")}
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-5">
                <IconDescription
                  icon={<Calendar className="w-6 h-6 text-blue-600" />}
                  description={t("dateLabel")}
                  value={formatDate(formData.nextManagementDate as any)}
                />{" "}
                <IconDescription
                  icon={<Clock1 className="w-6 h-6 text-blue-600" />}
                  description={t("timeLabel")}
                  value={formatTime(formData.nextManagementTime) + " " + t("hours")}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {renderCaseDataFields()}

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? "border-orange-400 bg-orange-50"
              : "border-gray-300 bg-gray-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            {t("uploadDescription")}
          </p>
          <label className="inline-block">
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && isValidFile(file)) {
                  handleFileChange(file);
                }
              }}
            />
            <span className="px-4 py-2 bg-white border-2 border-orange-400 text-orange-600 rounded-md cursor-pointer hover:bg-orange-50 transition-colors inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {t("uploadFile")}
            </span>
          </label>
          {formData.file && (
            <p className="text-sm text-green-600 mt-2">
              {t("fileSelected", { name: formData.file.name })}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <Label htmlFor="comment" className="text-sm font-semibold mb-2 block">
          {t("additionalComment")}
        </Label>
        <Textarea
          id="comment"
          placeholder={t("commentPlaceholder")}
          value={formData.comment || ""}
          onChange={(e) => onFormChange({ comment: e.target.value })}
          className="min-h-[120px] resize-none"
        />
      </div>

      <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
        <Checkbox
          id="sendEmail"
          checked={formData.sendEmail || false}
          onCheckedChange={(checked) =>
            onFormChange({ sendEmail: checked as boolean })
          }
        />
        <label
          htmlFor="sendEmail"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          <Mail className="w-4 h-4 inline mr-1" />
          {t("sendEmailLabel")}
        </label>
      </div>
    </div>
  );
};

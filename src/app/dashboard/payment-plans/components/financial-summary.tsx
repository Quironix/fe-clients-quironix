"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProfileContext } from "@/context/ProfileContext";
import { DollarSign, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPaymentPlan } from "../services";
import { CreatePaymentPlanRequest } from "../types";
import type { PaymentPlanConfig } from "./payment-plan-config-form";

interface Invoice {
  id: string;
  amount: number;
}

interface FinancialSummaryProps {
  selectedDebtor?: any;
  selectedInvoices?: Invoice[];
  paymentConfig?: PaymentPlanConfig;
  onViewDetails?: () => void;
  onReset?: () => void;
}

export default function FinancialSummary({
  selectedDebtor,
  selectedInvoices = [],
  paymentConfig,
  onViewDetails,
  onReset,
}: FinancialSummaryProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const t = useTranslations("paymentPlans.financialSummary");

  const getFrequencyFactor = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return 52;
      case "monthly":
        return 12;
      case "quarterly":
        return 4;
      case "semiannual":
        return 2;
      default:
        return 12;
    }
  };

  const getFrequencyName = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return t("frequencyWeekly");
      case "monthly":
        return t("frequencyMonthly");
      case "quarterly":
        return t("frequencyQuarterly");
      case "semiannual":
        return t("frequencySemiannual");
      default:
        return t("frequencyMonthly");
    }
  };

  const calculateFinancialMetrics = () => {
    if (!paymentConfig) {
      return {
        totalInvoices: 0,
        downPayment: 0,
        principalAmount: 0,
        numberOfInstallments: 0,
        installmentAmount: 0,
        totalToPay: 0,
        totalInterest: 0,
        ctc: 0,
        effectiveRate: 0,
        paymentFrequency: "monthly",
        frequencyName: t("frequencyMonthly"),
      };
    }

    const totalInvoices = selectedInvoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0
    );
    const downPayment = paymentConfig.downPayment || 0;
    const principalAmount = totalInvoices - downPayment;
    const numberOfInstallments = paymentConfig.numberOfInstallments || 1;
    const annualInterestRate = paymentConfig.annualInterestRate || 0;
    const paymentFrequency = paymentConfig.paymentFrequency || "monthly";
    const frequencyName = getFrequencyName(paymentFrequency);
    const frequencyFactor = getFrequencyFactor(paymentFrequency);
    const nominalPeriodRate = annualInterestRate / 100 / frequencyFactor;

    let installmentAmount = 0;

    if (principalAmount <= 0) {
      installmentAmount = 0;
    } else if (nominalPeriodRate === 0) {
      installmentAmount = principalAmount / numberOfInstallments;
    } else {
      const ratePower = Math.pow(1 + nominalPeriodRate, numberOfInstallments);
      installmentAmount =
        (principalAmount * (nominalPeriodRate * ratePower)) / (ratePower - 1);
    }

    const totalInstallments = installmentAmount * numberOfInstallments;
    const totalToPay = totalInstallments;
    const totalInterest = totalInstallments - principalAmount;
    const ctc = totalInterest;

    let effectiveRate = 0;
    if (nominalPeriodRate > 0) {
      effectiveRate =
        (Math.pow(1 + nominalPeriodRate, frequencyFactor) - 1) * 100;
    }

    return {
      totalInvoices,
      downPayment,
      principalAmount,
      numberOfInstallments,
      installmentAmount,
      totalToPay,
      totalInterest,
      ctc,
      effectiveRate,
      paymentFrequency,
      frequencyName,
      loanToValue:
        totalInvoices > 0 ? (principalAmount / totalInvoices) * 100 : 0,
      downPaymentRatio:
        totalInvoices > 0 ? (downPayment / totalInvoices) * 100 : 0,
    };
  };

  const metrics = calculateFinancialMetrics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, decimals: number = 2) => {
    return `${value.toFixed(decimals)}%`;
  };

  const calculatePaymentEndDate = (
    startDate: Date,
    numberOfInstallments: number,
    frequency: string
  ) => {
    const endDate = new Date(startDate);

    switch (frequency) {
      case "weekly":
        endDate.setDate(endDate.getDate() + numberOfInstallments * 7);
        break;
      case "biweekly":
        endDate.setDate(endDate.getDate() + numberOfInstallments * 15);
        break;
      case "monthly":
        endDate.setMonth(endDate.getMonth() + numberOfInstallments);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + numberOfInstallments * 3);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + numberOfInstallments);
    }

    return endDate;
  };

  const handleSubmit = async () => {
    if (!selectedDebtor?.id || !paymentConfig?.startDate) {
      return;
    }

    const paymentEndDate = calculatePaymentEndDate(
      paymentConfig.startDate,
      metrics.numberOfInstallments,
      metrics.paymentFrequency
    );

    const planData: CreatePaymentPlanRequest = {
      debtor_id: selectedDebtor.id,
      total_debt: Math.round(metrics.totalInvoices),
      installment_amount: Math.round(metrics.installmentAmount),
      payment_start_date: paymentConfig.startDate.toISOString(),
      payment_end_date: paymentEndDate.toISOString(),
      invoice_ids: selectedInvoices.map((invoice) => invoice.id),
      debt_concept:
        paymentConfig.comments || t("defaultConcept"),
      total_plan_amount: Math.round(metrics.totalToPay),
      initial_payment: Math.round(metrics.downPayment),
      number_of_installments: metrics.numberOfInstallments,
      payment_frequency: metrics.paymentFrequency,
      annual_interest_rate: paymentConfig.annualInterestRate || 0,
      payment_method: paymentConfig.paymentMethod,
      plan_start_date: paymentConfig.startDate.toISOString(),
    };

    try {
      const response = await createPaymentPlan(
        session.token,
        profile.client_id,
        planData
      );
      if (response.success) {
        toast.success(t("createSuccess"));
        if (onReset) {
          onReset();
        }
      } else {
        toast.error(t("createError"));
      }
    } catch (error) {
      console.error("Error creating payment plan:", error);
    } finally {
      router.push("/dashboard/payment-plans");
    }
  };

  if (!selectedDebtor?.id) {
    return (
      <div className="col-span-4 space-y-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">{t("title")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                {t("selectDebtorMessage")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full bg-gray-400 hover:bg-gray-500 text-white"
          disabled
        >
          {t("submitPlan")}
        </Button>
      </div>
    );
  }

  return (
    <div className="col-span-4 space-y-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">{t("title")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 pl-5">
                {t("totalPlacement")}
              </span>
              <span className="text-sm font-semibold pr-5">
                {formatCurrency(metrics.totalInvoices)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 pl-5">
                {t("cashPayment", { percentage: formatPercentage(metrics.downPaymentRatio, 1) })}
              </span>
              <span className="text-sm font-semibold pr-5">
                {formatCurrency(metrics.downPayment)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 pl-5">
                {t("financingAmount")}
              </span>
              <span className="text-sm font-semibold pr-5">
                {formatCurrency(metrics.principalAmount)}
              </span>
            </div>

            <Separator color="bg-blue-600" />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 pl-5">
                {t("installment", { frequency: metrics.frequencyName })}
              </span>
              <span className="text-lg font-bold pr-5">
                {formatCurrency(metrics.installmentAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 pl-5">
                {t("totalInterest")}
              </span>
              <span className="text-sm font-semibold pr-5">
                {formatCurrency(metrics.totalInterest)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-blue-100 py-2 px-5 rounded-md">
              <span className="text-sm font-medium text-gray-600">
                {t("totalToPay")}
              </span>
              <span className="text-lg font-bold">
                {formatCurrency(metrics.totalToPay)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        size="lg"
        className={`w-full ${
          selectedInvoices.length > 0 && metrics.principalAmount > 0
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-400 hover:bg-gray-500 text-white"
        }`}
        disabled={selectedInvoices.length === 0 || metrics.principalAmount <= 0}
        onClick={handleSubmit}
      >
        <Send className="h-5 w-5" />
        {t("generatePlan")}
      </Button>
    </div>
  );
}

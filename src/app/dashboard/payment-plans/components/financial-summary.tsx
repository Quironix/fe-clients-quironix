"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProfileContext } from "@/context/ProfileContext";
import { DollarSign, Send } from "lucide-react";
import { useSession } from "next-auth/react";
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
  // Función para obtener el factor de frecuencia (períodos por año)
  const getFrequencyFactor = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return 52; // 52 semanas por año
      case "monthly":
        return 12; // 12 meses por año
      case "quarterly":
        return 4; // 4 trimestres por año
      case "semiannual":
        return 2; // 2 semestres por año
      default:
        return 12; // Por defecto mensual
    }
  };

  // Función para obtener el nombre de la frecuencia
  const getFrequencyName = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return "semanal";
      case "monthly":
        return "mensual";
      case "quarterly":
        return "trimestral";
      case "semiannual":
        return "semestral";
      default:
        return "mensual";
    }
  };

  // Cálculos financieros profesionales
  const calculateFinancialMetrics = () => {
    // Validación de datos básicos
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
        frequencyName: "mensual",
      };
    }

    // 1. Valores base del financiamiento
    const totalInvoices = selectedInvoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0
    );
    const downPayment = paymentConfig.downPayment || 0;
    const principalAmount = totalInvoices - downPayment; // Capital a financiar

    // 2. Parámetros del préstamo
    const numberOfInstallments = paymentConfig.numberOfInstallments || 1;
    const annualInterestRate = paymentConfig.annualInterestRate || 0;
    const paymentFrequency = paymentConfig.paymentFrequency || "monthly";
    const frequencyName = getFrequencyName(paymentFrequency);

    // 3. Cálculo de tasas
    const frequencyFactor = getFrequencyFactor(paymentFrequency);
    const nominalPeriodRate = annualInterestRate / 100 / frequencyFactor; // Tasa nominal por período

    // 4. Cálculo de cuota usando fórmula PMT (Payment)
    let installmentAmount = 0;

    if (principalAmount <= 0) {
      // No hay nada que financiar
      installmentAmount = 0;
    } else if (nominalPeriodRate === 0) {
      // Sin intereses (tasa 0%)
      installmentAmount = principalAmount / numberOfInstallments;
    } else {
      // Con intereses - Fórmula PMT estándar bancaria
      const ratePower = Math.pow(1 + nominalPeriodRate, numberOfInstallments);
      installmentAmount =
        (principalAmount * (nominalPeriodRate * ratePower)) / (ratePower - 1);
    }

    // 5. Cálculos derivados
    const totalInstallments = installmentAmount * numberOfInstallments;
    const totalToPay = totalInstallments; // Solo las cuotas, el pie ya está pagado
    const totalInterest = totalInstallments - principalAmount; // Intereses totales pagados
    const ctc = totalInterest; // Costo Total del Crédito = solo los intereses

    // 6. Tasa efectiva anual (TEA)
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
      // Métricas adicionales
      loanToValue:
        totalInvoices > 0 ? (principalAmount / totalInvoices) * 100 : 0, // LTV%
      downPaymentRatio:
        totalInvoices > 0 ? (downPayment / totalInvoices) * 100 : 0, // % pie
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

  // Función para calcular fecha de fin de pagos
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

  // Función para manejar el envío del plan de pago
  const handleSubmit = async () => {
    // Validar que tenemos todos los datos necesarios
    if (!selectedDebtor?.id || !paymentConfig?.startDate) {
      console.error("Faltan datos requeridos para crear el plan de pago");
      return;
    }

    // Calcular fecha de fin de pagos
    const paymentEndDate = calculatePaymentEndDate(
      paymentConfig.startDate,
      metrics.numberOfInstallments,
      metrics.paymentFrequency
    );

    // Preparar el payload según la estructura del API
    const planData: CreatePaymentPlanRequest = {
      debtor_id: selectedDebtor.id,
      total_debt: Math.round(metrics.totalInvoices),
      installment_amount: Math.round(metrics.installmentAmount),
      payment_start_date: paymentConfig.startDate.toISOString(),
      payment_end_date: paymentEndDate.toISOString(),
      invoice_ids: selectedInvoices.map((invoice) => invoice.id),
      debt_concept:
        paymentConfig.comments || "Plan de pago para facturas seleccionadas",
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
        toast.success("Plan de pago creado correctamente");
        // Llamar a la función de reset para limpiar las métricas
        if (onReset) {
          onReset();
        }
      } else {
        toast.error("Error al crear el plan de pago");
      }
    } catch (error) {
      console.error("Error al crear el plan de pago:", error);
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
              <CardTitle className="text-lg">Resumen financiero</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                Selecciona un deudor para ver el resumen financiero
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full bg-gray-400 hover:bg-gray-500 text-white"
          disabled
        >
          Enviar plan de pago
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
            <CardTitle className="text-lg">Resumen financiero</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cálculos Financieros */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 pl-5">
                Colocación total:
              </span>
              <span className="text-sm font-semibold pr-5">
                {formatCurrency(metrics.totalInvoices)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 pl-5">
                Pago contado ({formatPercentage(metrics.downPaymentRatio, 1)}):
              </span>
              <span className="text-sm font-semibold pr-5">
                {formatCurrency(metrics.downPayment)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 pl-5">
                Capital a financiar:
              </span>
              <span className="text-sm font-semibold pr-5">
                {formatCurrency(metrics.principalAmount)}
              </span>
            </div>

            <Separator color="bg-blue-600" />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 pl-5">
                Cuota {metrics.frequencyName}:
              </span>
              <span className="text-lg font-bold pr-5">
                {formatCurrency(metrics.installmentAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 pl-5">
                Total intereses:
              </span>
              <span className="text-sm font-semibold pr-5">
                {formatCurrency(metrics.totalInterest)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-blue-100 py-2 px-5 rounded-md">
              <span className="text-sm font-medium text-gray-600">
                Total a pagar:
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
        Generar plan de pago
      </Button>
    </div>
  );
}

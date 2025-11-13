import { CreatePaymentPlanRequest } from "@/app/dashboard/payment-plans/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Obtiene el factor de frecuencia para convertir tasa anual a tasa por período
 */
function getFrequencyFactor(frequency: string): number {
  switch (frequency) {
    case "FREQ_7_DAYS":
      return 52; // Semanal
    case "FREQ_15_DAYS":
      return 24; // Quincenal
    case "FREQ_30_DAYS":
      return 12; // Mensual
    case "FREQ_45_DAYS":
      return 4; // Trimestral
    case "FREQ_60_DAYS":
      return 2; // Semestral
    default:
      return 12; // Default mensual
  }
}

/**
 * Calcula el monto de la cuota usando la fórmula de amortización
 */
function calculateInstallmentAmount(
  principal: number,
  annualInterestRate: number,
  numberOfInstallments: number,
  paymentFrequency: string
): number {
  if (principal <= 0) return 0;
  if (annualInterestRate === 0) {
    return Math.round(principal / numberOfInstallments);
  }

  const frequencyFactor = getFrequencyFactor(paymentFrequency);
  const periodRate = annualInterestRate / 100 / frequencyFactor;

  const installment =
    (principal *
      periodRate *
      Math.pow(1 + periodRate, numberOfInstallments)) /
    (Math.pow(1 + periodRate, numberOfInstallments) - 1);

  return Math.round(installment);
}

/**
 * Calcula la fecha de finalización del plan basado en la frecuencia y número de cuotas
 */
function calculateEndDate(
  startDate: Date,
  numberOfInstallments: number,
  paymentFrequency: string
): string {
  const result = new Date(startDate);

  switch (paymentFrequency) {
    case "FREQ_7_DAYS":
      result.setDate(result.getDate() + numberOfInstallments * 7);
      break;
    case "FREQ_15_DAYS":
      result.setDate(result.getDate() + numberOfInstallments * 15);
      break;
    case "FREQ_30_DAYS":
      result.setMonth(result.getMonth() + numberOfInstallments);
      break;
    case "FREQ_45_DAYS":
      result.setDate(result.getDate() + numberOfInstallments * 45);
      break;
    case "FREQ_60_DAYS":
      result.setMonth(result.getMonth() + numberOfInstallments * 2);
      break;
    default:
      result.setMonth(result.getMonth() + numberOfInstallments);
  }

  return formatToISO(result);
}

/**
 * Formatea una fecha a ISO 8601 (YYYY-MM-DD)
 */
function formatToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function createPaymentPlan({
  accessToken,
  clientId,
  dataToInsert,
}: {
  accessToken: string;
  clientId: string;
  dataToInsert: any;
}): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const totalDebt = Math.round(dataToInsert.totalAmount || 0);

    if (totalDebt === 0) {
      throw new Error("El monto total de la deuda debe ser mayor a 0");
    }

    const principal = totalDebt - (dataToInsert.downPayment || 0);

    if (principal < 0) {
      throw new Error("El pago inicial no puede ser mayor al monto total");
    }

    const installmentAmount = calculateInstallmentAmount(
      principal,
      dataToInsert.annualInterestRate,
      dataToInsert.numberOfInstallments,
      dataToInsert.paymentFrequency
    );

    const totalPlanAmount = Math.round(
      installmentAmount * dataToInsert.numberOfInstallments +
        (dataToInsert.downPayment || 0)
    );

    const planStartDate = formatToISO(new Date(dataToInsert.startDate));
    const paymentStartDate = planStartDate;
    const paymentEndDate = calculateEndDate(
      new Date(dataToInsert.startDate),
      dataToInsert.numberOfInstallments,
      dataToInsert.paymentFrequency
    );

    const invoiceIds = Array.isArray(dataToInsert.selectedInvoices)
      ? dataToInsert.selectedInvoices.filter((id: string) => id && typeof id === 'string')
      : [];

    if (invoiceIds.length === 0) {
      throw new Error("Debe seleccionar al menos una factura válida");
    }

    const payload: CreatePaymentPlanRequest = {
      debtor_id: dataToInsert.debtorId,
      total_debt: totalDebt,
      installment_amount: Math.round(installmentAmount),
      payment_start_date: paymentStartDate,
      payment_end_date: paymentEndDate,
      invoice_ids: invoiceIds,
      debt_concept: "Plan de pago desde gestión de deudor",
      total_plan_amount: totalPlanAmount,
      initial_payment: Math.round(dataToInsert.downPayment || 0),
      number_of_installments: dataToInsert.numberOfInstallments,
      payment_frequency: dataToInsert.paymentFrequency,
      annual_interest_rate: dataToInsert.annualInterestRate,
      payment_method: dataToInsert.paymentMethod,
      plan_start_date: planStartDate,
    };

    console.log("Payment Plan Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/payment-plans`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Payment Plan Error Response:", errorData);
      return {
        success: false,
        message: Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || "Error al crear plan de pago",
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error creating payment plan:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error de red al crear plan de pago",
    };
  }
}

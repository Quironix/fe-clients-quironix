import * as z from "zod";

const baseFieldsSchema = {
  downPayment: z.number().min(0, "Debe ser mayor o igual a 0"),
  numberOfInstallments: z.number().min(1, "Debe ser al menos 1"),
  annualInterestRate: z.number().min(0, "Debe ser mayor o igual a 0"),
  paymentMethod: z.string().min(1, "La forma de pago es requerida"),
  paymentFrequency: z.string().min(1, "La frecuencia es requerida"),
  startDate: z.date({ message: "La fecha es requerida" }),
};

export const createPaymentPlanSchema = (totalInvoicesAmount: number) =>
  z.object({
    ...baseFieldsSchema,
    committedAmount: z
      .number()
      .min(1, "El monto debe ser mayor a 0")
      .max(
        totalInvoicesAmount || Number.MAX_SAFE_INTEGER,
        "El monto no puede superar el total de las facturas seleccionadas"
      ),
  });

export type PaymentPlanFormData = z.infer<ReturnType<typeof createPaymentPlanSchema>>;

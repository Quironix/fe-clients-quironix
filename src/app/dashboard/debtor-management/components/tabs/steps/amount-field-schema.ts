import * as z from "zod";

export const createAmountFieldSchema = (
  totalizeSelectedInvoices: number,
  requiredMessage: string,
  maxMessage: string
) =>
  z.coerce
    .number()
    .min(1, requiredMessage)
    .max(totalizeSelectedInvoices || Number.MAX_SAFE_INTEGER, maxMessage);

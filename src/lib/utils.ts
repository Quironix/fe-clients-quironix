import { clsx, type ClassValue } from "clsx";
import { addDays, addMonths, addWeeks, isValid, parse } from "date-fns";
import { format, getTimezoneOffset } from "date-fns-tz";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  if (!date) return "";

  // Intentar parsear diferentes formatos de fecha
  let inputDate: Date;

  // Formato dd-MM-yyyy (ej: 19-11-2018)
  if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    inputDate = parse(date, "dd-MM-yyyy", new Date());
  }
  // Formato dd/MM/yyyy (ej: 19/11/2018)
  else if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    inputDate = parse(date, "dd/MM/yyyy", new Date());
  }
  // Formato ISO o otros formatos que JavaScript reconoce
  else {
    inputDate = new Date(date);
  }

  // Validar que la fecha parseada sea válida
  if (!isValid(inputDate)) {
    console.error("Fecha inválida:", date);
    return "";
  }

  // Obtener el offset actual de Chile
  const now = new Date();
  const currentOffset = getTimezoneOffset("America/Santiago", now);

  // Aplicar el offset actual (no el histórico)
  const adjustedDate = new Date(inputDate.getTime() - currentOffset);

  // Validar que la fecha ajustada sea válida
  if (isNaN(adjustedDate.getTime())) {
    console.error("Fecha ajustada inválida:", {
      input: date,
      inputDate: inputDate.toString(),
      currentOffset,
      adjustedTime: inputDate.getTime() - currentOffset,
    });
    return "";
  }

  // Formatear con locale español pero sin zona horaria
  const formattedDate = format(adjustedDate, "dd-MM-yyyy", {
    locale: es,
  });

  return formattedDate;
}

export function formatDateTime(date: string) {
  return format(new Date(date), "dd-MM-yyyy HH:mm", {
    timeZone: "America/Santiago",
    locale: es,
  });
}

// Función helper para convertir fechas a ISO String
export function toISOString(date: string | Date | null | undefined): string {
  if (!date) return "";

  let parsedDate: Date;

  if (date instanceof Date) {
    parsedDate = date;
  } else {
    // Si es string, usar la misma lógica de formatDate para parsear
    if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
      parsedDate = parse(date, "dd-MM-yyyy", new Date());
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      parsedDate = parse(date, "dd/MM/yyyy", new Date());
    } else {
      parsedDate = new Date(date);
    }
  }

  // Validar que la fecha sea válida
  if (!isValid(parsedDate)) {
    console.error("Fecha inválida para convertir a ISO:", date);
    return "";
  }

  return parsedDate.toISOString();
}

export function formatNumber(
  numero: number,
  isCurrency: boolean = true
): string {
  if (typeof numero !== "number" || isNaN(numero)) {
    return "0";
  }
  return (
    (isCurrency ? "$" : "") +
    new Intl.NumberFormat("es-CL").format(Math.round(numero))
  );
}

/**
 * Calcula las cuotas pendientes de pago basándose en las fechas de inicio, fin y número de cuotas
 * @param paymentStartDate - Fecha de inicio de pagos (formato ISO o dd-MM-yyyy o dd/MM/yyyy)
 * @param paymentEndDate - Fecha de fin de pagos (formato ISO o dd-MM-yyyy o dd/MM/yyyy)
 * @param numberOfInstallments - Número total de cuotas
 * @param paymentFrequency - Frecuencia de pago (MONTHLY, WEEKLY, etc.)
 * @returns Array de strings con las cuotas pendientes en formato "Cuota X/Y (DD/MM/AAAA)"
 */
export function getPendingInstallments(
  paymentStartDate: string,
  paymentEndDate: string,
  numberOfInstallments: number,
  paymentFrequency: string = "MONTHLY"
): string[] {
  if (!paymentStartDate || !paymentEndDate || !numberOfInstallments) {
    return [];
  }

  // Parsear fechas de inicio y fin
  let startDate: Date;
  let endDate: Date;

  // Función helper para parsear fechas usando la misma lógica que formatDate
  const parseDate = (dateStr: string): Date => {
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      return parse(dateStr, "dd-MM-yyyy", new Date());
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return parse(dateStr, "dd/MM/yyyy", new Date());
    } else {
      return new Date(dateStr);
    }
  };

  try {
    startDate = parseDate(paymentStartDate);
    endDate = parseDate(paymentEndDate);

    if (!isValid(startDate) || !isValid(endDate)) {
      console.error("Fechas inválidas:", { paymentStartDate, paymentEndDate });
      return [];
    }
  } catch (error) {
    console.error("Error parseando fechas:", error);
    return [];
  }

  // Fecha actual
  const currentDate = new Date();

  // Calcular el intervalo entre cuotas basado en la frecuencia
  const getNextPaymentDate = (
    currentPaymentDate: Date,
    frequency: string
  ): Date => {
    switch (frequency) {
      case "WEEKLY":
      case "FREQ_7_DAYS":
        return addWeeks(currentPaymentDate, 1);
      case "BIWEEKLY":
      case "FREQ_15_DAYS":
        return addDays(currentPaymentDate, 15);
      case "MONTHLY":
      case "FREQ_30_DAYS":
        return addMonths(currentPaymentDate, 1);
      case "FREQ_60_DAYS":
        return addDays(currentPaymentDate, 60);
      case "FREQ_90_DAYS":
      case "QUARTERLY":
        return addDays(currentPaymentDate, 90);
      default:
        return addMonths(currentPaymentDate, 1); // Default mensual
    }
  };

  // Generar todas las fechas de cuotas
  const installmentDates: Date[] = [];
  let currentPaymentDate = startDate;

  for (let i = 0; i < numberOfInstallments; i++) {
    installmentDates.push(new Date(currentPaymentDate));
    currentPaymentDate = getNextPaymentDate(
      currentPaymentDate,
      paymentFrequency
    );
  }

  // Filtrar solo las cuotas pendientes (futuras o del día actual)
  const pendingInstallments: string[] = [];

  installmentDates.forEach((installmentDate, index) => {
    // Comparar solo la fecha (sin hora) para incluir cuotas del día actual
    const installmentDateOnly = new Date(
      installmentDate.getFullYear(),
      installmentDate.getMonth(),
      installmentDate.getDate()
    );
    const currentDateOnly = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    if (installmentDateOnly >= currentDateOnly) {
      const installmentNumber = index + 1;
      const formattedDate = format(installmentDate, "dd/MM/yyyy", {
        locale: es,
      });
      pendingInstallments.push(
        `Cuota ${installmentNumber}/${numberOfInstallments} (${formattedDate})`
      );
    }
  });

  return pendingInstallments;
}

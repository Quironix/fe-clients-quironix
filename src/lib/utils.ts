import { clsx, type ClassValue } from "clsx";
import { isValid, parse } from "date-fns";
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

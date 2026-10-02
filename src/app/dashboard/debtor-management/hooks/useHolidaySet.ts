import { useEffect, useState } from "react";
import { getHolidays } from "../services/business-days";

export function useHolidaySet(
  accessToken?: string,
  clientId?: string
): Set<string> {
  const [holidaySet, setHolidaySet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!accessToken || !clientId) return;

    const currentYear = new Date().getFullYear();

    Promise.all([
      getHolidays(accessToken, clientId, currentYear),
      getHolidays(accessToken, clientId, currentYear + 1),
    ])
      .then(([currentYearHolidays, nextYearHolidays]) => {
        setHolidaySet(
          new Set([
            ...currentYearHolidays.holidays,
            ...nextYearHolidays.holidays,
          ])
        );
      })
      .catch((error) => {
        console.error("Error al obtener feriados:", error);
      });
  }, [accessToken, clientId]);

  return holidaySet;
}

export interface Phase {
  id: string;
  phase: number;
  is_current: boolean;
}

export interface InvoiceData {
  invoice_id: string;
  invoice_number: string;
  document_type: string;
  due_date: string;
  estimated_amount: number;
  collected_amount: number;
  commitment_status: string;
  phases: Phase[];
}

export interface DailyProjection {
  date: string;
  invoices_data: InvoiceData[];
}

export interface WeeklyProjection {
  week_number: number;
  week_start: string;
  week_end: string;
  total_weekly_estimated: number;
  total_weekly_collected: number;
  daily_projections: DailyProjection[];
}

export interface DebtorRow {
  id: string;
  name: string;
  debtor_code: string;
  overdue_debt: number;
  period_debt: number;
  weekly_projections: WeeklyProjection[];
}

export interface AllDebtorsData {
  data: DebtorRow[];
  pagination: { totalPages: number };
  total_projection_period: number;
  total_real_period: number;
}

export interface ReportsByDebtorData {
  weekly_projections: WeeklyProjection[];
  total_monthly_estimated: number;
  total_monthly_collected: number;
  overdue_debt: number;
  period_debt: number;
  debtor_id: string;
  month: string;
  year: number;
}

export interface IndicatorsPayload {
  total_projection: number;
  collected: number;
  variation: number;
  critical_cases: number;
  metadata: {
    period_days: number;
  };
}

export interface IndicatorsData {
  data: IndicatorsPayload;
}

export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export const getIndicators = async (
  accessToken: string,
  clientId: string
): Promise<ServiceResponse<IndicatorsData>> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reports/dashboard/indicators`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al obtener los indicadores",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Indicadores obtenidos correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al obtener los indicadores:", error);
    return {
      success: false,
      message: "Error al obtener los indicadores",
      data: null,
    };
  }
};

export const getAllDebtors = async (
  accessToken: string,
  clientId: string,
  search?: string | null,
  period_month?: string | null,
  page?: number,
  limit?: number
): Promise<ServiceResponse<AllDebtorsData>> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const queryParams = new URLSearchParams();

    if (search) {
      queryParams.append("search", search);
    }

    if (period_month) {
      queryParams.append("period_month", period_month);
    }

    if (page) {
      queryParams.append("page", page.toString());
    }

    if (limit) {
      queryParams.append("limit", limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `${API_URL}/v2/clients/${clientId}/reports/dashboard/debtors${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al obtener los deudores",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Deudores obtenidos correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al obtener los deudores:", error);
    return {
      success: false,
      message: "Error al obtener los deudores",
      data: null,
    };
  }
};

export const getReportsByDebtor = async (
  accessToken: string,
  clientId: string,
  debtorId: string,
  periodMonth?: string | null
): Promise<ServiceResponse<ReportsByDebtorData>> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const queryParams = new URLSearchParams();
    if (periodMonth) {
      queryParams.append("period_month", periodMonth.replace("/", "-"));
    }
    const queryString = queryParams.toString();
    const url = `${API_URL}/v2/clients/${clientId}/reports/payment-projection/${debtorId}/monthly${queryString ? `?${queryString}` : ""}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message:
          errorData?.message || "Error al obtener los reportes mensuales",
        data: null,
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: "Reportes mensuales obtenidos correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al obtener los reportes mensuales:", error);
    return {
      success: false,
      message: "Error al obtener los reportes mensuales",
      data: null,
    };
  }
};

export const changeInvoices = async (
  accessToken: string,
  clientId: string,
  debtorCode: string,
  moves: Array<{
    targetDate: string;
    invoices: string[];
  }>
): Promise<ServiceResponse<Record<string, unknown>>> => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/reports/payment-projections/${debtorCode}/invoices`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ moves }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message:
          errorData?.message || "Error al cambiar las facturas de semana",
        data: null,
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: "Facturas cambiadas de semana correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al cambiar las facturas de semana:", error);
    return {
      success: false,
      message: "Error al cambiar las facturas de semana",
      data: null,
    };
  }
};

import {
  ApiResponse,
  ApprovePaymentPlanRequest,
  CreatePaymentPlanRequest,
  PaginatedPaymentPlansResponse,
  PaginationParams,
  PaymentPlan,
  RejectPaymentPlanRequest,
  UpdatePaymentPlanRequest,
} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createPaymentPlan = async (
  accessToken: string,
  clientId: string,
  paymentPlanData: CreatePaymentPlanRequest
): Promise<ApiResponse<PaymentPlan>> => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/payment-plans`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPlanData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al crear el plan de pago",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Plan de pago creado correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al crear plan de pago:", error);
    return {
      success: false,
      message: "Error al crear el plan de pago",
      data: null,
    };
  }
};

export const getPaymentPlans = async (
  accessToken: string,
  clientId: string,
  params?: PaginationParams
): Promise<PaginatedPaymentPlansResponse> => {
  try {
    // Construir parámetros de consulta dinámicamente
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    if (params?.search) {
      queryParams.append("search", params.search);
    }

    if (params?.status) {
      const status =
        params.status === "OTHERS"
          ? "APPROVED,REJECTED,OBJECTED"
          : params.status;
      queryParams.append("status", status);
    }

    const queryString = queryParams.toString();
    const url = `${API_URL}/v2/clients/${clientId}/payment-plans${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al obtener los planes de pago",
        data: null,
      };
    }

    const data = await response.json();

    // Si la respuesta tiene paginación, la incluimos
    if (data.pagination) {
      return {
        success: true,
        message: "Planes de pago obtenidos correctamente",
        data: data.data || data,
        pagination: data.pagination,
      };
    }

    return {
      success: true,
      message: "Planes de pago obtenidos correctamente",
      data: Array.isArray(data) ? data : data.data || [],
    };
  } catch (error) {
    console.error("Error al obtener planes de pago:", error);
    return {
      success: false,
      message: "Error al obtener los planes de pago",
      data: null,
    };
  }
};

export const updatePaymentPlan = async (
  accessToken: string,
  clientId: string,
  paymentPlanId: string,
  updateData: UpdatePaymentPlanRequest
): Promise<ApiResponse<PaymentPlan>> => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/payment-plans/${paymentPlanId}/object`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al actualizar el plan de pago",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Plan de pago actualizado correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al actualizar plan de pago:", error);
    return {
      success: false,
      message: "Error al actualizar el plan de pago",
      data: null,
    };
  }
};

export const deletePaymentPlan = async (
  accessToken: string,
  clientId: string,
  paymentPlanId: string
): Promise<ApiResponse<PaymentPlan>> => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/payment-plans/${paymentPlanId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al eliminar el plan de pago",
        data: null,
      };
    }

    // Para DELETE, la respuesta puede ser vacía o contener datos mínimos
    let data = null;
    try {
      data = await response.json();
    } catch {
      // Si no hay contenido en la respuesta, es normal para DELETE
      data = { id: paymentPlanId };
    }

    return {
      success: true,
      message: "Plan de pago eliminado correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al eliminar plan de pago:", error);
    return {
      success: false,
      message: "Error al eliminar el plan de pago",
      data: null,
    };
  }
};

export const approvePaymentPlan = async (
  accessToken: string,
  clientId: string,
  paymentPlanId: string,
  approvalData: ApprovePaymentPlanRequest = {}
): Promise<ApiResponse<PaymentPlan>> => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/payment-plans/${paymentPlanId}/approve`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(approvalData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al aprobar el plan de pago",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Plan de pago aprobado correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al aprobar plan de pago:", error);
    return {
      success: false,
      message: "Error al aprobar el plan de pago",
      data: null,
    };
  }
};

export const rejectPaymentPlan = async (
  accessToken: string,
  clientId: string,
  paymentPlanId: string,
  rejectionData: RejectPaymentPlanRequest
): Promise<ApiResponse<PaymentPlan>> => {
  try {
    const response = await fetch(
      `${API_URL}/v2/clients/${clientId}/payment-plans/${paymentPlanId}/reject`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rejectionData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData?.message || "Error al rechazar el plan de pago",
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Plan de pago rechazado correctamente",
      data,
    };
  } catch (error) {
    console.error("Error al rechazar plan de pago:", error);
    return {
      success: false,
      message: "Error al rechazar el plan de pago",
      data: null,
    };
  }
};

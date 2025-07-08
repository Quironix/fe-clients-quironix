import { format } from "date-fns";

export const getPaymentNetting = async ({
  accessToken,
  clientId,
  page = 1,
  limit = 10,
  status = "PENDING",
  createdAtToFrom = format(new Date(), "yyyy-MM-dd"),
  createdAtTo = format(new Date(), "yyyy-MM-dd"),
}: {
  accessToken: string;
  clientId: string;
  page: number;
  limit: number;
  status: string;
  createdAtToFrom: string;
  createdAtTo: string;
}) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/reconciliation/movements?page=${page}&limit=${limit}&status=${status}&createdAtFrom=${createdAtToFrom}&createdAtTo=${createdAtTo}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Error al obtener los datos",
      data: null,
    };
  }
};

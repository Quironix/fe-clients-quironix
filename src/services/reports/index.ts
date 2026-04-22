const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ExportSchema =
  | "INVOICES"
  | "PROJECTION"
  | "LITIGATION"
  | "PAYMENT_PLANS"
  | "PAYMENTS"
  | "MANAGEMENTS";

export type ExportStatus = "open" | "closed" | "all";

interface ExportExcelParams {
  accessToken: string;
  clientId: string;
  schema: ExportSchema;
  from: string;
  to: string;
  status?: ExportStatus;
}

export async function exportExcel({
  accessToken,
  clientId,
  schema,
  from,
  to,
  status,
}: ExportExcelParams): Promise<{ blob: Blob; filename: string }> {
  const params = new URLSearchParams({ schema, from, to });
  if (status && status !== "all") {
    params.set("status", status);
  }

  const response = await fetch(
    `${API_URL}/v2/clients/${clientId}/reports/excel-export?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message?.[0] || error?.message || `Error ${response.status}`,
    );
  }

  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^";\n]+)"?/);
  const filename = match?.[1] || `${schema.toLowerCase()}_export.xlsx`;

  const blob = await response.blob();
  return { blob, filename };
}

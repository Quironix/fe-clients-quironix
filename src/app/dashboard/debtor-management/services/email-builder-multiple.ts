import { Invoice } from "@/app/dashboard/payment-plans/store";
import { SavedManagement } from "../components/tabs/add-management-tab";
import { getManagementCombination } from "../config/management-types";
import {
  EmailInvoice,
  EmailManagement,
  EmailMultiplePayload,
} from "../types/email";
import { generateBodyDescription } from "../utils/email-templates";

interface BuildMultipleEmailPayloadParams {
  managements: SavedManagement[];
  profile: any;
  contactEmail: string;
  contactName: string;
}

function formatCurrency(amount: number | string): string {
  const numValue = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

function formatDate(dateValue: string | Date): string {
  let date: Date;

  if (typeof dateValue === "string") {
    date = new Date(dateValue);
  } else {
    date = dateValue;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function calculateDueDays(dueDate: string | Date): string {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? `-${diffDays}` : `${Math.abs(diffDays)}`;
}

function formatInvoices(invoices: Invoice[]): EmailInvoice[] {
  return invoices.map((invoice) => {
    const phases = invoice.phases || [];
    const lastPhase = phases.length > 0 ? phases[phases.length - 1] : null;

    return {
      type: invoice.type || "Factura electrónica",
      number: invoice.number || "",
      issue_date: invoice.issue_date
        ? formatDate(invoice.issue_date)
        : "00/00/0000",
      due_date: invoice.due_date ? formatDate(invoice.due_date) : "00/00/0000",
      due_days: invoice.due_date ? calculateDueDays(invoice.due_date) : "0",
      amount: formatCurrency(invoice.amount || 0),
      balance: formatCurrency(invoice.balance || 0),
      rut_emisor: invoice.debtor?.dni_number || "",
      phase: lastPhase?.phase || 1,
    };
  });
}

function getInvoicesToSend(
  management: SavedManagement
): Invoice[] {
  const managementCombination = getManagementCombination(
    management.formData.managementType,
    management.formData.debtorComment,
    management.formData.executiveComment
  );

  if (managementCombination?.executive_comment === "LITIGATION_NORMALIZATION") {
    const normalizationData = management.formData.caseData?.litigationData;
    if (normalizationData?.selectedInvoiceIds) {
      return management.selectedInvoices.filter((inv) =>
        normalizationData.selectedInvoiceIds.includes(inv.id)
      );
    }
  }

  return management.selectedInvoices;
}

export function buildMultipleEmailPayload({
  managements,
  profile,
  contactEmail,
  contactName,
}: BuildMultipleEmailPayloadParams): EmailMultiplePayload {
  const emailManagements: EmailManagement[] = managements.map((management, index) => {
    const managementCombination = getManagementCombination(
      management.formData.managementType,
      management.formData.debtorComment,
      management.formData.executiveComment
    );

    if (!managementCombination) {
      throw new Error(
        `No se encontró configuración para la gestión: ${management.formData.managementType}/${management.formData.debtorComment}/${management.formData.executiveComment}`
      );
    }

    const invoicesToSend = getInvoicesToSend(management);

    const totalAmount = invoicesToSend.reduce((sum, inv) => {
      const balance =
        typeof inv.balance === "string" ? parseFloat(inv.balance) : inv.balance;
      return sum + (balance || 0);
    }, 0);

    const formattedInvoices = formatInvoices(invoicesToSend);

    const bodyHtml = generateBodyDescription(
      managementCombination,
      management.formData.caseData || {},
      invoicesToSend.length
    );

    return {
      id: index + 1,
      header_text: managementCombination.label,
      header_amount: totalAmount > 0 ? formatCurrency(totalAmount) : "",
      is_invoices: invoicesToSend.length > 0,
      invoices: formattedInvoices,
      body_html: bodyHtml,
    };
  });

  const clientContact = profile?.client?.contacts?.[0];
  const clientLogoUrl = profile?.client?.operational?.logo_url || "";
  const isFactoring = profile?.client?.type === "FACTORING";
  const clientPhone = clientContact?.phone || "";
  const clientEmail = clientContact?.email || "";

  const emailPayload: EmailMultiplePayload = {
    to: contactEmail,
    from: {
      name: "Comunicaciones Quironix",
      email: "contacto@birdxlab.com",
    },
    templateId: "",
    dynamicTemplateData: {
      logo_client: clientLogoUrl,
      name_client: contactName,
      body_description:
        "Notificamos que las siguientes facturas han sido cedidas por su emisor a logoipsum, por lo cual <strong>solicitamos confirmarnos recepción, contabilización y fecha de pago.</strong>",
      managements: emailManagements,
      contact_phone: clientPhone,
      contact_mail: clientEmail,
      is_factoring: isFactoring,
    },
  };

  return emailPayload;
}

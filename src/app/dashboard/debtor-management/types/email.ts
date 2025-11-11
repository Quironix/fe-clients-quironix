export interface EmailInvoice {
  type: string;
  number: string;
  issue_date: string;
  due_date: string;
  due_days: string;
  amount: string;
  balance: string;
  rut_emisor: string;
  phase: number;
}

export interface EmailDynamicTemplateData {
  logo_client: string;
  name_client: string;
  body_description: string;
  header_text: string;
  header_amount: string;
  is_invoices: boolean;
  invoices: EmailInvoice[];
  is_factoring: boolean;
  body_html: string;
  contact_phone: string;
  contact_email: string;
}

export interface EmailPayload {
  to: string;
  from: {
    name: string;
    email: string;
  };
  templateId?: string;
  dynamicTemplateData: EmailDynamicTemplateData;
}

export interface EmailManagement {
  id: number;
  header_text: string;
  header_amount: string;
  is_invoices: boolean;
  invoices: EmailInvoice[];
  body_html: string;
}

export interface EmailMultipleDynamicTemplateData {
  logo_client: string;
  name_client: string;
  body_description: string;
  managements: EmailManagement[];
  contact_phone: string;
  contact_mail: string;
  is_factoring: boolean;
}

export interface EmailMultiplePayload {
  to: string;
  from: {
    name: string;
    email: string;
  };
  templateId: string;
  dynamicTemplateData: EmailMultipleDynamicTemplateData;
}

export interface EmailResponse {
  success: boolean;
  message: string;
}

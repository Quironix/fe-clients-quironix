/**
 * Ejemplo de integración con SendGrid para el template de Gestiones
 *
 * Para usar este código:
 * 1. Instala SendGrid: npm install @sendgrid/mail
 * 2. Configura la variable de entorno SENDGRID_API_KEY
 * 3. Sube el template a SendGrid y obtén el Template ID
 * 4. Actualiza TEMPLATE_ID con tu ID real
 */

import sgMail from '@sendgrid/mail';

// Configuración
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const TEMPLATE_ID = 'd-xxxxxxxxxxxxx'; // Reemplazar con tu Template ID de SendGrid
const FROM_EMAIL = 'noreply@quironix.com'; // Email verificado en SendGrid

// Inicializar SendGrid
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// Tipos para las facturas
interface Factura {
  tipo: string;
  numero: string;
  emision: string;
  vcto?: string;
  dias_atraso: string;
  monto: string;
}

// Tipos para los datos de gestión
interface GestionData {
  title: string;
  amount?: string;
  date?: string;
  total: string;
  address?: string;
  invoices: Factura[];
  checkInfo?: boolean;
  note?: string;
}

// Tipos para los datos del template
interface GestionesEmailData {
  recipient_email: string;
  recipient_name: string;
  subject: string;
  support_phone?: string;
  support_email?: string;

  // Gestión 1
  gestion_1_title: string;
  gestion_1_amount?: string;
  gestion_1_date?: string;
  gestion_1_total: string;
  gestion_1_address?: string;
  gestion_1_invoices: Factura[];
  gestion_1_check_info?: boolean;

  // Gestión 2 (opcional)
  gestion_2?: boolean;
  gestion_2_title?: string;
  gestion_2_total?: string;
  gestion_2_note?: string;
  gestion_2_invoices?: Factura[];
}

/**
 * Envía un email de gestiones completadas usando SendGrid
 *
 * @param recipientEmail - Email del destinatario
 * @param recipientName - Nombre del destinatario
 * @param gestiones - Array de gestiones (máximo 2)
 * @param subject - Asunto del email (opcional)
 * @returns Promise con el resultado del envío
 */
export async function sendGestionesEmail(
  recipientEmail: string,
  recipientName: string,
  gestiones: GestionData[],
  subject?: string
) {
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY no está configurada');
  }

  if (gestiones.length === 0 || gestiones.length > 2) {
    throw new Error('Debe haber entre 1 y 2 gestiones');
  }

  // Preparar datos del template
  const templateData: GestionesEmailData = {
    recipient_email: recipientEmail,
    recipient_name: recipientName,
    subject: subject || `Gestione ${new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`,
    support_phone: '0923 2590 6728',
    support_email: 'empresa@logoipsum.com',

    // Gestión 1 (siempre presente)
    gestion_1_title: gestiones[0].title,
    gestion_1_amount: gestiones[0].amount,
    gestion_1_date: gestiones[0].date,
    gestion_1_total: gestiones[0].total,
    gestion_1_address: gestiones[0].address,
    gestion_1_invoices: gestiones[0].invoices,
    gestion_1_check_info: gestiones[0].checkInfo,
  };

  // Gestión 2 (opcional)
  if (gestiones.length === 2) {
    templateData.gestion_2 = true;
    templateData.gestion_2_title = gestiones[1].title;
    templateData.gestion_2_total = gestiones[1].total;
    templateData.gestion_2_note = gestiones[1].note;
    templateData.gestion_2_invoices = gestiones[1].invoices;
  }

  // Configurar mensaje
  const msg = {
    to: recipientEmail,
    from: FROM_EMAIL,
    templateId: TEMPLATE_ID,
    dynamicTemplateData: templateData,
  };

  try {
    const response = await sgMail.send(msg);
    console.log('Email enviado exitosamente:', response[0].statusCode);
    return response;
  } catch (error: any) {
    console.error('Error al enviar email:', error);
    if (error.response) {
      console.error('Response body:', error.response.body);
    }
    throw error;
  }
}

/**
 * Ejemplo de uso 1: Gestión única con pago sin recaudación
 */
export async function ejemploGestionUnica() {
  const gestion: GestionData = {
    title: 'Pago sin recaudación',
    amount: '$3.232.510',
    date: '17 de septiembre, 2024',
    total: '$3.232.510',
    address: 'Teatinos 301, Oficina 17, Ñuñoa',
    checkInfo: true,
    invoices: [
      {
        tipo: 'Factura electrónica',
        numero: '74689',
        emision: '01/09/2024',
        dias_atraso: '-12',
        monto: '$3.232.510',
      },
    ],
  };

  await sendGestionesEmail(
    's.pedro@intramedios',
    'Daniel',
    [gestion],
    'Gestione septiembre 2025'
  );
}

/**
 * Ejemplo de uso 2: Múltiples gestiones
 */
export async function ejemploMultiplesGestiones() {
  const gestion1: GestionData = {
    title: 'Pago sin recaudación',
    amount: '$3.232.510',
    date: '17 de septiembre, 2024',
    total: '$3.232.510',
    address: 'Teatinos 301, Oficina 17, Ñuñoa',
    checkInfo: true,
    invoices: [
      {
        tipo: 'Factura electrónica',
        numero: '74689',
        emision: '01/09/2024',
        dias_atraso: '-12',
        monto: '$3.232.510',
      },
    ],
  };

  const gestion2: GestionData = {
    title: 'Facturas con filtros',
    total: '$9.697.530',
    note: 'Si cuenta con alguna autorización al respecto, por favor también enviar una respuesta a la brevedad sobre los documentos mencionados.',
    invoices: [
      {
        tipo: 'Factura electrónica',
        numero: '74689',
        emision: '01/09/2024',
        vcto: '15/09/2024',
        dias_atraso: '-12',
        monto: '$3.232.510',
      },
      {
        tipo: 'Factura electrónica',
        numero: '74690',
        emision: '01/09/2024',
        vcto: '15/09/2024',
        dias_atraso: '-12',
        monto: '$3.232.510',
      },
      {
        tipo: 'Factura Menciona',
        numero: '74691',
        emision: '01/09/2024',
        vcto: '15/09/2024',
        dias_atraso: '-12',
        monto: '$3.232.510',
      },
    ],
  };

  await sendGestionesEmail(
    's.pedro@intramedios',
    'Daniel',
    [gestion1, gestion2],
    'Gestione septiembre 2025'
  );
}

/**
 * Función helper para formatear montos en formato chileno
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Función helper para formatear fechas en formato chileno
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Función helper para formatear fecha completa (para subject)
 */
export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Ejemplo de uso con datos del API
 */
export async function enviarEmailDesdeAPI(
  recipientEmail: string,
  recipientName: string,
  gestionesData: any[]
) {
  // Transformar datos del API al formato esperado
  const gestiones: GestionData[] = gestionesData.map(gestion => ({
    title: gestion.titulo || 'Gestión completada',
    amount: gestion.monto_principal ? formatCurrency(gestion.monto_principal) : undefined,
    date: gestion.fecha_recaudacion ? formatDate(new Date(gestion.fecha_recaudacion)) : undefined,
    total: formatCurrency(gestion.total),
    address: gestion.direccion_retiro,
    checkInfo: gestion.tiene_retiro_cheque || false,
    note: gestion.nota,
    invoices: gestion.facturas.map((factura: any) => ({
      tipo: factura.tipo_documento,
      numero: factura.numero.toString(),
      emision: formatDate(new Date(factura.fecha_emision)),
      vcto: factura.fecha_vencimiento ? formatDate(new Date(factura.fecha_vencimiento)) : undefined,
      dias_atraso: factura.dias_atraso.toString(),
      monto: formatCurrency(factura.monto),
    })),
  }));

  // Enviar email
  await sendGestionesEmail(
    recipientEmail,
    recipientName,
    gestiones,
    `Gestione ${formatMonthYear(new Date())}`
  );
}

// Export por defecto para facilitar imports
export default {
  sendGestionesEmail,
  ejemploGestionUnica,
  ejemploMultiplesGestiones,
  enviarEmailDesdeAPI,
  formatCurrency,
  formatDate,
  formatMonthYear,
};

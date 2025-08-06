import {
  IconCreditCard,
  IconFileCheckFilled,
  IconFileInvoice,
  IconHeartHandshake,
  IconInfoTriangle,
  IconLayoutDashboard,
  IconUsers,
} from "@tabler/icons-react";
import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";
import { Bank } from "../banks/components/bank-form";
import { TopNavItem } from "../interfaces";

export const topNav: TopNavItem[] = [
  {
    title: "Overview",
    href: "dashboard/overview",
    isActive: true,
    disabled: false,
  },
  {
    title: "Customers",
    href: "dashboard/customers",
    isActive: false,
    disabled: true,
  },
  {
    title: "Products",
    href: "dashboard/products",
    isActive: false,
    disabled: true,
  },
  {
    title: "Settings",
    href: "dashboard/settings",
    isActive: false,
    disabled: true,
  },
];

export const getSidebarData = (profile: any) => {
  const isFactoringClient = profile?.client?.type === "FACTORING";

  const onboardingItems = [
    // Solo incluir "Compañías" si el cliente es de tipo FACTORING

    {
      title: "Configuración cliente",
      url: "/dashboard/settings",
      scope: "client.onboarding.settings",
    },
    {
      disabled: true,
      title: "Integraciones",
      url: "/dashboard/integrations",
      scope: "client.onboarding.integrations",
    },
    {
      title: "Bancos y cuentas",
      url: "/dashboard/banks",
      scope: "client.onboarding.banks",
    },
    ...(isFactoringClient
      ? [
          {
            title: "Compañías",
            url: "/dashboard/companies",
            scope: "client.onboarding.companies",
          },
        ]
      : []),
  ];

  return {
    user: {
      name: "satnaing",
      email: "satnaingdev@gmail.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: "Shadcn Admin",
        logo: Command,
        plan: "Vite + ShadcnUI",
      },
      {
        name: "Acme Inc",
        logo: GalleryVerticalEnd,
        plan: "Enterprise",
      },
      {
        name: "Acme Corp.",
        logo: AudioWaveform,
        plan: "Startup",
      },
    ],
    navGroups: [
      {
        title: "Compañía",
        items: [
          {
            title: "Dashboard",
            url: "/dashboard/overview",
            icon: IconLayoutDashboard,
            scope: "client.dashboard",
            is_parent: true,
          },
          {
            title: "Onboarding",
            icon: IconCreditCard,
            scope: "client.onboarding",
            is_parent: true,
            items: onboardingItems,
          },
          {
            title: "Usuarios",
            icon: IconUsers,
            scope: "client.users",
            is_parent: true,
            items: [
              {
                title: "Roles",
                url: "/dashboard/roles",
                scope: "client.users.roles",
              },
              {
                title: "Usuarios",
                url: "/dashboard/users",
                scope: "client.users.users",
              },
              {
                disabled: true,
                title: "Historial de acciones",
                url: "/dashboard/actions-history",
                scope: "client.users.actions_history",
              },
            ],
          },
          {
            title: "Config. de la cartera",
            icon: IconHeartHandshake,
            scope: "client.settings_account",
            is_parent: true,
            items: [
              {
                title: "Deudores",
                url: "/dashboard/debtors",
                scope: "client.settings_account.debtors",
              },
              {
                disabled: true,
                title: "Periodo mensual y cierre",
                url: "/dashboard/monthly-period",
                scope: "client.settings_account.monthly_period",
              },
              {
                disabled: true,
                title: "Flujo de caja",
                url: "/dashboard/cash-flow",
                scope: "client.settings_account.cash_flow",
              },
              {
                disabled: true,
                title: "Comunicaciones",
                url: "/dashboard/communications",
                scope: "client.settings_account.communications",
              },
              {
                disabled: true,
                title: "Configuración de indicadores",
                url: "/dashboard/indicators",
                scope: "client.settings_account.indicators",
              },
            ],
          },
          {
            title: "Transacciones",
            icon: IconFileInvoice,
            scope: "client.transactions",
            is_parent: true,
            items: [
              {
                title: "Ingreso DTE",
                url: "/dashboard/transactions/dte",
                scope: "client.transactions.dte",
              },
              {
                title: "Ingreso pago",
                url: "/dashboard/transactions/payments",
                scope: "client.transactions.payments",
              },
              {
                title: "Carga de cartolas",
                url: "/dashboard/transactions/movements",
                scope: "client.transactions.movements",
              },
            ],
          },
          {
            title: "Conciliación de pagos",
            url: "/dashboard/payment-netting",
            icon: IconFileCheckFilled,
            scope: "client.payment_netting",
          },
          {
            title: "Litigios",
            url: "/dashboard/litigation",
            icon: IconInfoTriangle,
            scope: "client.litigation",
          },
          // {
          //   title: "Seguimiento",
          //   url: "/dashboard/litigation",
          //   icon: IconFileCheckFilled,
          //   scope: "client.litigation",
          // },
        ],
      },
    ],
  };
};

// Mantener sidebarData para compatibilidad hacia atrás (se reemplazará por getSidebarData)
export const sidebarData: any = {
  user: {
    name: "satnaing",
    email: "satnaingdev@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Shadcn Admin",
      logo: Command,
      plan: "Vite + ShadcnUI",
    },
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
  navGroups: [
    {
      title: "Compañía",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/overview",
          icon: IconLayoutDashboard,
          scope: "client.dashboard",
          is_parent: true,
        },
        {
          title: "Onboarding",
          icon: IconCreditCard,
          scope: "client.onboarding",
          is_parent: true,
          items: [
            {
              title: "Compañías",
              url: "/dashboard/companies",
              scope: "client.onboarding.companies",
            },
            {
              title: "Configuración cliente",
              url: "/dashboard/settings",
              scope: "client.onboarding.settings",
            },
            {
              disabled: true,
              title: "Integraciones",
              url: "/dashboard/integrations",
              scope: "client.onboarding.integrations",
            },
            {
              title: "Bancos y cuentas",
              url: "/dashboard/banks",
              scope: "client.onboarding.banks",
            },
          ],
        },
        {
          title: "Usuarios",
          icon: IconUsers,
          scope: "client.users",
          is_parent: true,
          items: [
            {
              title: "Usuarios",
              url: "/dashboard/users",
              scope: "client.users.users",
            },
            {
              title: "Roles",
              url: "/dashboard/roles",
              scope: "client.users.roles",
            },
            {
              disabled: true,
              title: "Historial de acciones",
              url: "/dashboard/actions-history",
              scope: "client.users.actions_history",
            },
          ],
        },
        {
          title: "Config. de la cartera",
          icon: IconHeartHandshake,
          scope: "client.settings_account",
          is_parent: true,
          items: [
            {
              title: "Creación de deudores",
              url: "/dashboard/debtors",
              scope: "client.settings_account.debtors",
            },
            {
              disabled: true,
              title: "Periodo mensual y cierre",
              url: "/dashboard/monthly-period",
              scope: "client.settings_account.monthly_period",
            },
            {
              disabled: true,
              title: "Flujo de caja",
              url: "/dashboard/cash-flow",
              scope: "client.settings_account.cash_flow",
            },
            {
              disabled: true,
              title: "Comunicaciones",
              url: "/dashboard/communications",
              scope: "client.settings_account.communications",
            },
            {
              disabled: true,
              title: "Configuración de indicadores",
              url: "/dashboard/indicators",
              scope: "client.settings_account.indicators",
            },
          ],
        },
        {
          title: "Transacciones",
          icon: IconFileInvoice,
          scope: "client.transactions",
          is_parent: true,
          items: [
            {
              title: "Ingreso DTE",
              url: "/dashboard/transactions/dte",
              scope: "client.transactions.dte",
            },
            {
              title: "Ingreso pago",
              url: "/dashboard/transactions/payments",
              scope: "client.transactions.payments",
            },
            {
              title: "Carga de cartolas",
              url: "/dashboard/transactions/movements",
              scope: "client.transactions.movements",
            },
            {
              title: "Payment Netting",
              url: "/dashboard/payment-netting",
              scope: "client.transactions.payment_netting",
            },
            {
              title: "Seguimiento",
              url: "/dashboard/litigation",
              scope: "client.litigation",
            },
          ],
        },
      ],
    },
  ],
};

export const languages = [
  {
    name: "Español",
    code: "ES",
  },
  {
    name: "Inglés",
    code: "EN",
  },
  {
    name: "Portugués",
    code: "PT",
  },
  {
    name: "Francés",
    code: "FR",
  },
  {
    name: "Alemán",
    code: "DE",
  },
  {
    name: "Italiano",
    code: "IT",
  },
];

export const categories = [
  "Agricultura, Ganadería, Silvicultura y Pesca",
  "Explotación de Minas y Canteras",
  "Industrias Manufacturera",
  "Suministro de Electricidad, Gas, Vapor y Aire Acondicionado",
  "Suministro de Agua",
  "Evacuación de Agua residuales, gestión de desechos y descontaminación",
  "Construcción",
  "Comercio al Por Mayor y al por Menor",
  "Reparación de Vehículos Automotores y Motocicletas",
  "Transporte y Almacenamiento",
  "Actividades de Alojamiento y de Servicio de Comidas",
  "Información y Comunicaciones",
  "Actividades Financieras y de Seguros",
  "Actividades inmobiliarias",
  "Actividades Profesionales, Cientificas y Técnicas",
  "Actividades de Servicios Administrativos y de Apoyo",
  "Adm. Pública y Defensa",
  "Planes de Seguridad Social de Afiliación Obligatoria",
  "Enseñanza",
  "Actividades de Atención de la Salud Humana y de Asistencia Social",
  "Actividades Artísticas, de Entretenimiento y Recreativas",
  "Otras Actividades de Servicios",
  "Actividades de los Hogaes como Empleadores",
  "Actividades No Diferenciadas de los Hogares",
  "Actividades de Organizaciones y Órganos Extraterritoriales",
];

export const channels = [
  {
    name: "Correo electrónico",
    value: "EMAIL",
  },
  {
    name: "Teléfono",
    value: "PHONE",
  },
  {
    name: "Correo postal",
    value: "MAIL",
  },
  {
    name: "Presencial",
    value: "IN_PERSON",
  },
  {
    name: "WhatsApp",
    value: "WHATSAPP",
  },
  {
    name: "SMS",
    value: "SMS",
  },
];

export const functionsContact = [
  {
    name: "Atención a proveedores",
    value: "Atención a proveedores",
  },
  {
    name: "Gerencia o jefatura",
    value: "Gerencia o jefatura",
  },
  {
    name: "Tesorería",
    value: "Tesorería",
  },
];

export const typeDocuments = ["RUT", "RUC"];

export const currencies = [
  // {
  //   name: "Dólar estadounidense",
  //   code: "USD",
  //   symbol: "$",
  // },
  // {
  //   name: "Euro",
  //   code: "EUR",
  //   symbol: "€",
  // },
  // {
  //   name: "Peso argentino",
  //   code: "ARS",
  //   symbol: "$",
  // },
  // {
  //   name: "Real brasileño",
  //   code: "BRL",
  //   symbol: "R$",
  // },
  {
    name: "Peso chileno",
    code: "CLP",
    symbol: "$",
  },
  // {
  //   name: "Peso colombiano",
  //   code: "COP",
  //   symbol: "$",
  // },
  // {
  //   name: "Peso mexicano",
  //   code: "MXN",
  //   symbol: "$",
  // },
  {
    name: "Sol peruano",
    code: "PEN",
    symbol: "S/",
  },
  // {
  //   name: "Libra esterlina",
  //   code: "GBP",
  //   symbol: "£",
  // },
  // {
  //   name: "Yen japonés",
  //   code: "JPY",
  //   symbol: "¥",
  // },
];

export const BANK_LIST: Bank[] = [
  { name: "Banco de Chile", sbifCode: "001" },
  { name: "Banco Internacional", sbifCode: "009" },
  { name: "Banco Scotiabank", sbifCode: "014" },
  { name: "Banco BCI", sbifCode: "016" },
  { name: "Banco BICE", sbifCode: "028" },
  { name: "HSBC", sbifCode: "031" },
  { name: "Banco Santander", sbifCode: "037" },
  { name: "Banco Itaú", sbifCode: "039" },
  { name: "JP Morgan Chase", sbifCode: "041" },
  { name: "Banco Security", sbifCode: "049" },
  { name: "Banco Falabella", sbifCode: "051" },
  { name: "Banco Ripley", sbifCode: "053" },
  { name: "Banco Consorcio", sbifCode: "055" },
  { name: "Banco BTG Pactual Chile", sbifCode: "059" },
  { name: "China Construction Bank Agencia en Chile", sbifCode: "060" },
  { name: "Bank of China Agencia en Chile", sbifCode: "061" },
  { name: "Tanner Banco Digital", sbifCode: "062" },
  { name: "Banco Estado", sbifCode: "012" },
];

export enum DocumentType {
  CHECK = "Cheque",
  DEPOSIT = "Depósito",
  CASH = "Efectivo",
  SIGHT_DRAFT = "Vale Vista",
  BILL_OF_EXCHANGE = "Letra",
  PROMISSORY_NOTE = "Pagaré",
  APPLICATION = "Aplicación",
  ADJUSTMENT = "Ajuste",
  TRANSFER = "Transferencia",
  CREDIT_CARD = "Tarjeta Crédito",
  DEBIT_CARD = "Tarjeta Debito",
  TAX_WITHHOLDING = "Retencion Impto",
  BANK_EXPENSE = "Gasto Bancaria",
  POST_DATED_CHECK = "Cheque A Fecha",
  DEBT_COLLECTION = "Cobro Deuda",
  INTEREST = "Intereses",
  CREDIT_NOTE = "Abono",
}

export const INVOICE_TYPES = [
  {
    country: "CL",
    types: [
      {
        label: "Factura Electrónica",
        value: "INVOICE",
      },
      {
        label: "Factura No Afecta o Exenta Electrónica",
        value: "EXEMPT_INVOICE",
      },
      {
        label: "Factura de Compra Electrónica",
        value: "PURCHASE_INVOICE",
      },
      {
        label: "Liquidación Factura Electrónica",
        value: "SETTLEMENT_INVOICE",
      },
      {
        label: "Nota de Débito Electrónica",
        value: "DEBIT_NOTE",
      },
      {
        label: "Nota de Crédito Electrónica",
        value: "CREDIT_NOTE",
      },
      {
        label: "Guía de Despacho Electrónica",
        value: "DISPATCH_GUIDE",
      },
      {
        label: "Factura de Exportación Electrónica",
        value: "EXPORT_INVOICE",
      },
      {
        label: "Nota de Crédito de Exportación Electrónica",
        value: "EXPORT_CREDIT_NOTE",
      },
      {
        label: "Nota de Débito de Exportación Electrónica",
        value: "EXPORT_DEBIT_NOTE",
      },
    ],
  },
];

export const DEBTOR_PAYMENT_METHODS = [
  {
    label: "Depósito o Transferencia",
    value: "DEPOSIT_OR_TRANSFER",
  },
  {
    label: "Cheque",
    value: "CHECK",
  },
  {
    label: "Cheque posfechado",
    value: "CHECK_POSTDATED",
  },
  {
    label: "Tarjeta",
    value: "CREDIT_CARD",
  },
  {
    label: "Vale Vista",
    value: "VIEW_CARD",
  },
];

export const CREDIT_STATUS = [
  { name: "Vigente", code: "ACTIVE" },
  { name: "Retenido", code: "INACTIVE" },
];

export const DOCUMENT_TYPE = [
  {
    name: "RUC",
    code: "RUC",
  },
  {
    name: "RUT",
    code: "RUT",
  },
];

export const PAYMENT_TERMS = [
  { name: "30 días", code: "30_DAYS" },
  { name: "60 días", code: "60_DAYS" },
  { name: "90 días", code: "90_DAYS" },
  { name: "120 días", code: "120_DAYS" },
  { name: "180 días", code: "180_DAYS" },
  { name: "360 días", code: "360_DAYS" },
];

export const PREFERRED_CHANNELS = [
  { code: "WHOLESALE", name: "Mayorista" },
  { code: "RETAIL", name: "Minorista" },
  { code: "GOVERNMENT", name: "Gobierno" },
  { code: "DISTRIBUTOR", name: "Distribuidor" },
  { code: "ONLINE", name: "Canal online" },
  { code: "DIRECT", name: "Venta directa" },
  { code: "OTHER", name: "Otro/no clasificado" },
];

export const RISK_CLASSIFICATION = [
  { code: "HIGH", name: "Alto" },
  { code: "MEDIUM", name: "Medio" },
  { code: "LOW", name: "Bajo" },
];

export const COMMUNICATION_CHANNEL = [
  { code: "EMAIL", name: "Correo electrónico" },
  { code: "PHONE", name: "Teléfono" },
  { code: "MAIL", name: "Correo postal" },
  { code: "IN_PERSON", name: "Presencial" },
  { code: "WHATSAPP", name: "WhatsApp" },
  { code: "SMS", name: "SMS" },
];

export const disputes = [
  {
    code: "COMMERCIAL_INVOICE",
    label: "Factura comercial",
    submotivo: [
      { code: "ISSUED", label: "Emitida" },
      { code: "NOT_ISSUED", label: "No emitida" },
    ],
  },
  {
    code: "SETTLEMENT",
    label: "Finiquito",
    submotivo: [
      { code: "LEGAL_COLLECTION", label: "Cobranza judicial" },
      { code: "STORE_DELIVERY", label: "Entrega de local" },
    ],
  },
  {
    code: "CREDIT_NOTE",
    label: "Nota de crédito",
    submotivo: [
      { code: "ADMINISTRATIVE", label: "Administrativa" },
      { code: "PHYSICAL_DIFFERENCE", label: "Diferencia física" },
      { code: "VALUE_DIFFERENCE", label: "Diferencia valor" },
      {
        code: "DISPATCH_GUIDE_DIFFERENCE",
        label: "Diferencia Guía de Despacho",
      },
    ],
  },
  {
    code: "INVOICE_ISSUE",
    label: "Problemas con la factura",
    submotivo: [
      { code: "RETENTION_CERTIFICATE", label: "Certificado de retención" },
      { code: "SERVICE_ISSUES", label: "Inconvenientes con el servicio" },
      { code: "IN_OTHER_FACTORING", label: "En poder de otro factoring" },
      { code: "DUE_DATE_ERROR", label: "Error de vencimiento" },
      { code: "INVOICE_VOIDED", label: "Factura anulada" },
      { code: "INVOICE_PAID", label: "Factura pagada" },
      { code: "REINVOICING", label: "Re-facturación" },
      { code: "REJECTED_BY_SII", label: "Rechazo en el SII" },
      { code: "NO_CONTRACT", label: "Sin contrato" },
      { code: "TRANSFERABLE_REQUEST", label: "Solicitud de cedible" },
      { code: "DOCUMENTATION_REQUEST", label: "Solicitud de documentación" },
    ],
  },
];

export enum DISPUTE_MESSAGES {
  INVOICE_NOT_FOUND = "No se encontró la factura",
  DEBTOR_NOT_FOUND = "No se encontró el deudor",
}

// Motivos de normalización como un JSON constante
export const NORMALIZATION_REASONS = [
  { code: "PAYMENT_RECEIVED", label: "Pago recibido" },
  { code: "PAYMENT_AGREEMENT", label: "Acuerdo de pago" },
  { code: "PARTIAL_PAYMENT", label: "Pago parcial" },
  { code: "DEBT_FORGIVENESS", label: "Condonación de deuda" },
  { code: "LEGAL_SETTLEMENT", label: "Acuerdo legal" },
  { code: "ADMINISTRATIVE_ERROR", label: "Error administrativo" },
  { code: "DUPLICATE_INVOICE", label: "Factura duplicada" },
];

// Estado de litigio como un JSON constante
export const LITIGATION_STATUS = [
  { code: "PENDING", label: "Pendiente de revisión" },
  { code: "IN_REVIEW", label: "En revisión" },
  { code: "APPROVED", label: "Aprobado" },
  { code: "REJECTED", label: "Rechazado" },
  { code: "NORMALIZED", label: "Normalizado (resuelto)" },
  { code: "CANCELLED", label: "Cancelado" },
];

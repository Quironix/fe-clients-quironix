import { TopNavItem } from "../interfaces";
import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChecklist,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
  IconCreditCard,
  IconHeartHandshake,
} from "@tabler/icons-react";
import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";

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
        },
        {
          title: "Onboarding",
          icon: IconCreditCard,
          items: [
            {
              title: "Configuración cliente",
              url: "/dashboard/settings",
            },
            {
              title: "Integraciones",
              url: "/dashboard/integrations",
            },
            {
              title: "Bancos y cuentas",
              url: "/dashboard/banks",
            },
          ],
        },
        {
          title: "Usuarios",
          icon: IconUsers,
          items: [
            {
              title: "Usuarios",
              url: "/dashboard/users",
            },
            {
              title: "Roles",
              url: "/dashboard/roles",
            },
            {
              title: "Historial de acciones",
              url: "/dashboard/actions-history",
            },
          ],
        },
        {
          title: "Config. de la cartera",
          icon: IconHeartHandshake,
          items: [
            {
              title: "Creación de deudores",
              url: "/dashboard/debtors",
            },

            {
              title: "Periodo mensual y cierre",
              url: "/dashboard/monthly-period",
            },
            {
              title: "Flujo de caja",
              url: "/dashboard/cash-flow",
            },
            {
              title: "Comunicaciones",
              url: "/dashboard/communications",
            },
            {
              title: "Configuración de indicadores",
              url: "/dashboard/indicators",
            },
          ],
        },
        {
          title: "Transacciones",
          icon: IconHeartHandshake,
          items: [
            {
              title: "Ingreso DTE",
              url: "/dashboard/admin-users",
            },
            {
              title: "Ingreso pago",
              url: "/dashboard/admin-users",
            },
            {
              title: "Carga de cartolas",
              url: "/dashboard/admin-users",
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
  "Suministro de Agua; Evacuación de Agua residuales, gestión de desechos y descontaminación",
  "Construcción",
  "Comercio al Por Mayor y al por Menor; Reparación de Vehículos Automotores y Motocicletas",
  "Transporte y Almacenamiento",
  "Actividades de Alojamiento y de Servicio de Comidas",
  "Información y Comunicaciones",
  "Actividades Financieras y de Seguros",
  "Actividades inmobiliarias",
  "Actividades Profesionales, Cientificas y Técnicas",
  "Actividades de Servicios Administrativos y de Apoyo",
  "Adm. Pública y Defensa; Planes de Seguridad Social de Afiliación Obligatoria",
  "Enseñanza",
  "Actividades de Atención de la Salud Humana y de Asistencia Social",
  "Actividades Artísticas, de Entretenimiento y Recreativas",
  "Otras Actividades de Servicios",
  "Actividades de los Hogaes como Empleadores; Actividades No Diferenciadas de los Hogares",
  "Actividades de Organizaciones y Órganos Extraterritoriales",
];

export const typeDocuments = [
  "Cédula de identidad",
  "Cédula extranjera",
  "Pasaporte",
];

export const currencies = [
  {
    name: "Dólar estadounidense",
    code: "USD",
    symbol: "$",
  },
  {
    name: "Euro",
    code: "EUR",
    symbol: "€",
  },
  {
    name: "Peso argentino",
    code: "ARS",
    symbol: "$",
  },
  {
    name: "Real brasileño",
    code: "BRL",
    symbol: "R$",
  },
  {
    name: "Peso chileno",
    code: "CLP",
    symbol: "$",
  },
  {
    name: "Peso colombiano",
    code: "COP",
    symbol: "$",
  },
  {
    name: "Peso mexicano",
    code: "MXN",
    symbol: "$",
  },
  {
    name: "Sol peruano",
    code: "PEN",
    symbol: "S/",
  },
  {
    name: "Libra esterlina",
    code: "GBP",
    symbol: "£",
  },
  {
    name: "Yen japonés",
    code: "JPY",
    symbol: "¥",
  },
];

"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Language from "@/components/ui/language";
import {
  AlertCircle,
  ArrowLeft,
  Home,
  Lock,
  ShieldX,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";

// Mapeo de rutas a descripciones amigables y categorías
const getRouteInfo = (
  route: string
): { description: string; category: string; icon: string } => {
  const routeMap: Record<
    string,
    { description: string; category: string; icon: string }
  > = {
    "/dashboard/overview": {
      description: "Dashboard Principal",
      category: "General",
      icon: "📊",
    },
    "/dashboard/settings": {
      description: "Configuración del Cliente",
      category: "Onboarding",
      icon: "⚙️",
    },
    "/dashboard/integrations": {
      description: "Integraciones",
      category: "Onboarding",
      icon: "🔗",
    },
    "/dashboard/banks": {
      description: "Bancos y Cuentas",
      category: "Onboarding",
      icon: "🏦",
    },
    "/dashboard/users": {
      description: "Gestión de Usuarios",
      category: "Usuarios",
      icon: "👥",
    },
    "/dashboard/roles": {
      description: "Gestión de Roles",
      category: "Usuarios",
      icon: "🔑",
    },
    "/dashboard/actions-history": {
      description: "Historial de Acciones",
      category: "Usuarios",
      icon: "📋",
    },
    "/dashboard/debtors": {
      description: "Creación de Deudores",
      category: "Cartera",
      icon: "👤",
    },
    "/dashboard/monthly-period": {
      description: "Periodo Mensual y Cierre",
      category: "Cartera",
      icon: "📅",
    },
    "/dashboard/cash-flow": {
      description: "Flujo de Caja",
      category: "Cartera",
      icon: "💰",
    },
    "/dashboard/communications": {
      description: "Comunicaciones",
      category: "Cartera",
      icon: "📧",
    },
    "/dashboard/indicators": {
      description: "Configuración de Indicadores",
      category: "Cartera",
      icon: "📈",
    },
    "/dashboard/transactions/dte": {
      description: "Ingreso DTE",
      category: "Transacciones",
      icon: "📄",
    },
    "/dashboard/transactions/payments": {
      description: "Ingreso de Pagos",
      category: "Transacciones",
      icon: "💳",
    },
    "/dashboard/transactions/movements": {
      description: "Carga de Cartolas",
      category: "Transacciones",
      icon: "📊",
    },
  };

  return (
    routeMap[route] || {
      description: route,
      category: "Desconocido",
      icon: "❓",
    }
  );
};

const AccessDeniedPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptedRoute = searchParams.get("route");
  const routeInfo = attemptedRoute ? getRouteInfo(attemptedRoute) : null;

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Acceso denegado"
          description="No tienes permisos suficientes para acceder a la página solicitada."
          icon={<ShieldX color="white" />}
          subDescription="Error 403"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="space-y-6">
            {/* Card principal de error */}
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <CardTitle className="text-xl text-red-800">
                  Permisos insuficientes
                </CardTitle>
                <CardDescription className="text-red-600">
                  Tu usuario no tiene los permisos necesarios para acceder a
                  esta funcionalidad.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Grid de acciones y ayuda */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Card de acciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    Acciones disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="w-full justify-start py-6"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a la página anterior
                  </Button>
                  <Link href="/dashboard/overview">
                    <Button className="w-full justify-start bg-primary hover:bg-primary/90 py-6">
                      <Home className="w-4 h-4 mr-2" />
                      Ir al Dashboard Principal
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Card de ayuda */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    ¿Necesitas acceso?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Contacta con tu administrador del sistema
                    </p>
                    <p className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Solicita los permisos específicos para esta página
                    </p>
                    <p className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      Verifica que tu rol tenga las funciones necesarias
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Main>
    </>
  );
};

export default AccessDeniedPage;

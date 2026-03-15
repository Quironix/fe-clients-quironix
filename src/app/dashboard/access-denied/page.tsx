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
  AlertTriangle,
  ArrowLeft,
  Home,
  Lock,
  ShieldX,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";

const AccessDeniedContent = () => {
  const t = useTranslations("dashboard.accessDenied");
  const tRoutes = useTranslations("dashboard.routes");
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptedRoute = searchParams.get("route");

  const getRouteInfo = (
    route: string
  ): { description: string; category: string; icon: string } => {
    const routeMap: Record<
      string,
      { descriptionKey: string; category: string; icon: string }
    > = {
      "/dashboard/overview": { descriptionKey: "dashboardOverview", category: "General", icon: "📊" },
      "/dashboard/settings": { descriptionKey: "settings", category: "Onboarding", icon: "⚙️" },
      "/dashboard/integrations": { descriptionKey: "integrations", category: "Onboarding", icon: "🔗" },
      "/dashboard/banks": { descriptionKey: "banks", category: "Onboarding", icon: "🏦" },
      "/dashboard/users": { descriptionKey: "users", category: "Usuarios", icon: "👥" },
      "/dashboard/roles": { descriptionKey: "roles", category: "Usuarios", icon: "🔑" },
      "/dashboard/actions-history": { descriptionKey: "actionsHistory", category: "Usuarios", icon: "📋" },
      "/dashboard/debtors": { descriptionKey: "debtors", category: "Cartera", icon: "👤" },
      "/dashboard/monthly-period": { descriptionKey: "monthlyPeriod", category: "Cartera", icon: "📅" },
      "/dashboard/cash-flow": { descriptionKey: "cashFlow", category: "Cartera", icon: "💰" },
      "/dashboard/communications": { descriptionKey: "communications", category: "Comunicaciones", icon: "📧" },
      "/dashboard/indicators": { descriptionKey: "indicators", category: "Cartera", icon: "📈" },
      "/dashboard/transactions/dte": { descriptionKey: "transactionsDte", category: "Transacciones", icon: "📄" },
      "/dashboard/transactions/payments": { descriptionKey: "transactionsPayments", category: "Transacciones", icon: "💳" },
      "/dashboard/transactions/movements": { descriptionKey: "transactionsMovements", category: "Transacciones", icon: "📊" },
    };

    const entry = routeMap[route];
    if (entry) {
      return {
        description: tRoutes(entry.descriptionKey as any),
        category: entry.category,
        icon: entry.icon,
      };
    }
    return {
      description: route,
      category: t("unknown"),
      icon: "❓",
    };
  };

  const routeInfo = attemptedRoute ? getRouteInfo(attemptedRoute) : null;

  return (
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
            {t("insufficientPermissions")}
          </CardTitle>
          <CardDescription className="text-red-600">
            {t("permissionsMessage")}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Información de la página solicitada */}
      {attemptedRoute && routeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              {t("requestedPage")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
              <span className="text-2xl">{routeInfo.icon}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900">
                  {routeInfo.description}
                </h4>
                <p className="text-sm text-orange-700">
                  {t("category", { category: routeInfo.category })}
                </p>
                <code className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mt-1 inline-block">
                  {attemptedRoute}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de acciones y ayuda */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Card de acciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              {t("availableActions")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="w-full justify-start"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("goBack")}
            </Button>
            <Link href="/dashboard/overview">
              <Button className="w-full justify-start bg-primary hover:bg-primary/90">
                <Home className="w-4 h-4 mr-2" />
                {t("goToDashboard")}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Card de ayuda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              {t("needAccess")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600 space-y-2">
              <p className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                {t("contactAdmin")}
              </p>
              <p className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                {t("requestPermissions")}
              </p>
              <p className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                {t("verifyRole")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card de información técnica */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{t("errorCode")}</span>
            <span>{t("permissionsActive")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente de loading para el Suspense
const AccessDeniedFallback = () => {
  const t = useTranslations("dashboard.accessDenied");
  return (
  <div className="space-y-6">
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <CardTitle className="text-xl text-red-800">{t("fallback")}</CardTitle>
        <CardDescription className="text-red-600">
          {t("loadingInfo")}
        </CardDescription>
      </CardHeader>
    </Card>
  </div>
);
};

const AccessDeniedPage = () => {
  const t = useTranslations("accessDenied");
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("title")}
          description={t("description")}
          icon={<ShieldX color="white" />}
          subDescription={t("subDescription")}
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <Suspense fallback={<AccessDeniedFallback />}>
            <AccessDeniedContent />
          </Suspense>
        </div>
      </Main>
    </>
  );
};

export default AccessDeniedPage;

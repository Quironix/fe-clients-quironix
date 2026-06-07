"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MonthPicker } from "./components/month-picker";
import Language from "@/components/ui/language";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChartSpline } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import * as z from "zod";
import { useTranslations } from "next-intl";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";
import { usePaymentProjectionStore } from "../store";
import MonthlyTable from "./components/table-monthly";

const formSchema = z.object({
  period_month: z
    .string()
    .min(1, "El período es requerido")
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])$/,
      "El formato debe ser AAAA-MM (ej: 2024-01)"
    ),
});

type FormData = z.infer<typeof formSchema>;

const PageSettings = () => {
  const t = useTranslations("paymentProjection.settings");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPeriodMonth, periodMonth, setSearchDebtorCode } =
    usePaymentProjectionStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      period_month: "",
    },
  });

  const periodFromUrl = (() => {
    const periodParam = searchParams.get("period");
    if (!periodParam) return null;
    const [mm, yyyy] = periodParam.split("-");
    return mm && yyyy ? `${mm}/${yyyy}` : null;
  })();

  useEffect(() => {
    if (periodFromUrl) {
      setPeriodMonth(periodFromUrl);
    }
  }, [periodFromUrl]);

  const formatPeriodForDisplay = (period: string) => {
    if (!period) return "";
    const [year, month] = period.split("-");
    return `${month}/${year}`;
  };

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const displayPeriod = formatPeriodForDisplay(data.period_month);
      setSearchDebtorCode(null);
      setPeriodMonth(displayPeriod);

      const [year, month] = data.period_month.split("-");
      const params = new URLSearchParams(searchParams.toString());
      params.set("period", `${month}-${year}`);
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      alert("Error al procesar el formulario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title={t("pageTitle")}
          description={t("pageDescription")}
          icon={<ChartSpline color="white" />}
          subDescription={t("pageTitle")}
        />

        <div className="flex items-center justify-center gap-5 p-3 border border-gray-200 rounded-md h-[325px] mb-5">
          <div className="shrink-0">
            <Image
              src="/img/payment-projection.svg"
              alt="Deudores"
              className="h-full object-cover rounded-md bg-slate-100 p-4 min-w-[300px]"
              width={300}
              height={300}
            />
          </div>

          <div className="w-full h-full border border-gray-200 rounded-md p-5 flex flex-col items-start justify-start gap-6">
            <span className="text-lg font-bold">
              {t("configTitle")}
            </span>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="w-1/2 space-y-4"
              >
                <FormField
                  control={form.control}
                  name="period_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("periodLabel")}</FormLabel>
                      <FormControl>
                        <MonthPicker
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? t("processing") : t("configurePeriod")}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <MonthlyTable period_month={periodFromUrl ?? periodMonth} />
      </Main>
    </>
  );
};

export default PageSettings;

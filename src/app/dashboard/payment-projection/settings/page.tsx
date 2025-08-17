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
import { Input } from "@/components/ui/input";
import Language from "@/components/ui/language";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChartSpline } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Header from "../../components/header";
import { Main } from "../../components/main";
import TitleSection from "../../components/title-section";

// Schema de validación para el formato AAAA-MM (formato month input)
const formSchema = z.object({
  period: z
    .string()
    .min(1, "El período es requerido")
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])$/,
      "El formato debe ser AAAA-MM (ej: 2024-01)"
    ),
});

type FormData = z.infer<typeof formSchema>;

const PageSettings = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      period: "",
    },
  });

  // Función para convertir formato MM/AAAA a AAAA-MM para display
  const formatPeriodForDisplay = (period: string) => {
    if (!period) return "";
    const [year, month] = period.split("-");
    return `${month}/${year}`;
  };

  // Handle principal para enviar el formulario
  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      console.log("Datos del formulario:", data);
      // Aquí puedes agregar la lógica para procesar los datos
      // Por ejemplo, llamar a una API o actualizar el estado

      // Simular una operación asíncrona
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mostrar el período en formato legible MM/AAAA
      const displayPeriod = formatPeriodForDisplay(data.period);
      alert(`Período configurado: ${displayPeriod}`);
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
          title="Ingreso de proyección de pagos"
          description="Organiza y monitorea tu plan de pagos de 5 semanas"
          icon={<ChartSpline color="white" />}
          subDescription="Proyección de pagos"
        />

        <div className="flex items-center justify-center gap-5 p-3 border border-gray-200 rounded-md h-[325px] mb-5">
          <div className="flex-shrink-0">
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
              Configuración del plan de pago
            </span>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="w-1/2 space-y-4"
              >
                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período (MM/AAAA)</FormLabel>
                      <FormControl>
                        <Input {...field} type="month" className="font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Procesando..." : "Configurar Período"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <h1>Settings</h1>
      </Main>
    </>
  );
};

export default PageSettings;

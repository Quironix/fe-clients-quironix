"use client";

import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Building2,
  FileText,
  Settings,
  User,
  Mail,
  Phone,
  CalendarCheck,
} from "lucide-react";
import { useMemo } from "react";
import { DataTable } from "../../components/data-table";
import LoaderTable from "../../components/loader-table";


interface Invoice {
  id: number;
  number: string;
  documentType: string;
  amount: number;
  dueDate: string;
  phase: string;
}

const mockInvoices: Invoice[] = [
  {
    id: 1,
    number: "42.437.696",
    documentType: "Factura",
    amount: 99999999,
    dueDate: "10/08/2025",
    phase: "Fase 1",
  },
  {
    id: 2,
    number: "43.123.456",
    documentType: "Factura",
    amount: 5000000,
    dueDate: "15/08/2025",
    phase: "Fase 2",
  },
];

interface FormValues {
  debtorDocument: string;
  selectedInvoices: number[];
  totalPlacement: string;
  upfrontPayment: string;
  installments: number;
  interestRate: number;
  paymentMethod: string;
  paymentFrequency: string;
  startDate: string;
  comment?: string;
}

const FormPaymentPlans = () => {
  const form = useForm<FormValues>({
    defaultValues: {
      debtorDocument: "",
      selectedInvoices: [],
      totalPlacement: "",
      upfrontPayment: "",
      installments: 1,
      interestRate: 0,
      paymentMethod: "",
      paymentFrequency: "",
      startDate: "",
      comment: "",
    },
  });

  const { register, handleSubmit, watch, setValue, formState } = form;
  const { errors } = formState;

  const selected = watch("selectedInvoices") || [];

  const toggleInvoice = (id: number) => {
    const updated = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    setValue("selectedInvoices", updated);
  };

  const columnsByClientType = useMemo(
    () => [
      {
        id: "select",
        header: "",
        cell: ({ row }: any) => (
          <Checkbox
            checked={selected.includes(row.original.id)}
            onCheckedChange={() => toggleInvoice(row.original.id)}
          />
        ),
        size: 50,
      },
      {
        id: "number",
        header: "Nº Documento",
        accessorKey: "number",
      },
      {
        id: "documentType",
        header: "Documento",
        accessorKey: "documentType",
      },
      {
        id: "amount",
        header: "Monto",
        accessorKey: "amount",
        cell: ({ row }: any) => `$${row.original.amount.toLocaleString()}`,
      },
      {
        id: "dueDate",
        header: "Vencimiento",
        accessorKey: "dueDate",
      },
      {
        id: "phase",
        header: "Fase",
        accessorKey: "phase",
      },
    ],
    [selected]
  );

  const handlePaginationChange = () => {};
  const isLoading = false;

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log("Datos enviados:", data);
    alert("Formulario enviado. Revisa consola para detalles.");
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-3">
        <Accordion type="single" collapsible defaultValue="debtor">
          <AccordionItem value="debtor" className="p-2 rounded-md my-2">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-8 h-8 p-1 rounded-xl bg-[#EFF5FF] text-[#1249C7]" />
                <span className="font-semibold text-lg">Información del deudor</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <FormField
                name="debtorDocument"
                render={() => (
                  <FormItem className="mt-4">
                    <FormLabel>
                      Seleccionar deudor 
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="19.123.123-2"
                        {...register("debtorDocument")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-[#EFF5FF] rounded-xl p-6 mt-6">
                <h4 className="font-semibold mb-4 text-sm">Datos del deudor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-[#1249C7] mt-[3px]" />
                    <div>
                      <div className="text-xs text-muted-foreground">Documento</div>
                      <div className="font-medium">19.123.123-2</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[#1249C7] mt-[3px]" />
                    <div>
                      <div className="text-xs text-muted-foreground">Contacto</div>
                      <div className="font-medium">Nombre apellido</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-[#1249C7] mt-[3px]" />
                    <div>
                      <div className="text-xs text-muted-foreground">Razón Social</div>
                      <div className="font-medium">Nombre legal empresa</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#1249C7] mt-[3px]" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-medium">nombre.apellido@email.com</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarCheck className="w-5 h-5 text-[#1249C7] mt-[3px]" />
                    <div>
                      <div className="text-xs text-muted-foreground">Solicitud de prórroga</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">DD/MM/AAAA</span>
                        <span className="text-[#1249C7] border border-[#1249C7] px-2 py-0.5 rounded-full text-xs cursor-pointer">
                          Plan de pago anterior
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#1249C7] mt-[3px]" />
                    <div>
                      <div className="text-xs text-muted-foreground">Teléfono</div>
                      <div className="font-medium">+56 9 1234 1234</div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="invoices" className="p-2 rounded-md my-2">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-8 h-8 p-1 rounded-xl bg-[#EFF5FF] text-[#1249C7]" />
                <span className="font-semibold text-lg">Facturas del deudor</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mt-5">
                <DataTable
                  columns={columnsByClientType}
                  data={mockInvoices}
                  showPagination={false}
                  onPaginationChange={handlePaginationChange}
                  isServerSideLoading={isLoading}
                  loadingComponent={<LoaderTable cols={7} />}
                  emptyMessage="No se encontraron facturas"
                />
              </div>
            </AccordionContent>
          </AccordionItem>


          <AccordionItem value="plan" className="p-2 rounded-md my-2">
            <AccordionTrigger className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-8 h-8 p-1 rounded-xl bg-[#EFF5FF] text-[#1249C7]" />
                <span className="font-semibold text-lg">Configuración del Plan de Pago</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <FormItem>
                  <FormLabel>
                    Colocación total ($)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="$1.000.000"
                      {...register("totalPlacement")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem>
                  <FormLabel>
                    Pago contado ($)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="$100.000"
                      {...register("upfrontPayment")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem>
                  <FormLabel>
                    N° de cuotas
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...register("installments", {
                        required: "Campo requerido",
                        min: { value: 1, message: "Debe ser al menos 1" },
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem>
                  <FormLabel>
                    Tasa de interés anual (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      {...register("interestRate", {
                        required: "Campo requerido",
                        min: { value: 0, message: "No puede ser negativa" },
                      })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem>
                  <FormLabel>
                    Formas de pago
                  </FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      {...register("paymentMethod")}
                    >
                      <option value="">Seleccione método</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="cheque">Cheque</option>
                      <option value="efectivo">Efectivo</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
                
                <FormItem>
                  <FormLabel>
                    Frecuencia de pago
                  </FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                      {...register("paymentFrequency")}
                    >
                      <option value="">Seleccione frecuencia</option>
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem>
                  <FormLabel>
                   Inicio de pago
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...register("startDate")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem className="md:col-span-2">
                  <FormLabel>Comentarios</FormLabel>
                  <FormControl>
                    <textarea
                      rows={4}
                      className="w-full rounded-md border border-gray-300 p-2"
                      {...register("comment")}
                      placeholder="Comentarios adicionales..."
                    />
                  </FormControl>
                </FormItem>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end pt-4">
          <Button type="submit">Generar plan de pago</Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default FormPaymentPlans;

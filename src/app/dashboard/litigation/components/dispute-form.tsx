"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDisputeStore } from "../store/disputeStore";
import { Loader2 } from "lucide-react";
import { useLitigationStore } from "../store/litigation-store";
import LitigationDialogConfirm from "./litigation-dialog-confirm";
import { useProfileContext } from "@/context/ProfileContext";
import { FormField } from "@/components/ui/form";
import DebtorsSelectFormItem from "../../components/debtors-select-form-item";
import SelectClient from "../../components/select-client";


const API_URL = process.env.NEXT_PUBLIC_API_URL;

const litigationSchema = z.object({
  client: z.string(),
  debtor: z.string(),
  invoiceType: z.string(),
  invoiceNumber: z.string(),
  invoiceAmount: z
    .string(),
  reason: z.string(),
  subreason: z.string(),
  contact: z.string(),
  comment: z.string().optional(),
  number: z.string().optional(),
  document: z.string().optional(),
  litigationAmount: z.string().optional(),
  debtorId: z.string().optional(), 
  invoiceId: z.string().optional(),
});

type LitigationForm = z.infer<typeof litigationSchema>;

const DisputeForm = () => {
  const { setField } = useDisputeStore();
  const { litigiosIngresados, addLitigio } = useLitigationStore();
  const [showDialog, setShowDialog] = useState(false);
  const { session, profile } = useProfileContext();

  const form = useForm<LitigationForm>({
    resolver: zodResolver(litigationSchema),
    defaultValues: {
      client: "",
      debtor: "",
      invoiceType: "",
      invoiceNumber: "",
      invoiceAmount: "",
      reason: "",
      subreason: "",
      contact: "",
      comment: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  const onSubmit = async (data: LitigationForm) => {
    console.log('data',profile)
    try {
      const payload = {
        invoice_id: data.invoiceNumber,
        debtor_id: data.debtorId,
        litigation_amount: parseFloat(data.litigationAmount ?? "0"),
        description: data.comment ?? "",
        motivo: data.reason,
        submotivo: data.subreason,
        contact: data.contact,
        initial_comment: data.comment ?? "",
      };
  
      const res = await fetch(
        `${API_URL}/v2/clients/${profile.client_id}/litigations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      console.log('que pasa', res)
  
      if (!res.ok) throw new Error("Error al crear litigio");
  
      setShowDialog(true);
      if (typeof window !== "undefined") {
        const event = new CustomEvent("litigation:created");
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar litigio");
      setShowDialog(false);
    }
  };
  
  
  const handleConfirm = () => {
    setShowDialog(false);
    reset(); 
  };

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[735px] max-w-full bg-white rounded-md p-6 space-y-6"
        >
          <div>
            <h2 className="text-lg font-semibold">Ingreso de litigio</h2>
            <p className="text-sm text-gray-500">
              Completa los campos obligatorios para ingresar un litigio.
            </p>
          </div>

          {/* Cliente y Deudor */}
          <div className="grid grid-cols-2 gap-4">
             {/* <FormField
                    control={form.control}
                    name="client"
                    render={({ field }) => (
                      <SelectClient field={field} title="Cliente" />
                    )}
                  /> */}
            <div>
              <label className="font-semibold">Cliente</label>
              <Input placeholder="Completa" {...register("client")} />
              {errors.client && (
                <p className="text-red-500 text-sm">{errors.client.message}</p>
              )}
            </div>
            <FormField
                  control={form.control}
                  name="debtorId"
                  render={({ field }) => (
                    <DebtorsSelectFormItem
                      field={field}
                      title="Deudor"
                    />
                  )}
                />
            {/* <div>
              <label className="font-semibold">Deudor</label>
              <Input placeholder="Completa" {...register("debtor")} />
              {errors.debtor && (
                <p className="text-red-500 text-sm">{errors.debtor.message}</p>
              )}
            </div> */}
          </div>

          {/* Factura */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-semibold">Factura</label>
              <select
                className="w-full border border-gray-300 p-2 rounded-md"
                {...register("invoiceType")}
              >
                <option value="">Selecciona tipo de factura</option>
                <option value="Factura">Factura</option>
                <option value="Nota de crédito">Nota de crédito</option>
              </select>
              {errors.invoiceType && (
                <p className="text-red-500 text-sm">{errors.invoiceType.message}</p>
              )}
            </div>
            <div>
              <label className="font-semibold">Número de factura</label>
              <Input placeholder="Completa" {...register("invoiceNumber")} />
              {errors.invoiceNumber && (
                <p className="text-red-500 text-sm">{errors.invoiceNumber.message}</p>
              )}
            </div>
            <div>
              <label className="font-semibold">Monto de factura</label>
              <Input placeholder="Completa" {...register("invoiceAmount")} />
              {errors.invoiceAmount && (
                <p className="text-red-500 text-sm">{errors.invoiceAmount.message}</p>
              )}
            </div>
          </div>

          {/* Tabla de litigios */}
          {litigiosIngresados.length === 0 ? (
            <div className="bg-gray-100 p-3 rounded text-sm text-gray-600 border">
              No hay litigios ingresados con anterioridad
            </div>
          ) : (
            <div className="border bg-gray-50 p-4 rounded mt-4">
              <h3 className="text-sm font-semibold mb-2">Litigios ingresados</h3>
              <table className="min-w-full border bg-white text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">
                      <input type="checkbox" />
                    </th>
                    <th className="p-2 text-left">Número</th>
                    <th className="p-2 text-left">Documento</th>
                    <th className="p-2 text-left">Monto Factura</th>
                    <th className="p-2 text-left">Monto Litigio</th>
                  </tr>
                </thead>
                <tbody>
                  {litigiosIngresados.map((l, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">
                        <input type="checkbox" />
                      </td>
                      <td className="p-2">{l.invoiceId}</td>
                      <td className="p-2">{l.invoiceId}</td>
                      <td className="p-2">${l.invoiceAmount}</td>
                      <td className="p-2">${l.litigationAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Motivo, submotivo, contacto */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-semibold">Motivo litigio</label>
              <select
                className="w-full border border-gray-300 p-2 rounded-md"
                {...register("reason")}
              >
                <option value="">Selecciona motivo</option>
                <option value="Falta de pago">Falta de pago</option>
                <option value="Error en factura">Error en factura</option>
              </select>
              {errors.reason && (
                <p className="text-red-500 text-sm">{errors.reason.message}</p>
              )}
            </div>
            <div>
              <label className="font-semibold">Submotivo</label>
              <select
                className="w-full border border-gray-300 p-2 rounded-md"
                {...register("subreason")}
              >
                <option value="">Selecciona submotivo</option>
                <option value="Monto incorrecto">Monto incorrecto</option>
                <option value="Factura duplicada">Factura duplicada</option>
              </select>
              {errors.subreason && (
                <p className="text-red-500 text-sm">{errors.subreason.message}</p>
              )}
            </div>
            <div>
              <label className="font-semibold">Contacto</label>
              <select
                className="w-full border border-gray-300 p-2 rounded-md"
                {...register("contact")}
              >
                <option value="">Selecciona contacto</option>
                <option value="Juan Pérez">Juan Pérez</option>
                <option value="María González">María González</option>
              </select>
              {errors.contact && (
                <p className="text-red-500 text-sm">{errors.contact.message}</p>
              )}
            </div>
          </div>

          {/* Comentario */}
          <div>
            <label className="font-semibold">Comentario</label>
            <Textarea
              placeholder="Comentario"
              {...register("comment")}
              className="min-h-[80px]"
            />
          </div>

          <div className=" bg-[#FF8113] h-0.5 max-w-full"></div>

          {/* Botón */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Ingresando litigio
                </>
              ) : (
                "Crear litigio"
              )}
            </Button>
          </div>
        </form>
      </FormProvider>

      {showDialog && (
        <div className="justify-center">

          <LitigationDialogConfirm
          title={<img src="/img/success-confirm.svg" alt="éxito" className="w-20 h-full mx-auto" />}
            description="El litigio ha sido creado con éxito."
            onConfirm={handleConfirm}
          />
        </div>
      )}
    </>
  );
};

export default DisputeForm;

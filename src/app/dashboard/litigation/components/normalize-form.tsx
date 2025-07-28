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
import Image from 'next/image';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

const litigationSchema = z.object({
  client: z.string(),
  debtor: z.string(),
  invoiceType: z.string(),
  invoiceNumber: z.string(),
  invoiceAmount: z.string(),
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

const NormalizeForm = () => {
  const { setField } = useDisputeStore();
  const { litigiosIngresados, addLitigio } = useLitigationStore();
  const [showDialog, setShowDialog] = useState(false);

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
    try {
      const payload = {
        invoice_id: data.invoiceNumber,
        debtor_id: data.debtor,
        litigation_amount: parseFloat(data.litigationAmount ?? "0"),
        description: "Cliente no responde...",
        motivo: data.reason,
        submotivo: data.subreason,
        contact: data.contact,
        initial_comment: data.comment ?? "",
      };
  
      const res = await fetch(
        `${API_URL}/v2/clients/${data.client}/litigations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
  
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
            <h2 className="text-lg font-semibold">Normailizar litigio</h2>
            <p className="text-sm text-gray-500">
              Completa los campos obligatorios para ingresar un litigio.
            </p>
          </div>

          {/* Cliente y Deudor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Cliente</label>
              <Input placeholder="Cliente" {...register("client")} />
              {errors.client && (
                <p className="text-red-500 text-sm">{errors.client.message}</p>
              )}
            </div>
            <div>
              <label className="font-semibold">Deudor</label>
              <Input placeholder="Deudor" {...register("debtor")} />
              {errors.debtor && (
                <p className="text-red-500 text-sm">{errors.debtor.message}</p>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Razón de normalización</label>
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
          <div className="grid grid-cols-2 gap-4 items-center ">
            <div className="bg-[#F1F5F9] mr-2 px-5 py-2 rounded w-full">
              <div className="flex items-center">

                <div className="items-center mr-2">
                <Image src="/img/dollar-sign.svg"
                   alt="Signo pesos"
                    width={8}
                    height={8}
                    className="w-8 h-8"></Image>
                </div>
                <div>
                  <p>Monto Factura</p>
                  <p className="text-[#2F6EFF] font-bold text-3xl">$ { ""}</p>
                </div>
              </div>

            </div>
            <Button
              type="submit"
               className="mt-4 px-5 bg-[#1249C7] text-white hover:bg-[#1249C7]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando
                </>
              ) : (
                "Normalizar"
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

export default NormalizeForm;

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import DebtorsSelectFormItem from "../../components/debtors-select-form-item";
import SelectClient from "../../components/select-client";
import { useDisputeStore } from "../store/disputeStore";
import { useLitigationStore } from "../store/litigation-store";
import EmptyLitigations from "./empty-litigations";
import LitigationDialogConfirm from "./litigation-dialog-confirm";

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
  const { data: session } = useSession();
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
    control,
  } = form;

  const onSubmit = async (data: LitigationForm) => {
    try {
      const payload = {
        normalization_reason: data.reason,
        normalization_by_contact: data.contact,
        comment: data.comment,
        is_important_comment: "Cliente no responde...",
      };

      const res = await fetch(
        `${API_URL}/v2/clients/${data.client}/litigations/${data.invoiceId}/normalize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.token}`,
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
      <Form {...form}>
        <form
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Cliente y Deudor */}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="client"
              render={({ field }) => (
                <SelectClient field={field} title="Cliente" singleClient />
              )}
            />

            <FormField
              control={control}
              name="debtorId"
              render={({ field }) => (
                <DebtorsSelectFormItem field={field} title="Deudor" />
              )}
            />
          </div>
          {/* Tabla de litigios */}
          {litigiosIngresados.length === 0 ? (
            <EmptyLitigations />
          ) : (
            <div className="border bg-gray-50 p-4 rounded mt-4">
              <h3 className="text-sm font-semibold mb-2">
                Litigios ingresados
              </h3>
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
              className="min-h-[40px]"
            />
          </div>

          <div className=" bg-[#FF8113] h-0.5 max-w-full"></div>

          {/* Botón */}
          <div className="grid grid-cols-3 gap-4 items-center justify-center">
            <div className="col-span-2 bg-[#F1F5F9] mr-2 px-5 py-2 rounded w-full">
              <div className="flex items-center">
                <div className="items-center mr-2">
                  <Image
                    src="/img/dollar-sign.svg"
                    alt="Signo pesos"
                    width={8}
                    height={8}
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <p>Monto Factura</p>
                  <p className="text-[#2F6EFF] font-bold text-3xl">$ {"..."}</p>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <Button
                type="submit"
                className="mt-4 px-10 bg-[#1249C7] text-white hover:bg-[#1249C7]/90 w-full"
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
          </div>
        </form>
      </Form>

      {showDialog && (
        <div className="justify-center">
          <LitigationDialogConfirm
            title={
              <img
                src="/img/success-confirm.svg"
                alt="éxito"
                className="w-20 h-full mx-auto"
              />
            }
            description="El litigio ha sido creado con éxito."
            onConfirm={handleConfirm}
          />
        </div>
      )}
    </>
  );
};

export default NormalizeForm;

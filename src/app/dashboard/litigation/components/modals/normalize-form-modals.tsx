"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Loader2, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useLitigationStore } from "../../store/litigation-store";
import LitigationDialogConfirm from "../litigation-dialog-confirm";
import { Litigation } from "../../types";
import { useProfileContext } from '../../../../../context/ProfileContext';
import { normalizeLitigation } from "../../services";
import DebtorsSelectFormItem from "@/app/dashboard/components/debtors-select-form-item";
import SelectClient from "@/app/dashboard/components/select-client";
import { FormField } from "@/components/ui/form";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const normalizeSchema = z.object({
    normalizedReason: z.string(),
    contact: z.string(),
    comment: z.string().optional(),
    client: z.string(),
    debtor: z.string().optional(),
    invoiceNumber: z.string().optional(),
});

type normalizeForm = z.infer<typeof normalizeSchema>;

type NormalizeFormModalsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  litigation: Litigation;
};

const NormalizeFormModals = ({ open, onOpenChange, litigation }: NormalizeFormModalsProps) => {
    const [showDialog, setShowDialog] = useState(false);
    const {session,profile} = useProfileContext()
    const form = useForm<z.infer<typeof normalizeSchema>>({
        resolver: zodResolver(normalizeSchema),
        defaultValues: {
            normalizedReason: "",
          client: "",
          debtor: "",
            contact: "",
          comment: ""
        },
      });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control
  } = form;

  const onSubmit = async (data: normalizeForm) => {
    try {
        const payload = {
            normalization_reason: data.normalizedReason,
            normalization_by_contact: data.contact,
            comment: data.comment,
            is_important_comment: false,
        };
        console.log("Formulario enviado payload", payload);
  
        const accessToken = session?.token;
      const clientId = profile?.client_id;
      const litigationId = litigation.id;
  
      if (!accessToken || !clientId || !litigationId) {
        throw new Error("Faltan datos necesarios para la actualización");
      }

    await normalizeLitigation(accessToken, clientId, litigationId, payload);
    //   const res = await fetch(`${API_URL}/v2/clients/${data.client}/litigations/${data.}/normalize`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(payload),
    //   });

    //   if (!res.ok) throw new Error("Error al crear litigio");

      setShowDialog(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("litigation:created"));
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
    onOpenChange(false);
  };

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-start"
        >
                  <div className="bg-white rounded-md w-full max-w-3xl relative py-8 px-6">
                  <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 hover:text-black"
          >
            <X />
                      </button>
                      
            <div>
              <h2 className="text-lg font-semibold">Normalizar litigio</h2>
              <p className="text-sm text-gray-500">Completa los campos obligatorios para ingresar un litigio.</p>
            </div>

            <div className="grid grid-cols-2 bg-[#EDF2F7] px-4 py-3 my-4 rounded-md">
              <div>
                <p className="text-sm text-gray-600">Monto factura</p>
                <p className="text-[#2F6EFF] font-bold text-2xl">
                  ${(litigation.invoice.amount || "0")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto litigio</p>
                <p className="text-[#2F6EFF] font-bold text-2xl">
                  ${(litigation.litigation_amount || "0").toLocaleString("es-CL")}
                </p>
              </div>
            </div>

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
              name="debtor"
              render={({ field }) => (
                <DebtorsSelectFormItem field={field} title="Deudor" />
              )}
            />
          </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="font-semibold">N° Factura</label>
                <Input placeholder="Ingresar" {...register("invoiceNumber")} />
                {errors.invoiceNumber && <p className="text-red-500 text-sm">{errors.invoiceNumber.message}</p>}
              </div>
              <div className="flex flex-col">
                <label className="font-semibold">Razón de normalización</label>
                <select {...register("normalizedReason")} className="w-full border border-gray-300 p-2 rounded-md">
                    <option value="PAYMENT_RECEIVED">Pago recibido</option>
                    <option value="PAYMENT_AGREEMENT">Acuerdo de pago</option>
                    <option value="PARTIAL_PAYMENT">Pago parcial</option>
                    <option value="DEBT_FORGIVENESS">Condonación de deuda</option>
                    <option value="LEGAL_SETTLEMENT">Acuerdo legal</option>
                    <option value="ADMINISTRATIVE_ERROR">Error administrativo</option>
                    <option value="DUPLICATE_INVOICE">Factura duplicada</option>
                    <option value="OTHER">Otro</option>
                </select>
                {errors.normalizedReason && <p className="text-red-500 text-sm">{errors.normalizedReason.message}</p>}
              </div>
              <div className="flex flex-col">
                <label className="font-semibold">Contacto</label>
                <select className="w-full border border-gray-300 p-2 rounded-md" {...register("contact")}>
                  <option value="">Selecciona</option>
                  <option value="A. Díaz">A. Díaz</option>
                  <option value="Juan Pérez">Juan Pérez</option>
                </select>
                {errors.contact && <p className="text-red-500 text-sm">{errors.contact.message}</p>}
              </div>
            </div>

            {/* COMENTARIO */}
            <div className="mb-4">
              <label className="font-semibold">Comentario</label>
              <Textarea placeholder="Completa" {...register("comment")} className="min-h-[40px]" />
            </div>

            {/* LÍNEA DIVISORIA */}
            <div className="bg-[#FF8113] h-0.5 w-full mb-4"></div>

            {/* BOTÓN */}
            <div className=" mx-auto">
              <Button
                type="submit"
                className="w-[25%] bg-[#1249C7] text-white hover:bg-[#1249C7]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Guardando
                  </>
                ) : (
                  "Normalizar"
                )}
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>

      {/* DIALOG CONFIRMACIÓN */}
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

export default NormalizeFormModals;

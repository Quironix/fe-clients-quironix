"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { useLitigationStore } from "../store/litigation-store";
import { GetAllLitigationByDebtorId } from "../services";
import { useProfileContext } from "@/context/ProfileContext";
import { FormField } from "@/components/ui/form";
import DebtorsSelectFormItem from "../../components/debtors-select-form-item";
import SelectClient from "../../components/select-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const formSchema = z.object({
  reason: z.string(),
  contact: z.string(),
  comment: z.string(),
  client: z.string(),
  debtorId: z.string()
});

type FormSchema = z.infer<typeof formSchema>;

export default function NormalizeLitigationForm() {
  const [litigations, setLitigations] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { session, profile } = useProfileContext();
  const [deudorId, setDeudorId] = useState<string | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      contact: "",
      comment: "",
    },
  });

  const { addLitigio, clearLitigios } = useLitigationStore();

    const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = form;

  const debtorId = form.watch("debtorId");
  
  useEffect(() => {
    async function fetchLitigations() {
      try {
        setLoading(true);
        const data = await GetAllLitigationByDebtorId(
          profile.client_id,
          session.token,
          debtorId
        );
        setLitigations(data);
      } catch (err) {
        console.error("Error al cargar litigios", err);
      } finally {
        setLoading(false);
      }
    }

    if (profile.client_id && session.token) {
      fetchLitigations();
    }
  }, [profile.client_id, session.token]);

  const handleCheckboxChange = (id: string, litigio: any) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      } else {
        addLitigio({ ...litigio, litigation_id: id });
        return [...prev, id];
      }
    });
  };

  const onSubmit = async (data: FormSchema) => {
    const payload = {
      litigations: litigations
        .filter((l) => selectedIds.includes(l.litigation_id))
        .map((l) => ({
          litigation_id: l.litigation_id,
          normalization_reason: data.reason,
          normalization_by_contact: data.contact,
          comment: data.comment,
          is_important_comment: false,
        })),
    };

    try {
      const res = await fetch(
        `${API_URL}/v2/clients/${profile.client_id}/litigations/bulk-normalize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al normalizar litigios");
      }

      setShowDialog(true);
      clearLitigios();
      form.reset();
      setSelectedIds([]);
      window.dispatchEvent(new CustomEvent("litigation:created"));
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al guardar litigio");
      setShowDialog(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
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
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Motivo de normalización
        </label>
        <Input {...form.register("reason")} />
        {form.formState.errors.reason && (
          <p className="text-sm text-red-500">
            {form.formState.errors.reason.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contacto con cliente
        </label>
        <Input {...form.register("contact")} />
        {form.formState.errors.contact && (
          <p className="text-sm text-red-500">
            {form.formState.errors.contact.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Comentario (opcional)
        </label>
        <Textarea {...form.register("comment")} />
      </div>

      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">Litigios disponibles</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Cargando litigios...</p>
        ) : litigations.length === 0 ? (
          <p className="text-sm text-gray-500">No hay litigios para mostrar</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-auto">
            {litigations.map((litigio) => (
              <div
                key={litigio.litigation_id}
                className="flex items-center justify-between border rounded px-2 py-1"
              >
                <div className="text-sm">
                  <p className="font-medium">Factura: {litigio.invoiceId}</p>
                  <p>Monto: ${litigio.invoiceAmount}</p>
                  <p>Motivo: {litigio.reason}</p>
                </div>
                <Checkbox
                  checked={selectedIds.includes(litigio.litigation_id)}
                  onCheckedChange={() =>
                    handleCheckboxChange(litigio.litigation_id, litigio)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full">
        Normalizar seleccionados
      </Button>

      {showDialog && (
        <p className="text-sm text-green-600 mt-2">
          Litigios normalizados exitosamente.
        </p>
      )}
    </form>
  );
}

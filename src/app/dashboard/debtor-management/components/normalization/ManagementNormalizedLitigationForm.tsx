"use client";

import { Invoice } from "@/app/dashboard/payment-plans/store";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import InvoiceCardLitigation from "./InvoiceCardLitigation";

const normalizationReasons = [
  { code: "PAYMENT", label: "Pago total" },
  { code: "PARTIAL_PAYMENT", label: "Pago parcial" },
  { code: "AGREEMENT", label: "Acuerdo" },
  { code: "CONDONATION", label: "Condonación" },
  { code: "OTHER", label: "Otro" },
];

const normalizationFormSchema = z.object({
  selectedInvoiceIds: z
    .array(z.string())
    .min(1, "Debes seleccionar al menos una factura"),
  reason: z.string().min(1, "La razón de normalización es requerida"),
  comment: z.string().min(1, "El comentario es requerido"),
});

type ManagementNormalizedLitigationFormData = z.infer<
  typeof normalizationFormSchema
>;

interface LitigationItem {
  id: string;
  invoice_id: string;
  invoice?: any;
  litigation_amount?: number;
}

interface ManagementNormalizedLitigationFormProps {
  value?: any;
  onChange: (data: any) => void;
  selectedInvoices?: Invoice[];
  litigations?: LitigationItem[];
}

const ManagementNormalizedLitigationForm = ({
  value,
  onChange,
  selectedInvoices = [],
  litigations = [],
}: ManagementNormalizedLitigationFormProps) => {
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>(
    value?.selectedInvoiceIds || []
  );
  const [reason, setReason] = useState<string>(value?.reason || "");
  const [comment, setComment] = useState<string>(value?.comment || "");

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const form = useForm<ManagementNormalizedLitigationFormData>({
    resolver: zodResolver(normalizationFormSchema),
    mode: "onChange",
    defaultValues: value || {
      selectedInvoiceIds: [],
      reason: "",
      comment: "",
    },
  });

  const getInvoiceIdsWithLitigation = (): string[] => {
    return litigations.map((litigation) => litigation.invoice_id);
  };

  const hasLitigation = (invoiceId: string): boolean => {
    return getInvoiceIdsWithLitigation().includes(invoiceId);
  };

  const getLitigationNumber = (invoiceId: string): string | undefined => {
    const litigation = litigations.find((lit) => lit.invoice_id === invoiceId);
    if (!litigation?.litigation_amount) return undefined;
    return new Intl.NumberFormat("es-CL").format(Number(litigation.litigation_amount));
  };

  const handleToggleInvoice = (invoice: Invoice) => {
    if (!hasLitigation(invoice.id)) {
      return;
    }

    setSelectedInvoiceIds((prev) => {
      const isSelected = prev.includes(invoice.id);
      if (isSelected) {
        return prev.filter((id) => id !== invoice.id);
      } else {
        return [...prev, invoice.id];
      }
    });
  };

  const getTotalAmount = (): number => {
    return selectedInvoices
      .filter((inv) => selectedInvoiceIds.includes(inv.id))
      .reduce((sum, inv) => sum + Number(inv.balance || 0), 0);
  };

  useEffect(() => {
    const validateAndNotify = async () => {
      form.setValue("selectedInvoiceIds", selectedInvoiceIds, {
        shouldValidate: false,
      });
      form.setValue("reason", reason, { shouldValidate: false });
      form.setValue("comment", comment, { shouldValidate: false });

      setTimeout(async () => {
        const isValid = await form.trigger();

        onChangeRef.current({
          selectedInvoiceIds,
          reason,
          comment,
          totalAmount: getTotalAmount(),
          _isValid: isValid,
        });
      }, 100);
    };

    validateAndNotify();
  }, [selectedInvoiceIds, reason, comment, form]);

  return (
    <div className="space-y-4">
      <Form {...form}>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Litigios abiertos</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {selectedInvoices.length} disponible
                {selectedInvoices.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Selecciona la o las facturas que se encuentran en litigio para ser
              normalizadas.
            </p>
          </div>

          {selectedInvoices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2">
              {selectedInvoices.map((invoice) => {
                const isSelected = selectedInvoiceIds.includes(invoice.id);
                const invoiceHasLitigation = hasLitigation(invoice.id);
                const litigationNumber = getLitigationNumber(invoice.id);

                return (
                  <InvoiceCardLitigation
                    key={invoice.id}
                    invoice={invoice}
                    isSelected={isSelected}
                    isDisabled={!invoiceHasLitigation}
                    showAmountInput={false}
                    litigationNumber={litigationNumber}
                    disabledReason={
                      !invoiceHasLitigation
                        ? "No pertenece a litigios abiertos"
                        : undefined
                    }
                    onToggleSelect={() => handleToggleInvoice(invoice)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-sm text-gray-500">
                No hay facturas seleccionadas en el Paso 1
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Razón de normalización <Required />
              </label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona razón" />
                </SelectTrigger>
                <SelectContent>
                  {normalizationReasons.map((item) => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Comentario <Required />
              </label>
              <Textarea
                placeholder="Ingresa un comentario sobre la normalización"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[40px] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Monto litigios de factura seleccionadas:
              </span>
              <span className="text-lg font-bold text-blue-700">
                ${new Intl.NumberFormat("es-CL").format(getTotalAmount())}
              </span>
            </div>
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={selectedInvoiceIds.length === 0 || !reason || !comment}
            >
              Normalizar litigios
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default ManagementNormalizedLitigationForm;

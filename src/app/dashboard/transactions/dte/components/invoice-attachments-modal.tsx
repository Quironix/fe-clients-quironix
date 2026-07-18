"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfileContext } from "@/context/ProfileContext";
import { FileText, Loader2, Paperclip, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createInvoiceAttachment,
  deleteInvoiceAttachment,
  getInvoiceAttachments,
} from "../services";
import { DTE, InvoiceAttachment } from "../types";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

interface InvoiceAttachmentsModalProps {
  invoice: DTE;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InvoiceAttachmentsModal = ({
  invoice,
  open,
  onOpenChange,
}: InvoiceAttachmentsModalProps) => {
  const { session, profile } = useProfileContext();
  const [attachments, setAttachments] = useState<InvoiceAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const clientId = profile?.client?.id || "";
  const invoiceId = invoice.id || "";

  const loadAttachments = async () => {
    if (!session?.token || !clientId || !invoiceId) return;
    setIsLoading(true);
    try {
      const data = await getInvoiceAttachments(
        session.token,
        clientId,
        invoiceId
      );
      setAttachments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener comprobantes:", error);
      toast.error("Error al obtener los comprobantes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAttachments();
    }
  }, [open]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!session?.token || !clientId || !invoiceId) {
      toast.error("Error de autenticación");
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      await createInvoiceAttachment(session.token, clientId, invoiceId, {
        file: base64,
        filename: file.name,
      });
      toast.success("Comprobante subido correctamente");
      await loadAttachments();
    } catch (error) {
      console.error("Error al subir comprobante:", error);
      toast.error("Error al subir el comprobante");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!session?.token || !clientId) return;
    try {
      await deleteInvoiceAttachment(session.token, clientId, attachmentId);
      toast.success("Comprobante eliminado");
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (error) {
      console.error("Error al eliminar comprobante:", error);
      toast.error("Error al eliminar el comprobante");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Comprobantes de la factura {invoice.number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : attachments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              Esta factura no tiene comprobantes cargados
            </p>
          ) : (
            <ul className="space-y-2">
              {attachments.map((attachment) => (
                <li
                  key={attachment.id}
                  className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 shrink-0 text-gray-500" />
                    <a
                      href={attachment.storage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      {attachment.filename}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(attachment.id)}
                    className="hover:bg-red-500 hover:text-white text-primary shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <label className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-md p-3 cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
            <Upload className="w-4 h-4" />
            {isUploading ? "Subiendo..." : "Subir un comprobante"}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={isUploading}
              onChange={handleFileChange}
            />
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceAttachmentsModal;

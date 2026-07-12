"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Loader2, Mail, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { sendTrackEmail } from "../../../services/email-sender";
import { TrackEmailMessage } from "../../../types/debtor-tracks";
import { EmailPayload } from "../../../types/email";

// PRD_canal_correo_bidireccional_multiturno.md §4.6: template SendGrid
// dedicado de "respuesta rápida", pendiente de crear (ver §14 pregunta #1).
// NEXT_PUBLIC_ es obligatorio para que Next.js exponga la var al browser.
const QUICK_REPLY_TEMPLATE_ID = process.env.NEXT_PUBLIC_SG_QUICK_REPLY || "";

interface EmailThreadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  messages: TrackEmailMessage[];
  loading?: boolean;
  trackId?: string | null;
  accessToken?: string;
  clientId?: string;
  onMessageSent?: () => void;
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  } catch {
    return dateString;
  }
};

// PRD_canal_correo_bidireccional_multiturno.md §7.2/§7.3: el hilo se arma con
// una sola fuente (GET .../email-messages, ambas direcciones, ya ordenado),
// sin merge en frontend. El compose de "Responder" reusa el mismo template
// de respuesta rápida para todo el hilo (§4.6).
export const EmailThreadSheet = ({
  isOpen,
  onClose,
  messages,
  loading,
  trackId,
  accessToken,
  clientId,
  onMessageSent,
}: EmailThreadSheetProps) => {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const lastInboundMessage = [...messages]
    .reverse()
    .find((m) => m.direction === "IN");
  const lastOutboundMessage = [...messages]
    .reverse()
    .find((m) => m.direction === "OUT");
  const replyToAddress =
    lastInboundMessage?.from_address ||
    lastOutboundMessage?.to_addresses?.[0] ||
    null;

  // Asunto del hilo (el primer mensaje que tenga uno), prefijado con "Re: "
  // si no lo tiene ya — así la respuesta se ve con el mismo formato que el
  // resto del hilo (asunto en negrita) en el historial de gestiones.
  const originalSubject = messages.find((m) => m.subject)?.subject;
  const replySubject = originalSubject
    ? originalSubject.trim().toLowerCase().startsWith("re:")
      ? originalSubject
      : `Re: ${originalSubject}`
    : undefined;

  const handleSendReply = async () => {
    if (!replyText.trim() || !trackId || !accessToken || !clientId) return;
    if (!replyToAddress) {
      toast.error("No se pudo determinar el destinatario de la respuesta");
      return;
    }

    setSending(true);
    try {
      const bodyHtml = replyText.replace(/\n/g, "<br>");
      const result = await sendTrackEmail(
        {
          to: replyToAddress,
          templateId: QUICK_REPLY_TEMPLATE_ID,
          trackId,
          subject: replySubject,
          // PRD §4.6: template mínimo (logo + {{body_html}} + firma) — shape
          // deliberadamente distinto al de EmailDynamicTemplateData (pensado
          // para el template de gestión individual).
          dynamicTemplateData: {
            body_html: bodyHtml,
          } as EmailPayload["dynamicTemplateData"],
        },
        accessToken,
        clientId,
      );

      if (result.success) {
        setReplyText("");
        toast.success("Respuesta enviada");
        onMessageSent?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error al enviar respuesta:", error);
      toast.error("Error al enviar la respuesta");
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Hilo de correo
          </SheetTitle>
          <SheetDescription>
            Intercambio completo entre el ejecutivo y el deudor, en orden
            cronológico.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-4 pb-4 overflow-y-auto flex-1">
          {loading && (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Cargando
              hilo...
            </div>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay mensajes para mostrar.
            </p>
          )}
          {!loading &&
            messages.map((message) => {
              const isInbound = message.direction === "IN";
              const attachments = message.attachments || [];

              return (
                <div
                  key={message.id}
                  className={`flex ${isInbound ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-sm ${
                      isInbound
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-blue-50 border border-blue-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span
                        className={`text-xs font-semibold ${
                          isInbound ? "text-emerald-700" : "text-blue-700"
                        }`}
                      >
                        {isInbound ? "Correo entrante" : "Correo saliente"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(message.created_at)}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      {isInbound
                        ? `De: ${message.from_address}`
                        : `Para: ${message.to_addresses?.join(", ") || "-"}`}
                    </div>

                    {message.subject && (
                      <p className="font-semibold mb-1">{message.subject}</p>
                    )}

                    {isInbound ? (
                      <p className="whitespace-pre-wrap break-words text-gray-700">
                        {message.body_text || "-"}
                      </p>
                    ) : (
                      <div
                        className="text-gray-700 [&_a]:text-blue-600 [&_a]:underline"
                        dangerouslySetInnerHTML={{
                          __html: message.body_html || "-",
                        }}
                      />
                    )}

                    {attachments.length > 0 && (
                      <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-gray-200">
                        {attachments.map((attachment, index) => (
                          <a
                            key={`${attachment.storage_url}-${index}`}
                            href={attachment.storage_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="flex items-center gap-1 text-blue-600 hover:underline break-all text-xs"
                          >
                            <Paperclip className="h-3 w-3 shrink-0" />
                            {attachment.filename}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {QUICK_REPLY_TEMPLATE_ID && (
          <div className="border-t px-4 py-3 flex flex-col gap-2">
            <Textarea
              placeholder={
                replyToAddress
                  ? `Responder a ${replyToAddress}...`
                  : "Escribe tu respuesta..."
              }
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              disabled={sending || !trackId}
              rows={3}
            />
            <Button
              onClick={handleSendReply}
              disabled={sending || !replyText.trim() || !trackId}
              className="self-end"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar respuesta
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { Mail, Paperclip } from "lucide-react";
import {
  DEBTOR_COMMENTS,
  getExecutiveCommentLabel,
} from "../../../config/management-types";
import { InvoiceWithTrack } from "../../../types/debtor-tracks";

interface EmailThreadSheetProps {
  isOpen: boolean;
  onClose: () => void;
  messages: InvoiceWithTrack[];
}

const getDebtorCommentLabel = (comment?: string) => {
  if (!comment) return null;
  const found = DEBTOR_COMMENTS.find((c) => c.value === comment);
  return found?.label || comment;
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  } catch {
    return dateString;
  }
};

export const EmailThreadSheet = ({
  isOpen,
  onClose,
  messages,
}: EmailThreadSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Hilo de correo
          </SheetTitle>
          <SheetDescription>
            Intercambio completo entre el ejecutivo y el deudor, en orden
            cronológico.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-3 px-4 pb-4 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay mensajes para mostrar.
            </p>
          )}
          {messages.map((message) => {
            const track = message.track;
            const isInbound = track?.managementType === "MAIL_IN";
            const attachments = track?.attachments || [];

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
                      {formatDateTime(track?.createdAt)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-2">
                    {isInbound ? "De: " : "Para: "}
                    {track?.contact?.name || track?.contact?.value || "-"}
                  </div>

                  {isInbound ? (
                    <>
                      {track?.emailSubject && (
                        <p className="font-semibold mb-1">
                          {track.emailSubject}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words text-gray-700">
                        {track?.emailBody || "-"}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-1 text-gray-700">
                      {getDebtorCommentLabel(track?.debtorComment) && (
                        <p>
                          <span className="text-gray-500">
                            Comentario deudor:{" "}
                          </span>
                          {getDebtorCommentLabel(track?.debtorComment)}
                        </p>
                      )}
                      {track?.executiveComment && (
                        <p>
                          <span className="text-gray-500">
                            Comentario analista:{" "}
                          </span>
                          {getExecutiveCommentLabel(track.executiveComment)}
                        </p>
                      )}
                      {track?.observation && (
                        <p className="whitespace-pre-wrap break-words">
                          {track.observation}
                        </p>
                      )}
                    </div>
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
      </SheetContent>
    </Sheet>
  );
};

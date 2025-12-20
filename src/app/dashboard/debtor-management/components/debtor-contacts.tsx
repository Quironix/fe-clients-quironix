"use client";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useWebRTCAutoConnect } from "@/hooks/useWebRTCAutoConnect";
import { useWebRTCPhone } from "@/hooks/useWebRTCPhone";
import {
  Clock,
  Mail,
  MailIcon,
  Phone,
  PhoneOff,
  Plus,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateContactForm from "../../components/create-contact-from";
import DialogForm from "../../components/dialog-form";
import { useDebtorsStore } from "../../debtors/store";
import type { Contact } from "../../debtors/types";

interface DebtorContactsProps {
  mainContact: Contact;
  additionalContacts?: Contact[] | any;
  callSchedule: string;
}

export const DebtorContacts = ({
  mainContact,
  additionalContacts = [],
  callSchedule,
}: DebtorContactsProps) => {
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState(0);
  const { dataDebtor } = useDebtorsStore();
  const { isRegistered, callStatus, makeCall, hangup } = useWebRTCPhone();

  const { isConnected } = useWebRTCAutoConnect();

  // Usar los contactos del store si están disponibles, sino usar las props
  const contacts =
    dataDebtor?.contacts && dataDebtor.contacts.length > 0
      ? dataDebtor.contacts
      : [mainContact, ...additionalContacts];

  const [currentMainContact, setCurrentMainContact] = useState<Contact>(
    contacts[0] || mainContact
  );
  const [currentAdditionalContacts, setCurrentAdditionalContacts] = useState<
    Contact[]
  >(contacts.slice(1) || additionalContacts);

  // Actualizar cuando cambian los contactos en el store
  useEffect(() => {
    if (dataDebtor?.contacts && dataDebtor.contacts.length > 0) {
      setCurrentMainContact(dataDebtor.contacts[0]);
      setCurrentAdditionalContacts(dataDebtor.contacts.slice(1));
    }
  }, [dataDebtor?.contacts]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (callStatus === "in-call") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callStatus]);

  const formatCallDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleContactSwap = (index: number) => {
    const selectedContact = currentAdditionalContacts[index];
    const newAdditionalContacts = [...currentAdditionalContacts];
    newAdditionalContacts[index] = currentMainContact;
    setCurrentMainContact(selectedContact);
    setCurrentAdditionalContacts(newAdditionalContacts);
  };

  const handleCall = () => {
    if (!isRegistered) {
      toast.error("No estás conectado a la central telefónica");
      return;
    }

    if (
      callStatus === "in-call" ||
      callStatus === "calling" ||
      callStatus === "ringing"
    ) {
      // Si ya hay una llamada en curso, colgar
      hangup();
    } else {
      // Realizar nueva llamada
      const phoneNumber = currentMainContact.phone;
      if (phoneNumber) {
        makeCall(phoneNumber);
      } else {
        toast.error("El contacto no tiene número de teléfono");
      }
    }
  };

  const isInCall =
    callStatus === "in-call" ||
    callStatus === "calling" ||
    callStatus === "ringing";

  return (
    <div className="bg-[#EFF5FF] rounded-lg px-6 py-4 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900">Contactos</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Título */}

          {/* Contacto principal */}
          <div className="flex items-center gap-3 min-w-64">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-0">
                <span className="text-sm font-semibold text-gray-900">
                  {currentMainContact.name}
                </span>
                <span className="text-[12px] text-gray-900">
                  {currentMainContact.email}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {currentMainContact.phone}
              </span>
            </div>
          </div>

          {/* Contactos adicionales */}
          {currentAdditionalContacts.map((contact: Contact, index: number) => (
            <HoverCard key={index} openDelay={200}>
              <HoverCardTrigger asChild>
                <div
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white cursor-pointer hover:bg-gray-300 transition-colors"
                  onClick={() => handleContactSwap(index)}
                >
                  <User className="w-6 h-6 text-gray-600" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent
                className="w-80 shadow-lg"
                side="bottom"
                align="center"
                sideOffset={5}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {contact.name}
                      </h4>
                      <p className="text-sm text-gray-600">{contact.role}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{contact.email}</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
          <DialogForm
            open={openAdd}
            title="Agregar nuevo contacto"
            onOpenChange={setOpenAdd}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="border-orange-600 text-orange-600 bg-orange-50 hover:bg-white hover:text-orange-600 rounded-full w-10 h-10 flex items-center justify-center"
                onClick={() => setOpenAdd(!openAdd)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            }
          >
            <CreateContactForm
              onSuccess={() => {
                setOpenAdd(false);
                // La UI se actualizará automáticamente porque el store de debtors se actualizó
              }}
            />
          </DialogForm>
          {/* Separador vertical */}
          <div className="h-12 w-px bg-gray-300" />

          {/* Horario de llamada */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-700">
                <MailIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Llamada</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {callSchedule.length > 0 ? callSchedule : "08:00 - 18:00"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-3">
          {isInCall ? (
            <>
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-600 text-white cursor-default font-bold"
                disabled
              >
                <Phone className="w-4 h-4 mr-2 font-bold" strokeWidth={3} />
                En llamada {formatCallDuration(callDuration)}
              </Button>
              <Button
                size="lg"
                variant="destructive"
                className="text-white w-10 h-10 p-0 font-bold"
                style={{ backgroundColor: "#FF3B30" }}
                onClick={hangup}
              >
                <PhoneOff className="w-5 h-5 font-bold" strokeWidth={3} />
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              onClick={handleCall}
              disabled={!isRegistered}
              className="font-bold"
            >
              <Phone className="w-4 h-4 mr-2 font-bold" strokeWidth={3} />
              {isRegistered ? "Llamar" : "Conectando..."}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

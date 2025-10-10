import { Button } from "@/components/ui/button";
import { Clock, Phone, Plus, User, Mail } from "lucide-react";
import { useState } from "react";
import DialogForm from "../../components/dialog-form";
import CreateContactForm from "../../components/create-contact-from";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface Contact {
  name: string;
  role: string;
  function: string;
  email: string;
  phone: string;
  channel: string;
}

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
  const [currentMainContact, setCurrentMainContact] = useState<Contact>(mainContact);
  const [currentAdditionalContacts, setCurrentAdditionalContacts] = useState<Contact[]>(additionalContacts);

  const handleContactSwap = (index: number) => {
    const selectedContact = currentAdditionalContacts[index];
    const newAdditionalContacts = [...currentAdditionalContacts];
    newAdditionalContacts[index] = currentMainContact;
    setCurrentMainContact(selectedContact);
    setCurrentAdditionalContacts(newAdditionalContacts);
  };

  return (
    <div className="bg-[#EFF5FF] rounded-lg px-6 py-4 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900">Contactos</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Título */}

          {/* Contacto principal */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-900">
                {currentMainContact.name}
              </span>
              <span className="text-sm text-gray-600">{currentMainContact.phone}</span>
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
              <HoverCardContent className="w-80 shadow-lg" side="bottom" align="center" sideOffset={5}>
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

          {/* Separador vertical */}
          <div className="h-12 w-px bg-gray-300" />

          {/* Horario de llamada */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Llamada</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{callSchedule}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-3">
          <DialogForm
            open={openAdd}
            title="Agregar nuevo contacto"
            onOpenChange={setOpenAdd}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={() => setOpenAdd(!openAdd)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            }
          >
            <CreateContactForm />
          </DialogForm>

          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Phone className="w-4 h-4 mr-2" />
            Llamar
          </Button>
        </div>
      </div>
    </div>
  );
};

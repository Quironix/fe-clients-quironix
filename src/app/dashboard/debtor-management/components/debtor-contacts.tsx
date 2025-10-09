import { Button } from "@/components/ui/button";
import { Clock, Phone, Plus, User } from "lucide-react";

interface Contact {
  name: string;
  phone: string;
  avatar?: string;
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
                {mainContact.name}
              </span>
              <span className="text-sm text-gray-600">{mainContact.phone}</span>
            </div>
          </div>

          {/* Contactos adicionales */}
          {additionalContacts.map((contact, index) => (
            <div
              key={index}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white"
            >
              <User className="w-6 h-6 text-gray-600" />
            </div>
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
          <Button
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
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

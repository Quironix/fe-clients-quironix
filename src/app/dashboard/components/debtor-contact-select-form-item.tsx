import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DebtorContactSelectFormItemProps {
  field: any;
  selectedDebtor: any;
  isFetchingDebtor: boolean;
}

export default function DebtorContactSelectFormItem({
  field,
  selectedDebtor,
  isFetchingDebtor,
}: DebtorContactSelectFormItemProps) {
  return (
    <FormItem>
      <FormLabel>Contacto</FormLabel>
      <Select
        onValueChange={(value) => {
          field.onChange(value);
        }}
        value={field.value}
        disabled={!selectedDebtor || isFetchingDebtor}
      >
        <FormControl>
          <SelectTrigger className="truncate w-full">
            <SelectValue
              placeholder={
                isFetchingDebtor
                  ? "Cargando contactos..."
                  : !selectedDebtor
                    ? "Selecciona un deudor primero"
                    : selectedDebtor.contacts?.length === 0
                      ? "Sin contactos disponibles"
                      : "Selecciona contacto"
              }
              className="truncate"
            />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {selectedDebtor?.contacts?.length > 0 ? (
            selectedDebtor.contacts.map((contact: any) => {
              const contactName = `${contact.name} ${
                contact.email
                  ? `- ${contact.email}`
                  : contact.phone
                    ? `- ${contact.phone}`
                    : ""
              }`;
              return (
                <SelectItem key={contact.name} value={contactName}>
                  {contactName}
                </SelectItem>
              );
            })
          ) : (
            <div className="py-2 px-3 text-sm text-gray-500">
              No hay contactos disponibles
            </div>
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}

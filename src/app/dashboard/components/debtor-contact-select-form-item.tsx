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
import { useTranslations } from "next-intl";

interface DebtorContactSelectFormItemProps {
  field: any;
  selectedDebtor: any;
  isFetchingDebtor: boolean;
  modal?: boolean;
}

export default function DebtorContactSelectFormItem({
  field,
  selectedDebtor,
  isFetchingDebtor,
  modal = false,
}: DebtorContactSelectFormItemProps) {
  const tCommon = useTranslations("common");
  return (
    <FormItem>
      <FormLabel>{tCommon("labels.contact")}</FormLabel>
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
                  ? tCommon("loading.loadingContacts")
                  : !selectedDebtor
                    ? tCommon("placeholders.selectDebtorFirst")
                    : selectedDebtor.contacts?.length === 0
                      ? tCommon("placeholders.noContactsAvailable")
                      : tCommon("placeholders.selectContact")
              }
              className="truncate"
            />
          </SelectTrigger>
        </FormControl>
        <SelectContent modal={modal}>
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
              {tCommon("placeholders.noContactsAvailableMsg")}
            </div>
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}

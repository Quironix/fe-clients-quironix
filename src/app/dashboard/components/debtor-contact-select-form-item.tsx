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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface DebtorContactSelectFormItemProps {
  field: any;
  selectedDebtor: any;
  isFetchingDebtor: boolean;
  modal?: boolean;
  /**
   * When true, allows selecting more than one contact. `field.value` becomes
   * a string[] instead of a string. See PRD_contactos_del_deudor.md O3.
   */
  multiple?: boolean;
}

function buildContactLabel(contact: any): string {
  return `${contact.name} ${
    contact.email ? `- ${contact.email}` : contact.phone ? `- ${contact.phone}` : ""
  }`;
}

/**
 * Only contacts explicitly disabled (enabled === false) are excluded — a
 * missing `enabled` field is treated as enabled (legacy contacts default to
 * true). See PRD_contactos_del_deudor.md O2.
 */
function isPreferredContact(contact: any): boolean {
  return contact?.default === true || contact?.preferred === true;
}

function PreferredBadge() {
  return (
    <Badge className="ml-2 border-orange-200 bg-orange-100 text-orange-700">
      Preferente
    </Badge>
  );
}

/**
 * Contactos vigentes con el preferente primero
 * (PRD_contactos_vigentes_y_targeting_collector.md O1/O1b).
 */
function getEnabledContacts(selectedDebtor: any): any[] {
  return (selectedDebtor?.contacts || [])
    .filter((contact: any) => contact.enabled !== false)
    .sort(
      (a: any, b: any) =>
        Number(isPreferredContact(b)) - Number(isPreferredContact(a)),
    );
}

export default function DebtorContactSelectFormItem({
  field,
  selectedDebtor,
  isFetchingDebtor,
  modal = false,
  multiple = false,
}: DebtorContactSelectFormItemProps) {
  const tCommon = useTranslations("common");
  const enabledContacts = getEnabledContacts(selectedDebtor);

  if (multiple) {
    const selectedValues: string[] = Array.isArray(field.value)
      ? field.value
      : [];

    const toggleContact = (contactName: string, checked: boolean) => {
      if (checked) {
        field.onChange([...selectedValues, contactName]);
      } else {
        field.onChange(selectedValues.filter((v) => v !== contactName));
      }
    };

    const triggerLabel =
      selectedValues.length === 0
        ? isFetchingDebtor
          ? tCommon("loading.loadingContacts")
          : !selectedDebtor
            ? tCommon("placeholders.selectDebtorFirst")
            : enabledContacts.length === 0
              ? tCommon("placeholders.noContactsAvailable")
              : tCommon("placeholders.selectContact")
        : selectedValues.join(", ");

    return (
      <FormItem>
        <FormLabel>{tCommon("labels.contact")}</FormLabel>
        <Popover modal={modal}>
          <PopoverTrigger asChild>
            <FormControl>
              <Button
                type="button"
                variant="outline"
                disabled={!selectedDebtor || isFetchingDebtor}
                className="w-full justify-start truncate font-normal"
              >
                <span className="truncate">{triggerLabel}</span>
              </Button>
            </FormControl>
          </PopoverTrigger>
          <PopoverContent className="w-full p-2" align="start">
            {enabledContacts.length > 0 ? (
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
                {enabledContacts.map((contact: any) => {
                  const contactName = buildContactLabel(contact);
                  const checked = selectedValues.includes(contactName);
                  return (
                    <label
                      key={contactName}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          toggleContact(contactName, value === true)
                        }
                      />
                      <span className="truncate">{contactName}</span>
                      {isPreferredContact(contact) && <PreferredBadge />}
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="py-2 px-3 text-sm text-gray-500">
                {tCommon("placeholders.noContactsAvailableMsg")}
              </div>
            )}
          </PopoverContent>
        </Popover>
        <FormMessage />
      </FormItem>
    );
  }

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
                    : enabledContacts.length === 0
                      ? tCommon("placeholders.noContactsAvailable")
                      : tCommon("placeholders.selectContact")
              }
              className="truncate"
            />
          </SelectTrigger>
        </FormControl>
        <SelectContent modal={modal}>
          {enabledContacts.length > 0 ? (
            enabledContacts.map((contact: any) => {
              const contactName = buildContactLabel(contact);
              return (
                <SelectItem key={contactName} value={contactName}>
                  <span className="flex items-center">
                    <span className="truncate">{contactName}</span>
                    {isPreferredContact(contact) && <PreferredBadge />}
                  </span>
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

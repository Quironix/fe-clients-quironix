import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Required from "@/components/ui/required";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import { useProfileContext } from "@/context/ProfileContext";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCompaniesStore } from "../companies/store";

interface CompanySelection {
  id: string;
  debtor_code?: string;
}

const SelectClient = ({
  field,
  title,
  required,
}: {
  field: any;
  title: string;
  required?: boolean;
}) => {
  const { companies, getCompanies } = useCompaniesStore();
  const { session, profile } = useProfileContext();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (session?.token && profile?.client?.id && companies.length === 0) {
      getCompanies(session?.token, profile?.client?.id);
    }
  }, [getCompanies, profile?.client?.id, session?.token]);

  // Asegurar que el valor siempre sea un array de objetos
  const selectedValues: CompanySelection[] = Array.isArray(field.value)
    ? field.value.map((item: any) =>
        typeof item === "string"
          ? { id: item }
          : { id: item.id, debtor_code: item.debtor_code }
      )
    : field.value
      ? [typeof field.value === "string" ? { id: field.value } : field.value]
      : [];

  const handleValueChange = (companyId: string, checked: boolean) => {
    let newValues: CompanySelection[];
    if (checked) {
      // Buscar la company y usar su client_code como debtor_code
      const company = companies.find((c) => c.id === companyId);
      const companyData: CompanySelection = {
        id: companyId,
        ...(company?.client_code && { debtor_code: company.client_code }),
      };
      newValues = [...selectedValues, companyData];
    } else {
      newValues = selectedValues.filter((item) => item.id !== companyId);
    }
    field.onChange(newValues);
  };

  const removeValue = (companyId: string) => {
    const newValues = selectedValues.filter((item) => item.id !== companyId);
    field.onChange(newValues);
  };

  const isCompanySelected = (companyId: string) => {
    return selectedValues.some((item) => item.id === companyId);
  };

  return (
    <FormItem>
      <FormLabel>
        {title} {required && <Required />}
      </FormLabel>
      <Select open={open} onOpenChange={setOpen}>
        <FormControl>
          <SelectTrigger
            className="w-full min-h-10"
            onClick={() => setOpen(!open)}
          >
            <div className="flex flex-wrap gap-1 items-center w-full">
              {selectedValues.length > 0 ? (
                <>
                  {selectedValues.slice(0, 2).map((item) => {
                    const company = companies.find((c) => c.id === item.id);
                    return company ? (
                      <Badge
                        key={item.id}
                        variant="secondary"
                        className="flex items-center gap-1 text-xs px-2 py-1"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {company.name}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeValue(item.id);
                          }}
                        />
                      </Badge>
                    ) : null;
                  })}
                  {selectedValues.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedValues.length - 2} más
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">
                  Selecciona una o más compañías
                </span>
              )}
            </div>
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {companies.length > 0 ? (
            companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center space-x-2 px-2 py-2 hover:bg-accent cursor-pointer"
                onClick={() => {
                  const isSelected = isCompanySelected(company.id || "");
                  handleValueChange(company.id || "", !isSelected);
                }}
              >
                <Checkbox
                  checked={isCompanySelected(company.id || "")}
                  onChange={() => {}} // Manejado por el onClick del div
                />
                <div className="flex-1">
                  <div className="font-medium">{company.name}</div>
                  {company.client_code && (
                    <div className="text-xs text-muted-foreground">
                      Código: {company.client_code}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              {companies.length === 0
                ? "Cargando compañías..."
                : "No hay compañías disponibles"}
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Mostrar compañías seleccionadas de forma simplificada
      {selectedValues.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Compañías seleccionadas:
          </div>
          {selectedValues.map((item) => {
            const company = companies.find((c) => c.id === item.id);
            return company ? (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{company.name}</div>
                  {item.debtor_code && (
                    <div className="text-xs text-muted-foreground">
                      Código de deudor: {item.debtor_code}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeValue(item.id)}
                  className="h-8 w-8 p-0 hover:bg-red-100"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : null;
          })}
        </div>
      )} */}

      <FormMessage />
    </FormItem>
  );
};

export default SelectClient;

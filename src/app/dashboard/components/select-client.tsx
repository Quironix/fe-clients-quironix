import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Required from "@/components/ui/required";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import { useProfileContext } from "@/context/ProfileContext";
import { Search } from "lucide-react";
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
  singleClient = false,
}: {
  field: any;
  title: string;
  required?: boolean;
  singleClient?: boolean;
}) => {
  const { companies, getCompanies } = useCompaniesStore();
  const { session, profile } = useProfileContext();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (session?.token && profile?.client?.id && companies.length === 0) {
      getCompanies(session?.token, profile?.client?.id);
    }
  }, [getCompanies, profile?.client?.id, session?.token]);

  // Filtrar compañías basado en la búsqueda
  const filteredCompanies = companies.filter((company) =>
    company.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Manejar valores según el tipo de selección
  const selectedValues: CompanySelection[] = singleClient
    ? // Para selección única, convertir a array para uso interno
      field.value
      ? [typeof field.value === "string" ? { id: field.value } : field.value]
      : []
    : // Para selección múltiple, comportamiento original
      Array.isArray(field.value)
      ? field.value.map((item: any) =>
          typeof item === "string"
            ? { id: item }
            : { id: item.id, debtor_code: item.debtor_code }
        )
      : field.value
        ? [typeof field.value === "string" ? { id: field.value } : field.value]
        : [];

  const handleValueChange = (companyId: string, checked: boolean) => {
    if (singleClient) {
      // Para selección única
      if (checked) {
        const company = companies.find((c) => c.id === companyId);
        const companyData: CompanySelection = {
          id: companyId,
          ...(company?.client_code && { debtor_code: company.client_code }),
        };
        field.onChange(companyData.id); // Enviar objeto único
        setOpen(false); // Cerrar el selector después de seleccionar
      } else {
        field.onChange(null); // Limpiar selección
      }
    } else {
      // Para selección múltiple (comportamiento original)
      let newValues: CompanySelection[];
      if (checked) {
        const company = companies.find((c) => c.id === companyId);
        const companyData: CompanySelection = {
          id: companyId,
          ...(company?.client_code && { debtor_code: company.client_code }),
        };
        newValues = [...selectedValues, companyData];
      } else {
        newValues = selectedValues.filter((item) => item.id !== companyId);
      }
      field.onChange(newValues); // Enviar array
    }
  };

  const removeValue = (companyId: string) => {
    if (singleClient) {
      field.onChange(null);
    } else {
      const newValues = selectedValues.filter((item) => item.id !== companyId);
      field.onChange(newValues);
    }
  };

  const isCompanySelected = (companyId: string) => {
    return selectedValues.some((item) => item.id === companyId);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchQuery(""); // Limpiar búsqueda al cerrar
    }
  };

  return (
    <FormItem>
      <FormLabel>
        {title} {required && <Required />}
      </FormLabel>
      <Select open={open} onOpenChange={handleOpenChange}>
        <FormControl>
          <SelectTrigger
            className="w-full min-h-8"
            onClick={() => setOpen(!open)}
          >
            <div className="flex flex-wrap gap-1 items-center w-full">
              {selectedValues.length > 0 ? (
                <>
                  {singleClient ? (
                    // Para selección única, mostrar solo el elemento seleccionado
                    (() => {
                      const company = companies.find(
                        (c) => c.id === selectedValues[0].id
                      );
                      return company ? (
                        <Badge
                          key={selectedValues[0].id}
                          variant="secondary"
                          className="flex items-center gap-1 text-[0.6rem] px-1 py-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {company.name}
                        </Badge>
                      ) : null;
                    })()
                  ) : (
                    // Para selección múltiple, comportamiento original
                    <>
                      {selectedValues.slice(0, 2).map((item) => {
                        const company = companies.find((c) => c.id === item.id);
                        return company ? (
                          <Badge
                            key={item.id}
                            variant="secondary"
                            className="flex items-center gap-1 text-[0.6rem] px-1 py-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {company.name}
                          </Badge>
                        ) : null;
                      })}
                      {selectedValues.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedValues.length - 2} más
                        </Badge>
                      )}
                    </>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">
                  {singleClient
                    ? "Selecciona una compañía"
                    : "Selecciona una o más compañías"}
                </span>
              )}
            </div>
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {/* Campo de búsqueda */}
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Buscar compañías..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 px-0 py-1 h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>

          {/* Lista de compañías filtradas */}
          <div className="max-h-60 overflow-auto">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company) => (
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
                  : searchQuery
                    ? "No se encontraron compañías que coincidan con la búsqueda"
                    : "No hay compañías disponibles"}
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};

export default SelectClient;

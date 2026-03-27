import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import Required from "@/components/ui/required";
import { useProfileContext } from "@/context/ProfileContext";
import { ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
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
  modal = false,
}: {
  field: any;
  title: string;
  required?: boolean;
  singleClient?: boolean;
  modal?: boolean;
}) => {
  const { companies, getCompanies } = useCompaniesStore();
  const { session, profile } = useProfileContext();
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (session?.token && profile?.client?.id && companies.length === 0) {
      getCompanies(session?.token, profile?.client?.id);
    }
  }, [getCompanies, profile?.client?.id, session?.token]);

  const filteredCompanies = companies.filter((company) =>
    company.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedValues: CompanySelection[] = singleClient
    ? field.value
      ? [typeof field.value === "string" ? { id: field.value } : field.value]
      : []
    : Array.isArray(field.value)
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
      if (checked) {
        const company = companies.find((c) => c.id === companyId);
        const companyData: CompanySelection = {
          id: companyId,
          ...(company?.client_code && { debtor_code: company.client_code }),
        };
        field.onChange(companyData.id);
        setOpen(false);
      } else {
        field.onChange(null);
      }
    } else {
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
      field.onChange(newValues);
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
      setSearchQuery("");
    }
  };

  const dropdownContent = (
    <>
      <div className="flex items-center border-b px-3 py-2">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <Input
          placeholder={tCommon("placeholders.searchCompanies")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 px-0 py-1 h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
          autoFocus
        />
      </div>

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
                onChange={() => {}}
              />
              <div className="flex-1">
                <div className="font-medium">{company.name}</div>
                {company.client_code && (
                  <div className="text-xs text-muted-foreground">
                    {tCommon("labels.code")}: {company.client_code}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {companies.length === 0
              ? tCommon("loading.loadingCompanies")
              : searchQuery
                ? tCommon("placeholders.noCompaniesMatch")
                : tCommon("placeholders.noCompaniesAvailable")}
          </div>
        )}
      </div>
    </>
  );

  return (
    <FormItem>
      <FormLabel>
        {title} {required && <Required />}
      </FormLabel>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <FormControl>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full min-h-8 justify-between"
            >
              <div className="flex flex-wrap gap-1 items-center w-full">
                {selectedValues.length > 0 ? (
                  <>
                    {singleClient ? (
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
                            {tCommon("more", { count: selectedValues.length - 2 })}
                          </Badge>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    {singleClient
                      ? tCommon("placeholders.selectCompany")
                      : tCommon("placeholders.selectCompanies")}
                  </span>
                )}
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
        </FormControl>
        {modal ? (
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="w-[var(--radix-popover-trigger-width)] p-0 z-[100] bg-popover text-popover-foreground rounded-md border shadow-md outline-hidden"
          >
            {dropdownContent}
          </PopoverPrimitive.Content>
        ) : (
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 !z-[100]">
            {dropdownContent}
          </PopoverContent>
        )}
      </Popover>
      <FormMessage />
    </FormItem>
  );
};

export default SelectClient;

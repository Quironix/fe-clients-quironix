import { FormControl, FormMessage } from "@/components/ui/form";

import { FormItem, FormLabel } from "@/components/ui/form";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCountriesStore } from "@/context/CountriesContext";
import { useProfileContext } from "@/context/ProfileContext";
import { useEffect } from "react";

interface CountriesSelectFormItemProps {
  field: any;
  title: string;
  required?: boolean;
}

export default function CountriesSelectFormItem({
  field,
  title,
  required,
}: CountriesSelectFormItemProps) {
  const { countries, isLoading, getAllCountries } = useCountriesStore();
  const { session } = useProfileContext();

  useEffect(() => {
    if (session?.token && countries.length === 0) {
      getAllCountries(session.token);
    }
  }, [session?.token]);

  return (
    <FormItem>
      <FormLabel>
        {title} {required && <Required />}
      </FormLabel>
      <Select
        onValueChange={(value) => field.onChange(value === "__none__" ? null : value)}
        value={field.value || "__none__"}
        disabled={isLoading}
      >
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={"Selecciona un país"} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="__none__">-- Selecciona un país --</SelectItem>
          {countries.length > 0 ? (
            countries.map((country: any) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No hay países disponibles
            </div>
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}

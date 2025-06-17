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
        onValueChange={field.onChange}
        value={field.value}
        key={field.value}
        disabled={isLoading}
      >
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={"Selecciona un país"} />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {countries.length > 0 ? (
            countries.map((country: any) => (
              <SelectItem key={country.id} value={country.id}>
                {country.name}
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No hay bancos disponibles
            </div>
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}

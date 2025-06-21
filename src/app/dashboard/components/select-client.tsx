import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileContext } from "@/context/ProfileContext";
import { useEffect } from "react";
import { useCompaniesStore } from "../companies/store";

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

  useEffect(() => {
    if (session?.token && profile?.client?.id && companies.length === 0) {
      getCompanies(session?.token, profile?.client?.id);
    }
  }, [getCompanies, profile?.client?.id, session?.token]);

  return (
    <FormItem>
      <FormLabel>
        {title} {required && <Required />}
      </FormLabel>
      <Select
        onValueChange={field.onChange}
        value={field.value}
        key={field.value}
        disabled={companies.length === 0}
      >
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una compañía" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {companies.length > 0 &&
            companies?.map((company) => (
              <SelectItem key={company.id} value={company.id || ""}>
                {company.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};

export default SelectClient;

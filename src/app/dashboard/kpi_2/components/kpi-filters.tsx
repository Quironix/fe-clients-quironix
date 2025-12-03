import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";
import { KPIType } from "../services/types";

interface KPIFiltersProps {
  searchTerm: string;
  selectedType: KPIType | "all";
  onSearchChange: (value: string) => void;
  onTypeChange: (value: KPIType | "all") => void;
}

export const KPIFilters = ({
  searchTerm,
  selectedType,
  onSearchChange,
  onTypeChange,
}: KPIFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar KPI..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          <SelectItem value="Calidad Producida">Calidad Producida</SelectItem>
          <SelectItem value="Eficiencia">Eficiencia</SelectItem>
          <SelectItem value="Impecabilidad">Impecabilidad</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

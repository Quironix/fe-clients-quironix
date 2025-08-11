"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { forwardRef, useImperativeHandle, useState } from "react";
import { PaymentPlansFilters } from "../hooks/usePaymentPlans";

export interface FilterInputsRef {
  getCurrentFilters: () => PaymentPlansFilters;
  clearFilters: () => void;
}

interface FilterInputsProps {
  onFilterChange: (filters: PaymentPlansFilters) => void;
  initialFilters?: PaymentPlansFilters;
}

const FilterInputs = forwardRef<FilterInputsRef, FilterInputsProps>(
  ({ onFilterChange, initialFilters = {} }, ref) => {
    const [filters, setFilters] = useState<PaymentPlansFilters>(initialFilters);

    useImperativeHandle(ref, () => ({
      getCurrentFilters: () => filters,
      clearFilters: () => {
        const clearedFilters = {};
        setFilters(clearedFilters);
        onFilterChange(clearedFilters);
      },
    }));

    const handleFilterChange = (key: keyof PaymentPlansFilters, value: any) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
    };

    const applyFilters = () => {
      onFilterChange(filters);
    };

    const clearFilters = () => {
      const clearedFilters = {};
      setFilters(clearedFilters);
      onFilterChange(clearedFilters);
    };

    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filtros</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda por texto */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar planes..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={filters.status || "ALL"}
              onValueChange={(value) =>
                handleFilterChange(
                  "status",
                  value === "ALL" ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los estados</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="COMPLETED">Completado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
                <SelectItem value="DEFAULTED">En mora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha desde */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Fecha desde</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />
          </div>

          {/* Fecha hasta */}
          <div className="space-y-2">
            <Label htmlFor="dateTo">Fecha hasta</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="mr-2 h-4 w-4" />
            Aplicar filtros
          </Button>
        </div>
      </div>
    );
  }
);

FilterInputs.displayName = "FilterInputs";

export default FilterInputs;

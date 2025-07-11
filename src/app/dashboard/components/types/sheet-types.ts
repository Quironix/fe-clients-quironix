export interface FilterField {
  id: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'number';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
}

export interface FilterConfig {
  fields: FilterField[];
  defaultValues: Record<string, any>;
  onApply: (values: Record<string, any>) => void;
  onReset: () => void;
}

export interface ColumnConfig {
  id: string;
  displayName: string;
  visible: boolean;
  order: number;
  canHide: boolean;
}
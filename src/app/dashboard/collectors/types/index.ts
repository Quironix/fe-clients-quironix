// Definir aquí los tipos específicos del módulo

export interface CollectorsItem {
  id?: string;
  name: string;
  // Agregar más propiedades según sea necesario
}

export interface CollectorsResponse {
  data: CollectorsItem[];
  total: number;
  page: number;
  limit: number;
}

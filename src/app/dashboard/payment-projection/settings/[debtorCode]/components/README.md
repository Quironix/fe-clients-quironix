# ListInvoicesProjection Component

## Descripción

Componente que muestra una vista de proyección semanal de facturas con funcionalidad de drag and drop entre columnas de semanas.

## Características

### Header Estático

- **Resumen general**: Muestra el título, periodo y total de facturas
- **Grid de semanas**: Vista previa de cada semana con montos estimados
- **Información consolidada**: Resumen visual de la proyección semanal

### Columnas de Semanas

- **5 columnas**: Una para cada semana del periodo
- **Headers informativos**: Título, rango de fechas, contador y resumen financiero
- **Área de scroll**: Las facturas se muestran en un área con scroll vertical

### Funcionalidad Drag & Drop

- **Arrastrar facturas**: Las tarjetas de facturas son arrastrables
- **Soltar en semanas**: Se pueden mover entre diferentes columnas de semanas
- **Actualización automática**: Los contadores y montos se actualizan automáticamente
- **Feedback visual**: Indicadores visuales durante el arrastre

## Props

```typescript
interface ListInvoicesProjectionProps {
  debtor?: any; // Datos del deudor
  periodMonth?: string; // Periodo mensual
}
```

## Estructura de Datos

### WeekColumn

```typescript
interface WeekColumn {
  week: number; // Número de semana
  title: string; // Título de la semana
  dateRange: string; // Rango de fechas
  estimated: number; // Monto estimado
  collected: number; // Monto recaudado
  count: number; // Cantidad de facturas
  invoices: Invoice[]; // Lista de facturas
}
```

### Invoice

```typescript
interface Invoice {
  id: string; // ID único
  invoiceNumber: string; // Número de factura
  phase: string; // Fase de la factura
  dueDate: string; // Fecha de vencimiento
  documentBalance: number; // Saldo del documento
  week: number; // Semana asignada
}
```

## Uso

```tsx
import ListInvoicesProjection from "./components/list-invoices-projection";

<ListInvoicesProjection debtor={debtorData} periodMonth="2024-07" />;
```

## Funcionalidades

### Drag & Drop

- **handleDragStart**: Inicia el arrastre de una factura
- **handleDragOver**: Maneja el hover sobre una columna
- **handleDragLeave**: Maneja la salida del hover
- **handleDrop**: Procesa el drop de una factura
- **handleDragEnd**: Finaliza el arrastre

### Estado

- **weeks**: Array de columnas de semanas
- **dragState**: Estado del drag and drop
- **setWeeks**: Función para actualizar las semanas

## Estilos

### Clases CSS Utilizadas

- **Grid**: `grid grid-cols-5 gap-4` para el layout de columnas
- **Scroll**: `max-h-96 overflow-y-auto` para el área de scroll
- **Drag & Drop**: `cursor-move`, `opacity-50`, `border-blue-400`
- **Responsive**: Diseño adaptable a diferentes tamaños de pantalla

### Temas de Color

- **Azul**: Para elementos principales y montos
- **Gris**: Para texto secundario y bordes
- **Rosa**: Para etiquetas de facturas
- **Naranja**: Para alertas e iconos de información

## Dependencias

- **React**: Para el estado y efectos
- **UI Components**: Card, Badge, etc.
- **Lucide Icons**: Para iconos
- **Utils**: formatNumber para formateo de números
- **Custom Hook**: useInvoiceDragAndDrop para la lógica de drag & drop

## Consideraciones de Rendimiento

- **useCallback**: Para funciones de drag & drop
- **Estado local**: Manejo eficiente del estado
- **Re-renderizado**: Solo cuando es necesario
- **Scroll virtual**: Para listas largas (futuro)

## Mejoras Futuras

- [ ] Persistencia de cambios en backend
- [ ] Validaciones de reglas de negocio
- [ ] Animaciones de transición
- [ ] Filtros y búsqueda
- [ ] Exportación de datos
- [ ] Historial de cambios

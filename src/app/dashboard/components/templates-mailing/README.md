# Templates de Email para SendGrid

Este directorio contiene templates HTML optimizados para SendGrid que siguen las mejores prácticas para emails transaccionales.

## Template: Gestiones Completadas

**Archivo:** `gestiones-template.html`

### Descripción

Template para notificar a los usuarios sobre gestiones completadas, incluyendo detalles de facturas, montos y fechas de recaudación.

### Características

- ✅ Diseño responsive compatible con todos los clientes de email
- ✅ Layout basado en tablas para máxima compatibilidad
- ✅ CSS inline para evitar problemas de renderizado
- ✅ Soporte para imágenes placeholder
- ✅ Variables dinámicas con sintaxis Handlebars de SendGrid
- ✅ Secciones condicionales para contenido variable

### Variables de SendGrid Disponibles

#### Variables Generales

```handlebars
{{recipient_email}}
# Email del destinatario (ej: "s.pedro@intramedios")
{{recipient_name}}
# Nombre del destinatario (ej: "Daniel")
{{subject}}
# Asunto del email (ej: "Gestione septiembre 2025")
{{support_phone}}
# Teléfono de soporte (ej: "0923 2590 6728")
{{support_email}}
# Email de soporte (ej: "empresa@logoipsum.com")
```

#### Variables Gestión 1

```handlebars
{{gestion_1_title}}
# Título de la gestión (ej: "Pago sin recaudación")
{{gestion_1_amount}}
# Monto principal (ej: "$3.232.510")
{{gestion_1_date}}
# Fecha de recaudación (ej: "17 de septiembre,2024")
{{gestion_1_total}}
# Total a pagar (ej: "$3.232.510")
{{gestion_1_address}}
# Dirección para retiro (ej: "Teatinos 301, Oficina 17, Ñuñoa") # Array de
facturas
{{#each gestion_1_invoices}}
  {{tipo}}
  # Tipo de factura (ej: "Factura electrónica")
  {{numero}}
  # Número de factura (ej: "74689")
  {{emision}}
  # Fecha de emisión (ej: "00/00/0000")
  {{dias_atraso}}
  # Días de atraso (ej: "-12")
  {{monto}}
  # Monto de la factura (ej: "$3.232.510")
{{/each}}

# Información del cheque (condicional)
{{#if gestion_1_check_info}}
  # Esta sección se muestra solo si existe información de cheque
{{/if}}
```

#### Variables Gestión 2 (Condicional)

```handlebars
{{#if gestion_2}}
  {{gestion_2_title}}
  # Título de la gestión 2 (ej: "Facturas con filtros")
  {{gestion_2_total}}
  # Total a pagar (ej: "$3.232.510")
  {{gestion_2_note}}
  # Nota adicional # Array de facturas
  {{#each gestion_2_invoices}}
    {{tipo}}
    # Tipo de factura
    {{numero}}
    # Número de factura
    {{emision}}
    # Fecha de emisión
    {{vcto}}
    # Fecha de vencimiento
    {{dias_atraso}}
    # Días de atraso
    {{monto}}
    # Monto de la factura
  {{/each}}
{{/if}}
```

### Imágenes Placeholder

El template incluye imágenes placeholder que debes reemplazar con URLs de SendGrid:

1. **Logo principal** (línea ~47):

   ```html
   <img
     src="https://via.placeholder.com/120x30/6366F1/ffffff?text=LOGOIPSUM"
     alt="Logo"
   />
   ```

   - Tamaño recomendado: 120x30px o 240x60px (retina)
   - Formato: PNG con fondo transparente

2. **Icono Gestión 1** (línea ~94):

   ```html
   <img
     src="https://via.placeholder.com/60x60/6366F1/ffffff?text=💻"
     alt="Icono"
   />
   ```

   - Tamaño: 60x60px o 120x120px (retina)
   - Sugerencia: Icono de computadora/dinero

3. **Icono Gestión 2** (línea ~188):
   ```html
   <img
     src="https://via.placeholder.com/60x60/6366F1/ffffff?text=📊"
     alt="Icono"
   />
   ```
   - Tamaño: 60x60px o 120x120px (retina)
   - Sugerencia: Icono de gráficos/documentos

### Cómo Subir Imágenes a SendGrid

1. Ve a **Marketing** > **Image Library** en SendGrid
2. Sube tus imágenes (logo e iconos)
3. Copia las URLs generadas
4. Reemplaza los placeholders en el template

### Ejemplo de Datos JSON para SendGrid

```json
{
  "recipient_email": "s.pedro@intramedios",
  "recipient_name": "Daniel",
  "subject": "Gestione septiembre 2025",
  "support_phone": "0923 2590 6728",
  "support_email": "empresa@logoipsum.com",

  "gestion_1_title": "Pago sin recaudación",
  "gestion_1_amount": "$3.232.510",
  "gestion_1_date": "17 de septiembre, 2024",
  "gestion_1_total": "$3.232.510",
  "gestion_1_address": "Teatinos 301, Oficina 17, Ñuñoa",
  "gestion_1_invoices": [
    {
      "tipo": "Factura electrónica",
      "numero": "74689",
      "emision": "01/09/2024",
      "dias_atraso": "-12",
      "monto": "$3.232.510"
    }
  ],
  "gestion_1_check_info": true,

  "gestion_2": true,
  "gestion_2_title": "Facturas con filtros",
  "gestion_2_total": "$9.697.530",
  "gestion_2_note": "Si cuenta con alguna autorización al respecto, por favor también enviar una respuesta a la brevedad sobre los documentos mencionados.",
  "gestion_2_invoices": [
    {
      "tipo": "Factura electrónica",
      "numero": "74689",
      "emision": "01/09/2024",
      "vcto": "15/09/2024",
      "dias_atraso": "-12",
      "monto": "$3.232.510"
    },
    {
      "tipo": "Factura electrónica",
      "numero": "74690",
      "emision": "01/09/2024",
      "vcto": "15/09/2024",
      "dias_atraso": "-12",
      "monto": "$3.232.510"
    },
    {
      "tipo": "Factura Menciona",
      "numero": "74691",
      "emision": "01/09/2024",
      "vcto": "15/09/2024",
      "dias_atraso": "-12",
      "monto": "$3.232.510"
    }
  ]
}
```

### Integración con SendGrid

#### Opción 1: Dynamic Templates (Recomendado)

1. Ve a **Email API** > **Dynamic Templates** en SendGrid
2. Crea un nuevo template
3. Copia y pega el contenido de `gestiones-template.html`
4. Usa el editor de SendGrid para actualizar las imágenes
5. Guarda el template y obtén el Template ID
6. Envía emails usando el API con el Template ID y los datos JSON

#### Opción 2: Transactional Templates

```javascript
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.NEXT_SENDGRID_API_KEY);

const msg = {
  to: "s.pedro@intramedios",
  from: "noreply@quironix.com",
  templateId: "d-xxxxxxxxxxxxx", // Tu Template ID
  dynamicTemplateData: {
    recipient_email: "s.pedro@intramedios",
    recipient_name: "Daniel",
    subject: "Gestione septiembre 2025",
    // ... resto de variables
  },
};

await sgMail.send(msg);
```

### Testing

Para probar el template:

1. **Test Local**: Abre `gestiones-template.html` en un navegador
2. **Test SendGrid**: Usa la función "Send Test" en SendGrid
3. **Test Litmus**: Para testing en múltiples clientes de email (opcional)

### Personalización

#### Colores

Los colores principales están definidos inline:

- Primario (enlaces, headers): `#6366F1`
- Error/Alerta: `#EF4444`
- Gris oscuro (texto): `#333333`
- Gris medio (texto secundario): `#666666`
- Gris claro (bordes): `#e5e7eb`

#### Tipografía

- Familia: `Arial, Helvetica, sans-serif`
- Tamaños: 12px (tablas), 13px (notas), 14px (texto), 16px (títulos)

## Buenas Prácticas

✅ **DO:**

- Siempre testear en múltiples clientes de email (Gmail, Outlook, Apple Mail)
- Usar imágenes con URLs absolutas hospedadas en SendGrid
- Mantener el ancho máximo en 600px para compatibilidad
- Usar CSS inline para todos los estilos
- Incluir textos ALT en todas las imágenes
- Optimizar imágenes para web (compresión y tamaño adecuado)

❌ **DON'T:**

- No usar JavaScript
- No usar CSS externo o en `<style>` tags
- No usar videos o GIFs complejos
- No exceder 102KB de tamaño total del email
- No usar fuentes web personalizadas (usar font stacks seguros)

## Soporte

Para dudas sobre este template, contactar al equipo de desarrollo de Quironix.

## Licencia

Uso interno de Quironix - Todos los derechos reservados.

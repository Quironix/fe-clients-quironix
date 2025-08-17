# Generador de Módulos del Dashboard

Este script automatiza la creación de nuevos módulos para el dashboard de Quironix, generando toda la estructura de carpetas y archivos necesarios.

## Uso

```bash
./create-dashboard-module.sh <nombre-del-modulo>
```

### Ejemplo

```bash
./create-dashboard-module.sh payment-projection
```

## Estructura Generada

El script crea la siguiente estructura dentro de `src/app/dashboard/<nombre-del-modulo>/`:

```
<nombre-del-modulo>/
├── components/                 # Componentes específicos del módulo
├── services/
│   └── index.ts               # Servicios API con ejemplos GET y POST
├── store/
│   └── index.tsx              # Store de Zustand configurado
├── hooks/
│   └── use<NombreModulo>.ts   # Hook personalizado del módulo
├── types/
│   └── index.ts               # Tipos TypeScript del módulo
├── page.tsx                   # Página principal del módulo
└── README.md                  # Documentación específica del módulo
```

## Características

### Conversión de Nombres

El script convierte automáticamente los nombres:

- **Input**: `payment-projection` (snake-case)
- **PascalCase**: `PaymentProjection` (para componentes, stores, tipos)
- **camelCase**: `paymentProjection` (para hooks y variables)

### Archivos Generados

1. **services/index.ts**: Incluye ejemplos de servicios GET y POST con autenticación
2. **store/index.tsx**: Store de Zustand con estado básico y operaciones CRUD
3. **hooks/use<Modulo>.ts**: Hook personalizado que integra el store con sesión y perfil
4. **types/index.ts**: Tipos TypeScript básicos para el módulo
5. **page.tsx**: Página inicial con layout estándar del dashboard
6. **README.md**: Documentación específica del módulo

### Templates Incluidos

Todos los archivos incluyen:

- ✅ Estructura base funcional
- ✅ Imports necesarios
- ✅ Manejo de errores con toast
- ✅ Integración con autenticación (NextAuth)
- ✅ Integración con contexto de perfil
- ✅ Tipado TypeScript
- ✅ Layout consistente con el resto del dashboard

## Próximos Pasos Después de Generar un Módulo

1. **Actualizar servicios**:

   - Reemplazar `REPLACE_ENDPOINT` en `services/index.ts` por el endpoint real
   - Ajustar los métodos según las necesidades de la API

2. **Definir tipos**:

   - Actualizar `types/index.ts` con los tipos específicos del módulo
   - Reemplazar `any` por tipos específicos en el store

3. **Personalizar UI**:

   - Modificar `page.tsx` según el diseño requerido
   - Agregar componentes específicos en la carpeta `components/`

4. **Agregar al routing**:
   - El módulo estará disponible automáticamente en `/dashboard/<nombre-del-modulo>`

## Requisitos

- El script debe ejecutarse desde la raíz del proyecto
- Requiere permisos de ejecución: `chmod +x create-dashboard-module.sh`

## Validaciones

El script incluye validaciones para:

- ✅ Verificar que se proporcione el nombre del módulo
- ✅ Confirmar que existe el directorio dashboard
- ✅ Prevenir sobrescribir módulos existentes
- ✅ Mostrar mensajes de progreso y éxito

## Ejemplos de Uso

### Crear módulo de reportes

```bash
./create-dashboard-module.sh reports
```

### Crear módulo de configuración avanzada

```bash
./create-dashboard-module.sh advanced-settings
```

### Crear módulo de analytics

```bash
./create-dashboard-module.sh analytics-dashboard
```

## Troubleshooting

### El script no es ejecutable

```bash
chmod +x create-dashboard-module.sh
```

### El módulo ya existe

El script prevendrá la sobrescritura. Elimina el módulo existente si deseas recrearlo:

```bash
rm -rf src/app/dashboard/<nombre-del-modulo>
```

### Errores de permisos

Asegúrate de tener permisos de escritura en el directorio del proyecto.

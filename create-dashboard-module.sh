#!/bin/bash

# Script para crear la estructura de módulos del dashboard
# Uso: ./create-dashboard-module.sh <nombre-del-modulo>

# Verificar si se proporcionó el nombre del módulo
if [ $# -eq 0 ]; then
    echo "Error: Debe proporcionar el nombre del módulo"
    echo "Uso: ./create-dashboard-module.sh <nombre-del-modulo>"
    echo "Ejemplo: ./create-dashboard-module.sh payment-projection"
    exit 1
fi

MODULE_NAME=$1
DASHBOARD_PATH="src/app/dashboard"

# Convertir nombre de snake-case a PascalCase para los componentes
# Separar por guiones, capitalizar cada palabra y unir
MODULE_PASCAL=$(echo $MODULE_NAME | tr '-' ' ' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1))substr($i,2)}}1' | tr -d ' ')

# Convertir nombre de snake-case a camelCase para hooks (primera palabra minúscula, resto PascalCase)
MODULE_CAMEL=$(echo $MODULE_NAME | awk -F'-' '{print $1; for(i=2;i<=NF;i++) print toupper(substr($i,1,1))substr($i,2)}' | tr -d '\n')

# Verificar que el directorio dashboard existe
if [ ! -d "$DASHBOARD_PATH" ]; then
    echo "Error: El directorio $DASHBOARD_PATH no existe"
    exit 1
fi

# Crear la estructura de directorios
MODULE_PATH="$DASHBOARD_PATH/$MODULE_NAME"

echo "Creando estructura para el módulo: $MODULE_NAME"
echo "Ruta: $MODULE_PATH"

# Verificar si el módulo ya existe
if [ -d "$MODULE_PATH" ]; then
    echo "Error: El módulo '$MODULE_NAME' ya existe en $MODULE_PATH"
    exit 1
fi

# Crear directorios
mkdir -p "$MODULE_PATH/components"
mkdir -p "$MODULE_PATH/services"
mkdir -p "$MODULE_PATH/store"
mkdir -p "$MODULE_PATH/hooks"
mkdir -p "$MODULE_PATH/types"

echo "✅ Directorios creados"

# Crear services/index.ts
cat > "$MODULE_PATH/services/index.ts" << 'EOF'
// Ejemplo de servicio GET
export const getAll = async (accessToken: string, clientId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/REPLACE_ENDPOINT`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
};

export const create = async (
  accessToken: string,
  data: any,
  clientId: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v2/clients/${clientId}/REPLACE_ENDPOINT`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create data");
  }

  return response.json();
};
EOF

echo "✅ services/index.ts creado"

# Crear store/index.tsx
cat > "$MODULE_PATH/store/index.tsx" << EOF
import { create as createStore } from "zustand";
import { getAll, create } from "../services";
import { toast } from "sonner";

interface ${MODULE_PASCAL}Store {
  data: any[];
  setData: (data: any[]) => void;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  refreshData: (accessToken: string, clientId: string) => Promise<void>;
  createData: (
    accessToken: string,
    data: any,
    clientId: string
  ) => Promise<void>;
}

export const use${MODULE_PASCAL}Store = createStore<${MODULE_PASCAL}Store>((set, get) => ({
  data: [],
  isLoading: true,
  searchTerm: "",
  setSearchTerm: (term: string) => set({ searchTerm: term }),
  setData: (data: any[]) => set({ data }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  refreshData: async (accessToken: string, clientId: string) => {
    try {
      set({ isLoading: true, data: [] });
      const data = await getAll(accessToken, clientId);
      set({ data, isLoading: false });
    } catch (error) {
      console.error("Error al cargar los datos:", error);
      set({ isLoading: false });
      toast.error("Error", {
        description: "No se pudieron cargar los datos. Por favor, intente nuevamente.",
      });
    }
  },
  createData: async (accessToken: string, data: any, clientId: string) => {
    try {
      set({ isLoading: true });
      const newData = await create(accessToken, data, clientId);
      set((state) => ({ data: [...state.data, newData] }));
      set({ isLoading: false });
      toast.success("Dato creado exitosamente");
    } catch (error) {
      console.error("Error al crear el dato:", error);
      set({ isLoading: false });
      toast.error("Error", {
        description: "No se pudo crear el dato. Por favor, intente nuevamente.",
      });
    }
  },
}));
EOF

echo "✅ store/index.tsx creado"

# Crear hooks/use{ModuleName}.ts
cat > "$MODULE_PATH/hooks/use${MODULE_PASCAL}.ts" << EOF
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useProfileContext } from "@/context/ProfileContext";
import { use${MODULE_PASCAL}Store } from "../store";

export const use${MODULE_PASCAL} = () => {
  const { data: session }: any = useSession();
  const { profile } = useProfileContext();
  const {
    data,
    isLoading,
    searchTerm,
    setSearchTerm,
    refreshData,
    createData,
  } = use${MODULE_PASCAL}Store();

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      refreshData(session?.token, profile?.client?.id);
    }
  }, [session?.token, profile?.client?.id]);

  return {
    data,
    isLoading,
    searchTerm,
    setSearchTerm,
    refreshData: () => refreshData(session?.token, profile?.client?.id),
    createData: (data: any) => createData(session?.token, data, profile?.client?.id),
  };
};
EOF

echo "✅ hooks/use${MODULE_PASCAL}.ts creado"

# Crear types/index.ts
cat > "$MODULE_PATH/types/index.ts" << EOF
// Definir aquí los tipos específicos del módulo

export interface ${MODULE_PASCAL}Item {
  id?: string;
  name: string;
  // Agregar más propiedades según sea necesario
}

export interface ${MODULE_PASCAL}Response {
  data: ${MODULE_PASCAL}Item[];
  total: number;
  page: number;
  limit: number;
}
EOF

echo "✅ types/index.ts creado"

# Crear page.tsx
cat > "$MODULE_PATH/page.tsx" << EOF
"use client";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import Header from "../components/header";
import { Main } from "../components/main";
import TitleSection from "../components/title-section";
import { UsersIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Language from "@/components/ui/language";

const ${MODULE_PASCAL}Content = () => {
  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="${MODULE_PASCAL}"
          description="Aquí puedes ver un resumen de ${MODULE_NAME}."
          icon={<UsersIcon color="white" />}
          subDescription="${MODULE_PASCAL}"
        />
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <div className="w-full h-full">
            <Card className="h-full p-5">
              <div className="flex justify-between items-start gap-5">
                <div className="w-1/3">
                  <Image
                    src="/img/settings.svg"
                    alt="${MODULE_PASCAL}"
                    width={100}
                    height={100}
                    className="w-full h-full"
                  />
                </div>
                <div className="w-2/3">
                  <h2 className="text-2xl font-bold mb-4">${MODULE_PASCAL}</h2>
                  <p className="text-gray-600">
                    Contenido del módulo ${MODULE_NAME}. Personaliza esta página según tus necesidades.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Main>
    </>
  );
};

const ${MODULE_PASCAL}Page = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <${MODULE_PASCAL}Content />
    </Suspense>
  );
};

export default ${MODULE_PASCAL}Page;
EOF

echo "✅ page.tsx creado"

# Crear README.md para el módulo
cat > "$MODULE_PATH/README.md" << EOF
# Módulo ${MODULE_PASCAL}

Este módulo fue generado automáticamente usando el script create-dashboard-module.sh

## Estructura

- \`components/\` - Componentes específicos del módulo
- \`services/index.ts\` - Servicios API del módulo
- \`store/index.tsx\` - Store de Zustand para el estado del módulo
- \`hooks/use${MODULE_PASCAL}.ts\` - Hook personalizado del módulo
- \`types/index.ts\` - Tipos TypeScript del módulo
- \`page.tsx\` - Página principal del módulo

## Próximos pasos

1. Actualizar el endpoint en \`services/index.ts\` (reemplazar REPLACE_ENDPOINT)
2. Definir los tipos apropiados en \`types/index.ts\`
3. Personalizar la UI en \`page.tsx\`
4. Agregar componentes específicos en la carpeta \`components/\`

## Ruta

El módulo estará disponible en: \`/dashboard/${MODULE_NAME}\`
EOF

echo "✅ README.md creado"

echo ""
echo "🎉 ¡Módulo '$MODULE_NAME' creado exitosamente!"
echo ""
echo "📁 Estructura creada en: $MODULE_PATH"
echo ""
echo "📝 Próximos pasos:"
echo "1. Actualizar el endpoint en services/index.ts (reemplazar 'REPLACE_ENDPOINT')"
echo "2. Definir los tipos apropiados en types/index.ts"
echo "3. Personalizar la UI en page.tsx"
echo "4. Agregar componentes específicos en la carpeta components/"
echo ""
echo "🌐 Ruta disponible: /dashboard/$MODULE_NAME"

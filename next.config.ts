import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  output: "standalone",
  reactStrictMode: false, // Optimizado para desarrollo
  poweredByHeader: false,

  // Configuración de Turbopack (ahora estable)
  turbopack: {
    rules: {
      "*.svg": ["@svgr/webpack"],
    },
    // Mejora el rendimiento de Turbopack
    resolveAlias: {
      "@": "./src",
    },
  },

  // Transpilación de módulos externos que causan problemas en build
  transpilePackages: [
    "@tanstack/react-table",
    "@tanstack/table-core",
    "@tanstack/react-query",
  ],

  // Optimizaciones de desarrollo mejoradas
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "@tabler/icons-react",
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-popover",
      "@tanstack/react-query",
      "@tanstack/react-table",
    ],
    // Mejora la velocidad de TypeScript
    typedRoutes: false,
    // Reduce el trabajo en desarrollo
    optimisticClientCache: true,
  },

  // Configuración de webpack optimizada
  webpack: (config, { dev, isServer }) => {
    // Configuraciones para desarrollo con webpack (cuando no se usa Turbopack)
    if (dev && !process.env.TURBOPACK && !process.argv.includes("--turbo")) {
      // Source maps más rápidos en desarrollo
      config.devtool = "eval-cheap-module-source-map";

      // Optimizar watching
      config.watchOptions = {
        poll: false, // Usar eventos nativos del sistema
        aggregateTimeout: 200, // Reducido para respuesta más rápida
        ignored: ["**/node_modules", "**/.git", "**/.next", "**/build"],
      };

      // Reducir trabajo innecesario en desarrollo
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    // Configuraciones para build de producción
    if (!dev) {
      // Manejar módulos ESM problemáticos
      config.module.rules.push({
        test: /\.m?js$/,
        include: /node_modules\/@tanstack/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      });

      // Configurar resolución de módulos para ESM
      config.resolve.extensionAlias = {
        ".js": [".ts", ".tsx", ".js", ".jsx"],
        ".mjs": [".mts", ".mjs"],
      };
    }

    // Optimizar resolución de módulos (siempre)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimizar bundle size (siempre)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": require("path").resolve(__dirname, "src"),
      };
    }

    return config;
  },

  // Configuración de imágenes optimizada
  images: {
    unoptimized: process.env.NODE_ENV === "development", // Solo en desarrollo
  },

  // Configuración de compilación
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },

  // Optimizaciones de desarrollo adicionales
  onDemandEntries: {
    // Período en ms que una página puede estar inactiva antes de ser eliminada del cache
    maxInactiveAge: 60 * 1000, // 1 minuto en desarrollo
    // Número de páginas que deben mantenerse simultáneamente sin usar
    pagesBufferLength: 2,
  },
};

export default nextConfig;

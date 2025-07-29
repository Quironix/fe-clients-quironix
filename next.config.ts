import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  output: "standalone",
  reactStrictMode: false, // Optimizado para desarrollo
  poweredByHeader: false,
  
  // Optimizaciones de desarrollo
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@tabler/icons-react',
      'lucide-react'
    ],
  },

  // Configuración de Turbopack (estable)
  turbo: {
    rules: {
      '*.svg': ['@svgr/webpack'],
    },
  },

  // Configuración de webpack optimizada (solo cuando no se usa Turbopack)
  webpack: (config, { dev, isServer }) => {
    if (dev && !process.env.TURBOPACK) {
      // Source maps más rápidos en desarrollo
      config.devtool = 'eval-cheap-module-source-map';
      
      // Optimizar watching
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };

      // Optimizar resolución de módulos
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Optimizar bundle size
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, 'src'),
      };
    }

    return config;
  },

  // Configuración de imágenes optimizada
  images: {
    unoptimized: process.env.NODE_ENV === 'development', // Solo en desarrollo
  },

  // Configuración de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error']
    } : false,
  },
};

export default nextConfig;

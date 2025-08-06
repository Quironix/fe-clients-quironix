#!/bin/bash

echo "🚀 Optimizando entorno de desarrollo..."

# Limpiar caches
echo "🧹 Limpiando caches..."
rm -rf .next
rm -rf build
rm -rf .tsbuildinfo
rm -rf node_modules/.cache
rm -rf .eslintcache

# Limpiar cache de npm/yarn
echo "📦 Limpiando cache de paquetes..."
if command -v yarn &> /dev/null; then
    yarn cache clean
elif command -v npm &> /dev/null; then
    npm cache clean --force
fi

# Reinstalar dependencias optimizadas
echo "⚡ Optimizando dependencias..."
if command -v yarn &> /dev/null; then
    yarn install --prefer-offline
elif command -v npm &> /dev/null; then
    npm ci
fi

echo "✅ Optimización completada!"
echo "🏃‍♂️ Ejecuta 'npm run dev' para iniciar el desarrollo ultra-rápido" 
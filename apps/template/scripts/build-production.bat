@echo off
REM 🚀 Script de Build para Producción - Windows
REM Proyecto webapp-base + api-base

setlocal enabledelayedexpansion

echo 🚀 Iniciando build de producción...
echo =======================================

REM Verificar que estamos en el directorio correcto
if not exist "webapp-base" (
    echo ❌ Error: No se encontró el directorio webapp-base
    echo Debes ejecutar este script desde el directorio que contiene webapp-base y api-base
    pause
    exit /b 1
)

if not exist "api-base" (
    echo ❌ Error: No se encontró el directorio api-base
    echo Debes ejecutar este script desde el directorio que contiene webapp-base y api-base
    pause
    exit /b 1
)

echo 📋 Verificando prerrequisitos...

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js no está instalado
    pause
    exit /b 1
)

REM Verificar PHP
php --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: PHP no está instalado
    pause
    exit /b 1
)

REM Verificar Composer
composer --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Composer no está instalado
    pause
    exit /b 1
)

echo ✅ Prerrequisitos OK

REM Build Frontend
echo 📦 Building Frontend (Next.js)...
cd webapp-base

REM Verificar archivo de entorno
if not exist ".env.production" (
    echo ⚠️  No se encontró .env.production, copiando desde .env.example
    copy .env.example .env.production >nul
)

REM Instalar dependencias y hacer build
echo   📥 Instalando dependencias...
call npm ci
if errorlevel 1 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
)

echo   🔨 Generando build de producción...
call npm run build
if errorlevel 1 (
    echo ❌ Error en el build del frontend
    pause
    exit /b 1
)

echo ✅ Frontend build completado
cd ..

REM Build Backend
echo 🔧 Preparando Backend (Laravel)...
cd api-base

REM Verificar archivo de entorno
if not exist ".env" (
    echo ⚠️  No se encontró .env, copiando desde .env.example
    copy .env.example .env >nul
    echo ⚠️  IMPORTANTE: Configura las variables de entorno en api-base\.env
)

REM Instalar dependencias optimizadas
echo   📥 Instalando dependencias optimizadas...
call composer install --optimize-autoloader
if errorlevel 1 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
)

REM Cachear para producción
echo   💾 Cacheando configuración...
call php artisan config:cache
call php artisan route:cache
call php artisan view:cache

echo ✅ Backend preparado
cd ..

REM Resumen
echo.
echo 🎉 Build de producción completado exitosamente!
echo =======================================
echo 📂 Archivos generados:
echo   • webapp-base\.next\ (build de Next.js)
echo   • api-base\bootstrap\cache\ (cachés de Laravel)
echo.
echo 🚀 Para iniciar en producción:
echo   Frontend: cd webapp-base ^&^& npm start
echo   Backend:  cd api-base ^&^& php artisan serve
echo.
echo 📋 No olvides:
echo   • Configurar variables de entorno de producción
echo   • Configurar base de datos en api-base\.env
echo   • Ejecutar migraciones: php artisan migrate
echo   • Configurar SSL en el servidor
echo.
echo 📖 Consulta PRODUCTION_DEPLOYMENT.md para más detalles

pause

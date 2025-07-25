# 🚀 Guía de Despliegue en Producción

Esta guía describe los pasos necesarios para desplegar la aplicación webapp-base en un entorno de producción.

## 📋 Prerrequisitos

### Frontend (Next.js)
- Node.js 18+ 
- npm o yarn
- Servidor web (Nginx, Apache) o servicio de hosting (Vercel, Netlify)

### Backend (Laravel)
- PHP 8.1+
- Composer
- Base de datos (MySQL, PostgreSQL)
- Servidor web (Apache, Nginx)

## 🛠️ Preparación del Build

### 1. Frontend (Next.js)

```bash
# Navegar al directorio del frontend
cd webapp-base

# Instalar dependencias
npm ci

# Configurar variables de entorno para producción
cp .env.example .env.production

# Editar .env.production con los valores correctos
# NEXT_PUBLIC_BACKEND_URL=https://tu-api.dominio.com
# NEXT_PUBLIC_SESSION_DOMAIN=tu-dominio.com

# Generar build de producción
npm run build

# Probar el build localmente (opcional)
npm start
```

### 2. Backend (Laravel)

```bash
# Navegar al directorio del backend
cd ../api-base

# Instalar dependencias optimizadas
composer install --optimize-autoloader

# Configurar variables de entorno para producción
cp .env.example .env

# Editar .env con valores de producción:
# APP_ENV=production
# APP_DEBUG=false
# APP_URL=https://tu-api.dominio.com
# DB_CONNECTION=mysql (o tu base de datos)
# DB_HOST=tu-host-db
# DB_DATABASE=tu-base-datos
# DB_USERNAME=tu-usuario
# DB_PASSWORD=tu-password

# Generar clave de aplicación
php artisan key:generate

# Ejecutar migraciones
php artisan migrate --force

# Ejecutar seeders (si es necesario)
php artisan db:seed --force

# Cachear configuración para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Crear enlace simbólico para storage
php artisan storage:link
```

## 🌐 Opciones de Despliegue

### Opción 1: Vercel (Frontend) + VPS/Cloud (Backend)

#### Frontend en Vercel:
1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel dashboard
3. Build automático en cada push

#### Backend en VPS:
1. Subir archivos al servidor
2. Configurar servidor web (Nginx/Apache)
3. Configurar base de datos
4. Configurar SSL

### Opción 2: VPS Completo

#### Configuración Nginx para ambos:

```nginx
# Frontend (Next.js)
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend (Laravel)
server {
    listen 80;
    server_name api.tu-dominio.com;
    root /path/to/api-base/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### Opción 3: Docker

```dockerfile
# Dockerfile para Frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```dockerfile
# Dockerfile para Backend
FROM php:8.1-fpm
WORKDIR /var/www
COPY . .
RUN composer install --optimize-autoloader
EXPOSE 9000
CMD ["php-fpm"]
```

## 🔧 Variables de Entorno Críticas

### Frontend (.env.production)
```env
NEXT_PUBLIC_BACKEND_URL=https://api.tu-dominio.com
NEXT_PUBLIC_SESSION_DOMAIN=tu-dominio.com
```

### Backend (.env)
```env
APP_NAME="Tu App"
APP_ENV=production
APP_KEY=base64:tu-clave-generada
APP_DEBUG=false
APP_URL=https://api.tu-dominio.com

DB_CONNECTION=mysql
DB_HOST=tu-host
DB_PORT=3306
DB_DATABASE=tu_base_datos
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password

SANCTUM_STATEFUL_DOMAINS="tu-dominio.com"
SESSION_DOMAIN=".tu-dominio.com"
```

## 🔒 Configuración de Seguridad

### 1. SSL/HTTPS
- Configurar certificados SSL (Let's Encrypt recomendado)
- Forzar HTTPS en ambas aplicaciones

### 2. CORS
- Configurar dominios permitidos en Laravel
- Verificar configuración de Sanctum

### 3. Base de Datos
- Crear usuario específico con permisos mínimos
- Configurar backups automáticos
- Habilitar SSL para conexiones

## 📊 Monitoreo y Logs

### Laravel Logs
```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Limpiar logs antiguos
php artisan log:clear
```

### Next.js Logs
- Configurar PM2 para gestión de procesos
- Logs disponibles en `/var/log/pm2/`

## 🚀 Script de Despliegue Automatizado

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando despliegue..."

# Frontend
echo "📦 Building frontend..."
cd webapp-base
npm ci
npm run build

# Backend
echo "🔧 Preparing backend..."
cd ../api-base
composer install --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Despliegue completado!"
```

## 📝 Checklist Post-Despliegue

- [ ] Frontend accesible y funcionando
- [ ] Backend API respondiendo correctamente
- [ ] Base de datos conectada
- [ ] Autenticación funcionando
- [ ] Permission Manager operativo
- [ ] SSL configurado
- [ ] Monitoreo activo
- [ ] Backups configurados

## 🆘 Solución de Problemas

### Error de CORS
- Verificar `config/cors.php` en Laravel
- Comprobar dominios en `SANCTUM_STATEFUL_DOMAINS`

### Error de Autenticación
- Verificar configuración de Sanctum
- Comprobar cookies y sesiones

### Error 500 Laravel
- Revisar logs: `storage/logs/laravel.log`
- Verificar permisos de escritura
- Comprobar configuración de base de datos

---

💡 **Tip:** Siempre probar en un entorno de staging antes de producción.

# 🔐 Sistema de Autenticación y Roles

## 📋 Descripción General

Sistema completo de autenticación con redirecciones inteligentes basadas en roles de usuario. Incluye validación automática en login, guards de protección de rutas y componentes específicos por rol.

## ✅ Funcionalidades Implementadas

### 1. Redirección Automática en Login
- **Administradores** (`admin`, `administrator`) → `/dashboard`
- **Clientes/Usuarios** (`customer`, `user`) → `/dashboard/profile`
- **Usuarios sin rol** → `/dashboard/profile` (por defecto)

### 2. Hook `useAuthRedirect`
```tsx
const { shouldShowLogin } = useAuthRedirect()

// Se encarga automáticamente de:
// - Verificar autenticación
// - Redirigir según rol del usuario
// - Mostrar loading states apropiados
```

### 3. Componente `RoleGuard`
```tsx
<RoleGuard allowedRoles={['admin']} fallbackRoute="/profile">
  <AdminOnlyContent />
</RoleGuard>

// O usando el HOC
const ProtectedPage = withRoleGuard(MyComponent, ['admin'])
```

### 4. Componente `UserRoleDisplay`
Muestra información del usuario con badge de rol coloreado según el tipo.

## 🚀 Uso del Sistema

### Páginas de Autenticación
```tsx
// src/app/(front)/auth/login/page.tsx
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const { shouldShowLogin } = useAuthRedirect()
  
  if (!shouldShowLogin) {
    return <LoadingRedirect />
  }
  
  return <LoginTemplate />
}
```

### Protección de Rutas
```tsx
// src/app/(back)/dashboard/users/page.tsx
export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'administrator']}>
      <UsersCrudTemplate />
    </RoleGuard>
  )
}
```

### Contenido Condicional por Rol
```tsx
// Solo para administradores
<RoleGuard allowedRoles={['admin']}>
  <AdminPanel />
</RoleGuard>

// Solo para clientes
<RoleGuard allowedRoles={['customer']}>
  <CustomerDashboard />
</RoleGuard>
```

## 🎯 Flujo de Redirecciones

### Al Acceder a `/auth/login`:
1. **No autenticado** → Muestra formulario de login
2. **Autenticado como admin** → Redirige a `/dashboard`
3. **Autenticado como customer** → Redirige a `/dashboard/profile`

### Después del Login Exitoso:
1. **Con parámetro redirect** → Redirige a la URL especificada
2. **Sin parámetro redirect** → Usa ruta por defecto según rol
3. **Rol admin** → `/dashboard`
4. **Rol customer/user** → `/dashboard/profile`

### Acceso a Rutas Protegidas:
1. **Sin autenticación** → Redirige a `/auth/login?redirect=ruta-actual`
2. **Con autenticación pero sin permisos** → Redirige a `fallbackRoute`
3. **Con permisos** → Muestra contenido

## 🔧 Configuración de Roles

### Roles Soportados:
- `admin` / `administrator` - Acceso completo
- `customer` / `user` - Acceso limitado
- `undefined` / otros - Acceso básico por defecto

### Personalización:
```tsx
// En useAuthRedirect.ts y getDefaultRouteForRole()
switch (role?.toLowerCase()) {
  case 'admin':
    return '/dashboard'
  case 'custom_role':
    return '/custom-dashboard'
  default:
    return '/profile'
}
```

## 📁 Archivos del Sistema

### Hooks:
- `src/hooks/useAuthRedirect.ts` - Lógica de redirección automática
- `src/hooks/useIsClient.ts` - Prevención de errores de hidratación

### Componentes:
- `src/ui/components/RoleGuard.tsx` - Protección de rutas y contenido
- `src/ui/components/UserRoleDisplay.tsx` - Visualización de información del usuario
- `src/ui/components/RoleBasedDemo.tsx` - Demostración del sistema

### Páginas Actualizadas:
- `src/app/(front)/auth/login/page.tsx` - Login con redirección inteligente
- `src/app/(back)/dashboard/users/page.tsx` - Protegida para administradores
- `src/modules/auth/templates/LoginTemplate.tsx` - Template con lógica de roles

## 🎨 UX/UI

### Loading States:
- Spinner durante verificación de autenticación
- Mensaje "Redirigiendo..." cuando está autenticado
- Fallback personalizable en RoleGuard

### Badges de Rol:
- **Admin**: Badge rojo (`bg-danger`)
- **Customer**: Badge azul (`bg-primary`)
- **Sin rol**: Badge gris (`bg-secondary`)

## 🐛 Prevención de Errores

### Hidratación Segura:
```tsx
const { shouldShowLogin } = useAuthRedirect()

// Evita diferencias servidor/cliente
if (!shouldShowLogin) {
  return <LoadingState />
}
```

### Verificación de Permisos:
```tsx
// Verificación defensiva de roles
const hasPermission = allowedRoles.some(role => 
  role.toLowerCase() === userRole?.toLowerCase()
)
```

## 🚀 Beneficios

1. **Experiencia fluida**: Sin redirects manuales o validaciones duplicadas
2. **Seguridad robusta**: Protección a nivel de componente y página
3. **Mantenible**: Lógica centralizada y reutilizable
4. **Type-safe**: Interfaces TypeScript para todos los componentes
5. **Responsive**: Loading states apropiados para cada escenario
6. **Escalable**: Fácil agregar nuevos roles y rutas

## 🔍 Testing

### Escenarios de Prueba:
1. Login como admin → debe ir a `/dashboard`
2. Login como customer → debe ir a `/dashboard/profile`
3. Acceso a `/dashboard/users` sin ser admin → debe redirigir
4. Login con parámetro redirect → debe respetar el redirect
5. Usuario ya autenticado accede a login → debe redirigir según rol

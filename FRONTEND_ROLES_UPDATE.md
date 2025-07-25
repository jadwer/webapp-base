# Frontend - Actualización del Sistema de Roles

## Cambios Realizados

Este documento describe las actualizaciones realizadas en el frontend para soportar el nuevo sistema de roles basado en relaciones JSON:API.

### 📋 Resumen de Cambios

1. **Tipos de Datos Actualizados** (`src/modules/users/types/user.ts`)
   - Agregada interfaz `Role` con id y name
   - Añadido campo `roles?: Role[]` a la interfaz `User`
   - Mantenido campo `role?: string` para retrocompatibilidad

2. **Servicios API Actualizados** (`src/modules/users/services/usersService.ts`)
   - Función `prepareRoleRelationship()` para enviar roles como relaciones
   - Actualizada `getAllUsers()` para incluir `?include=roles`
   - Actualizada `getUser()` para incluir `?include=roles`
   - Modificadas `createUser()` y `updateUser()` para usar relaciones en lugar de atributos

3. **Nuevo Hook para Roles** (`src/modules/users/hooks/useRoles.ts`)
   - Hook personalizado para cargar roles dinámicamente
   - Manejo de estado loading y error
   - Fetch automático de roles disponibles

4. **Nuevo Servicio de Roles** (`src/modules/users/services/rolesService.ts`)
   - Función `getAllRoles()` para obtener roles del backend
   - Mapeo correcto de datos JSON:API

5. **Componente UserForm Actualizado** (`src/modules/users/components/UserForm.tsx`)
   - Uso del hook `useRoles` para cargar roles dinámicamente
   - Conversión de nombre de rol a ID para formularios
   - Manejo de roles como ID en lugar de nombre

6. **Componente UserTable Actualizado** (`src/modules/users/components/UserTable.tsx`)
   - Añadidas columnas de Rol y Estado
   - Mostrar roles desde el array `roles[]` o fallback a `role`
   - Badges para estado y rol

7. **Template CRUD Actualizado** (`src/modules/users/templates/UsersCrudTemplate.tsx`)
   - Función `handleEdit()` para convertir roles de array a nombre para edición
   - Botón cancelar para limpiar formulario de edición

### 🔄 Flujo de Datos

#### Crear Usuario
```
Frontend Form (role ID) → prepareRoleRelationship() → JSON:API relationships → Backend
```

#### Editar Usuario  
```
Backend (roles array) → handleEdit() → role name → UserForm → role ID → Backend
```

#### Mostrar Usuarios
```
Backend (?include=roles) → Frontend (roles array) → UserTable display
```

### ✅ Compatibilidad

- **Retrocompatibilidad**: Mantenido campo `role` para casos legacy
- **Nuevos datos**: Soporta array `roles[]` para múltiples roles futuros
- **Fallbacks**: UserTable muestra `roles[0].name` o `role` como fallback

### 📡 API Requests

#### GET Users (con roles incluidos)
```
GET /api/v1/users?include=roles
```

#### CREATE/UPDATE Users (con relaciones)
```json
{
  "data": {
    "type": "users",
    "attributes": { "name": "...", "email": "..." },
    "relationships": {
      "roles": {
        "data": [{ "type": "roles", "id": "role-id" }]
      }
    }
  }
}
```

### 🧪 Testing

- ✅ Proyecto compila sin errores TypeScript
- ✅ Build de producción exitoso
- 🔄 Pendiente: Pruebas de integración con backend

### 📝 Notas Técnicas

1. **IDs vs Nombres**: Frontend ahora envía IDs de roles, no nombres
2. **Carga Dinámica**: Roles se cargan del backend en lugar de estar hardcodeados
3. **JSON:API Compliance**: Estructura de requests cumple especificación JSON:API
4. **Error Handling**: Manejo de errores en carga de roles y operaciones CRUD

Este update permite que el frontend funcione correctamente con el nuevo backend que usa spatie/laravel-permission + Laravel JSON:API 5.x.

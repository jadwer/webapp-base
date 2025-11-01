# 🗺️ Implementation Review Roadmap
## Sistema de Autenticación y Autorización - webapp-base

**Fecha Creación:** 2025-11-01
**Propósito:** Revisión sistemática de implementación módulo a módulo
**Alcance:** Auth → Roles → Permissions → Users → Módulos Complementarios

---

## 🎯 Objetivos Generales

1. **Validar implementación** de cada módulo contra patrones enterprise (CLAUDE.md)
2. **Resolver conflictos** identificados (duplicación de hooks, naming)
3. **Estandarizar arquitectura** (SWR, JSON:API, index.ts exports)
4. **Implementar testing** (0% → 70% coverage mínimo)
5. **Documentar flujos** completos de autenticación y autorización
6. **Validar integración backend** (Spatie Permissions, Sanctum)

---

## 📊 Estado Inicial del Proyecto

| Aspecto | Estado Actual | Meta |
|---------|---------------|------|
| Módulos Documentados | 17/17 (100%) ✅ | Mantener |
| Testing Coverage | 0-18% ⚠️ | 70% mínimo |
| Patrón SWR | Inconsistente ⚠️ | 100% compliance |
| Module Exports | Falta index.ts en Users ❌ | 100% con index.ts |
| Hooks Duplicados | usePermissions x2 ❌ | Resolver conflicto |
| Backend Validation | 24% (4/17) ⚠️ | 100% críticos |

---

## 🚀 FASE 1: Fundamentos de Auth & Audit

### 1.1 **Auth Module** - Base del Sistema ✅ (Ya documentado)

**Estado:** ✅ Documentado exhaustivamente (1,994 líneas)
**Prioridad:** 🔴 CRÍTICA
**Archivo Ref:** `docs/modules/AUTH_MODULE_COMPLETE.md`

#### Checklist de Revisión:

**A. Token Management**
- [ ] Verificar storage de token en localStorage (`authToken` key)
- [ ] Validar Bearer token injection en axiosClient
- [ ] Revisar token refresh mechanism (si existe)
- [ ] Probar token expiration handling

**B. Authentication Flow**
- [ ] Login: POST `/api/v1/auth/login` → token + profile
- [ ] Logout: POST `/api/v1/auth/logout` → cleanup completo
- [ ] Profile: GET `/api/v1/auth/user?include=roles,permissions`
- [ ] Verificar cleanup en logout (localStorage, SWR cache, context)

**C. Context & State**
- [ ] AuthContext provider en layout correcto
- [ ] useAuth hook funcionando correctamente
- [ ] Profile data con roles/permissions incluidos
- [ ] Error handling robusto (401, 403, 500)

**D. Integration Tests**
- [ ] Crear tests para authService (login, logout, getProfile)
- [ ] Crear tests para useAuth hook
- [ ] Crear tests de flujo completo (login → protected route → logout)

**Archivos Clave:**
```
src/modules/auth/
├── services/authService.ts           (API layer)
├── hooks/useAuth.ts                  (React hook)
├── contexts/AuthContext.tsx          (Global state)
├── types/auth.ts                     (TypeScript interfaces)
└── tests/                            (❌ CREAR - 0% coverage)
    ├── authService.test.ts
    ├── useAuth.test.ts
    └── AuthContext.test.tsx
```

**Criterios de Completitud:**
- ✅ Todos los tests passing (>70% coverage)
- ✅ Token management validado
- ✅ Error handling completo
- ✅ Documentación actualizada si hay cambios

---

### 1.2 **Audit Module** - Sistema de Auditoría ⚠️ NO EXISTE

**Estado:** ❌ No implementado en frontend
**Prioridad:** 🟡 MEDIA (definir necesidad)
**Decisión Requerida:** ¿Se implementa o solo se usa backend audit?

#### Opciones de Implementación:

**Opción A: No Implementar Frontend Audit**
- Usar solo backend audit logs (Laravel)
- Frontend consume logs vía API read-only
- Más simple, menos overhead

**Opción B: Implementar Frontend Audit Module**
- Tracker de acciones críticas (login, logout, role changes, permission changes)
- Local logging para debugging
- Integración con backend audit

#### Si se decide implementar:

**Checklist de Creación:**
- [ ] Definir qué eventos se auditan (login, logout, CRUD roles/permissions/users)
- [ ] Crear módulo `src/modules/audit/`
- [ ] Service para enviar audit logs al backend
- [ ] Hook useAudit para logging fácil
- [ ] Integrar en componentes críticos
- [ ] Crear vista de audit trail (dashboard)

**API Endpoints Necesarios:**
```
POST   /api/v1/audit-logs          (crear log)
GET    /api/v1/audit-logs          (listar logs)
GET    /api/v1/audit-logs/{id}     (detalle log)
```

**Archivos a Crear:**
```
src/modules/audit/
├── services/auditService.ts       (API logging)
├── hooks/useAudit.ts              (Logging hook)
├── types/audit.ts                 (Event types)
├── components/AuditLogTable.tsx   (Visualization)
└── tests/auditService.test.ts     (Testing)
```

**Decisión:** ⏸️ PENDIENTE - Definir con usuario

---

## 🚀 FASE 2: Sistema de Roles y Permisos

### 2.1 **Roles Module** - Gestión de Roles ✅ (Ya documentado)

**Estado:** ✅ Documentado exhaustivamente (2,104 líneas)
**Prioridad:** 🔴 CRÍTICA
**Archivo Ref:** `docs/modules/ROLES_MODULE_COMPLETE.md`

#### Checklist de Revisión:

**A. CRUD Operations**
- [ ] Create role: POST `/api/v1/roles` con permissions relationship
- [ ] Read roles: GET `/api/v1/roles?include=permissions`
- [ ] Update role: PATCH `/api/v1/roles/{id}`
- [ ] Delete role: DELETE `/api/v1/roles/{id}`
- [ ] Verificar JSON:API compliance completo

**B. Spatie Integration**
- [ ] Validar guard_name field ("api" o "web")
- [ ] Probar asignación de permissions a roles
- [ ] Verificar sincronización con backend Spatie
- [ ] Revisar transformers (camelCase ↔ snake_case)

**C. Components**
- [ ] RoleForm: Crear/editar roles con permissions selector
- [ ] RoleTable: Listar roles con acciones
- [ ] PermissionMatrix: Asignación visual de permisos
- [ ] RoleGuard: Protección de rutas por rol

**D. Testing**
- [ ] Crear tests para rolesService
- [ ] Crear tests para useRoles hook
- [ ] Crear tests para RoleForm component
- [ ] Tests de integración con backend

**Archivos Clave:**
```
src/modules/roles/
├── services/rolesService.ts
├── hooks/useRoles.ts
├── hooks/usePermissions.ts           ⚠️ CONFLICTO (ver 2.2)
├── components/RoleForm.tsx
├── components/PermissionMatrix.tsx
├── lib/jsonApiTransformer.ts
└── tests/                            (❌ CREAR)
```

**Criterios de Completitud:**
- ✅ CRUD completo validado
- ✅ Spatie integration funcionando
- ✅ Tests passing >70%
- ✅ Conflicto de usePermissions resuelto

---

### 2.2 **Permissions - DOS SISTEMAS** 🚨 RESOLVER DUPLICACIÓN

**Estado:** ⚠️ Analizado (857 líneas) + CONFLICTO IDENTIFICADO
**Prioridad:** 🔴 CRÍTICA - Resolver primero
**Problema:** Dos módulos con hooks del mismo nombre

#### 🔍 Análisis del Conflicto:

**Sistema 1: Permissions Module (CRUD)**
- **Ubicación:** `src/modules/permissions/`
- **Ruta:** `/dashboard/permissions`
- **Hook:** `usePermissions()` - Básico CRUD
- **Propósito:** Administrar permissions como entidades
- **Service:** `getAllPermissions()`, `createPermission()`, `updatePermission()`, `deletePermission()`

**Sistema 2: Permission Manager (Matriz en Roles)**
- **Ubicación:** `src/modules/roles/pages/PermissionManagerPage.tsx`
- **Ruta:** `/dashboard/permission-manager`
- **Hook:** `usePermissions()` - Avanzado con grouped/search
- **Propósito:** Asignar permisos a roles (matriz)
- **Service:** `permissionsService.getAll()`, `.getGrouped()`, `.search()`

#### 🎯 Opciones de Solución:

**Opción A: Renombrar Hooks (Recomendado)**
```typescript
// src/modules/permissions/hooks/usePermissions.ts
export function usePermissionsCRUD() { ... }        // CRUD básico
export function usePermission() { ... }             // Single permission
export function usePermissionActions() { ... }      // Create/Update/Delete

// src/modules/roles/hooks/usePermissions.ts
export function usePermissionsGrouped() { ... }     // Grouped permissions
export function usePermissionSearch() { ... }       // Search
export function usePermissionsForMatrix() { ... }   // Matrix display
```

**Opción B: Consolidar en un Solo Módulo**
- Mover todo a `src/modules/permissions/`
- Exportar diferentes hooks según funcionalidad
- Eliminar duplicación de código
- Mantener una sola fuente de verdad

**Opción C: Namespace Imports**
```typescript
import * as PermissionsCRUD from '@/modules/permissions'
import * as PermissionsMatrix from '@/modules/roles/hooks/usePermissions'
```

#### 📋 Plan de Acción Recomendado:

**Paso 1: Análisis Detallado**
- [ ] Comparar ambos `permissionsService.ts`
- [ ] Identificar funcionalidad duplicada
- [ ] Mapear dependencias de cada hook
- [ ] Evaluar impacto en componentes existentes

**Paso 2: Decisión de Arquitectura**
- [ ] Definir cuál será el módulo principal
- [ ] Planificar migración de código
- [ ] Actualizar imports en componentes

**Paso 3: Implementación**
- [ ] Renombrar hooks según decisión
- [ ] Actualizar todos los imports
- [ ] Actualizar documentación
- [ ] Crear tests

**Paso 4: Validación**
- [ ] Probar `/dashboard/permissions` (CRUD)
- [ ] Probar `/dashboard/permission-manager` (Matriz)
- [ ] Verificar que no hay breaking changes
- [ ] Tests passing

**Archivos Afectados:**
```
src/modules/permissions/
├── hooks/usePermissions.ts           🚨 RENOMBRAR
├── services/permissionsService.ts

src/modules/roles/
├── hooks/usePermissions.ts           🚨 RENOMBRAR
├── services/permissionsService.ts    (puede estar duplicado)
├── pages/PermissionManagerPage.tsx   (actualizar imports)
├── components/PermissionMatrix.tsx   (actualizar imports)

src/app/(back)/dashboard/
├── permissions/page.tsx              (actualizar imports)
└── permission-manager/page.tsx       (actualizar imports)
```

**Criterios de Completitud:**
- ✅ Conflicto de nombres resuelto
- ✅ Cero breaking changes en componentes
- ✅ Ambos sistemas funcionando correctamente
- ✅ Tests covering ambos casos de uso
- ✅ Documentación actualizada

---

## 🚀 FASE 3: Gestión de Usuarios

### 3.1 **Users Module** - CRUD de Usuarios ⚠️ REFACTOR NECESARIO

**Estado:** ⚠️ Analizado (631 líneas) - NO sigue patrón enterprise
**Prioridad:** 🔴 ALTA
**Problemas Identificados:**
- ❌ No usa SWR (usa custom hooks con useState/useEffect)
- ❌ Falta `index.ts` export file
- ❌ No tiene React.memo optimizations
- ❌ 0% test coverage

#### Checklist de Refactoring:

**A. Migrar a SWR (Patrón Enterprise)**

**ANTES (Custom Hook - Actual):**
```typescript
// src/modules/users/hooks/useUsers.ts
export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  return { users, loading, error, refetch: fetchUsers }
}
```

**DESPUÉS (SWR - Enterprise Pattern):**
```typescript
// src/modules/users/hooks/useUsers.ts
import useSWR from 'swr'
import { usersService } from '../services/usersService'

export function useUsers(include?: string[]) {
  const key = include ? ['users', include.join(',')] : 'users'

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => usersService.getAll(include),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    users: data || [],
    error,
    isLoading,
    mutate
  }
}

export function useUser(id: string | number | null, include?: string[]) {
  const key = id ? (include ? ['user', id.toString(), include.join(',')] : ['user', id.toString()]) : null

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => id ? usersService.getById(id, include) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  return {
    user: data,
    error,
    isLoading,
    mutate
  }
}

export function useUserActions() {
  const createUser = useCallback(async (data: UserFormData): Promise<User> => {
    try {
      const newUser = await usersService.create(data)
      await mutate(key => typeof key === 'string' && key.startsWith('users'))
      await mutate(key => Array.isArray(key) && key[0] === 'users')
      return newUser
    } catch (error) {
      console.error('Error creando usuario:', error)
      throw error
    }
  }, [])

  const updateUser = useCallback(async (id: string | number, data: UserFormData): Promise<User> => {
    try {
      const updatedUser = await usersService.update(id, data)
      await mutate(key => typeof key === 'string' && key.startsWith('users'))
      await mutate(key => Array.isArray(key) && key[0] === 'users')
      return updatedUser
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      throw error
    }
  }, [])

  const deleteUser = useCallback(async (id: string | number): Promise<void> => {
    try {
      await usersService.delete(id)
      await mutate(key => typeof key === 'string' && key.startsWith('users'))
      await mutate(key => Array.isArray(key) && key[0] === 'users')
    } catch (error) {
      console.error('Error eliminando usuario:', error)
      throw error
    }
  }, [])

  return {
    createUser,
    updateUser,
    deleteUser
  }
}
```

**B. Crear index.ts Export File**

```typescript
// src/modules/users/index.ts
// Types
export type { User, Role, UserFormData } from './types/user'

// Services
export { usersService } from './services/usersService'
export { rolesService } from './services/rolesService'

// Hooks
export { useUsers, useUser, useUserActions } from './hooks/useUsers'
export { useRoles } from './hooks/useRoles'
export { useUserForm } from './hooks/useUserForm'

// Components
export { default as UserForm } from './components/UserForm'
export { default as UserTable } from './components/UserTable'

// Templates
export { default as UsersCrudTemplate } from './templates/UsersCrudTemplate'
```

**C. Optimizaciones de Performance**

```typescript
// src/modules/users/components/UserForm.tsx
import { memo } from 'react'

export const UserForm = memo(function UserForm({ ... }) {
  // Component logic
})

// src/modules/users/components/UserTable.tsx
import { memo } from 'react'

export const UserTable = memo(function UserTable({ ... }) {
  // Component logic
})
```

**D. Testing Implementation**

```typescript
// src/modules/users/tests/usersService.test.ts
import { describe, it, expect, vi } from 'vitest'
import { usersService } from '../services/usersService'
import axiosClient from '@/lib/axiosClient'

vi.mock('@/lib/axiosClient')

describe('usersService', () => {
  describe('getAll', () => {
    it('should fetch all users with roles included', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', attributes: { name: 'Test User', email: 'test@example.com' } }
          ],
          included: [
            { type: 'roles', id: '1', attributes: { name: 'admin' } }
          ]
        }
      }

      vi.mocked(axiosClient.get).mockResolvedValue(mockResponse)

      const users = await usersService.getAll()

      expect(users).toHaveLength(1)
      expect(users[0].name).toBe('Test User')
    })
  })

  // More tests...
})
```

#### Plan de Acción:

**Paso 1: Refactor Hooks to SWR**
- [ ] Reescribir useUsers con SWR
- [ ] Reescribir useUser con SWR
- [ ] Reescribir useUserActions con SWR mutate
- [ ] Mantener compatibilidad de API (mismo return shape)

**Paso 2: Crear Module Exports**
- [ ] Crear `src/modules/users/index.ts`
- [ ] Exportar todos los tipos, services, hooks, components
- [ ] Actualizar imports en componentes que usan users

**Paso 3: Performance Optimizations**
- [ ] Agregar React.memo a componentes
- [ ] useCallback en event handlers
- [ ] Verificar re-renders innecesarios

**Paso 4: Testing**
- [ ] Tests para usersService (CRUD operations)
- [ ] Tests para useUsers hook (SWR behavior)
- [ ] Tests para UserForm component
- [ ] Tests para UserTable component
- [ ] Integration tests (create/update/delete flow)

**Archivos a Modificar/Crear:**
```
src/modules/users/
├── hooks/
│   ├── useUsers.ts                   🔄 REFACTOR to SWR
│   ├── useRoles.ts                   ✅ Keep (already simple)
│   └── useUserForm.ts                🔄 REFACTOR to use useUserActions
├── services/
│   ├── usersService.ts               ✅ Keep (already good)
│   └── rolesService.ts               ✅ Keep
├── components/
│   ├── UserForm.tsx                  🔄 Add memo + update hooks
│   └── UserTable.tsx                 🔄 Add memo
├── templates/
│   └── UsersCrudTemplate.tsx         🔄 Update to use new hooks
├── index.ts                          ❌ CREATE (new file)
└── tests/                            ❌ CREATE (new directory)
    ├── usersService.test.ts
    ├── useUsers.test.ts
    ├── UserForm.test.tsx
    └── UserTable.test.tsx
```

**Criterios de Completitud:**
- ✅ SWR implementado correctamente
- ✅ index.ts creado y funcionando
- ✅ Performance optimizations aplicadas
- ✅ Tests passing >70% coverage
- ✅ Cero breaking changes en componentes existentes
- ✅ Documentación actualizada

---

## 🚀 FASE 4: Módulos Complementarios

### 4.1 **Contacts Module** - Gestión de Contactos ✅ (Ya documentado)

**Prioridad:** 🟡 MEDIA
**Checklist:**
- [ ] Validar integración con Purchase/Sales modules
- [ ] Revisar Document management system
- [ ] Probar relationship con Users si aplica
- [ ] Crear tests (0% actual)

### 4.2 **Products Module** - Sistema de Productos ✅ (Enterprise-ready)

**Prioridad:** 🟡 MEDIA
**Checklist:**
- [ ] Validar 5 view modes con datasets grandes (>1000 items)
- [ ] Probar virtualization performance
- [ ] Revisar permisos específicos por acción (create/edit/delete products)
- [ ] Crear tests para componentes críticos

### 4.3 **Purchase & Sales Modules** - Órdenes ✅ (Production-ready)

**Prioridad:** 🟡 MEDIA
**Checklist:**
- [ ] Validar 3-step workflow completo
- [ ] Probar analytics y reportes
- [ ] Revisar permisos por rol (¿quién puede aprobar órdenes?)
- [ ] Crear tests para workflow crítico

### 4.4 **Finance & Accounting** - Módulos Financieros ⚠️ BACKEND CAMBIÓ

**Prioridad:** 🔴 ALTA
**Problema:** Backend "cambió mucho" según documentación
**Checklist:**
- [ ] Validar contra schema actual del backend
- [ ] Verificar endpoints disponibles
- [ ] Revisar breaking changes aplicables
- [ ] Actualizar transformers si es necesario
- [ ] Probar integración completa
- [ ] Crear tests críticos

### 4.5 **Inventory Module** - Gestión de Inventario ⚠️ NO BACKEND SCHEMA

**Prioridad:** 🟡 MEDIA
**Problema:** No hay schema documentado en backend
**Checklist:**
- [ ] Validar si existe implementación en backend
- [ ] Documentar schema real del backend
- [ ] Verificar endpoints funcionando
- [ ] Revisar control de acceso por almacén/ubicación
- [ ] Crear tests

---

## 📊 Tracking de Progreso

### Sprints Propuestos:

#### **Sprint 4: Auth & Permissions Cleanup** (1-2 semanas)
- [ ] Auth module validation + tests
- [ ] Resolver conflicto Permissions hooks
- [ ] Permissions CRUD tests
- [ ] Permission Manager tests
- [ ] Documentación actualizada

#### **Sprint 5: Roles & Users Refactor** (1-2 semanas)
- [ ] Roles module validation + tests
- [ ] Users module SWR refactor
- [ ] Users module index.ts creation
- [ ] Users module tests (>70% coverage)
- [ ] Integration tests Auth-Roles-Users

#### **Sprint 6: Complementary Modules** (2-3 semanas)
- [ ] Finance & Accounting backend validation
- [ ] Inventory backend schema documentation
- [ ] Contacts/Products/Purchase/Sales tests
- [ ] Permisos específicos por módulo
- [ ] Performance audit

#### **Sprint 7: Testing & Documentation** (1 semana)
- [ ] Coverage global >70%
- [ ] Integration tests completos
- [ ] Documentación final
- [ ] Performance benchmarks

---

## 🎯 Criterios de Éxito Global

**Proyecto completado cuando:**
- ✅ Todos los módulos críticos con tests >70%
- ✅ SWR implementado consistentemente
- ✅ Cero conflictos de naming
- ✅ index.ts en todos los módulos
- ✅ Backend validation 100% en módulos críticos
- ✅ Performance audit pasado
- ✅ Documentación actualizada
- ✅ Audit system definido (implementar o no)

---

## 📖 Referencias

### Documentación Existente
- [CLAUDE.md](../CLAUDE.md) - Development guidelines & enterprise patterns
- [AUTH_MODULE_COMPLETE.md](./modules/AUTH_MODULE_COMPLETE.md) - Auth documentation
- [ROLES_MODULE_COMPLETE.md](./modules/ROLES_MODULE_COMPLETE.md) - Roles documentation
- [PRODUCTS_MODULE_COMPLETE.md](./modules/PRODUCTS_MODULE_COMPLETE.md) - Enterprise patterns reference

### Backend References
- `/home/jadwer/dev/AtomoSoluciones/base/api-base/docs/DATABASE_SCHEMA_REFERENCE.md`
- `/home/jadwer/dev/AtomoSoluciones/base/api-base/docs/FRONTEND_INTEGRATION_GUIDE.md`

---

**Última Actualización:** 2025-11-01
**Next Action:** Iniciar Sprint 4 - Auth & Permissions Cleanup

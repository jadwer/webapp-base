# 📝 Prompt para Próxima Sesión de Claude Code

**Fecha:** 2025-11-01
**Contexto:** Revisión de implementación módulo a módulo (Sprint 4)

---

## 🎯 Prompt Inicial

```
Hola! Vamos a continuar con la revisión de implementación del proyecto webapp-base.

Ya completamos 3 sprints de DOCUMENTACIÓN (17 módulos, 26,817 líneas):
- Sprint 1: ERP Core (Products, Inventory, Finance, Accounting, Contacts)
- Sprint 2: Supporting (Page-Builder-Pro, Laborwasser, Auth, Roles, Public-Catalog)
- Sprint 3: Admin & Utils (Permissions, Users, Purchase, Sales, Catalog)

Ahora iniciamos SPRINT 4: Auth & Permissions Cleanup - REVISIÓN DE IMPLEMENTACIÓN

Lee primero estos documentos para contexto:
1. docs/IMPLEMENTATION_REVIEW_ROADMAP.md - Roadmap completo de revisión
2. docs/modules/AUTH_MODULE_COMPLETE.md - Documentación de Auth module
3. docs/modules/README.md - Estado de documentación

OBJETIVO DE ESTA SESIÓN:
Empezar con FASE 1.1 del roadmap: **Auth Module - Revisión de Implementación**

Específicamente necesito que:

1. **Revises el Auth Module** siguiendo el checklist de la sección 1.1 del roadmap:
   - Token Management (localStorage, Bearer injection)
   - Authentication Flow (login, logout, profile)
   - Context & State (AuthContext, useAuth)
   - Error handling

2. **Identifiques problemas** de implementación (bugs, anti-patterns, missing features)

3. **Propongas soluciones** concretas con código si es necesario

4. **Priorices acciones** (crítico, importante, mejora)

5. **Prepares para testing** - identifica qué tests faltan y genera esqueleto de tests

NO hagas cambios en el código todavía, primero quiero revisar tus hallazgos.

¿Estás listo para comenzar con la revisión del Auth Module?
```

---

## 📋 Contexto para Claude Code

### Estado Actual del Proyecto:

**Documentación:**
- ✅ 17 módulos documentados (100%)
- ✅ 26,817 líneas de código analizadas
- ✅ Roadmap de implementación creado

**Problemas Identificados:**
- ❌ **Conflicto crítico:** Dos hooks `usePermissions` con mismo nombre
  - `src/modules/permissions/hooks/usePermissions.ts` (CRUD básico)
  - `src/modules/roles/hooks/usePermissions.ts` (Grouped/Search avanzado)
- ⚠️ **Users Module:** NO usa SWR, falta index.ts
- ⚠️ **Testing:** 0% coverage en mayoría de módulos
- ⚠️ **Audit Module:** No existe, pendiente definir si se implementa

**Prioridades Sprint 4:**
1. Validar Auth module (base de todo el sistema)
2. Resolver conflicto de Permissions hooks
3. Crear tests para Auth y Permissions
4. Actualizar documentación con hallazgos

### Archivos Clave a Revisar (Sprint 4):

```
src/modules/auth/
├── services/authService.ts           (⚠️ REVISAR token management)
├── hooks/useAuth.ts                  (⚠️ REVISAR state management)
├── contexts/AuthContext.tsx          (⚠️ REVISAR provider setup)
└── tests/                            (❌ NO EXISTE - crear)

src/modules/permissions/
├── hooks/usePermissions.ts           (🚨 CONFLICTO - renombrar)
└── tests/                            (❌ NO EXISTE - crear)

src/modules/roles/
├── hooks/usePermissions.ts           (🚨 CONFLICTO - renombrar)
└── tests/                            (❌ NO EXISTE - crear)
```

### Decisiones Pendientes:

1. **Audit Module:**
   - ¿Implementar frontend audit o solo usar backend?
   - Si se implementa: ¿qué eventos auditar?

2. **Permissions Hooks Conflict:**
   - ¿Renombrar a `usePermissionsCRUD` y `usePermissionsGrouped`?
   - ¿O consolidar en un solo módulo?

3. **Testing Strategy:**
   - ¿Vitest para todos los módulos?
   - ¿Coverage mínimo 70% o más alto para módulos críticos?

### Expected Outcomes Sprint 4:

Al final de este sprint deberíamos tener:
- ✅ Auth module validado y con tests >70%
- ✅ Conflicto Permissions resuelto
- ✅ Tests creados para Permissions y Roles
- ✅ Roadmap actualizado con hallazgos
- ✅ Lista de issues/bugs priorizada

---

## 🔧 Comandos Útiles para la Sesión

```bash
# Ejecutar tests de un módulo
npm run test src/modules/auth

# Ejecutar tests con coverage
npm run test:coverage

# Ver archivos del módulo Auth
ls -la src/modules/auth/

# Ver rutas de dashboard protegidas
ls -la src/app/\(back\)/dashboard/

# Buscar uso de usePermissions (identificar conflicto)
grep -r "usePermissions" src/modules/ src/app/
```

---

## 📊 Tracking de Progreso

Usa el TodoWrite tool para trackear:

```markdown
Sprint 4: Auth & Permissions Cleanup
- [ ] Revisar Auth module implementation
- [ ] Identificar problemas críticos
- [ ] Proponer soluciones
- [ ] Crear esqueleto de tests
- [ ] Resolver conflicto usePermissions
- [ ] Validar Permissions CRUD
- [ ] Validar Permission Manager
- [ ] Actualizar roadmap con hallazgos
```

---

## 🎯 Success Criteria para Esta Sesión

Esta sesión será exitosa si:

1. **Auth Module revisado completamente**
   - Token management validado
   - Authentication flow documentado
   - Problemas identificados y priorizados

2. **Conflicto Permissions analizado**
   - Ambos sistemas comparados
   - Solución propuesta y documentada
   - Plan de migración definido

3. **Testing preparado**
   - Esqueleto de tests creado
   - Coverage gaps identificados
   - Prioridades de testing definidas

4. **Roadmap actualizado**
   - Hallazgos documentados
   - Issues priorizados
   - Next steps claros

---

**¡Listo para comenzar Sprint 4!** 🚀

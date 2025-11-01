# [MODULE_NAME] Module - Complete Documentation

**Module**: [Module Name]
**Status**: [⚪ Pendiente | 🟡 En Progreso | ✅ Completo | ⚠️ Necesita Actualización]
**Date**: YYYY-MM-DD
**Total Files**: XX
**Backend Integration Status**: [✅ Validado | ⚠️ Necesita Ajustes | ❌ Desincronizado]

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Module Structure](#module-structure)
3. [Entities & Types](#entities--types)
4. [Components Breakdown](#components-breakdown)
5. [Hooks & Services](#hooks--services)
6. [Backend Integration Analysis](#backend-integration-analysis)
7. [Gaps & Discrepancies](#gaps--discrepancies)
8. [Testing Coverage](#testing-coverage)
9. [Performance Optimizations](#performance-optimizations)
10. [Known Issues & Limitations](#known-issues--limitations)
11. [Usage Examples](#usage-examples)
12. [Next Steps & Improvements](#next-steps--improvements)

---

## Overview

**Purpose**: [Brief description of what this module does]

**Key Features**:
- Feature 1
- Feature 2
- Feature 3

**Implementation Status**:
- ✅ [Completed feature]
- 🟡 [In progress feature]
- ⚪ [Planned feature]

---

## Module Structure

### Directory Tree

```
src/modules/[module-name]/
├── components/           # [XX files]
│   ├── [MainComponent].tsx
│   ├── [SecondaryComponent].tsx
│   └── ...
├── hooks/               # [XX files]
│   ├── use[Entity].ts
│   └── ...
├── services/            # [XX files]
│   ├── [entity]Service.ts
│   └── ...
├── types/               # [XX files]
│   ├── [entity].ts
│   └── ...
├── templates/           # [XX files]
│   ├── [Template].html.tsx
│   └── ...
├── utils/               # [XX files]
│   ├── transformers.ts
│   ├── errorHandling.ts
│   └── ...
├── store/               # [XX files] (if using Zustand)
│   └── [module]Store.ts
├── tests/               # [XX files]
│   ├── services/
│   ├── hooks/
│   └── components/
└── index.ts             # Module exports
```

### File Count

| Type | Count | Purpose |
|------|-------|---------|
| **Components (.tsx)** | XX | UI components |
| **Hooks (.ts)** | XX | Custom React hooks |
| **Services (.ts)** | XX | API integration layer |
| **Types (.ts)** | XX | TypeScript interfaces |
| **Templates (.html.tsx)** | XX | Designer-friendly templates |
| **Utils (.ts)** | XX | Helper functions |
| **Tests** | XX | Unit/Integration tests |
| **Total** | XXX | All files |

---

## Entities & Types

### Entity 1: [EntityName]

**TypeScript Interface:**
```typescript
export interface Entity {
  id: number;
  field1: string;
  field2: number;
  field3: boolean;
  // ... all fields
}
```

**Backend Mapping:**
| Frontend Field | Backend Field | Type | Notes |
|----------------|---------------|------|-------|
| `field1` | `field_1` | string | - |
| `field2` | `field_2` | number | - |

**JSON:API Type:** `"entity-name"` (kebab-case)

**Key Relationships:**
- `belongsTo`: [RelatedEntity]
- `hasMany`: [RelatedEntities]

---

## Components Breakdown

### Main Components

#### 1. [MainComponent].tsx

**Purpose**: [Description]

**Props Interface:**
```typescript
interface MainComponentProps {
  prop1: Type1;
  prop2: Type2;
}
```

**Key Features:**
- Feature 1
- Feature 2

**Dependencies:**
- Hook: `use[Entity]`
- Service: `[entity]Service`

**State Management:**
- Local state: `useState` for [what]
- Global state: Zustand store for [what] (if applicable)

**Example Usage:**
```tsx
import { MainComponent } from '@/modules/[module-name]';

<MainComponent prop1={value1} prop2={value2} />
```

---

#### 2. [SecondaryComponent].tsx

[Repeat structure for each major component]

---

### Utility Components

#### [UtilityComponent].tsx

**Purpose**: [Description]

**Usage:**
```tsx
<UtilityComponent {...props} />
```

---

## Hooks & Services

### Hooks

#### use[Entity].ts

**Purpose**: [Description]

**Parameters:**
```typescript
interface UseEntityOptions {
  filters?: FilterType;
  include?: string[];
}
```

**Return Type:**
```typescript
{
  entities: Entity[];
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
}
```

**Implementation Details:**
- Uses SWR for data fetching
- Transforms JSON:API response to flat objects
- Handles pagination/filtering

**Example:**
```typescript
const { entities, isLoading } = useEntity({ filters: { active: true } });
```

---

### Services

#### [entity]Service.ts

**Purpose**: [Description]

**Functions:**

```typescript
// GET all
async function getEntities(filters?: FilterOptions): Promise<Entity[]>

// GET one
async function getEntity(id: number): Promise<Entity>

// CREATE
async function createEntity(data: EntityFormData): Promise<Entity>

// UPDATE
async function updateEntity(id: number, data: Partial<EntityFormData>): Promise<Entity>

// DELETE
async function deleteEntity(id: number): Promise<void>
```

**JSON:API Integration:**
- Endpoint: `/api/v1/[entities]`
- Transformers: `transform[Entity]ToJsonApi`, `transform[Entity]FromJsonApi`

---

## Backend Integration Analysis

### Endpoints Used

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/[entities]` | GET | List all | ✅ Working |
| `/api/v1/[entities]` | POST | Create | ✅ Working |
| `/api/v1/[entities]/{id}` | GET | Get one | ✅ Working |
| `/api/v1/[entities]/{id}` | PATCH | Update | ✅ Working |
| `/api/v1/[entities]/{id}` | DELETE | Delete | ✅ Working |

### Backend Schema Comparison

**Backend Database Schema** (from DATABASE_SCHEMA_REFERENCE.md):
```sql
CREATE TABLE [table_name] (
  id BIGINT UNSIGNED PRIMARY KEY,
  field_1 VARCHAR(255),
  field_2 DECIMAL(10,2),
  -- ... all fields
);
```

**Frontend Types Coverage:**
- ✅ All backend fields mapped
- ⚠️ Missing: [field_name] (if any)
- ℹ️ Additional: [field_name] (frontend-only, if any)

### JSON:API Compliance

**Request Format:**
```typescript
// Example CREATE request
{
  data: {
    type: "entity-name",
    attributes: {
      field1: "value",
      field2: 123
    },
    relationships: {
      relatedEntity: {
        data: { type: "related-entities", id: "1" }
      }
    }
  }
}
```

**Response Handling:**
- ✅ Uses transformJsonApiResource
- ✅ Handles included relationships
- ✅ Proper error parsing

---

## Gaps & Discrepancies

### ⚠️ Gaps Identificados

#### 1. [Gap Name]

**Descripción**: [What's missing or different]

**Backend soporta pero frontend no usa:**
- Feature/field X
- Endpoint Y

**Impacto:** [HIGH/MEDIUM/LOW]

**Acción requerida:**
- [ ] Implementar feature
- [ ] Actualizar types
- [ ] Agregar tests

---

#### 2. Breaking Changes Backend

**Fecha cambio backend:** YYYY-MM-DD

**Cambios aplicables a este módulo:**
- ❌ URL cambió: `/old-url` → `/new-url`
- ⚠️ Campo renombrado: `old_field` → `new_field`
- ✅ Ya adaptado: [change]

**Status adaptación frontend:**
- ✅ Completado
- 🟡 En progreso
- ⚪ Pendiente

---

### ℹ️ Frontend Ahead of Backend

**Features implementados en frontend que backend no soporta aún:**
- [Feature name]: [Description]

---

## Testing Coverage

### Current Coverage

| Type | Files | Coverage | Status |
|------|-------|----------|--------|
| Unit Tests (Services) | X/Y | XX% | [✅ Good | ⚠️ Low | ❌ None] |
| Integration Tests (Hooks) | X/Y | XX% | [✅ Good | ⚠️ Low | ❌ None] |
| Component Tests | X/Y | XX% | [✅ Good | ⚠️ Low | ❌ None] |
| **Total** | XX | XX% | [Status] |

### Test Files

```
tests/
├── services/
│   └── [entity]Service.test.ts
├── hooks/
│   └── use[Entity].test.tsx
└── components/
    └── [Component].test.tsx
```

### Coverage Requirements

**Project Standard:** 70% minimum (from CLAUDE.md)

**Current Status:** [PASS ✅ | FAIL ❌]

### Missing Tests

**Critical missing tests:**
- [ ] Service: [test description]
- [ ] Hook: [test description]
- [ ] Component: [test description]

---

## Performance Optimizations

### Current Optimizations

#### 1. [Optimization Name]

**Implementation:**
- Technique used
- Where applied

**Impact:**
- Before: [metric]
- After: [metric]

---

#### 2. Virtualization

**Using:** [TanStack Virtual | React Window | None]

**Applied to:**
- Component: [ComponentName]
- Threshold: [number] items

---

#### 3. Memoization

**React.memo used in:**
- [Component1]
- [Component2]

**useCallback/useMemo:**
- [Hook/function name]

---

### Performance Metrics

| Operation | Target | Actual | Status |
|-----------|--------|--------|--------|
| Initial Load | < 1s | [X]s | [✅ | ⚠️ | ❌] |
| Filter Update | < 300ms | [X]ms | [✅ | ⚠️ | ❌] |
| CRUD Operation | < 500ms | [X]ms | [✅ | ⚠️ | ❌] |

---

## Known Issues & Limitations

### 🔴 Critical Issues

#### Issue 1: [Issue Name]

**Description**: [What's wrong]

**Impact**: [High/Medium/Low]

**Workaround**: [Temporary solution if any]

**Planned Fix**: [What needs to be done]

**Tracking**: [Issue number if applicable]

---

### 🟡 Medium Issues

[List medium priority issues]

---

### 🟢 Minor Issues / Tech Debt

[List minor issues and tech debt]

---

## Usage Examples

### Example 1: Basic CRUD Operations

```tsx
import { useEntity, entityService } from '@/modules/[module-name]';

function MyComponent() {
  // Fetch entities
  const { entities, isLoading, mutate } = useEntity();

  // Create entity
  const handleCreate = async (data: EntityFormData) => {
    const newEntity = await entityService.createEntity(data);
    mutate(); // Refresh list
  };

  // Update entity
  const handleUpdate = async (id: number, data: Partial<EntityFormData>) => {
    await entityService.updateEntity(id, data);
    mutate();
  };

  // Delete entity
  const handleDelete = async (id: number) => {
    await entityService.deleteEntity(id);
    mutate();
  };

  return (
    // ... JSX
  );
}
```

---

### Example 2: With Filters

```tsx
const { entities } = useEntity({
  filters: {
    isActive: true,
    categoryId: 5
  }
});
```

---

### Example 3: With Relationships

```tsx
const { entity } = useEntity(id, {
  include: ['relatedEntity1', 'relatedEntity2']
});

// entity.relatedEntity1 is populated
// entity.relatedEntity2 is populated
```

---

## Next Steps & Improvements

### Immediate (Sprint Current)

- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

### Short Term (1-2 sprints)

- [ ] Increase test coverage to 70%+
- [ ] Fix critical issues
- [ ] Implement missing backend features

### Medium Term (3-6 sprints)

- [ ] [Feature improvement]
- [ ] [Performance optimization]
- [ ] [Refactoring task]

### Long Term (Roadmap)

- [ ] [Major feature]
- [ ] [Architecture change]

---

## Changelog

### [YYYY-MM-DD] - Initial Documentation
- Created comprehensive module documentation
- Validated against backend schema
- Identified gaps and next steps

---

**Last Updated**: YYYY-MM-DD
**Documented By**: Claude (Frontend AI Assistant)
**Backend Schema Version**: [Version from DATABASE_SCHEMA_REFERENCE.md]
**Frontend Code Version**: [Git commit hash or date]

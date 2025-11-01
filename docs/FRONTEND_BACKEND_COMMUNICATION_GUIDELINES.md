# 📡 Frontend-Backend Communication Guidelines

**Fecha:** 2025-10-31
**Autor:** Claude (Frontend AI Assistant)
**Propósito:** Directrices oficiales para comunicación entre webapp-base (Next.js) y api-base (Laravel)
**Estado:** Vigente - Validado contra backend docs

---

## ⚠️ NOTA IMPORTANTE

Este documento fue creado basándose en la documentación del backend y es **técnicamente correcto**.

Sin embargo, al revisar el frontend real se descubrió que ya tenemos **17 módulos implementados con 400+ archivos**, muchos siguiendo estos patrones pero algunos pueden tener variaciones.

**Validación en progreso:** Cada módulo se está documentando individualmente para confirmar adherencia a estas guidelines.

**Ver:** `docs/modules/` para documentación específica de cada módulo implementado.

---

## 🎯 Principios Fundamentales

### 1. JSON:API 1.1 Compliance
**TODOS** los requests y responses siguen la especificación JSON:API 1.1

### 2. Bearer Token Authentication
**TODAS** las requests (excepto login) requieren `Authorization: Bearer {token}`

### 3. Party Pattern
**SIEMPRE** usar `contact_id` para referenciar clientes/proveedores, NUNCA `customer_id` o `supplier_id`

### 4. CamelCase ↔ Snake_case
- **Frontend/API:** camelCase (`invoiceNumber`, `totalAmount`)
- **Database:** snake_case (`invoice_number`, `total_amount`)
- **Transformación:** Automática por JSON:API schemas

---

## 📋 Table of Contents

1. [Authentication](#1-authentication)
2. [Request Format](#2-request-format)
3. [Response Handling](#3-response-handling)
4. [Relationships](#4-relationships)
5. [Filtering & Sorting](#5-filtering--sorting)
6. [Pagination](#6-pagination)
7. [File Uploads](#7-file-uploads)
8. [Error Handling](#8-error-handling)
9. [Data Transformers](#9-data-transformers)
10. [Best Practices](#10-best-practices)
11. [Common Pitfalls](#11-common-pitfalls)

---

## 1. Authentication

### Login Flow

```typescript
// src/lib/auth.ts
export async function login(email: string, password: string) {
  const response = await axios.post('/api/auth/login', {
    email,
    password
  });

  const { token, user } = response.data;

  // Store token
  localStorage.setItem('api_token', token);

  // Set default header for all future requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  return { token, user };
}
```

### Axios Client Setup

```typescript
// src/lib/axiosClient.ts
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Accept': 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json'
  }
});

// Inject token automatically
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('api_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 (Unauthenticated)
axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('api_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

---

## 2. Request Format

### CREATE (POST)

```typescript
// ✅ CORRECTO
async function createProduct(data: ProductFormData) {
  const payload = {
    data: {
      type: "products",            // ✅ kebab-case, plural
      attributes: {
        name: data.name,            // ✅ camelCase
        sku: data.sku,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        iva: data.iva
      },
      relationships: {
        category: {
          data: {
            type: "categories",     // ✅ kebab-case
            id: String(data.categoryId)  // ⚠️ STRING, not number
          }
        },
        brand: {
          data: { type: "brands", id: String(data.brandId) }
        },
        unit: {
          data: { type: "units", id: String(data.unitId) }
        }
      }
    }
  };

  const response = await axiosClient.post('/api/v1/products', payload);
  return response.data;
}
```

### UPDATE (PATCH)

```typescript
// ✅ CORRECTO
async function updateProduct(id: number, data: Partial<ProductFormData>) {
  const payload = {
    data: {
      type: "products",
      id: String(id),               // ✅ ID required in PATCH
      attributes: {
        ...data                     // Solo los campos a actualizar
      }
    }
  };

  const response = await axiosClient.patch(`/api/v1/products/${id}`, payload);
  return response.data;
}
```

### DELETE

```typescript
// ✅ CORRECTO
async function deleteProduct(id: number) {
  await axiosClient.delete(`/api/v1/products/${id}`);
  // No response body expected
}
```

---

## 3. Response Handling

### Single Resource Response

```typescript
{
  "jsonapi": { "version": "1.0" },
  "data": {
    "type": "products",
    "id": "1",
    "attributes": {
      "name": "Laptop Gaming",
      "sku": "LAP-001",
      "price": 1500.00,
      "cost": 900.00,
      "iva": true,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    },
    "relationships": {
      "category": {
        "data": { "type": "categories", "id": "2" }
      }
    }
  }
}
```

### Collection Response

```typescript
{
  "jsonapi": { "version": "1.0" },
  "data": [
    { "type": "products", "id": "1", "attributes": { ... } },
    { "type": "products", "id": "2", "attributes": { ... } }
  ],
  "meta": {
    "page": {
      "currentPage": 1,
      "from": 1,
      "lastPage": 5,
      "perPage": 15,
      "to": 15,
      "total": 75
    }
  },
  "links": {
    "first": "/api/v1/products?page[number]=1",
    "prev": null,
    "next": "/api/v1/products?page[number]=2",
    "last": "/api/v1/products?page[number]=5"
  }
}
```

### Response Transformer

```typescript
// src/lib/transformers/jsonApiTransformer.ts

/**
 * Transform JSON:API response to flat object
 */
export function transformJsonApiResource<T>(response: any): T {
  const { data, included = [] } = response;

  // Extract attributes
  const result: any = { ...data.attributes };
  result.id = parseInt(data.id);

  // Resolve relationships
  if (data.relationships) {
    Object.keys(data.relationships).forEach(key => {
      const relationship = data.relationships[key].data;

      if (Array.isArray(relationship)) {
        // hasMany relationship
        result[key] = relationship.map(r => {
          const includedItem = included.find(
            (item: any) => item.type === r.type && item.id === r.id
          );
          return includedItem ? { id: parseInt(includedItem.id), ...includedItem.attributes } : null;
        }).filter(Boolean);
      } else if (relationship) {
        // belongsTo relationship
        const includedItem = included.find(
          (item: any) => item.type === relationship.type && item.id === relationship.id
        );
        result[key] = includedItem ? { id: parseInt(includedItem.id), ...includedItem.attributes } : null;
      }
    });
  }

  return result as T;
}

/**
 * Transform JSON:API collection response
 */
export function transformJsonApiCollection<T>(response: any): T[] {
  const { data, included = [] } = response;

  return data.map((item: any) =>
    transformJsonApiResource({ data: item, included })
  );
}
```

---

## 4. Relationships

### Include in GET Request

```typescript
// ✅ CORRECTO - Include single relationship
const response = await axiosClient.get(
  '/api/v1/products/1?include=category'
);

// ✅ CORRECTO - Include multiple relationships
const response = await axiosClient.get(
  '/api/v1/products/1?include=category,brand,unit'
);

// ✅ CORRECTO - Include nested relationships
const response = await axiosClient.get(
  '/api/v1/sales-orders/1?include=customer,salesOrderItems.product'
);
```

### Set Relationship in CREATE/UPDATE

```typescript
// ✅ CORRECTO - Set belongsTo relationship
const payload = {
  data: {
    type: "sales-orders",
    attributes: {
      orderNumber: "SO-2025-001",
      orderDate: "2025-01-15",
      totalAmount: 1500.00
    },
    relationships: {
      contact: {                    // ⚠️ contact, NOT customer
        data: {
          type: "contacts",
          id: String(contactId)
        }
      }
    }
  }
};
```

### Update Only Relationship

```typescript
// ✅ CORRECTO - Update only relationship (no attributes)
const payload = {
  data: {
    type: "products",
    id: String(productId),
    relationships: {
      category: {
        data: { type: "categories", id: String(newCategoryId) }
      }
    }
  }
};

await axiosClient.patch(`/api/v1/products/${productId}`, payload);
```

---

## 5. Filtering & Sorting

### Filter by Field

```typescript
// ✅ CORRECTO - Filter by boolean
const customers = await axiosClient.get(
  '/api/v1/contacts?filter[isCustomer]=true'
);

// ✅ CORRECTO - Filter by foreign key
const addresses = await axiosClient.get(
  `/api/v1/contact-addresses?filter[contactId]=${contactId}`
);

// ✅ CORRECTO - Text search (partial match)
const products = await axiosClient.get(
  '/api/v1/products?filter[name]=laptop'
);

// ✅ CORRECTO - Multiple filters
const activeCustomers = await axiosClient.get(
  '/api/v1/contacts?filter[isCustomer]=true&filter[status]=active'
);
```

### Sorting

```typescript
// ✅ CORRECTO - Sort ascending
const products = await axiosClient.get(
  '/api/v1/products?sort=name'
);

// ✅ CORRECTO - Sort descending (prefix with -)
const products = await axiosClient.get(
  '/api/v1/products?sort=-price'
);

// ✅ CORRECTO - Multiple sort fields
const products = await axiosClient.get(
  '/api/v1/products?sort=-price,name'
);
```

### Combining Filters, Sorts, Includes

```typescript
// ✅ CORRECTO - Full query
const response = await axiosClient.get(
  '/api/v1/products' +
  '?filter[isActive]=true' +
  '&filter[categoryId]=2' +
  '&sort=-createdAt' +
  '&include=category,brand' +
  '&page[number]=1' +
  '&page[size]=25'
);
```

---

## 6. Pagination

### Standard Pagination

```typescript
// ✅ CORRECTO - Standard JSON:API pagination
const response = await axiosClient.get(
  '/api/v1/products?page[number]=2&page[size]=25'
);

const { data, meta, links } = response.data;

console.log(meta.page);
// {
//   currentPage: 2,
//   total: 100,
//   perPage: 25,
//   lastPage: 4
// }

console.log(links);
// {
//   first: "/api/v1/products?page[number]=1",
//   prev: "/api/v1/products?page[number]=1",
//   next: "/api/v1/products?page[number]=3",
//   last: "/api/v1/products?page[number]=4"
// }
```

### ⚠️ Pagination NOT Supported

```typescript
// ❌ NO SOPORTADO - Products pagination
// Backend no implementa paginación estándar para products
// Usar sin pagination o esperar fix del backend
const products = await axiosClient.get('/api/v1/products');
```

---

## 7. File Uploads

### Upload Document (multipart/form-data)

```typescript
// ✅ CORRECTO - Document upload
async function uploadContactDocument(
  contactId: number,
  file: File,
  documentType: string,
  notes?: string
) {
  const formData = new FormData();
  formData.append('contact_id', String(contactId));
  formData.append('document_type', documentType);  // rfc, ine, factura, etc.
  formData.append('file', file);
  if (notes) formData.append('notes', notes);

  const response = await axios.post(
    '/api/v1/contact-documents/upload',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        // ⚠️ NO set Content-Type - FormData handles it
      }
    }
  );

  return response.data;
}
```

### View/Preview Document

```typescript
// ✅ CORRECTO - View document (opens in browser)
async function viewDocument(documentId: number) {
  const response = await axiosClient.get(
    `/api/v1/contact-documents/${documentId}/view`,
    { responseType: 'blob' }
  );

  const blob = response.data;
  const url = URL.createObjectURL(blob);

  // Open in new tab
  window.open(url, '_blank');

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
```

### Download Document

```typescript
// ✅ CORRECTO - Download document
async function downloadDocument(documentId: number, filename: string) {
  const response = await axiosClient.get(
    `/api/v1/contact-documents/${documentId}/download`,
    { responseType: 'blob' }
  );

  const blob = response.data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

---

## 8. Error Handling

### Error Types

```typescript
interface JsonApiError {
  status: string;
  title: string;
  detail: string;
  source?: {
    pointer: string;  // e.g., "/data/attributes/name"
  };
}
```

### Handle Validation Errors (422)

```typescript
async function handleSubmit(formData: ProductFormData) {
  try {
    await createProduct(formData);
    toast.success('Product created successfully');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;

      if (status === 422) {
        // Validation errors
        const errors = error.response?.data?.errors || [];

        errors.forEach((err: JsonApiError) => {
          // Extract field name from pointer
          const field = err.source?.pointer?.split('/').pop();

          // Show field-specific error
          setFieldError(field || 'general', err.detail);
        });
      } else if (status === 401) {
        // Unauthenticated
        toast.error('Session expired. Please login again.');
        router.push('/auth/login');
      } else if (status === 403) {
        // Forbidden
        toast.error('You don\'t have permission to perform this action.');
      } else if (status === 404) {
        // Not Found
        toast.error('Resource not found.');
      } else {
        // Generic error
        toast.error('An error occurred. Please try again.');
      }
    }
  }
}
```

### Centralized Error Handler

```typescript
// src/lib/errorHandler.ts

export function parseJsonApiErrors(error: any): string[] {
  if (!axios.isAxiosError(error)) {
    return ['An unexpected error occurred'];
  }

  const errors = error.response?.data?.errors || [];

  if (errors.length === 0) {
    return [error.message || 'An error occurred'];
  }

  return errors.map((err: JsonApiError) => err.detail);
}

export function handleApiError(error: any) {
  const messages = parseJsonApiErrors(error);

  messages.forEach(message => {
    toast.error(message);
  });
}
```

---

## 9. Data Transformers

### Request Transformer (Frontend → Backend)

```typescript
// src/lib/transformers/requestTransformer.ts

export function transformProductToJsonApi(data: ProductFormData): any {
  return {
    data: {
      type: "products",
      attributes: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        iva: data.iva,
        isActive: data.isActive
      },
      relationships: {
        category: {
          data: data.categoryId ? {
            type: "categories",
            id: String(data.categoryId)
          } : null
        },
        brand: {
          data: data.brandId ? {
            type: "brands",
            id: String(data.brandId)
          } : null
        },
        unit: {
          data: data.unitId ? {
            type: "units",
            id: String(data.unitId)
          } : null
        }
      }
    }
  };
}
```

### Response Transformer (Backend → Frontend)

```typescript
// src/lib/transformers/responseTransformer.ts

export function transformProductFromJsonApi(response: any): Product {
  const { data, included = [] } = response;

  // Base attributes
  const product: Product = {
    id: parseInt(data.id),
    ...data.attributes
  };

  // Resolve category
  if (data.relationships?.category?.data) {
    const categoryId = data.relationships.category.data.id;
    const category = included.find(
      (item: any) => item.type === 'categories' && item.id === categoryId
    );
    if (category) {
      product.category = {
        id: parseInt(category.id),
        ...category.attributes
      };
    }
  }

  // Resolve brand
  if (data.relationships?.brand?.data) {
    const brandId = data.relationships.brand.data.id;
    const brand = included.find(
      (item: any) => item.type === 'brands' && item.id === brandId
    );
    if (brand) {
      product.brand = {
        id: parseInt(brand.id),
        ...brand.attributes
      };
    }
  }

  return product;
}
```

---

## 10. Best Practices

### 1. Always Use TypeScript Interfaces

```typescript
// src/modules/products/types/product.ts

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: number;
  cost: number;
  iva: boolean;
  isActive: boolean;
  categoryId: number | null;
  brandId: number | null;
  unitId: number | null;
  category?: Category;
  brand?: Brand;
  unit?: Unit;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  description?: string;
  price: number | string;  // String for form input
  cost: number | string;
  iva: boolean;
  isActive: boolean;
  categoryId: number | null;
  brandId: number | null;
  unitId: number | null;
}
```

### 2. Use SWR for Data Fetching

```typescript
// src/modules/products/hooks/useProducts.ts

import useSWR from 'swr';
import { transformJsonApiCollection } from '@/lib/transformers';

export function useProducts(filters?: ProductFilters) {
  const params = new URLSearchParams();
  if (filters?.isActive !== undefined) {
    params.append('filter[isActive]', String(filters.isActive));
  }
  if (filters?.categoryId) {
    params.append('filter[categoryId]', String(filters.categoryId));
  }
  params.append('include', 'category,brand,unit');

  const { data, error, mutate } = useSWR(
    `/api/v1/products?${params.toString()}`,
    async (url) => {
      const response = await axiosClient.get(url);
      return transformJsonApiCollection<Product>(response.data);
    }
  );

  return {
    products: data,
    isLoading: !data && !error,
    isError: error,
    mutate
  };
}
```

### 3. Always parseInt() IDs Before Sending

```typescript
// ✅ CORRECTO
const payload = {
  data: {
    type: "contact-addresses",
    attributes: {
      contactId: parseInt(contactId),     // ✅ Parse to integer
      addressLine1: "123 Main St",
      city: "New York"
    }
  }
};

// ❌ INCORRECTO
const payload = {
  data: {
    type: "contact-addresses",
    attributes: {
      contactId: contactId,               // ❌ Puede ser string
      addressLine1: "123 Main St"
    }
  }
};
```

### 4. Use Debounce for Search Inputs

```typescript
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

export function ProductsFiltersSimple() {
  const [search, setSearch] = useState('');
  const { setFilters } = useProductsFilters();

  // Debounce 300ms
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => {
      setFilters({ search: value });
    }, 300),
    [setFilters]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);              // Update local state immediately
    debouncedSetSearch(value);     // Update filters with delay
  };

  return (
    <input
      type="text"
      value={search}
      onChange={handleSearchChange}
      placeholder="Search products..."
    />
  );
}
```

### 5. Handle Loading States

```typescript
export function ProductsTable() {
  const { products, isLoading, isError } = useProducts();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <ErrorMessage message="Failed to load products" />;
  }

  if (!products || products.length === 0) {
    return <EmptyState message="No products found" />;
  }

  return (
    <table>
      {products.map(product => (
        <ProductRow key={product.id} product={product} />
      ))}
    </table>
  );
}
```

---

## 11. Common Pitfalls

### ❌ PITFALL 1: Using customer_id/supplier_id

```typescript
// ❌ INCORRECTO
const payload = {
  data: {
    type: "sales-orders",
    attributes: {
      customerId: 27  // ❌ NO EXISTE
    }
  }
};

// ✅ CORRECTO
const payload = {
  data: {
    type: "sales-orders",
    attributes: {
      contactId: 27   // ✅ Usa contact_id
    }
  }
};
```

### ❌ PITFALL 2: Using unit_price on Products

```typescript
// ❌ INCORRECTO
const product = await getProduct(1);
console.log(product.attributes.unitPrice);  // ❌ NO EXISTE

// ✅ CORRECTO
const product = await getProduct(1);
console.log(product.attributes.price);      // ✅ Precio de venta
console.log(product.attributes.cost);       // ✅ Costo
```

### ❌ PITFALL 3: IDs as Numbers in JSON:API

```typescript
// ❌ INCORRECTO
const payload = {
  data: {
    type: "products",
    relationships: {
      category: {
        data: { type: "categories", id: 2 }  // ❌ Number
      }
    }
  }
};

// ✅ CORRECTO
const payload = {
  data: {
    type: "products",
    relationships: {
      category: {
        data: { type: "categories", id: "2" }  // ✅ String
      }
    }
  }
};
```

### ❌ PITFALL 4: Forgetting Content-Type Header

```typescript
// ❌ INCORRECTO
const response = await axios.post(
  '/api/v1/products',
  payload
  // Missing headers
);

// ✅ CORRECTO
const response = await axios.post(
  '/api/v1/products',
  payload,
  {
    headers: {
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json'
    }
  }
);

// ✅ MEJOR - Use axiosClient with defaults
const response = await axiosClient.post('/api/v1/products', payload);
```

### ❌ PITFALL 5: Not Handling 401 Errors

```typescript
// ❌ INCORRECTO - User stuck with invalid token
try {
  const products = await fetchProducts();
} catch (error) {
  console.error(error);  // Only logs, doesn't handle
}

// ✅ CORRECTO - Redirect to login on 401
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('api_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 📚 Additional Resources

### Backend Documentation
- [FRONTEND_INTEGRATION_GUIDE.md](/home/jadwer/dev/AtomoSoluciones/base/api-base/docs/FRONTEND_INTEGRATION_GUIDE.md)
- [DATABASE_SCHEMA_REFERENCE.md](/home/jadwer/dev/AtomoSoluciones/base/api-base/docs/DATABASE_SCHEMA_REFERENCE.md)
- [json-api-relationships.md](/home/jadwer/dev/AtomoSoluciones/base/api-base/docs/api/json-api-relationships.md)
- [CHANGELOG_API.md](/home/jadwer/dev/AtomoSoluciones/base/api-base/docs/api-documentation/backend-specs/CHANGELOG_API.md)

### Frontend Documentation
- [CLAUDE.md](../CLAUDE.md) - Development guidelines
- [BACKEND_ANALYSIS_SUMMARY.md](./BACKEND_ANALYSIS_SUMMARY.md) - Backend understanding

### External Resources
- [JSON:API Specification](https://jsonapi.org/format/)
- [Laravel Sanctum](https://laravel.com/docs/12.x/sanctum)
- [SWR Documentation](https://swr.vercel.app/)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

**Última Actualización:** 2025-10-31
**Versión:** 1.0
**Estado:** ✅ Vigente

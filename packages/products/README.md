# @lwm/products

Empty scaffold during Fase 0 of WordPress-style refactor. Real implementation extracted in Fase 2/3.

## Campos fiscales SAT

El producto tiene 4 atributos fiscales usados para timbrado CFDI y para clasificacion de manufactura/inventario:

| Campo | Tipo | Semantica |
|---|---|---|
| `satClaveProdServ` | `string \| null` | Clave del catalogo SAT `c_ClaveProdServ` (clave de producto/servicio del CFDI). |
| `satClaveUnidad` | `string \| null` | Clave del catalogo SAT `c_ClaveUnidad` (unidad de medida del CFDI). |
| `productType` | `'finished' \| 'raw_material' \| 'both' \| null` | Uso del producto en manufactura/inventario. `null`/`undefined` = sin definir. |
| `taxRate` | `number \| null` | Tasa de IVA en porcentaje (16, 8, 0, o un valor personalizado). **`null` significa Exento de IVA**, que es distinto de tasa `0` (0% es una tasa válida sujeta a IVA, Exento no causa IVA). |

Este contrato viaja igual en el JSON:API del backend (atributos camelCase) y en los tipos de este paquete (`Product`, `CreateProductData`, `UpdateProductData` en `src/types/product.ts`). El transformer (`src/utils/transformers.ts`) coerciona `undefined` del backend a `null` para `taxRate`/`satClave*` de forma consistente.

### SatKeyCombobox

`SatKeyCombobox` (`src/components/SatKeyCombobox.tsx`) es el componente reutilizable para capturar `satClaveProdServ` y `satClaveUnidad` en el formulario de producto. Requisito de negocio: el operador debe poder **capturar la clave a mano** sin depender de que la busqueda encuentre la clave en el catalogo (los catalogos SAT tienen miles de entradas). Por eso:

- Mientras el usuario escribe 2+ caracteres, se dispara una busqueda con debounce de 300ms (`useSatCatalogSearch`) contra `GET /api/v1/sat/clave-prod-serv` o `GET /api/v1/sat/clave-unidad`, y se muestra un dropdown con `clave - descripcion`.
- Si el usuario selecciona una opcion del dropdown, se guarda esa clave y se muestra el resumen `clave - descripcion` con un boton "x" para limpiar.
- Si el usuario **no** selecciona nada del dropdown (porque no aparecio su clave, o porque prefiere teclearla directo), el texto libre se conserva tal cual como el valor final. No se valida contra el catalogo ni se bloquea el guardado.
- El boton "x" limpia el campo (`null`) tanto en modo resumen como en modo texto libre.

### Select de IVA (ProductForm)

El select "IVA" en `ProductForm` ofrece `16%`, `8%`, `0%` y `Exento` (mapeado a `null`). Si el producto ya tiene una `taxRate` que no coincide con ninguna de esas opciones estandar (p. ej. una tasa fronteriza regional), el select agrega dinamicamente una opcion `Personalizado: X%` para no perder ese valor al editar.

### Consumo en cotizaciones (`@lwm/sales`)

`QuoteItemsTable` usa `product.taxRate ?? (product.iva ? 16 : 0)` como default de IVA al agregar un producto a una cotizacion: prioriza el dato fiscal real (`taxRate`) y solo cae al flag legado `iva` (booleano) cuando el backend no trae `taxRate` para ese producto.

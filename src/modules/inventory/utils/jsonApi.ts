/**
 * JSON:API RELATIONSHIP PARSER
 * Utility para procesar relaciones incluidas en respuestas JSON:API
 * Basado en el patrón exitoso del módulo Products
 */

// JSON:API type definitions
export interface JsonApiResource {
  id: string
  type: string
  attributes?: Record<string, unknown>
  relationships?: Record<string, JsonApiRelationship>
}

export interface JsonApiRelationship {
  data?: JsonApiResourceIdentifier | JsonApiResourceIdentifier[]
  links?: Record<string, string>
  meta?: Record<string, unknown>
}

export interface JsonApiResourceIdentifier {
  id: string
  type: string
}

export interface JsonApiResponse<T = unknown> {
  data: T
  included?: JsonApiResource[]
  meta?: Record<string, unknown>
  links?: Record<string, string>
}

export interface JsonApiErrorObject {
  id?: string
  status?: string
  code?: string
  title?: string
  detail?: string
  source?: {
    pointer?: string
    parameter?: string
  }
  meta?: Record<string, unknown>
}

export interface JsonApiErrorResponse {
  errors: JsonApiErrorObject[]
  meta?: Record<string, unknown>
}

/**
 * Parsea relaciones incluidas y las agrega a los objetos principales
 */
export function parseJsonApiIncludes<T>(data: JsonApiResource | JsonApiResource[] | T, included: JsonApiResource[] = []): T {
  if (!data) return data

  // Si es un array, procesamos cada elemento
  if (Array.isArray(data)) {
    return data.map(item => parseJsonApiIncludes(item, included)) as unknown as T
  }

  // Si no es un objeto JSON:API, lo devolvemos tal como está
  if (typeof data !== 'object' || !('type' in data) || !('id' in data)) {
    return data as T
  }

  const jsonApiData = data as JsonApiResource

  // Crear el objeto resultado con los attributes flattened
  const result: Record<string, unknown> = {
    id: jsonApiData.id,
    type: jsonApiData.type,
    ...jsonApiData.attributes,
    // También mantener la estructura original para compatibilidad
    attributes: jsonApiData.attributes
  }

  // Procesar relationships si existen
  if (jsonApiData.relationships && included?.length > 0) {
    Object.keys(jsonApiData.relationships).forEach(relationKey => {
      const relationship = jsonApiData.relationships![relationKey]
      
      if (relationship.data) {
        if (Array.isArray(relationship.data)) {
          // Relación uno-a-muchos
          result[relationKey] = relationship.data.map((relData: JsonApiResourceIdentifier) => {
            const includedItem = included.find(inc => 
              inc.type === relData.type && inc.id === relData.id
            )
            return includedItem ? parseJsonApiIncludes(includedItem, included) : relData
          })
        } else {
          // Relación uno-a-uno
          const relationshipData = relationship.data as JsonApiResourceIdentifier
          const includedItem = included.find(inc => 
            inc.type === relationshipData.type && inc.id === relationshipData.id
          )
          result[relationKey] = includedItem ? parseJsonApiIncludes(includedItem, included) : relationshipData
        }
      }
    })
  }

  return result as T
}

/**
 * Procesa una respuesta completa JSON:API
 */
export function processJsonApiResponse<T>(response: JsonApiResponse): JsonApiResponse<T> {
  return {
    ...response,
    data: parseJsonApiIncludes<T>(response.data, response.included)
  }
}

/**
 * Helper para obtener un objeto relacionado específico
 */
export function getRelatedObject<T = unknown>(
  data: JsonApiResource,
  relationshipKey: string,
  included: JsonApiResource[] = []
): T | null {
  if (!data?.relationships?.[relationshipKey]?.data || !included?.length) {
    return null
  }

  const relationshipData = data.relationships[relationshipKey].data
  
  // Si es array, devolvemos el primer elemento (para simplificar)
  const relData = Array.isArray(relationshipData) ? relationshipData[0] : relationshipData
  
  if (!relData) return null

  const includedItem = included.find(inc => 
    inc.type === relData.type && inc.id === relData.id
  )

  return includedItem ? parseJsonApiIncludes<T>(includedItem, included) : null
}

/**
 * Helper para obtener múltiples objetos relacionados
 */
export function getRelatedObjects<T = unknown>(
  data: JsonApiResource,
  relationshipKey: string,
  included: JsonApiResource[] = []
): T[] {
  if (!data?.relationships?.[relationshipKey]?.data || !included?.length) {
    return []
  }

  const relationshipData = data.relationships[relationshipKey].data
  
  if (!Array.isArray(relationshipData)) {
    const singleItem = getRelatedObject<T>(data, relationshipKey, included)
    return singleItem ? [singleItem] : []
  }

  return relationshipData.map((relData: JsonApiResourceIdentifier) => {
    const includedItem = included.find(inc => 
      inc.type === relData.type && inc.id === relData.id
    )
    return includedItem ? parseJsonApiIncludes<T>(includedItem, included) : relData
  }).filter(Boolean) as T[]
}
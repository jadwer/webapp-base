/**
 * JSON:API RELATIONSHIP PARSER
 * Utility para procesar relaciones incluidas en respuestas JSON:API
 * Basado en el patrón exitoso del módulo Products
 */

/**
 * Parsea relaciones incluidas y las agrega a los objetos principales
 */
export function parseJsonApiIncludes<T>(data: any, included: any[] = []): T {
  if (!data) return data

  // Si es un array, procesamos cada elemento
  if (Array.isArray(data)) {
    return data.map(item => parseJsonApiIncludes(item, included)) as unknown as T
  }

  // Si no es un objeto JSON:API, lo devolvemos tal como está
  if (!data.type || !data.id) {
    return data as T
  }


  // Crear el objeto resultado con los attributes flattened
  const result: any = {
    id: data.id,
    type: data.type,
    ...data.attributes,
    // También mantener la estructura original para compatibilidad
    attributes: data.attributes
  }

  // Procesar relationships si existen
  if (data.relationships && included?.length > 0) {
    Object.keys(data.relationships).forEach(relationKey => {
      const relationship = data.relationships[relationKey]
      
      if (relationship.data) {
        if (Array.isArray(relationship.data)) {
          // Relación uno-a-muchos
          result[relationKey] = relationship.data.map((relData: any) => {
            const includedItem = included.find(inc => 
              inc.type === relData.type && inc.id === relData.id
            )
            return includedItem ? parseJsonApiIncludes(includedItem, included) : relData
          })
        } else {
          // Relación uno-a-uno
          const includedItem = included.find(inc => 
            inc.type === relationship.data.type && inc.id === relationship.data.id
          )
          result[relationKey] = includedItem ? parseJsonApiIncludes(includedItem, included) : relationship.data
        }
      }
    })
  }

  return result as T
}

/**
 * Procesa una respuesta completa JSON:API
 */
export function processJsonApiResponse<T>(response: {
  data: any
  included?: any[]
  meta?: any
  links?: any
}): {
  data: T
  included?: any[]
  meta?: any
  links?: any
} {
  return {
    ...response,
    data: parseJsonApiIncludes<T>(response.data, response.included)
  }
}

/**
 * Helper para obtener un objeto relacionado específico
 */
export function getRelatedObject(
  data: any,
  relationshipKey: string,
  included: any[] = []
): any | null {
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

  return includedItem ? parseJsonApiIncludes(includedItem, included) : null
}

/**
 * Helper para obtener múltiples objetos relacionados
 */
export function getRelatedObjects(
  data: any,
  relationshipKey: string,
  included: any[] = []
): any[] {
  if (!data?.relationships?.[relationshipKey]?.data || !included?.length) {
    return []
  }

  const relationshipData = data.relationships[relationshipKey].data
  
  if (!Array.isArray(relationshipData)) {
    const singleItem = getRelatedObject(data, relationshipKey, included)
    return singleItem ? [singleItem] : []
  }

  return relationshipData.map((relData: any) => {
    const includedItem = included.find(inc => 
      inc.type === relData.type && inc.id === relData.id
    )
    return includedItem ? parseJsonApiIncludes(includedItem, included) : relData
  }).filter(Boolean)
}
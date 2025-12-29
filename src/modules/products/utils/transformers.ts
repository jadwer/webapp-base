import { Product, Unit, Category, Brand } from '../types'

export interface JsonApiResource {
  id: string
  type: string
  attributes: Record<string, unknown>
  relationships?: Record<string, { data?: { type: string; id: string } }>
}


export function transformJsonApiUnit(resource: JsonApiResource): Unit {
  // console.log('🔄 Transforming Unit:', resource)
  return {
    id: resource.id,
    unitType: (resource.attributes.unitType || '') as string,
    code: (resource.attributes.code || '') as string,
    name: (resource.attributes.name || '') as string,
    description: resource.attributes.description as string | undefined,
    createdAt: (resource.attributes.createdAt || '') as string,
    updatedAt: (resource.attributes.updatedAt || '') as string,
    productsCount: resource.attributes.productsCount as number | undefined
  }
}

export function transformJsonApiCategory(resource: JsonApiResource): Category {
  // console.log('🔄 Transforming Category:', resource)
  return {
    id: resource.id,
    name: (resource.attributes.name || '') as string,
    description: resource.attributes.description as string | undefined,
    slug: (resource.attributes.slug || '') as string,
    createdAt: (resource.attributes.createdAt || '') as string,
    updatedAt: (resource.attributes.updatedAt || '') as string,
    productsCount: resource.attributes.productsCount as number | undefined
  }
}

export function transformJsonApiBrand(resource: JsonApiResource): Brand {
  // console.log('🔄 Transforming Brand:', resource)
  return {
    id: resource.id,
    name: (resource.attributes.name || '') as string,
    description: resource.attributes.description as string | undefined,
    slug: (resource.attributes.slug || '') as string,
    createdAt: (resource.attributes.createdAt || '') as string,
    updatedAt: (resource.attributes.updatedAt || '') as string,
    productsCount: resource.attributes.productsCount as number | undefined
  }
}

export function transformJsonApiProduct(
  resource: JsonApiResource, 
  included: JsonApiResource[] = []
): Product {
  // console.log('🔄 Transforming Product:', resource)
  
  // Parse included resources
  const includedMap: Record<string, JsonApiResource> = {}
  included.forEach(item => {
    includedMap[`${item.type}:${item.id}`] = item
  })

  // Get relationships
  let unit: Unit | undefined
  let category: Category | undefined
  let brand: Brand | undefined

  if (resource.relationships) {
    const unitRel = resource.relationships.unit?.data
    const categoryRel = resource.relationships.category?.data
    const brandRel = resource.relationships.brand?.data

    if (unitRel && includedMap[`${unitRel.type}:${unitRel.id}`]) {
      unit = transformJsonApiUnit(includedMap[`${unitRel.type}:${unitRel.id}`])
    }
    if (categoryRel && includedMap[`${categoryRel.type}:${categoryRel.id}`]) {
      category = transformJsonApiCategory(includedMap[`${categoryRel.type}:${categoryRel.id}`])
    }
    if (brandRel && includedMap[`${brandRel.type}:${brandRel.id}`]) {
      brand = transformJsonApiBrand(includedMap[`${brandRel.type}:${brandRel.id}`])
    }
  }

  return {
    id: resource.id,
    name: (resource.attributes.name || '') as string,
    sku: resource.attributes.sku as string | undefined,
    description: resource.attributes.description as string | undefined,
    fullDescription: resource.attributes.fullDescription as string | undefined,
    price: resource.attributes.price as number | undefined,
    cost: resource.attributes.cost as number | undefined,
    iva: Boolean(resource.attributes.iva),
    isActive: Boolean(resource.attributes.isActive ?? true),
    imgPath: resource.attributes.imgPath as string | undefined,
    datasheetPath: resource.attributes.datasheetPath as string | undefined,
    unitId: (resource.relationships?.unit?.data?.id || '') as string,
    categoryId: (resource.relationships?.category?.data?.id || '') as string,
    brandId: (resource.relationships?.brand?.data?.id || '') as string,
    createdAt: (resource.attributes.createdAt || '') as string,
    updatedAt: (resource.attributes.updatedAt || '') as string,
    unit,
    category,
    brand
  }
}
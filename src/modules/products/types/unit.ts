export interface Unit {
  id: string
  unitType: string
  code: string
  name: string
  createdAt: string
  updatedAt: string
  productsCount?: number // TODO: Backend needs to provide this count
}

export interface CreateUnitData {
  unitType: string
  code: string
  name: string
}

export type UpdateUnitData = Partial<CreateUnitData>

export interface UnitSortOptions {
  field: 'name' | 'code' | 'unitType' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}
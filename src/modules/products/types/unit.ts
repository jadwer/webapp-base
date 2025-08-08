export interface Unit {
  id: string
  unitType: string
  code: string
  name: string
  createdAt: string
  updatedAt: string
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
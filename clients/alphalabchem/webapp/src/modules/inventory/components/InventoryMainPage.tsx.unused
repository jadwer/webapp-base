/**
 * INVENTORY MAIN PAGE
 * Página principal del módulo inventory-simple con navegación entre secciones
 */

'use client'

import React, { useState } from 'react'
import { InventoryNavigation } from './InventoryNavigation'
import { WarehousesAdminPage } from './WarehousesAdminPage'
import { LocationsSimplePage } from './LocationsSimplePage'
import { StockSimplePage } from './StockSimplePage'
import { MovementsSimplePage } from './MovementsSimplePage'

type Section = 'warehouses' | 'locations' | 'stock' | 'movements'

export const InventoryMainPage = () => {
  const [activeSection, setActiveSection] = useState<Section>('warehouses')

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'warehouses':
        return <WarehousesAdminPage />
      case 'locations':
        return <LocationsSimplePage />
      case 'stock':
        return <StockSimplePage />
      case 'movements':
        return <MovementsSimplePage />
      default:
        return <WarehousesAdminPage />
    }
  }

  return (
    <div className="container-fluid py-4">
      {/* Page Title */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Gestión de Inventario</h1>
          <p className="text-muted mb-0">
            Sistema simple de inventario - {getSectionTitle(activeSection)}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <InventoryNavigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />

      {/* Active Section Content */}
      {renderActiveSection()}
    </div>
  )
}

function getSectionTitle(section: Section): string {
  switch (section) {
    case 'warehouses': return 'Almacenes'
    case 'locations': return 'Ubicaciones'
    case 'stock': return 'Inventario'
    case 'movements': return 'Movimientos'
    default: return 'Almacenes'
  }
}
/**
 * INVENTORY NAVIGATION
 * Navegación simple entre las secciones del módulo inventory-simple
 */

'use client'

import React from 'react'

interface InventoryNavigationProps {
  activeSection: 'warehouses' | 'locations' | 'stock' | 'movements'
  onSectionChange: (section: 'warehouses' | 'locations' | 'stock' | 'movements') => void
}

export const InventoryNavigation = ({ activeSection, onSectionChange }: InventoryNavigationProps) => {
  const sections = [
    { key: 'warehouses' as const, label: 'Almacenes', icon: 'bi-building' },
    { key: 'locations' as const, label: 'Ubicaciones', icon: 'bi-geo-alt' },
    { key: 'stock' as const, label: 'Inventario', icon: 'bi-boxes' },
    { key: 'movements' as const, label: 'Movimientos', icon: 'bi-arrow-left-right' }
  ]

  return (
    <div className="card mb-4">
      <div className="card-body py-2">
        <nav className="nav nav-pills nav-fill">
          {sections.map(section => (
            <button
              key={section.key}
              type="button"
              className={`nav-link ${activeSection === section.key ? 'active' : ''}`}
              onClick={() => onSectionChange(section.key)}
            >
              <i className={`bi ${section.icon} me-2`} />
              {section.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
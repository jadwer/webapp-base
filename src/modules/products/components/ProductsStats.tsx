'use client'

import React from 'react'
import { Card } from '@/ui/components/base'
import type { Product } from '../types'

interface ProductsStatsProps {
  products: Product[]
  totalProducts: number
  currentPage?: number
  perPage?: number
  displayedItems?: number
  customStats?: React.ReactNode
  className?: string
  showDetailedStats?: boolean
}

interface StatCardProps {
  value: number
  label: string
  color: 'primary' | 'success' | 'warning' | 'info' | 'danger'
  icon?: string
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color, icon }) => (
  <div className="col-md-3">
    <Card className="text-center">
      <div className="card-body">
        <h3 className={`display-6 text-${color}`}>
          {icon && <i className={`bi ${icon} me-2`} />}
          {value}
        </h3>
        <p className="text-muted mb-0">{label}</p>
      </div>
    </Card>
  </div>
)

export const ProductsStats: React.FC<ProductsStatsProps> = ({
  products,
  totalProducts,
  currentPage,
  perPage,
  displayedItems,
  customStats,
  className = '',
  showDetailedStats = true
}) => {
  // Calcular estadísticas básicas
  const productsWithPrice = products.filter(p => p.price && p.price > 0).length
  const productsWithSku = products.filter(p => p.sku).length
  const productsWithImage = products.filter(p => p.imgPath).length

  // Estadísticas adicionales si showDetailedStats está activo
  const productsWithCategory = products.filter(p => p.category).length
  const productsWithBrand = products.filter(p => p.brand).length

  return (
    <div className={`row g-3 mb-4 ${className}`}>
      {/* Estadística principal */}
      <StatCard 
        value={totalProducts} 
        label="Total Productos" 
        color="primary"
        icon="bi-box-seam"
      />
      
      {/* Estadísticas básicas */}
      <StatCard 
        value={productsWithPrice} 
        label="Con Precio" 
        color="success"
        icon="bi-currency-dollar"
      />
      
      <StatCard 
        value={productsWithSku} 
        label="Con SKU" 
        color="warning"
        icon="bi-upc-scan"
      />
      
      <StatCard 
        value={productsWithImage} 
        label="Con Imagen" 
        color="info"
        icon="bi-image"
      />

      {/* Estadísticas detalladas si está habilitado */}
      {showDetailedStats && (
        <>
          <StatCard 
            value={productsWithCategory} 
            label="Con Categoría" 
            color="success"
            icon="bi-tags"
          />
          
          <StatCard 
            value={productsWithBrand} 
            label="Con Marca" 
            color="info"
            icon="bi-award"
          />
        </>
      )}

      {/* Estadísticas personalizadas */}
      {customStats && (
        <div className="col-md-12">
          {customStats}
        </div>
      )}
      
      {/* Información de paginación si está disponible */}
      {currentPage && perPage && displayedItems && (
        <div className="col-12">
          <div className="alert alert-light mb-0">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1" />
              Mostrando {displayedItems} productos de {totalProducts} en total
              {currentPage > 1 && ` (Página ${currentPage})`}
            </small>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsStats
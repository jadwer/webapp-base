/**
 * 📦 CREATE WAREHOUSE PAGE - INVENTORY MODULE
 * Página para crear nuevo almacén
 */

import { WarehouseForm } from '@/modules/inventory'

export default function CreateWarehousePage() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">Crear Nuevo Almacén</h1>
              <p className="text-muted mb-0">
                Registra un nuevo almacén en el sistema de inventario
              </p>
            </div>
          </div>
          
          {/* Form */}
          <div className="row justify-content-center">
            <div className="col-xl-10">
              <WarehouseForm 
                showCancelButton={true}
                autoRedirect={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Crear Almacén - Sistema de Inventario',
  description: 'Crear nuevo almacén con validación en tiempo real y business rules',
}
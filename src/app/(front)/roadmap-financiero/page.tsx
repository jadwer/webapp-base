'use client'

import React from 'react'

export default function RoadmapFinancieroPage() {
  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header Hero */}
      <div className="bg-gradient-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">
                <i className="bi bi-roadmap me-3"></i>
                Roadmap Financiero-Contable
              </h1>
              <p className="lead mb-0">
                Análisis del estado actual y planificación técnica para la implementación 
                de reglas de negocio empresariales en los módulos Finance y Accounting
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="bg-white bg-opacity-10 rounded p-3">
                <div className="small text-white-50">Versión</div>
                <div className="h4 mb-1">1.0</div>
                <div className="small">Planificación Técnica</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {/* Resumen Ejecutivo */}
        <section className="mb-5">
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h2 className="h4 mb-0">
                    <i className="bi bi-clipboard-data me-2"></i>
                    Resumen Ejecutivo
                  </h2>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-lg-8">
                      <h5 className="text-primary mb-3">Situación Actual</h5>
                      <p className="mb-3">
                        El proyecto cuenta con <strong>APIs completamente funcionales</strong> para 
                        Finance (11 entidades) y Accounting (6 entidades) con estructura JSON:API 
                        completa. Todas las entidades están implementadas en el backend con CRUD 
                        completo, relaciones, filtros y paginación.
                      </p>
                      
                      <h5 className="text-success mb-3">Objetivos para Septiembre 12</h5>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          Completar interfaces frontend para todas las entidades existentes
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          Implementar validaciones de negocio en el frontend
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          Crear dashboards y reportes ejecutivos
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          Integrar funcionalidades de conciliación bancaria
                        </li>
                      </ul>
                    </div>
                    <div className="col-lg-4">
                      <div className="bg-light rounded p-3">
                        <h6 className="fw-bold mb-3">Impacto Esperado</h6>
                        <div className="mb-3">
                          <div className="small text-muted">Funcionalidad</div>
                          <div className="fw-bold text-primary">Empresarial Completa</div>
                          <div className="small">AP/AR/GL</div>
                        </div>
                        <div className="mb-3">
                          <div className="small text-muted">Trazabilidad</div>
                          <div className="fw-bold text-info">100% Auditable</div>
                          <div className="small">Todas las transacciones</div>
                        </div>
                        <div className="mb-3">
                          <div className="small text-muted">Automatización</div>
                          <div className="fw-bold text-success">Procesos Contables</div>
                          <div className="small">Sin intervención manual</div>
                        </div>
                        <div>
                          <div className="small text-muted">Cumplimiento</div>
                          <div className="fw-bold text-warning">Estándares MX</div>
                          <div className="small">Mejores prácticas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Estado Actual */}
        <section className="mb-5">
          <h2 className="h3 mb-4">
            <i className="bi bi-clipboard-check me-2 text-success"></i>
            Análisis del Estado Actual
          </h2>
          
          <div className="row mb-4">
            {/* Fortalezas */}
            <div className="col-lg-6">
              <div className="card h-100 border-success">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-database-check me-2"></i>
                    Backend Completamente Implementado
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <h6 className="text-success">Módulo Financiero - Completamente Programado</h6>
                    <ul className="list-unstyled small">
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Cuentas por Pagar</strong> - Facturas de proveedores ya en la base de datos</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Cuentas por Cobrar</strong> - Facturas de clientes ya programadas</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Pagos a Proveedores</strong> - Sistema completo en base de datos</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Cobros de Clientes</strong> - Módulo funcional programado</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Tesorería Bancaria</strong> - Cuentas y estados de cuenta listos</li>
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h6 className="text-success">Módulo Contable - Ya en Base de Datos</h6>
                    <ul className="list-unstyled small">
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Catálogo de Cuentas</strong> - Plan contable jerárquico programado</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Asientos Contables</strong> - Sistema de pólizas completo</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Ejercicios Fiscales</strong> - Periodos contables configurables</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Tipos de Cambio</strong> - Multi-moneda ya implementado</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h6 className="text-success">Capacidades del Sistema Programado</h6>
                    <ul className="list-unstyled small">
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Operaciones Completas</strong> - Crear, consultar, modificar y eliminar registros</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Relaciones Configuradas</strong> - Conexiones entre facturas, pagos y contactos</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Búsquedas Avanzadas</strong> - Filtros, ordenamiento y paginación</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Estándares Modernos</strong> - API REST empresarial implementada</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Seguridad Integrada</strong> - Control de acceso y permisos</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h6 className="text-success">Reportes Ejecutivos Programados</h6>
                    <ul className="list-unstyled small">
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Balance General</strong> - Estado financiero en tiempo real</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Estado de Resultados</strong> - Utilidades y pérdidas automático</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Balanza de Comprobación</strong> - Verificación contable</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Libro Diario y Mayor</strong> - Reportes contables completos</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Reportes de Ventas y Compras</strong> - Análisis de negocio</li>
                    </ul>
                  </div>

                  <div>
                    <h6 className="text-success">Integraciones ya Funcionando</h6>
                    <ul className="list-unstyled small">
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Directorio de Contactos</strong> - Clientes y proveedores integrados</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Manejo Multi-Moneda</strong> - Pesos, dólares y otras divisas</li>
                      <li><i className="bi bi-check text-success me-1"></i> <strong>Información Adicional</strong> - Campos personalizables ya programados</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Pendientes Frontend */}
            <div className="col-lg-6">
              <div className="card h-100 border-warning">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="bi bi-laptop me-2"></i>
                    Desarrollo Frontend Pendiente
                  </h5>
                </div>
                <div className="card-body">
                  <div className="mb-4">
                    <h6 className="text-warning">Interfaces por Completar</h6>
                    <ul className="list-unstyled small">
                      <li><i className="bi bi-circle text-warning me-1"></i> <strong>Estados de Cuenta Bancarios</strong> - Importación y visualización de movimientos</li>
                      <li><i className="bi bi-circle text-warning me-1"></i> <strong>Captura de Pólizas Contables</strong> - Gestión de asientos contables</li>
                      <li><i className="bi bi-circle text-warning me-1"></i> <strong>Tipos de Cambio</strong> - Configuración de divisas (USD, EUR)</li>
                      <li><i className="bi bi-circle text-warning me-1"></i> <strong>Ejercicios Fiscales</strong> - Administración de periodos contables</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h6 className="text-warning">Reportes y Dashboards</h6>
                    <ul className="list-unstyled small">
                      <li><i className="bi bi-circle text-warning me-1"></i> Dashboard ejecutivo financiero</li>
                      <li><i className="bi bi-circle text-warning me-1"></i> Estados de cuenta por pagar/cobrar</li>
                      <li><i className="bi bi-circle text-warning me-1"></i> Flujo de efectivo</li>
                      <li><i className="bi bi-circle text-warning me-1"></i> Balance de comprobación</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h6 className="text-warning">Validaciones de Negocio</h6>
                    <ul className="list-unstyled small">
                      <li><i className="bi bi-circle text-warning me-1"></i> Validaciones de formularios avanzadas</li>
                      <li><i className="bi bi-circle text-warning me-1"></i> Manejo de estados documentales</li>
                      <li><i className="bi bi-circle text-warning me-1"></i> Controles de conciliación bancaria</li>
                    </ul>
                  </div>

                  <div>
                    <h6 className="text-warning">Funcionalidades Especiales</h6>
                    <div className="bg-light rounded p-2 small">
                      <strong>POR DESARROLLAR:</strong><br/>
                      Conciliación automática bancaria<br/>
                      Aplicación de pagos a facturas<br/>
                      Workflows de aprobación<br/>
                      Exportación a Excel/PDF
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap de Implementación */}
        <section className="mb-5">
          <h2 className="h3 mb-4">
            <i className="bi bi-map me-2 text-primary"></i>
            Roadmap de Implementación
          </h2>
          
          {/* Cronograma General */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Cronograma General</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <i className="bi bi-calendar-check display-6 text-primary"></i>
                    <div className="h4 mt-2">Sep 12</div>
                    <div className="small text-muted">Fecha de Entrega</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <i className="bi bi-layers display-6 text-info"></i>
                    <div className="h4 mt-2">2 Fases</div>
                    <div className="small text-muted">Frontend + Reportes</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <i className="bi bi-database-check display-6 text-success"></i>
                    <div className="h4 mt-2">24 APIs</div>
                    <div className="small text-muted">Módulos + Reportes</div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="border rounded p-3">
                    <i className="bi bi-laptop display-6 text-warning"></i>
                    <div className="h4 mt-2">Pantallas</div>
                    <div className="small text-muted">Solo Interfaces</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fases */}
          <div className="row">
            {/* Fase 1 */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100 border-primary">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-1-circle me-2"></i>
                    FASE 1: Interfaces Completar
                  </h5>
                  <small>Entrega: Antes de Sep 12 | Backend YA LISTO</small>
                </div>
                <div className="card-body">
                  <p className="small mb-3">
                    Completar las interfaces frontend faltantes para todas las 
                    entidades que ya están implementadas en el backend.
                  </p>
                  
                  <h6 className="text-primary">Pantallas por Completar:</h6>
                  <ul className="list-unstyled small">
                    <li className="mb-1">
                      <i className="bi bi-laptop text-primary me-1"></i>
                      <strong>Estados de Cuenta Bancarios</strong> (programación ya lista)
                    </li>
                    <li className="mb-1">
                      <i className="bi bi-laptop text-primary me-1"></i>
                      <strong>Captura de Pólizas Contables</strong> (base de datos programada)
                    </li>
                    <li className="mb-1">
                      <i className="bi bi-laptop text-primary me-1"></i>
                      <strong>Configuración de Tipos de Cambio</strong> (módulo ya en sistema)
                    </li>
                    <li className="mb-1">
                      <i className="bi bi-laptop text-primary me-1"></i>
                      <strong>Administración de Ejercicios Fiscales</strong> (funcionalidad completa)
                    </li>
                  </ul>

                  <div className="bg-light rounded p-2 mt-3">
                    <strong className="small">Estado del Sistema:</strong>
                    <div className="small text-success">
                      ✅ Base de datos completa | Programación terminada | Solo faltan pantallas
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fase 2 */}
            <div className="col-lg-6 mb-4">
              <div className="card h-100 border-success">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-2-circle me-2"></i>
                    FASE 2: Reportes y Funcionalidades
                  </h5>
                  <small>Entrega: Sep 12 | Aprovechando APIs Existentes</small>
                </div>
                <div className="card-body">
                  <p className="small mb-3">
                    Crear dashboards ejecutivos y funcionalidades especiales 
                    usando todas las APIs que ya están funcionando.
                  </p>
                  
                  <h6 className="text-success">Reportes - Solo Pantallas por Desarrollar:</h6>
                  <ul className="list-unstyled small">
                    <li className="mb-1">
                      <i className="bi bi-graph-up text-success me-1"></i>
                      <strong>Balance General</strong> - API ya funcionando, solo falta interfaz
                    </li>
                    <li className="mb-1">
                      <i className="bi bi-table text-success me-1"></i>
                      <strong>Estado de Resultados</strong> - Cálculos automáticos programados
                    </li>
                    <li className="mb-1">
                      <i className="bi bi-cash text-success me-1"></i>
                      <strong>Reportes de Ventas/Compras</strong> - Datos en tiempo real disponibles
                    </li>
                    <li className="mb-1">
                      <i className="bi bi-bank text-success me-1"></i>
                      <strong>Libro Diario y Mayor</strong> - Consultas ya programadas
                    </li>
                    <li className="mb-1">
                      <i className="bi bi-file-earmark-excel text-success me-1"></i>
                      <strong>Tablero Ejecutivo</strong> - Conectar APIs existentes
                    </li>
                  </ul>

                  <div className="bg-light rounded p-2 mt-3">
                    <strong className="small">Ventaja Competitiva:</strong>
                    <div className="small text-success">
                      ✅ Solo pantallas | Toda la programación del sistema ya terminada
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mejoras Futuras */}
        <section className="mb-5">
          <h2 className="h3 mb-4">
            <i className="bi bi-lightbulb me-2 text-warning"></i>
            Mejoras Futuras (Post-MVP)
          </h2>
          
          <div className="row">
            <div className="col-lg-3 mb-3">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <i className="bi bi-graph-up display-4 text-primary mb-3"></i>
                  <h6 className="text-primary">Analytics & Reporting</h6>
                  <ul className="list-unstyled small text-start">
                    <li>Dashboard financiero ejecutivo</li>
                    <li>Reportes de antigüedad</li>
                    <li>Estados financieros automáticos</li>
                    <li>Indicadores KPI</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 mb-3">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <i className="bi bi-globe display-4 text-info mb-3"></i>
                  <h6 className="text-info">Integraciones Avanzadas</h6>
                  <ul className="list-unstyled small text-start">
                    <li>SAT (México) - CFDI automático</li>
                    <li>APIs Bancarias México</li>
                    <li>ERP externos (SAP, Oracle)</li>
                    <li>Plataformas de pago</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 mb-3">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <i className="bi bi-gear display-4 text-success mb-3"></i>
                  <h6 className="text-success">Automatización Avanzada</h6>
                  <ul className="list-unstyled small text-start">
                    <li>Workflow de aprobaciones</li>
                    <li>OCR para facturas</li>
                    <li>Matching inteligente ML</li>
                    <li>Proyecciones flujo efectivo</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="col-lg-3 mb-3">
              <div className="card h-100 border-0 bg-light">
                <div className="card-body text-center">
                  <i className="bi bi-calculator display-4 text-warning mb-3"></i>
                  <h6 className="text-warning">Contabilidad Avanzada</h6>
                  <ul className="list-unstyled small text-start">
                    <li>Centros de costo</li>
                    <li>Proyectos y jobs</li>
                    <li>Multi-compañía</li>
                    <li>Consolidación financiera</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plan de Acción */}
        <section className="mb-5">
          <div className="card border-primary">
            <div className="card-header bg-primary text-white">
              <h3 className="h4 mb-0">
                <i className="bi bi-flag me-2"></i>
                Plan de Acción Inmediato
              </h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-lg-6">
                  <h5 className="text-primary">Ventajas del Enfoque</h5>
                  <div className="timeline">
                    <div className="d-flex mb-3">
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '12px'}}>✓</div>
                      <div className="ms-3">
                        <strong>Sistema Completamente Programado</strong> - 24 APIs incluyendo reportes ejecutivos
                      </div>
                    </div>
                    <div className="d-flex mb-3">
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '12px'}}>✓</div>
                      <div className="ms-3">
                        <strong>Solo Desarrollo de Pantallas</strong> - No hay programación adicional necesaria
                      </div>
                    </div>
                    <div className="d-flex mb-3">
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '12px'}}>✓</div>
                      <div className="ms-3">
                        <strong>Integración Inmediata</strong> - Conectar pantallas con sistema ya probado
                      </div>
                    </div>
                    <div className="d-flex mb-3">
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '12px'}}>✓</div>
                      <div className="ms-3">
                        <strong>Entrega Realista</strong> - Sep 12 es completamente factible
                      </div>
                    </div>
                    <div className="d-flex">
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', fontSize: '12px'}}>✓</div>
                      <div className="ms-3">
                        <strong>Menor Riesgo</strong> - Sistema estable, solo desarrollo de interfaces
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="col-lg-6">
                  <h5 className="text-success">Success Metrics</h5>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <div className="bg-light rounded p-2 text-center">
                        <div className="h4 text-success mb-1">100%</div>
                        <div className="small">Test Cases Passing</div>
                      </div>
                    </div>
                    <div className="col-6 mb-3">
                      <div className="bg-light rounded p-2 text-center">
                        <div className="h4 text-info mb-1">&lt;500ms</div>
                        <div className="small">Response Time</div>
                      </div>
                    </div>
                    <div className="col-6 mb-3">
                      <div className="bg-light rounded p-2 text-center">
                        <div className="h4 text-warning mb-1">80%</div>
                        <div className="small">Reducción Tiempo</div>
                      </div>
                    </div>
                    <div className="col-6 mb-3">
                      <div className="bg-light rounded p-2 text-center">
                        <div className="h4 text-danger mb-1">0</div>
                        <div className="small">Bugs Críticos</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-4 border-top">
          <p className="text-muted mb-0">
            <strong>Objetivo:</strong> Completar las interfaces frontend para aprovechar 
            al máximo el backend financiero-contable ya implementado, entregando un 
            sistema empresarial funcional para el 12 de septiembre de 2025.
          </p>
          <small className="text-muted">
            Documento de planificación técnica generado por Claude Code
          </small>
        </footer>
      </div>

      <style jsx>{`
        .bg-gradient-primary {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        }
        
        .timeline .d-flex:not(:last-child)::after {
          content: '';
          position: absolute;
          left: 15px;
          top: 35px;
          width: 2px;
          height: 20px;
          background-color: #dee2e6;
        }
        
        .timeline {
          position: relative;
        }
        
        .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
          transition: box-shadow 0.15s ease-in-out;
        }
      `}</style>
    </div>
  )
}
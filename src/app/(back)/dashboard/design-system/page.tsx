'use client'

import React, { useState } from 'react'
import { Button } from '@/ui/components/base/Button'
import { Card, CardHeader, CardContent, CardFooter } from '@/ui/components/base/Card'
import { ToggleSwitch } from '@/ui/components/base/ToggleSwitch'

export default function DesignSystemPage() {
  const [loading, setLoading] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  
  const handleLoadingTest = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <h1 className="mb-4">Design System - AtomoSoluciones</h1>
            <p className="text-muted mb-5">
              Catálogo de componentes UI para mantener consistencia visual en toda la aplicación.
            </p>
          </div>
        </div>

        {/* Colors Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="mb-4">🎨 Paleta de Colores</h2>
            <div className="row g-3">
              <div className="col-md-3">
                <Card variant="outlined" padding="compact">
                  <CardContent>
                    <div 
                      className="rounded mb-2" 
                      style={{ 
                        backgroundColor: '#2563eb', 
                        height: '60px',
                        border: '1px solid #e2e8f0'
                      }}
                    ></div>
                    <h6 className="mb-1">Primary</h6>
                    <small className="text-muted">#2563eb</small>
                  </CardContent>
                </Card>
              </div>
              
              <div className="col-md-3">
                <Card variant="outlined" padding="compact">
                  <CardContent>
                    <div 
                      className="rounded mb-2" 
                      style={{ 
                        backgroundColor: '#64748b', 
                        height: '60px',
                        border: '1px solid #e2e8f0'
                      }}
                    ></div>
                    <h6 className="mb-1">Secondary</h6>
                    <small className="text-muted">#64748b</small>
                  </CardContent>
                </Card>
              </div>
              
              <div className="col-md-3">
                <Card variant="outlined" padding="compact">
                  <CardContent>
                    <div 
                      className="rounded mb-2" 
                      style={{ 
                        backgroundColor: '#059669', 
                        height: '60px',
                        border: '1px solid #e2e8f0'
                      }}
                    ></div>
                    <h6 className="mb-1">Success</h6>
                    <small className="text-muted">#059669</small>
                  </CardContent>
                </Card>
              </div>
              
              <div className="col-md-3">
                <Card variant="outlined" padding="compact">
                  <CardContent>
                    <div 
                      className="rounded mb-2" 
                      style={{ 
                        backgroundColor: '#dc2626', 
                        height: '60px',
                        border: '1px solid #e2e8f0'
                      }}
                    ></div>
                    <h6 className="mb-1">Danger</h6>
                    <small className="text-muted">#dc2626</small>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="mb-4">🔘 Botones</h2>
            
            {/* Button Variants */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Variantes de Color</h5>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-wrap gap-3 mb-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="danger">Danger</Button>
                </div>
                
                <h6 className="mt-4 mb-3">Outline Style</h6>
                <div className="d-flex flex-wrap gap-3 mb-3">
                  <Button variant="primary" buttonStyle="outline">Primary</Button>
                  <Button variant="secondary" buttonStyle="outline">Secondary</Button>
                  <Button variant="success" buttonStyle="outline">Success</Button>
                  <Button variant="danger" buttonStyle="outline">Danger</Button>
                </div>
                
                <h6 className="mt-4 mb-3">Ghost Style</h6>
                <div className="d-flex flex-wrap gap-3">
                  <Button variant="primary" buttonStyle="ghost">Primary</Button>
                  <Button variant="secondary" buttonStyle="ghost">Secondary</Button>
                </div>
              </CardContent>
            </Card>

            {/* Button Sizes */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Tamaños</h5>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <Button size="small">Small</Button>
                  <Button size="medium">Medium</Button>
                  <Button size="large">Large</Button>
                </div>
              </CardContent>
            </Card>

            {/* Button States */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Estados Especiales</h5>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-wrap gap-3 mb-3">
                  <Button 
                    loading={loading} 
                    onClick={handleLoadingTest}
                  >
                    {loading ? 'Cargando...' : 'Probar Loading'}
                  </Button>
                  <Button disabled>Deshabilitado</Button>
                  <Button fullWidth>Ancho Completo</Button>
                </div>
              </CardContent>
            </Card>

            {/* Icons */}
            <Card variant="outlined">
              <CardHeader>
                <h5 className="mb-0">Con Iconos</h5>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-wrap gap-3">
                  <Button 
                    startIcon={<i className="bi bi-plus-lg"></i>}
                  >
                    Agregar
                  </Button>
                  <Button 
                    variant="secondary"
                    endIcon={<i className="bi bi-download"></i>}
                  >
                    Descargar
                  </Button>
                  <Button 
                    variant="danger"
                    buttonStyle="outline"
                    iconOnly
                    title="Eliminar"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cards Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="mb-4">🃏 Cards</h2>
            <div className="row g-4">
              <div className="col-md-4">
                <Card variant="elevated">
                  <CardHeader>
                    <h5 className="mb-1">Card Elevado</h5>
                    <small className="text-muted">Con sombra</small>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-0">
                      Este card tiene sombra y efecto hover. Perfecto para destacar contenido importante.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="small">Acción</Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="col-md-4">
                <Card variant="outlined">
                  <CardHeader>
                    <h5 className="mb-1">Card Outlined</h5>
                    <small className="text-muted">Con borde</small>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-0">
                      Card con borde sutil, ideal para contenido secundario o informativo.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="small" variant="secondary">Acción</Button>
                  </CardFooter>
                </Card>
              </div>
              
              <div className="col-md-4">
                <Card 
                  variant="elevated" 
                  interactive
                  onCardClick={() => alert('¡Card clickeado!')}
                >
                  <CardHeader>
                    <h5 className="mb-1">Card Interactivo</h5>
                    <small className="text-muted">Clickeable</small>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-0">
                      Este card es clickeable y tiene efectos de hover especiales.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="mb-4">📝 Tipografía</h2>
            <Card variant="outlined">
              <CardContent>
                <h1>Heading 1 - Principal</h1>
                <h2>Heading 2 - Sección</h2>
                <h3>Heading 3 - Subsección</h3>
                <h4>Heading 4 - Título</h4>
                <h5>Heading 5 - Subtítulo</h5>
                <h6>Heading 6 - Pequeño</h6>
                
                <p className="mt-4">
                  <strong>Texto normal:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                
                <p className="text-muted">
                  <strong>Texto secundario:</strong> Ut enim ad minim veniam, quis nostrud exercitation 
                  ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                
                <small className="text-muted d-block mt-3">
                  <strong>Texto pequeño:</strong> Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.
                </small>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Switches Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="mb-4">🔘 Toggle Switches</h2>
            <Card variant="outlined">
              <CardContent>
                <div className="row g-4">
                  <div className="col-md-4">
                    <h6 className="mb-3">Switch Básico</h6>
                    <ToggleSwitch
                      id="basic-switch"
                      checked={notifications}
                      onChange={setNotifications}
                      label="Notificaciones"
                      description="Recibir notificaciones del sistema"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <h6 className="mb-3">Con Íconos</h6>
                    <ToggleSwitch
                      id="icon-switch"
                      checked={darkMode}
                      onChange={setDarkMode}
                      label="Modo oscuro"
                      description="Cambiar tema de la aplicación"
                      leftIcon="bi-sun"
                      rightIcon="bi-moon"
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <h6 className="mb-3">Newsletter</h6>
                    <ToggleSwitch
                      id="newsletter-switch"
                      checked={newsletter}
                      onChange={setNewsletter}
                      label="Suscribirse al newsletter"
                      description="Recibir actualizaciones por email"
                      size="large"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Guidelines */}
        <div className="row">
          <div className="col-12">
            <h2 className="mb-4">📋 Guías de Uso</h2>
            <Card variant="outlined">
              <CardContent>
                <h5>Principios del Design System</h5>
                <ul className="mt-3">
                  <li><strong>Consistencia:</strong> Usa los mismos componentes en contextos similares</li>
                  <li><strong>Jerarquía:</strong> Utiliza los colores primary/secondary para establecer importancia</li>
                  <li><strong>Accesibilidad:</strong> Todos los componentes incluyen estados focus y son navegables por teclado</li>
                  <li><strong>Responsive:</strong> Los componentes se adaptan automáticamente a diferentes tamaños de pantalla</li>
                  <li><strong>Performance:</strong> CSS Modules aseguran que solo se carguen los estilos necesarios</li>
                </ul>
                
                <h6 className="mt-4">Importación de Componentes</h6>
                <pre className="bg-light p-3 rounded mt-2">
                  <code>{`import { Button } from '@/ui/components/base/Button'
import { Card, CardHeader, CardContent } from '@/ui/components/base/Card'`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  )
}
'use client'

import React, { useState } from 'react'
import { Button } from '@/ui/components/base/Button'
import { Card, CardHeader, CardContent, CardFooter } from '@/ui/components/base/Card'
import { ToggleSwitch } from '@/ui/components/base/ToggleSwitch'
import { Input, Textarea, Checkbox, Radio } from '@/ui/components/base'

export default function DesignSystemPage() {
  const [loading, setLoading] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  
  // Input states
  const [inputValue, setInputValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  
  // Checkbox states
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(true)
  const [dataProcessing, setDataProcessing] = useState(false)
  
  // Radio states
  const [contactMethod, setContactMethod] = useState('email')
  const [plan, setPlan] = useState('basic')
  
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

        {/* Input Components Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="mb-4">📝 Input Components</h2>
            
            {/* Input Sizes */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Tamaños de Input</h5>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-column gap-4">
                  <Input
                    id="input-small"
                    type="text"
                    label="Input Pequeño"
                    placeholder="Tamaño small"
                    size="small"
                  />
                  <Input
                    id="input-medium"
                    type="text"
                    label="Input Mediano (Predeterminado)"
                    placeholder="Tamaño medium"
                    size="medium"
                  />
                  <Input
                    id="input-large"
                    type="text"
                    label="Input Grande"
                    placeholder="Tamaño large"
                    size="large"
                  />
                  <Input
                    id="input-xl"
                    type="text"
                    label="Input Extra Grande"
                    placeholder="Tamaño extra large"
                    size="xl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Basic Inputs */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Inputs Básicos</h5>
              </CardHeader>
              <CardContent>
                <div className="row g-4">
                  <div className="col-md-4">
                    <Input
                      id="basic-text"
                      type="text"
                      label="Texto básico"
                      placeholder="Ingresa texto aquí..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <Input
                      id="email-input"
                      type="email"
                      label="Email"
                      placeholder="tu@email.com"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <Input
                      id="password-input"
                      type="password"
                      label="Contraseña"
                      placeholder="Tu contraseña"
                      value={passwordValue}
                      onChange={(e) => setPasswordValue(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inputs with Icons */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Inputs con Iconos</h5>
              </CardHeader>
              <CardContent>
                <div className="row g-4">
                  <div className="col-md-4">
                    <Input
                      id="icon-email"
                      type="email"
                      label="Email con icono"
                      placeholder="tu@email.com"
                      leftIcon="bi-envelope"
                    />
                  </div>
                  <div className="col-md-4">
                    <Input
                      id="icon-phone"
                      type="tel"
                      label="Teléfono"
                      placeholder="+1 234 567 8900"
                      leftIcon="bi-telephone"
                    />
                  </div>
                  <div className="col-md-4">
                    <Input
                      id="icon-search"
                      type="text"
                      label="Búsqueda"
                      placeholder="Buscar..."
                      leftIcon="bi-search"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input States */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Estados de Input</h5>
              </CardHeader>
              <CardContent>
                <div className="row g-4">
                  <div className="col-md-4">
                    <Input
                      id="error-input"
                      type="text"
                      label="Con error"
                      placeholder="Input con error"
                      errorText="Este campo es requerido"
                    />
                  </div>
                  <div className="col-md-4">
                    <Input
                      id="disabled-input"
                      type="text"
                      label="Deshabilitado"
                      placeholder="Input deshabilitado"
                      disabled
                    />
                  </div>
                  <div className="col-md-4">
                    <Input
                      id="help-input"
                      type="text"
                      label="Con ayuda"
                      placeholder="Input con texto de ayuda"
                      helpText="Texto explicativo para el usuario"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Select Component */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Select Dropdown</h5>
              </CardHeader>
              <CardContent>
                <div className="row g-4">
                  <div className="col-md-6">
                    <Input
                      id="select-country"
                      type="select"
                      label="País"
                      leftIcon="bi-globe"
                      options={[
                        { value: '', label: 'Selecciona un país...' },
                        { value: 'mx', label: 'México' },
                        { value: 'us', label: 'Estados Unidos' },
                        { value: 'ca', label: 'Canadá' },
                        { value: 'es', label: 'España' }
                      ]}
                    />
                  </div>
                  <div className="col-md-6">
                    <Input
                      id="select-multiple"
                      type="select"
                      label="Múltiple selección"
                      multiple
                      options={[
                        { value: 'react', label: 'React' },
                        { value: 'vue', label: 'Vue.js' },
                        { value: 'angular', label: 'Angular' },
                        { value: 'svelte', label: 'Svelte' }
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Textarea Component */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Textarea</h5>
              </CardHeader>
              <CardContent>
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="mb-3">Tamaños de Textarea</h6>
                    <div className="d-flex flex-column gap-4">
                      <Textarea
                        id="textarea-small"
                        label="Textarea Pequeño"
                        placeholder="Escribe un comentario breve..."
                        size="small"
                        helpText="Ideal para comentarios cortos"
                      />
                      <Textarea
                        id="textarea-medium"
                        label="Textarea Mediano"
                        placeholder="Escribe un mensaje..."
                        size="medium"
                        helpText="Tamaño estándar"
                      />
                      <Textarea
                        id="textarea-large"
                        label="Textarea Grande"
                        placeholder="Escribe un texto largo..."
                        size="large"
                        helpText="Para textos más extensos"
                      />
                      <Textarea
                        id="textarea-xl"
                        label="Textarea Extra Grande"
                        placeholder="Escribe documentación, artículos, etc..."
                        size="xl"
                        helpText="Para documentos largos"
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="mb-3">Estados de Textarea</h6>
                    <div className="d-flex flex-column gap-4">
                      <Textarea
                        id="textarea-normal"
                        label="Normal"
                        placeholder="Textarea en estado normal"
                        helpText="Estado predeterminado"
                      />
                      <Textarea
                        id="textarea-error"
                        label="Con Error"
                        placeholder="Textarea con error"
                        errorText="Este campo es obligatorio"
                      />
                      <Textarea
                        id="textarea-success"
                        label="Exitoso"
                        placeholder="Textarea válido"
                        successText="Contenido válido"
                      />
                      <Textarea
                        id="textarea-disabled"
                        label="Deshabilitado"
                        placeholder="Textarea deshabilitado"
                        disabled
                        helpText="Este campo está deshabilitado"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Checkbox Components Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="mb-4">☑️ Checkbox Components</h2>
            
            {/* Checkbox Sizes */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Tamaños de Checkbox</h5>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-column gap-4">
                  <Checkbox
                    id="checkbox-small"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    label="Checkbox Pequeño"
                    description="Ideal para opciones secundarias en listas compactas"
                    size="small"
                  />
                  <Checkbox
                    id="checkbox-medium"
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                    label="Checkbox Mediano (Predeterminado)"
                    description="Tamaño estándar para formularios y configuraciones"
                    size="medium"
                  />
                  <Checkbox
                    id="checkbox-large"
                    checked={dataProcessing}
                    onChange={(e) => setDataProcessing(e.target.checked)}
                    label="Checkbox Grande"
                    description="Para opciones importantes y destacadas"
                    size="large"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Checkbox States */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Estados de Checkbox</h5>
              </CardHeader>
              <CardContent>
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="mb-3">Estados Básicos</h6>
                    <div className="d-flex flex-column gap-3">
                      <Checkbox
                        id="terms-checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        label="Acepto los términos y condiciones"
                      />
                      <Checkbox
                        id="marketing-checkbox"
                        checked={marketingEmails}
                        onChange={(e) => setMarketingEmails(e.target.checked)}
                        label="Recibir emails de marketing"
                        description="Te enviaremos ofertas especiales y noticias del producto"
                      />
                      <Checkbox
                        id="data-checkbox"
                        checked={dataProcessing}
                        onChange={(e) => setDataProcessing(e.target.checked)}
                        label="Procesamiento de datos"
                        description="Autorizo el procesamiento de mis datos personales"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="mb-3">Estados Especiales</h6>
                    <div className="d-flex flex-column gap-3">
                      <Checkbox
                        id="error-checkbox"
                        checked={false}
                        onChange={() => {}}
                        label="Con Error"
                        errorText="Debes aceptar para continuar"
                        required
                      />
                      <Checkbox
                        id="help-checkbox"
                        checked={true}
                        onChange={() => {}}
                        label="Con Texto de Ayuda"
                        helpText="Información adicional sobre esta opción"
                      />
                      <Checkbox
                        id="indeterminate-checkbox"
                        checked={false}
                        onChange={() => {}}
                        label="Estado Indeterminado"
                        description="Representa una selección parcial"
                        indeterminate={true}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Radio Components Section */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="mb-4">🔘 Radio Components</h2>
            
            {/* Radio Sizes */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Tamaños de Radio</h5>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-column gap-4">
                  <div>
                    <h6 className="mb-3">Radio Pequeño</h6>
                    <div className="d-flex gap-4">
                      <Radio
                        id="size-small-1"
                        name="size-small"
                        value="option1"
                        checked={true}
                        onChange={() => {}}
                        label="Opción 1"
                        size="small"
                      />
                      <Radio
                        id="size-small-2"
                        name="size-small"
                        value="option2"
                        checked={false}
                        onChange={() => {}}
                        label="Opción 2"
                        size="small"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="mb-3">Radio Mediano (Predeterminado)</h6>
                    <div className="d-flex gap-4">
                      <Radio
                        id="size-medium-1"
                        name="size-medium"
                        value="option1"
                        checked={true}
                        onChange={() => {}}
                        label="Opción 1"
                        size="medium"
                      />
                      <Radio
                        id="size-medium-2"
                        name="size-medium"
                        value="option2"
                        checked={false}
                        onChange={() => {}}
                        label="Opción 2"
                        size="medium"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h6 className="mb-3">Radio Grande</h6>
                    <div className="d-flex gap-4">
                      <Radio
                        id="size-large-1"
                        name="size-large"
                        value="option1"
                        checked={true}
                        onChange={() => {}}
                        label="Opción 1"
                        size="large"
                      />
                      <Radio
                        id="size-large-2"
                        name="size-large"
                        value="option2"
                        checked={false}
                        onChange={() => {}}
                        label="Opción 2"
                        size="large"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Radio Groups */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Radio Groups</h5>
              </CardHeader>
              <CardContent>
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="mb-3">Método de contacto (Vertical)</h6>
                    <div className="d-flex flex-column gap-2">
                      <Radio
                        id="contact-email"
                        name="contact-method"
                        value="email"
                        checked={contactMethod === 'email'}
                        onChange={(e) => setContactMethod(e.target.value)}
                        label="Email"
                        description="Te contactaremos por correo electrónico"
                      />
                      <Radio
                        id="contact-phone"
                        name="contact-method"
                        value="phone"
                        checked={contactMethod === 'phone'}
                        onChange={(e) => setContactMethod(e.target.value)}
                        label="Teléfono"
                        description="Te llamaremos directamente"
                      />
                      <Radio
                        id="contact-sms"
                        name="contact-method"
                        value="sms"
                        checked={contactMethod === 'sms'}
                        onChange={(e) => setContactMethod(e.target.value)}
                        label="SMS"
                        description="Te enviaremos un mensaje de texto"
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="mb-3">Plan de suscripción (Horizontal)</h6>
                    <div className="d-flex gap-4">
                      <Radio
                        id="plan-basic"
                        name="subscription-plan"
                        value="basic"
                        checked={plan === 'basic'}
                        onChange={(e) => setPlan(e.target.value)}
                        label="Básico"
                      />
                      <Radio
                        id="plan-pro"
                        name="subscription-plan"
                        value="pro"
                        checked={plan === 'pro'}
                        onChange={(e) => setPlan(e.target.value)}
                        label="Pro"
                      />
                      <Radio
                        id="plan-enterprise"
                        name="subscription-plan"
                        value="enterprise"
                        checked={plan === 'enterprise'}
                        onChange={(e) => setPlan(e.target.value)}
                        label="Enterprise"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <Button size="xl">Extra Large</Button>
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
            
            {/* Switch Sizes */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Tamaños de Switch</h5>
              </CardHeader>
              <CardContent>
                <div className="d-flex flex-column gap-4">
                  <ToggleSwitch
                    id="switch-small"
                    checked={newsletter}
                    onChange={setNewsletter}
                    label="Switch Pequeño"
                    description="Ideal para configuraciones secundarias"
                    size="small"
                  />
                  <ToggleSwitch
                    id="switch-medium"
                    checked={notifications}
                    onChange={setNotifications}
                    label="Switch Mediano (Predeterminado)"
                    description="Tamaño estándar para la mayoría de casos"
                    size="medium"
                  />
                  <ToggleSwitch
                    id="switch-large"
                    checked={darkMode}
                    onChange={setDarkMode}
                    label="Switch Grande"
                    description="Para configuraciones importantes y destacadas"
                    size="large"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Switch Variants */}
            <Card variant="outlined" className="mb-4">
              <CardHeader>
                <h5 className="mb-0">Variantes de Switch</h5>
              </CardHeader>
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
                      leftIcon="bi-envelope"
                      rightIcon="bi-envelope-check"
                      size="large"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Switch Examples */}
            <Card variant="outlined">
              <CardHeader>
                <h5 className="mb-0">Ejemplos Avanzados</h5>
              </CardHeader>
              <CardContent>
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="mb-3">Configuraciones de Sistema</h6>
                    <div className="d-flex flex-column gap-3">
                      <ToggleSwitch
                        id="auto-save"
                        checked={true}
                        onChange={() => {}}
                        label="Autoguardado"
                        description="Guardar cambios automáticamente cada 30 segundos"
                        leftIcon="bi-save"
                        rightIcon="bi-save2"
                        size="medium"
                      />
                      <ToggleSwitch
                        id="wifi-switch"
                        checked={true}
                        onChange={() => {}}
                        label="WiFi"
                        description="Conectado a Red_Casa_5G"
                        leftIcon="bi-wifi-off"
                        rightIcon="bi-wifi"
                        size="medium"
                      />
                      <ToggleSwitch
                        id="bluetooth"
                        checked={false}
                        onChange={() => {}}
                        label="Bluetooth"
                        description="Descubrir dispositivos cercanos"
                        leftIcon="bi-bluetooth"
                        rightIcon="bi-bluetooth"
                        size="medium"
                      />
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="mb-3">Configuraciones de Aplicación</h6>
                    <div className="d-flex flex-column gap-3">
                      <ToggleSwitch
                        id="notifications-push"
                        checked={notifications}
                        onChange={setNotifications}
                        label="Notificaciones Push"
                        description="Mostrar notificaciones en tiempo real"
                        leftIcon="bi-bell-slash"
                        rightIcon="bi-bell"
                        size="large"
                      />
                      <ToggleSwitch
                        id="location"
                        checked={false}
                        onChange={() => {}}
                        label="Servicios de ubicación"
                        description="Permitir acceso a la ubicación del dispositivo"
                        leftIcon="bi-geo-alt-fill"
                        rightIcon="bi-geo-alt-fill"
                        size="medium"
                      />
                      <ToggleSwitch
                        id="analytics"
                        checked={dataProcessing}
                        onChange={setDataProcessing}
                        label="Analytics y métricas"
                        description="Compartir datos de uso para mejorar la app"
                        leftIcon="bi-graph-down"
                        rightIcon="bi-graph-up"
                        size="medium"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Complete Form Example */}
        <div className="row mb-5">
          <div className="col-12">
            <h2 className="mb-4">📋 Form Examples & Patterns</h2>
            <Card variant="outlined">
              <CardHeader>
                <h5 className="mb-1">User Registration Form</h5>
                <small className="text-muted">Comprehensive form example with validation patterns and states</small>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="row g-4">
                    {/* Personal Information */}
                    <div className="col-12">
                      <h6 className="text-primary mb-3">
                        <i className="bi bi-person-fill me-2"></i>
                        Información Personal
                      </h6>
                    </div>
                    
                    <div className="col-md-6">
                      <Input
                        id="firstName"
                        type="text"
                        label="Nombre"
                        placeholder="Ingresa tu nombre"
                        leftIcon="bi-person"
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <Input
                        id="lastName"
                        type="text"
                        label="Apellido"
                        placeholder="Ingresa tu apellido"
                        leftIcon="bi-person"
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <Input
                        id="email"
                        type="email"
                        label="Correo Electrónico"
                        placeholder="tu@email.com"
                        leftIcon="bi-envelope"
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <Input
                        id="phone"
                        type="tel"
                        label="Teléfono"
                        placeholder="+1 (555) 123-4567"
                        leftIcon="bi-telephone"
                        helpText="Formato: +1 (555) 123-4567"
                      />
                    </div>
                    
                    {/* Account Details */}
                    <div className="col-12 mt-5">
                      <h6 className="text-primary mb-3">
                        <i className="bi bi-shield-lock me-2"></i>
                        Detalles de la Cuenta
                      </h6>
                    </div>
                    
                    <div className="col-md-6">
                      <Input
                        id="username"
                        type="text"
                        label="Nombre de Usuario"
                        placeholder="usuario123"
                        leftIcon="bi-at"
                        helpText="Mínimo 3 caracteres, solo letras y números"
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <Input
                        id="password"
                        type="password"
                        label="Contraseña"
                        placeholder="••••••••"
                        leftIcon="bi-lock"
                        helpText="Mínimo 8 caracteres con mayúsculas y números"
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <Input
                        id="country"
                        type="select"
                        label="País"
                        leftIcon="bi-globe"
                        options={[
                          { value: '', label: 'Selecciona tu país...' },
                          { value: 'mx', label: 'México' },
                          { value: 'us', label: 'Estados Unidos' },
                          { value: 'ca', label: 'Canadá' },
                          { value: 'es', label: 'España' },
                          { value: 'ar', label: 'Argentina' },
                          { value: 'cl', label: 'Chile' },
                          { value: 'co', label: 'Colombia' }
                        ]}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <Input
                        id="role"
                        type="select"
                        label="Rol"
                        leftIcon="bi-person-badge"
                        options={[
                          { value: '', label: 'Selecciona un rol...' },
                          { value: 'admin', label: 'Administrador' },
                          { value: 'user', label: 'Usuario' },
                          { value: 'viewer', label: 'Solo lectura' },
                          { value: 'editor', label: 'Editor' }
                        ]}
                        helpText="Define los permisos del usuario"
                        required
                      />
                    </div>
                    
                    {/* Preferences */}
                    <div className="col-12 mt-5">
                      <h6 className="text-primary mb-3">
                        <i className="bi bi-gear me-2"></i>
                        Preferencias
                      </h6>
                    </div>
                    
                    <div className="col-12">
                      <div className="d-flex flex-column gap-3">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                          label="Acepto los términos y condiciones"
                          description="He leído y acepto los términos del servicio y la política de privacidad"
                        />
                        
                        <Checkbox
                          id="newsletter"
                          checked={marketingEmails}
                          onChange={(e) => setMarketingEmails(e.target.checked)}
                          label="Recibir newsletter"
                          description="Mantente al día con nuestras últimas noticias y actualizaciones"
                        />
                        
                        <ToggleSwitch
                          id="notifications"
                          checked={notifications}
                          onChange={setNotifications}
                          label="Notificaciones push"
                          description="Recibir notificaciones en tiempo real"
                          leftIcon="bi-bell-slash"
                          rightIcon="bi-bell"
                        />
                        
                        <ToggleSwitch
                          id="darkMode"
                          checked={darkMode}
                          onChange={setDarkMode}
                          label="Modo oscuro"
                          description="Cambiar al tema oscuro de la aplicación"
                          leftIcon="bi-sun"
                          rightIcon="bi-moon"
                          size="large"
                        />
                      </div>
                    </div>
                    
                    {/* Contact Preferences */}
                    <div className="col-12 mt-4">
                      <h6 className="mb-3">Método de contacto preferido</h6>
                      <div className="d-flex gap-4">
                        <Radio
                          id="contact-email-form"
                          name="contact-method-form"
                          value="email"
                          checked={contactMethod === 'email'}
                          onChange={(e) => setContactMethod(e.target.value)}
                          label="Email"
                          />
                        <Radio
                          id="contact-phone-form"
                          name="contact-method-form"
                          value="phone"
                          checked={contactMethod === 'phone'}
                          onChange={(e) => setContactMethod(e.target.value)}
                          label="Teléfono"
                          />
                        <Radio
                          id="contact-sms-form"
                          name="contact-method-form"
                          value="sms"
                          checked={contactMethod === 'sms'}
                          onChange={(e) => setContactMethod(e.target.value)}
                          label="SMS"
                          />
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="col-12 mt-5">
                      <div className="d-flex gap-3 justify-content-end">
                        <Button variant="secondary" buttonStyle="outline">
                          Cancelar
                        </Button>
                        <Button variant="primary" size="large">
                          <i className="bi bi-check-lg me-2"></i>
                          Crear Usuario
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
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
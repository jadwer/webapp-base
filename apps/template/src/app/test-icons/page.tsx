'use client'

import { Input } from '@/ui/components/base'

export default function TestIconsPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Prueba de Iconos Bootstrap</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Iconos directos (FUNCIONAN):</h3>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '24px' }}>
          <i className="bi bi-envelope"></i>
          <i className="bi bi-lock"></i>
          <i className="bi bi-search"></i>
          <i className="bi bi-diagram-3"></i>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Iconos en DIV con clases del Input (PRUEBA):</h3>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <i className="bi bi-envelope" style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            fontSize: '16px',
            color: '#6b7280'
          }}></i>
          <input style={{ paddingLeft: '40px', padding: '8px 12px', border: '1px solid #ccc' }} placeholder="Email test" />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Input component oficial (CORREGIDO - USA CLASES BI):</h3>
        <Input
          id="email"
          type="email"
          label="Email Input"
          placeholder="test@email.com"
          leftIcon="bi-envelope"
        />
        <br />
        <Input
          id="password"
          type="password"
          label="Password Input"
          placeholder="••••••••"
        />
        <br />
        <Input
          id="search"
          type="text"
          label="Search Input"
          placeholder="Buscar..."
          leftIcon="bi-search"
        />
        <br />
        <Input
          id="error-test"
          type="select"
          label="Select con Error"
          errorText="Seleccione una opción válida"
          options={[
            { value: '', label: 'Seleccionar...' },
            { value: 'option1', label: 'Opción 1' },
            { value: 'option2', label: 'Opción 2' }
          ]}
        />
        <br />
        <Input
          id="success-test"
          type="select"
          label="Select con Success"
          successText="Selección válida"
          options={[
            { value: 'selected', label: 'Opción seleccionada' },
            { value: 'option2', label: 'Opción 2' }
          ]}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Bootstrap Icons SOLO (sin CSS Modules):</h3>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <i className="bi bi-envelope" style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            fontSize: '16px',
            color: '#6b7280'
          }}></i>
          <input style={{ paddingLeft: '40px', padding: '8px 12px', border: '1px solid #ccc' }} placeholder="Solo Bootstrap" />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Con CSS Modules aplicados:</h3>
        <div style={{ border: '1px solid red', padding: '10px' }}>
          <i className="bi bi-envelope Input-module-scss-module__NBCdLa__icon Input-module-scss-module__NBCdLa__left"></i>
        </div>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>DEBUG Final: HTML real del Input</h3>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', background: '#f0f0f0', padding: '10px' }}>
          Esperamos ver: &lt;i class=&quot;bi bi-envelope Input-...icon Input-...left&quot;&gt;&lt;/i&gt;<br/>
          Con el contenido del icono renderizado por Bootstrap Icons CSS
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Solución JavaScript (FORZADO):</h3>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              fontFamily: 'bootstrap-icons',
              fontSize: '16px',
              color: '#6b7280'
            }}
          >
            &#xf32f;
          </span>
          <input style={{ paddingLeft: '40px', padding: '8px 12px', border: '1px solid #ccc' }} placeholder="Forzado con Unicode" />
        </div>
      </div>
    </div>
  )
}
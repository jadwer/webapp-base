/**
 * DERECHOS RESERVADOS / TÉRMINOS Y CONDICIONES
 * Página legal con términos de uso, propiedad intelectual y condiciones de servicio
 */

import { Metadata } from 'next'
import Link from 'next/link'
import styles from '../aviso-privacidad/page.module.scss'

export const metadata: Metadata = {
  title: 'Derechos Reservados y Términos de Uso - Labor Wasser de México',
  description: 'Términos y condiciones de uso, derechos de propiedad intelectual y políticas de Labor Wasser de México.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function DerechosReservadosPage() {
  const currentYear = new Date().getFullYear()
  const lastUpdate = '21 de enero de 2026'

  return (
    <div className={styles.container}>
      <article className={styles.content}>
        <header className={styles.header}>
          <h1>Derechos Reservados y Términos de Uso</h1>
          <p className={styles.lastUpdate}>Última actualización: {lastUpdate}</p>
        </header>

        <section className={styles.section}>
          <h2>1. Propiedad Intelectual</h2>
          <p>
            Todo el contenido de este sitio web, incluyendo pero no limitado a textos, gráficos, logotipos,
            iconos, imágenes, clips de audio, descargas digitales, compilaciones de datos y software,
            es propiedad de <strong>Labor Wasser de México S.A. de C.V.</strong> o de sus proveedores de contenido
            y está protegido por las leyes mexicanas e internacionales de propiedad intelectual.
          </p>
          <p>
            Las marcas comerciales, logotipos y marcas de servicio (colectivamente las &ldquo;Marcas&rdquo;) mostradas
            en este sitio son marcas registradas y no registradas de Labor Wasser de México y de terceros.
            Nada en este sitio debe interpretarse como una concesión de licencia o derecho para usar cualquier Marca.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Uso Permitido del Sitio</h2>
          <p>Se le otorga una licencia limitada para acceder y hacer uso personal de este sitio. Usted NO puede:</p>
          <ul>
            <li>Descargar o modificar cualquier parte del sitio sin autorización expresa por escrito</li>
            <li>Usar el sitio o su contenido con fines comerciales sin autorización</li>
            <li>Reproducir, duplicar, copiar, vender, revender o explotar comercialmente cualquier parte del sitio</li>
            <li>Utilizar técnicas de minería de datos, robots o herramientas similares de recopilación</li>
            <li>Enmarcar o utilizar técnicas de enmarcado para incluir marcas comerciales o contenido propietario</li>
            <li>Usar meta tags u otro &ldquo;texto oculto&rdquo; utilizando el nombre o marcas de Labor Wasser</li>
          </ul>
          <p>
            Cualquier uso no autorizado terminará los permisos o licencias otorgados por Labor Wasser de México.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Términos de Venta</h2>

          <h3>3.1 Cotizaciones</h3>
          <ul>
            <li>Las cotizaciones tienen una vigencia indicada en el documento (generalmente 15-30 días)</li>
            <li>Los precios están sujetos a cambios sin previo aviso antes de la aceptación formal</li>
            <li>Las cotizaciones no constituyen un contrato vinculante hasta ser aceptadas por escrito</li>
          </ul>

          <h3>3.2 Precios e Impuestos</h3>
          <ul>
            <li>Los precios mostrados son en Moneda Nacional (MXN) salvo que se indique lo contrario</li>
            <li>Todos los precios están sujetos al 16% de IVA</li>
            <li>Precios en USD están sujetos al tipo de cambio del día de facturación</li>
          </ul>

          <h3>3.3 Formas de Pago</h3>
          <ul>
            <li>Transferencia electrónica (SPEI)</li>
            <li>Depósito bancario</li>
            <li>Tarjeta de crédito/débito (procesado por Stripe)</li>
            <li>Crédito comercial (sujeto a aprobación y línea de crédito)</li>
          </ul>

          <h3>3.4 Tiempos de Entrega</h3>
          <ul>
            <li>Los tiempos de entrega (ETA) son estimados y pueden variar según disponibilidad</li>
            <li>Productos de importación pueden tener tiempos extendidos (4-8 semanas)</li>
            <li>Pedidos urgentes pueden estar sujetos a cargos adicionales</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Política de Devoluciones</h2>
          <p>Labor Wasser de México acepta devoluciones bajo las siguientes condiciones:</p>
          <ul>
            <li>Productos defectuosos o dañados durante el transporte: Reporte dentro de 48 horas</li>
            <li>Productos en perfecto estado: Dentro de 15 días, en empaque original sin abrir</li>
            <li>Reactivos y químicos: No se aceptan devoluciones por razones de seguridad (excepto defectos)</li>
            <li>Equipos especiales o sobre pedido: No se aceptan devoluciones</li>
          </ul>
          <p>
            Los gastos de envío de la devolución corren por cuenta del cliente, excepto en casos de error
            de Labor Wasser o productos defectuosos.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Garantías</h2>
          <p>
            Los productos distribuidos por Labor Wasser de México cuentan con la garantía del fabricante
            según las condiciones establecidas por cada marca. Labor Wasser actúa como intermediario
            en la gestión de garantías.
          </p>
          <ul>
            <li>Equipos: Garantía según fabricante (típicamente 1-2 años)</li>
            <li>Consumibles: Sin garantía después de apertura del empaque</li>
            <li>Reactivos: Garantía de fecha de caducidad indicada en etiqueta</li>
          </ul>
          <p>
            La garantía no cubre daños por mal uso, modificaciones no autorizadas, o uso fuera de
            especificaciones del fabricante.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Limitación de Responsabilidad</h2>
          <p>
            Labor Wasser de México no será responsable por daños indirectos, incidentales, especiales,
            consecuentes o punitivos, incluyendo pero no limitado a pérdida de ganancias, datos, uso,
            buena voluntad u otras pérdidas intangibles, resultantes de:
          </p>
          <ul>
            <li>Su uso o incapacidad para usar el sitio o los productos</li>
            <li>Cualquier conducta o contenido de terceros en el sitio</li>
            <li>Contenido obtenido del sitio</li>
            <li>Acceso no autorizado, uso o alteración de sus transmisiones o contenido</li>
          </ul>
          <p>
            En ningún caso la responsabilidad total de Labor Wasser excederá el monto pagado por usted
            por los productos o servicios en cuestión.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Contenido de Terceros</h2>
          <p>
            Este sitio puede contener enlaces a sitios web de terceros. Estos enlaces se proporcionan
            únicamente para su conveniencia. Labor Wasser no tiene control sobre el contenido de estos
            sitios y no asume responsabilidad por el contenido, políticas de privacidad o prácticas de
            sitios de terceros.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Disponibilidad del Sitio</h2>
          <p>
            Labor Wasser no garantiza que el sitio esté disponible de manera ininterrumpida, segura o
            libre de errores. Nos reservamos el derecho de modificar, suspender o discontinuar cualquier
            parte del sitio en cualquier momento sin previo aviso.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Ley Aplicable y Jurisdicción</h2>
          <p>
            Estos términos se regirán e interpretarán de acuerdo con las leyes de los Estados Unidos Mexicanos.
            Cualquier disputa relacionada con estos términos se someterá a la jurisdicción exclusiva de los
            tribunales competentes de Monterrey, Nuevo León, México.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Cambios a los Términos</h2>
          <p>
            Labor Wasser se reserva el derecho de modificar estos términos en cualquier momento.
            Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio.
            El uso continuado del sitio después de cualquier cambio constituye su aceptación de los nuevos términos.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Contacto</h2>
          <p>Para preguntas sobre estos términos, contáctenos:</p>
          <ul>
            <li>Correo: <a href="mailto:legal@laborwasser.mx">legal@laborwasser.mx</a></li>
            <li>Teléfono: +52 (81) 1234-5678</li>
            <li>Dirección: Av. Industrial 123, Col. Centro Industrial, C.P. 64000, Monterrey, N.L.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Documentos Relacionados</h2>
          <ul>
            <li><Link href="/aviso-privacidad">Aviso de Privacidad</Link></li>
            <li><Link href="/certificados">Certificaciones y Acreditaciones</Link></li>
          </ul>
        </section>

        <footer className={styles.footer}>
          <p>© {currentYear} Labor Wasser de México S.A. de C.V. Todos los derechos reservados.</p>
        </footer>
      </article>
    </div>
  )
}

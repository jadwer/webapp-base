/**
 * AVISO DE PRIVACIDAD
 * Requerido por la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)
 */

import { Metadata } from 'next'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Aviso de Privacidad - Labor Wasser de México',
  description: 'Aviso de privacidad de Labor Wasser de México. Conoce cómo protegemos y tratamos tus datos personales conforme a la LFPDPPP.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function AvisoPrivacidadPage() {
  const currentYear = new Date().getFullYear()
  const lastUpdate = '21 de enero de 2026'

  return (
    <div className={styles.container}>
      <article className={styles.content}>
        <header className={styles.header}>
          <h1>Aviso de Privacidad</h1>
          <p className={styles.lastUpdate}>Última actualización: {lastUpdate}</p>
        </header>

        <section className={styles.section}>
          <h2>1. Identidad del Responsable</h2>
          <p>
            <strong>Labor Wasser de México S.A. de C.V.</strong> (en adelante &ldquo;Labor Wasser&rdquo;), con domicilio en
            Av. Industrial 123, Col. Centro Industrial, C.P. 64000, Monterrey, Nuevo León, México,
            es responsable del tratamiento de sus datos personales.
          </p>
          <p>
            Para cualquier duda o aclaración respecto al presente aviso de privacidad, puede contactarnos a través de:
          </p>
          <ul>
            <li>Correo electrónico: <a href="mailto:privacidad@laborwasser.mx">privacidad@laborwasser.mx</a></li>
            <li>Teléfono: +52 (81) 1234-5678</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. Datos Personales Recabados</h2>
          <p>Para las finalidades señaladas en este aviso de privacidad, podemos recabar las siguientes categorías de datos personales:</p>

          <h3>Datos de identificación:</h3>
          <ul>
            <li>Nombre completo</li>
            <li>Razón social (en caso de personas morales)</li>
            <li>RFC (Registro Federal de Contribuyentes)</li>
            <li>CURP</li>
            <li>Domicilio fiscal y de entrega</li>
          </ul>

          <h3>Datos de contacto:</h3>
          <ul>
            <li>Correo electrónico</li>
            <li>Número telefónico fijo y/o móvil</li>
            <li>Dirección postal</li>
          </ul>

          <h3>Datos comerciales:</h3>
          <ul>
            <li>Historial de compras y cotizaciones</li>
            <li>Preferencias de productos</li>
            <li>Información de facturación</li>
          </ul>

          <h3>Datos financieros:</h3>
          <ul>
            <li>Información bancaria para pagos y transferencias</li>
            <li>Datos de tarjetas de crédito/débito (procesados por terceros certificados PCI-DSS)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Finalidades del Tratamiento</h2>

          <h3>Finalidades primarias (necesarias):</h3>
          <ul>
            <li>Procesar solicitudes de cotización y pedidos</li>
            <li>Facturación y cobranza</li>
            <li>Entrega de productos</li>
            <li>Atención al cliente y soporte técnico</li>
            <li>Cumplimiento de obligaciones legales y fiscales</li>
            <li>Gestión de devoluciones y garantías</li>
          </ul>

          <h3>Finalidades secundarias (opcionales):</h3>
          <ul>
            <li>Envío de boletines informativos y promociones</li>
            <li>Encuestas de satisfacción</li>
            <li>Invitaciones a eventos y capacitaciones</li>
            <li>Análisis estadísticos para mejora del servicio</li>
          </ul>
          <p>
            Si no desea que sus datos sean tratados para finalidades secundarias, puede manifestarlo enviando
            un correo a <a href="mailto:privacidad@laborwasser.mx">privacidad@laborwasser.mx</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Transferencia de Datos</h2>
          <p>Sus datos personales podrán ser transferidos a:</p>
          <ul>
            <li><strong>Empresas de mensajería y paquetería:</strong> Para la entrega de productos</li>
            <li><strong>Instituciones bancarias:</strong> Para procesamiento de pagos</li>
            <li><strong>Autoridades fiscales:</strong> Para cumplimiento de obligaciones legales (SAT)</li>
            <li><strong>Proveedores de servicios tecnológicos:</strong> Para almacenamiento seguro de información</li>
          </ul>
          <p>
            Las transferencias anteriores no requieren su consentimiento conforme al artículo 37 de la LFPDPPP.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Derechos ARCO</h2>
          <p>
            Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y
            las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección
            de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación);
            que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está
            siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales
            para fines específicos (Oposición).
          </p>
          <p>
            Para ejercer sus derechos ARCO, envíe su solicitud a <a href="mailto:privacidad@laborwasser.mx">privacidad@laborwasser.mx</a> con:
          </p>
          <ul>
            <li>Nombre completo y datos de contacto</li>
            <li>Descripción clara de los derechos que desea ejercer</li>
            <li>Documentos que acrediten su identidad (copia de INE o pasaporte)</li>
          </ul>
          <p>
            Responderemos en un plazo máximo de 20 días hábiles.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Uso de Cookies y Tecnologías de Rastreo</h2>
          <p>
            Nuestro sitio web utiliza cookies y otras tecnologías de rastreo para mejorar su experiencia de navegación,
            analizar el tráfico del sitio y personalizar el contenido mostrado.
          </p>
          <p>
            Puede deshabilitar las cookies en la configuración de su navegador, aunque esto podría afectar
            algunas funcionalidades del sitio.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Medidas de Seguridad</h2>
          <p>
            Labor Wasser implementa medidas de seguridad administrativas, técnicas y físicas para proteger
            sus datos personales contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento
            no autorizado, incluyendo:
          </p>
          <ul>
            <li>Encriptación SSL/TLS en todas las comunicaciones</li>
            <li>Almacenamiento seguro con acceso restringido</li>
            <li>Capacitación del personal en protección de datos</li>
            <li>Auditorías periódicas de seguridad</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>8. Cambios al Aviso de Privacidad</h2>
          <p>
            Labor Wasser se reserva el derecho de modificar este aviso de privacidad en cualquier momento.
            Las modificaciones serán publicadas en nuestro sitio web y, cuando sean significativas,
            le notificaremos por correo electrónico.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Autoridad de Protección de Datos</h2>
          <p>
            Si considera que sus derechos han sido vulnerados, puede presentar una queja ante el
            Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI).
          </p>
          <p>
            Sitio web: <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer">www.inai.org.mx</a>
          </p>
        </section>

        <footer className={styles.footer}>
          <p>© {currentYear} Labor Wasser de México S.A. de C.V. Todos los derechos reservados.</p>
        </footer>
      </article>
    </div>
  )
}

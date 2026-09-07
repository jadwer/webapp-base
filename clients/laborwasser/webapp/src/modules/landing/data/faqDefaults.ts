/**
 * PREGUNTAS FRECUENTES (fallback)
 *
 * Las 5 preguntas del Figma del rediseno 2026-08. Son el fallback de la
 * seccion FAQ del home cuando app-config no trae `landing.faq` (JSON con la
 * misma forma). Las respuestas se editan desde Configuracion General sin
 * deploy; estas solo evitan que el home salga vacio.
 */

export interface FaqItem {
  question: string
  answer: string
}

export const faqDefaults: FaqItem[] = [
  {
    question: '¿Qué productos ofrece Labor Wasser de México?',
    answer:
      'Reactivos, material y equipo de laboratorio, consumibles, medios de cultivo, equipo de protección personal y soluciones para monitoreo y tratamiento de agua, de marcas líderes nacionales e internacionales.',
  },
  {
    question: '¿Cómo puedo hacer una cotización?',
    answer:
      'Agrega los productos que necesitas al carrito y elige "Cotizar", o escríbenos con el botón "Cotiza con nosotros". Un asesor te responderá con precios, disponibilidad y tiempos de entrega.',
  },
  {
    question: '¿Realizan envíos a toda la República Mexicana?',
    answer:
      'Sí. Enviamos a todo el país; el costo y el tiempo de entrega dependen del destino y del tipo de producto (algunos reactivos requieren transporte especializado).',
  },
  {
    question: '¿Los productos cuentan con certificados de calidad?',
    answer:
      'Sí. Trabajamos con marcas certificadas y podemos entregar certificados de análisis (COA) y hojas de seguridad (SDS) de los productos que lo requieran.',
  },
  {
    question: '¿Cómo puedo buscar un producto?',
    answer:
      'Usa el buscador de la parte superior (por nombre, marca o modelo) o navega por categorías en el menú Productos. Si no lo encuentras, contáctanos y lo localizamos por ti.',
  },
]

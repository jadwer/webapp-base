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
    question: '¿Que productos ofrece Labor Wasser de Mexico?',
    answer:
      'Reactivos, material y equipo de laboratorio, consumibles, medios de cultivo, equipo de proteccion personal y soluciones para monitoreo y tratamiento de agua, de marcas lideres nacionales e internacionales.',
  },
  {
    question: '¿Como puedo hacer una cotizacion?',
    answer:
      'Agrega los productos que necesitas al carrito y elige "Cotizar", o escribenos con el boton "Cotiza con nosotros". Un asesor te respondera con precios, disponibilidad y tiempos de entrega.',
  },
  {
    question: '¿Realizan envios a toda la Republica Mexicana?',
    answer:
      'Si. Enviamos a todo el pais; el costo y el tiempo de entrega dependen del destino y del tipo de producto (algunos reactivos requieren transporte especializado).',
  },
  {
    question: '¿Los productos cuentan con certificados de calidad?',
    answer:
      'Si. Trabajamos con marcas certificadas y podemos entregar certificados de analisis (COA) y hojas de seguridad (SDS) de los productos que lo requieran.',
  },
  {
    question: '¿Como puedo buscar un producto?',
    answer:
      'Usa el buscador de la parte superior (por nombre, marca o modelo) o navega por categorias en el menu Productos. Si no lo encuentras, contactanos y lo localizamos por ti.',
  },
]

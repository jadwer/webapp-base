/**
 * Catalogos SAT usados por el formulario de contactos.
 *
 * ESPEJO EXACTO de los codigos que acepta el backend en ContactRequest
 * (Rule::in de regimenFiscal y usoCfdi). Si el backend agrega un codigo,
 * agregarlo aqui tambien.
 *
 * Origen: bug 2026-07-30. Estos campos eran texto libre con placeholder
 * "Ej. 601 - General de Ley Personas Morales"; el usuario escribia el texto
 * completo tal como sugeria el placeholder y el backend (que solo acepta el
 * codigo) respondia 422. El formulario debe capturar el CODIGO via select.
 */

export interface SatCatalogEntry {
  code: string
  label: string
}

export const REGIMENES_FISCALES: SatCatalogEntry[] = [
  { code: '601', label: 'General de Ley Personas Morales' },
  { code: '603', label: 'Personas Morales con Fines no Lucrativos' },
  { code: '605', label: 'Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { code: '606', label: 'Arrendamiento' },
  { code: '607', label: 'Regimen de Enajenacion o Adquisicion de Bienes' },
  { code: '608', label: 'Demas ingresos' },
  { code: '610', label: 'Residentes en el Extranjero sin Establecimiento Permanente en Mexico' },
  { code: '611', label: 'Ingresos por Dividendos (socios y accionistas)' },
  { code: '612', label: 'Personas Fisicas con Actividades Empresariales y Profesionales' },
  { code: '614', label: 'Ingresos por intereses' },
  { code: '615', label: 'Regimen de los ingresos por obtencion de premios' },
  { code: '616', label: 'Sin obligaciones fiscales' },
  { code: '620', label: 'Sociedades Cooperativas de Produccion que optan por diferir sus ingresos' },
  { code: '621', label: 'Incorporacion Fiscal' },
  { code: '622', label: 'Actividades Agricolas, Ganaderas, Silvicolas y Pesqueras' },
  { code: '623', label: 'Opcional para Grupos de Sociedades' },
  { code: '624', label: 'Coordinados' },
  { code: '625', label: 'Regimen de las Actividades Empresariales con ingresos a traves de Plataformas Tecnologicas' },
  { code: '626', label: 'Regimen Simplificado de Confianza' },
]

export const USOS_CFDI: SatCatalogEntry[] = [
  { code: 'G01', label: 'Adquisicion de mercancias' },
  { code: 'G02', label: 'Devoluciones, descuentos o bonificaciones' },
  { code: 'G03', label: 'Gastos en general' },
  { code: 'I01', label: 'Construcciones' },
  { code: 'I02', label: 'Mobiliario y equipo de oficina por inversiones' },
  { code: 'I03', label: 'Equipo de transporte' },
  { code: 'I04', label: 'Equipo de computo y accesorios' },
  { code: 'I05', label: 'Dados, troqueles, moldes, matrices y herramental' },
  { code: 'I06', label: 'Comunicaciones telefonicas' },
  { code: 'I07', label: 'Comunicaciones satelitales' },
  { code: 'I08', label: 'Otra maquinaria y equipo' },
  { code: 'D01', label: 'Honorarios medicos, dentales y gastos hospitalarios' },
  { code: 'D02', label: 'Gastos medicos por incapacidad o discapacidad' },
  { code: 'D03', label: 'Gastos funerales' },
  { code: 'D04', label: 'Donativos' },
  { code: 'D05', label: 'Intereses reales efectivamente pagados por creditos hipotecarios' },
  { code: 'D06', label: 'Aportaciones voluntarias al SAR' },
  { code: 'D07', label: 'Primas por seguros de gastos medicos' },
  { code: 'D08', label: 'Gastos de transportacion escolar obligatoria' },
  { code: 'D09', label: 'Depositos en cuentas para el ahorro, primas de pensiones' },
  { code: 'D10', label: 'Pagos por servicios educativos (colegiaturas)' },
  { code: 'S01', label: 'Sin efectos fiscales' },
  { code: 'CP01', label: 'Pagos' },
  { code: 'CN01', label: 'Nomina' },
]

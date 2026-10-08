/**
 * Catalogos SAT del formulario de CFDI servidos por el backend (regla 7):
 * - uso CFDI y regimen fiscal: GET /api/v1/contact-catalogs (api-base
 *   Modules/Contacts/app/Support/SatCatalogs.php, la misma fuente que usa contactos)
 * - forma de pago: GET /api/v1/sat/forma-pago (tabla sat_forma_pago, modulo SatCatalogs)
 *
 * Los fallbacks son copia de esas fuentes y solo se usan si el endpoint falla.
 */

import axiosClient from '../lib/axiosClient'

export interface SatCatalogOption {
  code: string
  label: string
}

interface ContactCatalogsPayload {
  regimenes_fiscales: SatCatalogOption[]
  usos_cfdi: SatCatalogOption[]
}

interface SatFormaPagoRow {
  clave: string
  descripcion: string
}

// Copia de SatCatalogs::USOS_CFDI (api-base Modules/Contacts/app/Support/SatCatalogs.php)
export const FALLBACK_USOS_CFDI: SatCatalogOption[] = [
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

// Copia de SatCatalogs::REGIMENES_FISCALES
export const FALLBACK_REGIMENES_FISCALES: SatCatalogOption[] = [
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

// Copia del seeder de forma de pago (api-base Modules/SatCatalogs/Database/seeders/SatCatalogsSeeder.php)
export const FALLBACK_FORMAS_PAGO: SatCatalogOption[] = [
  { code: '01', label: 'Efectivo' },
  { code: '02', label: 'Cheque nominativo' },
  { code: '03', label: 'Transferencia electrónica de fondos' },
  { code: '04', label: 'Tarjeta de crédito' },
  { code: '05', label: 'Monedero electrónico' },
  { code: '06', label: 'Dinero electrónico' },
  { code: '17', label: 'Compensación' },
  { code: '28', label: 'Tarjeta de débito' },
  { code: '30', label: 'Aplicación de anticipos' },
  { code: '31', label: 'Intermediario pagos' },
  { code: '99', label: 'Por definir' },
]

export const satCfdiCatalogsService = {
  async getContactCatalogs(): Promise<ContactCatalogsPayload> {
    const response = await axiosClient.get('/api/v1/contact-catalogs')
    return response.data.data
  },

  async getFormasPago(): Promise<SatCatalogOption[]> {
    const response = await axiosClient.get('/api/v1/sat/forma-pago')
    const rows = (response.data?.data ?? []) as SatFormaPagoRow[]
    return rows.map(row => ({ code: row.clave, label: row.descripcion }))
  },
}

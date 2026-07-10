/**
 * Reports Module - Date Range Presets
 *
 * Shared date presets for report filter bars.
 * Same presets used by SalesAdvancedReportsPage (Phase 13).
 */

export const DATE_PRESETS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Ayer', value: 'yesterday' },
  { label: 'Ultimos 7 dias', value: '7days' },
  { label: 'Ultimos 30 dias', value: '30days' },
  { label: 'Este mes', value: 'thisMonth' },
  { label: 'Mes pasado', value: 'lastMonth' },
  { label: 'Este ano', value: 'thisYear' },
  { label: 'Personalizado', value: 'custom' },
]

export const getPresetDates = (preset: string): { startDate: string; endDate: string } => {
  const today = new Date()
  const endDate = today.toISOString().split('T')[0]

  switch (preset) {
    case 'today':
      return { startDate: endDate, endDate }
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yd = yesterday.toISOString().split('T')[0]
      return { startDate: yd, endDate: yd }
    }
    case '7days': {
      const d7 = new Date(today)
      d7.setDate(d7.getDate() - 7)
      return { startDate: d7.toISOString().split('T')[0], endDate }
    }
    case '30days': {
      const d30 = new Date(today)
      d30.setDate(d30.getDate() - 30)
      return { startDate: d30.toISOString().split('T')[0], endDate }
    }
    case 'thisMonth': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      return { startDate: firstDay.toISOString().split('T')[0], endDate }
    }
    case 'lastMonth': {
      const firstDayLast = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastDayLast = new Date(today.getFullYear(), today.getMonth(), 0)
      return {
        startDate: firstDayLast.toISOString().split('T')[0],
        endDate: lastDayLast.toISOString().split('T')[0],
      }
    }
    case 'thisYear': {
      const jan1 = new Date(today.getFullYear(), 0, 1)
      return { startDate: jan1.toISOString().split('T')[0], endDate }
    }
    default:
      return { startDate: endDate, endDate }
  }
}

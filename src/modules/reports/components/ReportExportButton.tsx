/**
 * ReportExportButton Component
 *
 * Button dropdown for exporting reports in different formats
 */

'use client'

import { useState } from 'react'
import { useReportExport } from '../hooks'

type ExportFormat = 'xlsx' | 'csv' | 'pdf'

interface ReportExportButtonProps {
  reportType: string
  params: Record<string, string | number>
  filename: string
  formats?: ExportFormat[]
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline-primary' | 'outline-secondary'
}

const FORMAT_INFO: Record<ExportFormat, { icon: string; label: string }> = {
  xlsx: { icon: 'bi-file-earmark-excel', label: 'Excel (.xlsx)' },
  csv: { icon: 'bi-filetype-csv', label: 'CSV (.csv)' },
  pdf: { icon: 'bi-file-earmark-pdf', label: 'PDF (.pdf)' },
}

export function ReportExportButton({
  reportType,
  params,
  filename,
  formats = ['xlsx', 'csv', 'pdf'],
  label = 'Exportar',
  size = 'md',
  variant = 'outline-secondary',
}: ReportExportButtonProps) {
  const { exportReport, isExporting, error } = useReportExport()
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    setSelectedFormat(format)
    const fullFilename = `${filename}.${format}`
    try {
      await exportReport(reportType, params, format, fullFilename)
    } finally {
      setSelectedFormat(null)
    }
  }

  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : ''

  if (formats.length === 1) {
    // Single format - just a button
    const format = formats[0]
    return (
      <button
        className={`btn btn-${variant} ${sizeClass}`}
        onClick={() => handleExport(format)}
        disabled={isExporting}
        title={error?.message}
      >
        {isExporting ? (
          <span className="spinner-border spinner-border-sm me-2" />
        ) : (
          <i className={`bi ${FORMAT_INFO[format].icon} me-2`} />
        )}
        {label}
      </button>
    )
  }

  // Multiple formats - dropdown
  return (
    <div className="dropdown">
      <button
        className={`btn btn-${variant} ${sizeClass} dropdown-toggle`}
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        disabled={isExporting}
      >
        {isExporting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" />
            Exportando...
          </>
        ) : (
          <>
            <i className="bi bi-download me-2" />
            {label}
          </>
        )}
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        {formats.map(format => (
          <li key={format}>
            <button
              className="dropdown-item d-flex align-items-center"
              onClick={() => handleExport(format)}
              disabled={isExporting && selectedFormat === format}
            >
              {isExporting && selectedFormat === format ? (
                <span className="spinner-border spinner-border-sm me-2" />
              ) : (
                <i className={`bi ${FORMAT_INFO[format].icon} me-2`} />
              )}
              {FORMAT_INFO[format].label}
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <div className="text-danger small mt-1">{error.message}</div>
      )}
    </div>
  )
}

export default ReportExportButton

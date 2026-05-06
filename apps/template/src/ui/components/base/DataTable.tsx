'use client'

import React, { ReactNode } from 'react'
import clsx from 'clsx'
import styles from '@/ui/styles/modules/DataTable.module.scss'

export interface DataTableColumn<T = Record<string, unknown>> {
  /** Clave única de la columna */
  key: string
  /** Título de la columna */
  title: ReactNode
  /** Función de render personalizada */
  render?: (value: unknown, record: T, index: number) => ReactNode
  /** Campo de datos a mostrar (si no hay render) */
  dataIndex?: keyof T
  /** Ancho de la columna */
  width?: string | number
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right'
  /** Si la columna se puede ordenar */
  sortable?: boolean
  /** Clase CSS personalizada para la celda */
  className?: string
}

export interface DataTableProps<T = Record<string, unknown>> {
  /** Datos a mostrar */
  data: T[]
  /** Definición de columnas */
  columns: DataTableColumn<T>[]
  /** Si está cargando */
  loading?: boolean
  /** Mensaje cuando no hay datos */
  emptyText?: ReactNode
  /** Mensaje de carga */
  loadingText?: ReactNode
  /** Si muestra bordes */
  bordered?: boolean
  /** Si muestra rayas alternas */
  striped?: boolean
  /** Si las filas son hovereables */
  hoverable?: boolean
  /** Tamaño de la tabla */
  size?: 'small' | 'medium' | 'large'
  /** Función de render para expandir filas (próximamente) */
  // expandedRowRender?: (record: T, index: number) => ReactNode
  /** Callback al hacer click en una fila */
  onRowClick?: (record: T, index: number) => void
  /** Clase personalizada */
  className?: string
  /** ID único para la clave de las filas */
  rowKey?: keyof T | ((record: T, index: number) => string)
}

export const DataTable = <T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyText = 'No hay datos disponibles',
  loadingText = 'Cargando...',
  bordered = false,
  striped = false,
  hoverable = true,
  size = 'medium',
  // expandedRowRender,
  onRowClick,
  className,
  rowKey = 'id'
}: DataTableProps<T>) => {
  
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record, index)
    }
    return String(record[rowKey] || index)
  }

  const getCellValue = (record: T, column: DataTableColumn<T>, index: number): ReactNode => {
    if (column.render) {
      return column.render(
        column.dataIndex ? record[column.dataIndex] : record,
        record,
        index
      )
    }
    
    if (column.dataIndex) {
      const value = record[column.dataIndex]
      // Convert primitive values to ReactNode
      if (value === null || value === undefined) return null
      if (typeof value === 'string' || typeof value === 'number') return value
      return String(value)
    }
    
    return null
  }

  const renderTableBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className={styles.emptyCell}>
              <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <span>{loadingText}</span>
              </div>
            </td>
          </tr>
        </tbody>
      )
    }

    if (!data || data.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length} className={styles.emptyCell}>
              <div className={styles.emptyContainer}>
                <i className="bi bi-inbox" style={{ fontSize: '2rem', opacity: 0.5 }} />
                <div>{emptyText}</div>
              </div>
            </td>
          </tr>
        </tbody>
      )
    }

    return (
      <tbody>
        {data.map((record, index) => (
          <tr
            key={getRowKey(record, index)}
            className={clsx({
              [styles.clickableRow]: onRowClick
            })}
            onClick={() => onRowClick?.(record, index)}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className={clsx(
                  column.align && styles[`align-${column.align}`],
                  column.className
                )}
                style={{ width: column.width }}
              >
                {getCellValue(record, column, index)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    )
  }

  return (
    <div className={clsx(styles.tableContainer, className)}>
      <table
        className={clsx(
          styles.table,
          styles[size],
          {
            [styles.bordered]: bordered,
            [styles.striped]: striped,
            [styles.hoverable]: hoverable,
          }
        )}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx(
                  column.align && styles[`align-${column.align}`],
                  column.sortable && styles.sortable
                )}
                style={{ width: column.width }}
              >
                {column.title}
                {column.sortable && (
                  <i className="bi bi-chevron-expand ms-1" />
                )}
              </th>
            ))}
          </tr>
        </thead>
        {renderTableBody()}
      </table>
    </div>
  )
}

export default DataTable
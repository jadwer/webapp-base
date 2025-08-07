'use client'

import React, { useState } from 'react'
import { Card } from '@/ui/components/base'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { usePages, usePageActions } from '../hooks/usePages'
import PagesTableDS from '../components/PagesTableDS'
import PagesFilters from '../components/PagesFilters'
import PaginationControls from '../components/PaginationControls'
import type { PageFilters } from '../types/page'

interface PagesAdminTemplateProps {
  onCreatePage?: () => void
  onEditPage?: (pageId: string) => void
  onViewPage?: (pageId: string) => void
  className?: string
}

export const PagesAdminTemplate: React.FC<PagesAdminTemplateProps> = ({
  onCreatePage,
  onEditPage,
  onViewPage,
  className
}) => {
  const navigation = useNavigationProgress()
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<PageFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const { pages, meta, isLoading, error, refreshPages } = usePages(filters, currentPage)
  const { deletePage, duplicatePage, error: actionError } = usePageActions()

  const handleFiltersChange = (newFilters: PageFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleClearFilters = () => {
    setFilters({ sortBy: 'created_at', sortOrder: 'desc' })
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditPage = (page: { id: string }) => {
    if (onEditPage) {
      onEditPage(page.id)
    } else {
      navigation.push(`/dashboard/pages/${page.id}/edit`)
    }
  }

  const handleViewPage = (page: { id: string; slug: string }) => {
    if (onViewPage) {
      onViewPage(page.id)
    } else {
      // Open in new tab
      window.open(`/p/${page.slug}`, '_blank')
    }
  }

  const handleDeletePage = async (pageId: string) => {
    const success = await deletePage(pageId)
    if (success) {
      refreshPages()
      
      // If we're on a page with no results after deletion, go back to page 1
      if (pages.length === 1 && currentPage > 1) {
        setCurrentPage(1)
      }
    }
  }

  const handleDuplicatePage = async (pageId: string) => {
    await duplicatePage(pageId)
    refreshPages()
  }

  const handleCreatePage = () => {
    if (onCreatePage) {
      onCreatePage()
    } else {
      navigation.push('/dashboard/pages/create')
    }
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Gestión de Páginas</h1>
          <p className="text-muted mb-0">
            Administra y edita las páginas de tu sitio web
          </p>
        </div>
        
        <Button
          variant="primary"
          onClick={handleCreatePage}
          startIcon={<i className="bi bi-plus-lg" />}
        >
          Nueva Página
        </Button>
      </div>

      {/* Error Messages */}
      {(error || actionError) && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {error?.message || actionError || 'Ha ocurrido un error'}
        </div>
      )}

      <Card>
        {/* Filters */}
        <div className="p-3 border-bottom">
          <PagesFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Table */}
        <PagesTableDS
          pages={pages}
          isLoading={isLoading}
          onEdit={handleEditPage}
          onDelete={handleDeletePage}
          onDuplicate={handleDuplicatePage}
          onViewPage={handleViewPage}
        />

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="p-3 border-top">
            <PaginationControls
              meta={meta}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default PagesAdminTemplate
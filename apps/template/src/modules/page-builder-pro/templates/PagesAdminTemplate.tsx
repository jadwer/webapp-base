'use client'

import React, { useState } from 'react'
import { Card } from '@/ui/components/base'
import { Button } from '@/ui/components/base'
import { useNavigationProgress } from '@/ui/hooks/useNavigationProgress'
import { usePages, usePageActions, useSoftDeleteActions } from '../hooks/usePages'
import PagesTableDS from '../components/PagesTableDS'
import PagesFilters from '../components/PagesFilters'
import PaginationControls from '../components/PaginationControls'
import DeletedPagesPanel from '../components/DeletedPagesPanel'
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
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')
  const [filters, setFilters] = useState<PageFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  const { pages, meta, isLoading, error, refreshPages } = usePages(filters, currentPage)
  const { duplicatePage, error: actionError } = usePageActions()
  const { softDeletePage, error: softDeleteError } = useSoftDeleteActions()

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

  const handleSoftDeletePage = async (pageId: string) => {
    const result = await softDeletePage(pageId)
    if (result) {
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
      {(error || actionError || softDeleteError) && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {error?.message || actionError || softDeleteError || 'Ha ocurrido un error'}
        </div>
      )}

      {/* Tabs */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <Button
          variant={activeTab === 'active' ? 'primary' : 'secondary'}
          buttonStyle={activeTab === 'active' ? 'filled' : 'outline'}
          onClick={() => setActiveTab('active')}
          startIcon={<i className="bi bi-file-text" />}
        >
          Páginas Activas
        </Button>
        <Button
          variant={activeTab === 'deleted' ? 'primary' : 'secondary'}
          buttonStyle={activeTab === 'deleted' ? 'filled' : 'outline'}
          onClick={() => setActiveTab('deleted')}
          startIcon={<i className="bi bi-trash" />}
        >
          Páginas Eliminadas
        </Button>
      </div>

      <Card>
        {activeTab === 'active' ? (
          <>
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
              onDelete={handleSoftDeletePage}
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
          </>
        ) : (
          /* Deleted Pages Panel */
          <div className="p-3">
            <DeletedPagesPanel
              onPageRestored={refreshPages}
              onPagePermanentlyDeleted={refreshPages}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default PagesAdminTemplate
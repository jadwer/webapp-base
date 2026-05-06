/**
 * WishlistButton Component
 *
 * Button to add/remove products from wishlist
 */

'use client'

import { useState, useEffect } from 'react'
import { useWishlists, useWishlistMutations } from '../hooks/useWishlist'
import { toast } from '@/lib/toast'

interface WishlistButtonProps {
  productId: number
  isAuthenticated?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function WishlistButton({
  productId,
  isAuthenticated = false,
  size = 'md',
  showLabel = false,
  className = '',
}: WishlistButtonProps) {
  const { wishlists, isLoading, mutate } = useWishlists()
  const { addItem, removeItem, createWishlist, isAddingItem, isRemovingItem } = useWishlistMutations()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [currentItemId, setCurrentItemId] = useState<string | null>(null)

  // For now, we'll just provide the add functionality
  // Full wishlist item checking would require additional API calls
  useEffect(() => {
    // Reset state when component mounts or product changes
    setIsInWishlist(false)
    setCurrentItemId(null)
  }, [productId])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.info('Inicia sesion para agregar a tu lista de deseos')
      return
    }

    try {
      if (isInWishlist && currentItemId) {
        await removeItem(currentItemId)
        setIsInWishlist(false)
        setCurrentItemId(null)
      } else {
        let targetWishlistId: number

        if (wishlists.length === 0) {
          // Create default wishlist if none exists
          const newWishlist = await createWishlist({
            name: 'Mi Lista de Deseos',
            isPublic: false,
          })
          targetWishlistId = parseInt(newWishlist.id)
        } else {
          targetWishlistId = parseInt(wishlists[0].id)
        }

        const newItem = await addItem(targetWishlistId, productId)
        setIsInWishlist(true)
        setCurrentItemId(newItem.id)
      }
      await mutate()
    } catch (error) {
      console.error('Error updating wishlist:', error)
    }
  }

  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }

  const iconSize = {
    sm: '14',
    md: '16',
    lg: '20',
  }

  const isProcessing = isAddingItem || isRemovingItem

  return (
    <button
      type="button"
      className={`btn ${isInWishlist ? 'btn-danger' : 'btn-outline-secondary'} ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
      disabled={isLoading || isProcessing}
      title={isInWishlist ? 'Quitar de lista de deseos' : 'Agregar a lista de deseos'}
    >
      {isProcessing ? (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
      ) : (
        <i
          className={`bi ${isInWishlist ? 'bi-heart-fill' : 'bi-heart'}`}
          style={{ fontSize: `${iconSize[size]}px` }}
        />
      )}
      {showLabel && (
        <span className="ms-2">
          {isInWishlist ? 'En mi lista' : 'Agregar a lista'}
        </span>
      )}
    </button>
  )
}

export default WishlistButton

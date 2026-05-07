/**
 * LABORWASSER LANDING TYPES
 * Type definitions for landing page components
 */

// Navigation types
export interface NavigationItem {
  label: string
  href: string
  submenu?: NavigationItem[]
}

// Product offer types (for featured products)
export interface ProductOffer {
  id: string
  name: string
  originalPrice?: number
  salePrice: number
  image?: string
  isExclusive?: boolean
  badge?: string
}

// Brand logo types
export interface BrandLogo {
  id: string
  name: string
  logo: string
  website?: string
}

// Contact information types
export interface ContactInfo {
  phone: string
  email: string
  address: string
  schedule: string
}

// Social media types
export interface SocialMedia {
  platform: 'facebook' | 'instagram' | 'linkedin' | 'whatsapp'
  url: string
  icon: string
}
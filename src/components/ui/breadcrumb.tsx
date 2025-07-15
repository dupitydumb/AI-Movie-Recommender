"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
  isCurrentPage?: boolean
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Auto-generate breadcrumbs if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ]
    
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // Format segment labels
      let label = segment
      if (segment === 'movie') {
        label = 'Movies'
      } else if (segment === 'watch') {
        label = 'Watch'
      } else if (segment === 'about') {
        label = 'About'
      } else if (segment === 'docs') {
        label = 'Documentation'
      } else if (segment === 'price') {
        label = 'Pricing'
      } else if (/^\d+$/.test(segment)) {
        // This is likely a movie ID, we'll handle this in the component usage
        label = `Movie ${segment}`
      } else {
        // Capitalize first letter and replace hyphens with spaces
        label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      }
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: isLast
      })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbItems = items || generateBreadcrumbs()
  
  if (breadcrumbItems.length <= 1) {
    return null
  }
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 ${className}`}
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            )}
            
            {item.isCurrentPage ? (
              <span 
                className="text-gray-900 dark:text-gray-100 font-medium"
                aria-current="page"
              >
                {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// Structured data for breadcrumbs (SEO)
export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://Screenpick.fun${item.href}`
    }))
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

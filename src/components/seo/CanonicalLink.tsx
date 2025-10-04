'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'

export function CanonicalLink() {
  const pathname = usePathname()
  const baseUrl = 'https://screenpick.fun'
  
  // Ensure trailing slash for home page, no trailing slash for others
  const canonicalUrl = pathname === '/' 
    ? `${baseUrl}/` 
    : `${baseUrl}${pathname}`

  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  )
}
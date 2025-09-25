import { Metadata } from 'next'

interface PageMetadataProps {
  title: string
  description: string
  path: string
  keywords?: string
  image?: string
  noIndex?: boolean
  canonicalUrl?: string
}

export function generatePageMetadata({
  title,
  description,
  path,
  keywords,
  image,
  noIndex = false,
  canonicalUrl
}: PageMetadataProps): Metadata {
  // NOTE: use lowercase domain form for canonical consistency
  const baseUrl = 'https://screenpick.fun'
  const fullUrl = `${baseUrl}${path}`
  const canonical = canonicalUrl || fullUrl
  
  // Default image
  const defaultImage = "https://opengraph.b-cdn.net/production/images/2161793f-193f-4d1d-81af-c32901853530.jpg?token=LzPD2V4bNX5B8NQ59qUlIwyPh5Ptq0irwzYZzlz_f0A&height=630&width=1200&expires=33278216178"
  const metaImage = image || defaultImage
  
  return {
    title: {
      default: title,
      template: "%s | Screenpick - AI Movie Recommender"
    },
    description,
    keywords: keywords || "AI movie recommendations, movie recommendation engine, find movies, movie suggestions",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: "Screenpick",
      title,
      description,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [metaImage],
      creator: "@Screenpick",
    },
    alternates: {
      canonical,
    },
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

// Movie-specific metadata generator
interface MovieMetadataProps {
  movieId: string
  movieTitle?: string
  movieDescription?: string
  releaseYear?: string
  genres?: string[]
  rating?: number
  posterUrl?: string
}

export function generateMovieMetadata({
  movieId,
  movieTitle = "Movie Details",
  movieDescription,
  releaseYear,
  genres = [],
  rating,
  posterUrl
}: MovieMetadataProps): Metadata {
  const baseUrl = 'https://screenpick.fun'
  const path = `/movie/${movieId}/watch`
  const canonical = `${baseUrl}${path}`
  
  // Enhanced title for SEO
  const seoTitle = movieTitle + 
    (releaseYear ? ` (${releaseYear})` : '') + 
    (genres.length > 0 ? ` - ${genres.slice(0, 2).join(', ')} Movie` : ' - Movie Details') +
    (rating ? ` | ${rating}/10 Rating` : '')
  
  // Enhanced description
  const seoDescription = movieDescription || 
    `Watch ${movieTitle}${releaseYear ? ` (${releaseYear})` : ''} online. ` +
    `${genres.length > 0 ? `${genres.join(', ')} movie. ` : ''}` +
    `Find where to stream, rent, or buy this movie with our AI-powered movie recommendation engine.`
  
  // Keywords
  const movieKeywords = [
    movieTitle,
    `${movieTitle} movie`,
    `watch ${movieTitle}`,
    `${movieTitle} streaming`,
    `${movieTitle} online`,
    ...genres.map(genre => `${genre} movies`),
    'movie recommendations',
    'where to watch movies',
    'movie streaming guide'
  ].join(', ')
  
  return generatePageMetadata({
    title: seoTitle,
    description: seoDescription,
    path,
    keywords: movieKeywords,
    image: posterUrl,
    canonicalUrl: canonical
  })
}

// Utility to handle pagination canonical URLs
export function getPaginationCanonical(basePath: string, page: number): string {
  const baseUrl = 'https://screenpick.fun'
  if (page <= 1) {
    return `${baseUrl}${basePath}`
  }
  return `${baseUrl}${basePath}?page=${page}`
}

// Utility to handle sorting/filtering canonical URLs
export function getFilteredCanonical(basePath: string, params: Record<string, string>): string {
  const baseUrl = 'https://screenpick.fun'
  const searchParams = new URLSearchParams()
  
  // Only include important SEO parameters, exclude temporary filters
  const seoParams = ['genre', 'year', 'rating', 'sort']
  
  Object.entries(params).forEach(([key, value]) => {
    if (seoParams.includes(key) && value) {
      searchParams.set(key, value)
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `${baseUrl}${basePath}?${queryString}` : `${baseUrl}${basePath}`
}

import { generateMovieMetadata } from '@/lib/metadata'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

interface MoviePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// Fetch movie data for metadata
async function getMovieData(id: string) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.TMDB}`,
          'accept': 'application/json',
        },
        // Revalidate every hour
        next: { revalidate: 3600 }
      }
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      id: data.id,
      title: data.title,
      description: data.overview,
      releaseYear: data.release_date?.substring(0, 4),
      genres: data.genres?.map((g: any) => g.name) || [],
      rating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : undefined,
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : undefined
    }
  } catch (error) {
    console.error('Error fetching movie data:', error)
    return null
  }
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const resolvedParams = await params
  const movieData = await getMovieData(resolvedParams.id)
  
  if (!movieData) {
    return {
      title: 'Movie Not Found',
      description: 'The requested movie could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  return generateMovieMetadata({
    movieId: resolvedParams.id,
    movieTitle: movieData.title,
    movieDescription: movieData.description,
    releaseYear: movieData.releaseYear,
    genres: movieData.genres,
    rating: movieData.rating,
    posterUrl: movieData.posterUrl
  })
}

export default async function MoviePage({ params }: MoviePageProps) {
  const resolvedParams = await params
  // Redirect to the watch page since that's where the actual content is
  redirect(`/movie/${resolvedParams.id}/watch`)
}

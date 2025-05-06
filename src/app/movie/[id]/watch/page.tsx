"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { WatchOptions } from "@/components/ui/watch-options"
import { MovieDetails } from "@/components/ui/movie-details"
import { FadeIn } from "@/components/animation/fade-in"
import { Loader2 } from "lucide-react"

export default function WatchMoviePage() {
  const params = useParams()
  const movieId = params.id as string

  const [movie, setMovie] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dummyMovie = {
    id: movieId,
    title: "Inception",
    year: "2010",
    genre: ["Action", "Sci-Fi", "Thriller"],
    rating: 8.8,
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
    imageUrl: "/placeholder.svg?height=300&width=200&text=Inception",
    duration: "2h 28m",
  }

    useEffect(() => {
        // Simulate an API call to fetch movie details
        const fetchMovieDetails = async () => {
        try {
            // Simulating a delay for loading
            await new Promise((resolve) => setTimeout(resolve, 1000))
    
            // In a real app, you would fetch the movie details from an API
            // const response = await fetch(`/api/movies/${movieId}`)
            // if (!response.ok) throw new Error("Movie not found")
            // const data = await response.json()
    
            // For now, we'll use the dummy movie data
            setMovie(dummyMovie)
        } catch (err) {
            setError("Failed to load movie details.")
        } finally {
            setIsLoading(false)
        }
        }
    
        fetchMovieDetails()
    }, [movieId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-purple-500 animate-spin mb-4" />
            <p className="text-xl text-gray-300">Loading movie details...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Movie Not Found</h1>
            <p className="text-xl text-gray-300">We couldn't find the movie you're looking for.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <FadeIn>
          <div className="mb-8">
            <MovieDetails movie={movie} />
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <WatchOptions movieId={movieId} />
        </FadeIn>
      </main>
      <Footer />
    </div>
  )
}


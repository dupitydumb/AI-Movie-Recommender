"use client"

"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { WatchOptions } from "@/components/ui/watch-options"
import { MovieDetails } from "@/components/ui/movie-details"
import { FadeIn } from "@/components/animation/fade-in"
import { Loader2 } from "lucide-react"
import { SimilarMovies } from "@/app/components/similar-movies";
import { useRouter } from 'next/navigation';

export default function WatchMoviePage() {
  const params = useParams();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<any>(null);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [watchProviders, setWatchProviders] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setIsLoading(true);
        const apiKey = process.env.TMDB;
        console.log("API Key:", apiKey);
        const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US`;
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${apiKey}`
          }
        };

        try {
          const response = await fetch(url, options);
          const data = await response.json();

          const movieData = {
            id: data.id,
            title: data.title,
            year: data.release_date.substring(0, 4),
            genre: data.genres.map((genre: any) => genre.name),
            rating: data.vote_average,
            description: data.overview,
            imageUrl: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
            duration: `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m`,
          };

          setMovie(movieData);

          // Fetch watch providers
          const watchProvidersUrl = `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?language=en-US`;
          const watchProvidersOptions = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${apiKey}`
            }
          };

          const watchProvidersResponse = await fetch(watchProvidersUrl, watchProvidersOptions);
          const watchProvidersData = await watchProvidersResponse.json();

          console.log("Watch Providers:", watchProvidersData);

          setWatchProviders(watchProvidersData);

          // Fetch similar movies
          const similarMoviesUrl = `https://api.themoviedb.org/3/movie/${movieId}/similar?language=en-US&page=1`;
          const similarMoviesOptions = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${apiKey}`
            }
          };

          const similarMoviesResponse = await fetch(similarMoviesUrl, similarMoviesOptions);
          const similarMoviesData = await similarMoviesResponse.json();

          console.log("Similar Movies:", similarMoviesData);

          setSimilarMovies(similarMoviesData.results);

        } catch (err: any) {
          setError("Failed to load movie details.");
        }
        finally {
          setIsLoading(false);
        }
      } catch (error: any) {
        setError("Failed to load movie details.");
      }
    };

    fetchMovieDetails();
  }, [movieId]);

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Error</h1>
            <p className="text-xl text-gray-300">{error}</p>
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
            <p className="text-xl text-gray-300">
              We couldn't find the movie you're looking for.
            </p>
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
          <WatchOptions movieId={movieId} watchProviders={watchProviders} />
        </FadeIn>

        <FadeIn delay={0.4}>
          <SimilarMovies movies={similarMovies} />
        </FadeIn>
      </main>
      <Footer />
    </div>
  )
}

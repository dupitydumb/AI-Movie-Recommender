"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { WatchOptions } from "@/components/ui/watch-options"
import { MovieDetails } from "@/components/ui/movie-details"
import { Breadcrumb, BreadcrumbStructuredData } from "@/components/ui/breadcrumb"
import { motion } from "framer-motion"
import { ArrowLeft, Film, Clock } from "lucide-react"
import { SimilarMovies } from "@/app/components/similar-movies";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WatchMoviePage() {
  const params = useParams();
  const movieId = params.id as string;

  const [movie, setMovie] = useState<any>(null);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [watchProviders, setWatchProviders] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Breadcrumb items for structured data
  const breadcrumbItems = movie ? [
    { label: 'Home', href: '/' },
    { label: 'Movies', href: '/movie' },
    { label: movie.title, href: `/movie/${movieId}/watch`, isCurrentPage: true }
  ] : [];

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
            imageUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "/placeholder-movie.jpg",
            duration: `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m`,
          };

          console.log("Movie Data:", movieData);
          console.log("Image URL:", movieData.imageUrl);

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
          const similarMoviesUrl = `https://api.themoviedb.org/3/movie/${movieId}/recommendations?language=en-US&page=1`;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Header />
          <main className="flex-1 px-4 py-20 flex items-center justify-center">
            <motion.div 
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex flex-col items-center gap-6 mb-12">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-gray-800 rounded-full"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-t-red-500 rounded-full animate-spin"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-white">Loading movie details</p>
                  <p className="text-gray-400">Please wait while we fetch the information...</p>
                </div>
              </div>
            </motion.div>
          </main>
          <Footer />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Header />
          <main className="flex-1 px-4 py-20">
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-md mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center"
                >
                  <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Film className="w-8 h-8 text-red-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4 text-red-400">Something went wrong</h1>
                  <p className="text-lg text-gray-300 mb-6">{error}</p>
                  <Link href="/">
                    <Button className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </main>
          <Footer />
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <Header />
          <main className="flex-1 px-4 py-20">
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-md mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-gray-900/30 border border-gray-800/50 rounded-2xl text-center"
                >
                  <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Film className="w-8 h-8 text-gray-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4 text-white">Movie Not Found</h1>
                  <p className="text-lg text-gray-300 mb-6">
                    We couldn't find the movie you're looking for.
                  </p>
                  <Link href="/">
                    <Button className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </main>
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <Header />
        
        {/* Breadcrumb Navigation */}
        <section className="relative pt-8 pb-4 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Breadcrumb items={breadcrumbItems} className="mb-4" />
            </motion.div>
          </div>
        </section>

        <main className="relative overflow-hidden">
          {/* Hero Section with Movie Details */}
          <section className="relative z-10 pt-8 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-12"
              >
                <MovieDetails movie={movie} />
              </motion.div>
            </div>
          </section>

          {/* Watch Options Section */}
          <section className="relative z-10 py-16 px-4 bg-gray-950/50">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <WatchOptions movieId={movieId} watchProviders={watchProviders} />
              </motion.div>
            </div>
          </section>

          {/* Similar Movies Section */}
          <section className="relative z-10 py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <SimilarMovies movies={similarMovies} />
              </motion.div>
            </div>
          </section>
        </main>
        
        <Footer />
        
        {/* Structured Data for Breadcrumbs */}
        {breadcrumbItems.length > 0 && <BreadcrumbStructuredData items={breadcrumbItems} />}
      </div>
    </div>
  )
}

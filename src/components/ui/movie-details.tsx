"use client"

import Image from "next/image"
import { Star, Clock, Calendar, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useState } from "react"

interface MovieDetailsProps {
  movie: {
    id: string
    title: string
    year: string
    genre: string[]
    rating: number
    description: string
    imageUrl: string
    duration?: string
  }
}

export function MovieDetails({ movie }: MovieDetailsProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-700/50 transition-all duration-300">
      <div className="md:flex">
        <motion.div
          className="w-full md:w-1/3 lg:w-1/4 relative aspect-[2/3] md:h-[600px]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative overflow-hidden h-full rounded-l-2xl md:rounded-l-2xl md:rounded-r-none">
            {/* Loading placeholder */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Main image */}
            {!imageError ? (
              <Image
                src={movie.imageUrl}
                alt={movie.title}
                fill
                className={`object-cover transition-all duration-500 hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              /* Fallback image */
              <Image
                src="/placeholder-movie.jpg"
                alt={movie.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
          </div>
        </motion.div>

        <div className="p-8 md:w-2/3 lg:w-3/4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-full">
                <Calendar className="h-4 w-4 text-red-400" />
                <span className="text-gray-300 font-medium">{movie.year}</span>
              </div>

              {movie.duration && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-full">
                  <Clock className="h-4 w-4 text-red-400" />
                  <span className="text-gray-300 font-medium">{movie.duration}</span>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">{movie.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {movie.genre.map((genre, index) => (
                <motion.div 
                  key={genre} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200">
                    {genre}
                  </Badge>
                </motion.div>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{movie.description}</p>
              </div>

              <div className="border-t border-gray-800/50 pt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium">
                  <ExternalLink className="w-4 h-4" />
                  Where to Watch
                </div>
                <p className="text-gray-400 mt-3 leading-relaxed">
                  Find all the streaming services and rental options for "{movie.title}" below.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

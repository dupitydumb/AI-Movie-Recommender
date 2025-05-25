"use client"

import Image from "next/image"
import { Star, Clock, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

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
  return (
    <div className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
      <div className="md:flex">
        <motion.div
          className="w-full md:w-1/3 lg:w-1/4 relative aspect-[2/3] md:aspect-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={movie.imageUrl || "/placeholder.svg"}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ maxWidth: "100%" }}
          />
        </motion.div>

        <div className="p-6 md:w-2/3 lg:w-3/4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{movie.year}</span>
              </div>

              {movie.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{movie.duration}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="h-4 w-4 fill-yellow-400" />
                <span>{movie.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genre.map((genre) => (
                <motion.div key={genre} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Badge variant="secondary" className="bg-gray-700 hover:bg-gray-600">
                    {genre}
                  </Badge>
                </motion.div>
              ))}
            </div>

            <p className="text-gray-300 mb-6">{movie.description}</p>

            <div className="text-xl font-semibold text-purple-400 mb-2">Where to Watch</div>
            <p className="text-gray-300">
              Find all the streaming services and rental options for "{movie.title}" below.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

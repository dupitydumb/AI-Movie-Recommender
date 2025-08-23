"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Star, Calendar, Clock, MoreVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { toaster } from "@/components/ui/toaster";

interface MovieCardWithActionsProps {
  movie: {
    id: string;
    title: string;
    poster_path?: string;
    backdrop_path?: string;
    release_date?: string;
    vote_average?: number;
    runtime?: number;
    overview?: string;
    genres?: Array<{ id: number; name: string }>;
  };
  onSave?: (movieId: string) => void;
  onAddToList?: (movieId: string) => void;
  isSaved?: boolean;
  showSaveActions?: boolean;
  className?: string;
}

export function MovieCardWithActions({
  movie,
  onSave,
  onAddToList,
  isSaved = false,
  showSaveActions = true,
  className = ""
}: MovieCardWithActionsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { user } = useAuth();

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-movie.jpg';

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  const rating = movie.vote_average ? (movie.vote_average / 2).toFixed(1) : '';

  const handleSave = () => {
    if (!user) {
      toaster.create({
        title: "Authentication Required",
        description: "Please sign in to save movies",
      });
      return;
    }

    if (onSave) {
      onSave(movie.id);
    }
  };

  const handleAddToList = () => {
    if (!user) {
      toaster.create({
        title: "Authentication Required", 
        description: "Please sign in to create lists",
      });
      return;
    }

    if (onAddToList) {
      onAddToList(movie.id);
    }
  };

  return (
    <motion.div
      layout
      className={`group relative bg-gray-900/50 border border-gray-800/50 rounded-2xl overflow-hidden hover:border-gray-700/50 transition-all duration-300 hover:scale-[1.02] ${className}`}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {!imageError ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-700 rounded-lg flex items-center justify-center">
                📽️
              </div>
              <p className="text-sm font-medium">{movie.title}</p>
            </div>
          </div>
        )}

        {/* Overlay with Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {showSaveActions && (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                    isSaved
                      ? 'bg-red-500/90 text-white'
                      : 'bg-black/50 text-white hover:bg-red-500/90'
                  }`}
                >
                  {isSaved ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToList}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-gray-700/90 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>

                <div className="relative ml-auto">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-gray-700/90 transition-all duration-200"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </motion.button>

                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-2 shadow-lg"
                      >
                        <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm">
                          View Details
                        </button>
                        <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm">
                          Add to Watchlist
                        </button>
                        <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm">
                          Share
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-white text-xs font-medium">{rating}</span>
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-3 text-gray-400 text-sm mb-3">
          {year && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{year}</span>
            </div>
          )}
          {movie.runtime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{movie.runtime}m</span>
            </div>
          )}
        </div>

        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {movie.genres.slice(0, 3).map((genre) => (
              <span
                key={genre.id}
                className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {movie.overview && (
          <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
            {movie.overview}
          </p>
        )}
      </div>
    </motion.div>
  );
}

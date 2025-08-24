import { Star, Play, Info, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

interface MovieCardProps {
  id: string;
  title: string;
  releaseYear?: string | null; // may be undefined / null
  rating?: number | null;      // may be undefined / null
  posterPath: string;
  aireview: string;
  className?: string;
}

export function MovieCard({
  id,
  title,
  releaseYear,
  rating,
  posterPath,
  aireview,
  className,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Safely derive year
  let year: number | null = null;
  if (releaseYear) {
    const parsed = new Date(releaseYear);
    if (!isNaN(parsed.getTime())) {
      year = parsed.getFullYear();
    }
  }

  // Normalize rating for styling logic
  const numericRating = typeof rating === 'number' && isFinite(rating) ? rating : null;
  const ratingColor = numericRating === null
    ? "text-gray-300"
    : numericRating >= 8
      ? "text-green-400"
      : numericRating >= 6
        ? "text-yellow-400"
        : "text-red-400";
  const ratingBgColor = numericRating === null
    ? "bg-gray-400/20"
    : numericRating >= 8
      ? "bg-green-400/20"
      : numericRating >= 6
        ? "bg-yellow-400/20"
        : "bg-red-400/20";

  const handleCardClick = () => {
    if (typeof window !== 'undefined') {
      // On mobile, toggle expanded state first, then navigate on second click
      if (window.innerWidth < 640) {
        if (!isMobileExpanded) {
          setIsMobileExpanded(true);
          return;
        }
      }
      // Navigate to movie page
      window.location.href = `/movie/${id}/watch/`;
    }
  };

  const showOverlay = isHovered || isMobileExpanded;

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 hover:border-gray-700 transition-all duration-300 aspect-[2/3] cursor-pointer ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      onClick={handleCardClick}
      layout
    >
      {/* Poster Image - Full Card */}
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={posterPath ? `https://image.tmdb.org/t/p/w500/${posterPath}` : "/placeholder-movie.jpg"}
          alt={`${title} poster`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={false}
        />
        
        {/* Gradient Overlay - Always present but subtle */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Enhanced Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge - Always Visible */}
        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full ${ratingBgColor} backdrop-blur-sm border border-white/20 z-20`}>
          <Star className={`w-3 h-3 ${ratingColor} fill-current`} />
          <span className={`text-xs font-semibold ${ratingColor}`}>
            {numericRating !== null ? numericRating.toFixed(1) : 'N/A'}
          </span>
        </div>

        {/* Basic Title - Always Visible at Bottom (Hidden on Hover) */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 z-10 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ 
            opacity: showOverlay ? 0 : 1,
            y: showOverlay ? 10 : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="font-bold text-lg text-white leading-tight line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3 h-3 text-gray-300" />
            <span className="text-sm text-gray-300 font-medium drop-shadow-lg">
              {year ?? "Unknown"}
            </span>
          </div>
        </motion.div>

        {/* Hover Overlay with Detailed Information */}
        <motion.div
          className="absolute inset-0 flex flex-col justify-end p-4 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: showOverlay ? 1 : 0,
            y: showOverlay ? 0 : 20 
          }}
          transition={{ duration: 0.3 }}
          style={{ pointerEvents: showOverlay ? 'auto' : 'none' }}
        >
          {/* Enhanced Title on Hover */}
          <div className="mb-4">
            <h3 className="font-bold text-xl text-white leading-tight mb-2 group-hover:text-red-400 transition-colors duration-200">
              {title}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-300" />
              <span className="text-sm text-gray-300 font-medium">
                {year ?? "Unknown"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-sm text-gray-200 leading-relaxed line-clamp-3">
              {aireview}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link href={`/movie/${id}/watch/`} className="flex-1">
              <Button
                size="sm"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-3 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-red-500/50"
                onClick={(e) => e.stopPropagation()}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Now
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-105 px-3"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Mobile Touch Indicator */}
        <div className="absolute top-3 left-3 sm:hidden opacity-70 pointer-events-none">
          <div className="bg-black/30 backdrop-blur-sm rounded-full p-2">
            <Info className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

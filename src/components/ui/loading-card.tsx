import { motion } from "framer-motion";

interface LoadingCardProps {
  count?: number;
}

export function LoadingCard({ count = 1 }: LoadingCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-hidden rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800/50"
        >
          {/* Poster skeleton */}
          <div className="relative aspect-[2/3] bg-gray-800/50 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-700/50 to-gray-800/50"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <div className="h-5 bg-gray-700/50 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-800/50 rounded animate-pulse w-1/2"></div>
            </div>
            
            <div className="space-y-2">
              <div className="h-3 bg-gray-800/50 rounded animate-pulse w-full"></div>
              <div className="h-3 bg-gray-800/50 rounded animate-pulse w-5/6"></div>
              <div className="h-3 bg-gray-800/50 rounded animate-pulse w-4/6"></div>
            </div>
            
            <div className="block sm:hidden">
              <div className="h-12 bg-gray-700/50 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

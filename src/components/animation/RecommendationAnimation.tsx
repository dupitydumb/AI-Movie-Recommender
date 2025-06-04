"use client";
import React from "react";
import { motion } from "framer-motion";

const RecommendationAnimation = () => {
  const genres = ["Sci-Fi", "Comedy", "Action", "Drama"];
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>([]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * genres.length);
      setSelectedGenres([genres[randomIndex]]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const moviePosters = [
    "/movie.json",
    "/movie.json",
    "/movie.json",
  ];

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <motion.div
        className="text-xl text-gray-300 mb-4"
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        {selectedGenres.length > 0 ? selectedGenres[0] : "Choose a genre..."}
      </motion.div>
      <div className="flex gap-4">
        {moviePosters.map((poster, index) => (
          <motion.img
            key={index}
            src={poster}
            alt="Movie Poster"
            className="w-24 h-36 object-cover rounded-md shadow-md"
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, delay: 0.2 * index }}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationAnimation;

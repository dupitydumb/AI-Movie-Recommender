"use client";

import React from "react";
import { MovieCard } from "@/components/ui/moviecard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimilarMoviesProps {
  movies: any[];
}

export function SimilarMovies({ movies }: SimilarMoviesProps) {
  return (
    <Card className="bg-gray-800/30 border border-gray-700 rounded-xl overflow-hidden">
      <CardHeader className="p-4 font-semibold text-gray-200 border-b border-gray-700">
        <CardTitle>Similar Movies</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-gray-200">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              releaseYear={movie.release_date.substring(0, 4)}
              rating={movie.vote_average}
              posterPath={movie.poster_path}
              aireview={movie.overview}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

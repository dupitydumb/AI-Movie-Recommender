"use client";

import React from "react";

interface SimilarMoviesProps {
  movies: any[];
}

export function SimilarMovies({ movies }: SimilarMoviesProps) {
  return (
    <div>
      <h2>Similar Movies</h2>
      {movies.map((movie) => (
        <div key={movie.id}>
          <h3>{movie.title}</h3>
          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
        </div>
      ))}
    </div>
  );
}

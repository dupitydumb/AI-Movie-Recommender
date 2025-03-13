"use client";
import dotenv from "dotenv";
import { Provider } from "@/components/ui/provider";
import {
  Box,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  HStack,
  Separator,
} from "@chakra-ui/react";
import {
  ProgressCircleRing,
  ProgressCircleRoot,
} from "@/components/ui/progress-circle";
import {
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from "@/components/ui/skeleton";
import "./page.css";
import { MovieCard } from "@/components/ui/moviecard";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Features } from "@/components/ui/features";
import * as React from "react";
import { useState } from "react";
import { Section, Send } from "lucide-react";
import Head from "next/head";
import Script from "next/script";
import ReactGA from "react-ga4";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  let [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  dotenv.config();
  ReactGA.initialize("G-3YKPKP74MD");
  ReactGA.send({ hitType: "pageview", page: "/", title: "Home" });
  async function run(prompt: string) {
    if (loading) return;
    setMovies([]);
    setLoading(true);
    const promise = fetch("/api/search?q=" + prompt, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${process.env.API_KEY}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.error) {
          alert(data.error + "Token: " + process.env.API_KEY);
        } else {
          if (data.movies.length === 0) {
            setError("Sorry, we couldn't get any movie recommendations.");
          } else {
            setMovies(data.movies);
          }
        }
      });
    await promise;
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1300));
      run(prompt);
    } catch (err) {
      console.error("Error generating movie recommendations:", err);
      setError("Sorry, we couldn't process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  function Tracking() {
    return (
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-3YKPKP74MD');
        `}
      </script>
    );
  }

  return (
    <Provider>
      <div className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen">
        <Header />
        <div className="wrapper">
          <Box p={8}>
            <VStack gap={4}>
              <Box textAlign="center">
                <section className="py-12 text-center">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                    Movie AI Recommender
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
                    Discover your next favorite movie with our AI-powered
                    recommendation engine. Just tell us what you're in the mood
                    for!
                  </p>
                </section>
              </Box>
              <Separator />
              <div className="search-form max-w-4xl mx-auto">
                <form
                  onSubmit={handleSubmit}
                  className="flex gap-2 mb-8 w-full items-center"
                >
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="I'm in the mood for a sci-fi movie with time travel..."
                    className="bg-gray-800/50 border-gray-700 text-white w-full px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-purple-500"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? "Thinking..." : <Send className="h-4 w-4" />}
                  </Button>
                </form>
                {error && (
                  <div className="text-red-400 mb-4 text-center">{error}</div>
                )}

                {movies.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      Recommended Movies
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {movies.map((movie) => {
                        if (!movie) {
                          return null;
                        }
                        return (
                          <MovieCard
                            key={movie.id}
                            title={movie.title}
                            releaseYear={movie.release_date}
                            rating={movie.vote_average}
                            posterPath={movie.poster_path}
                            aireview={movie.overview}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {!movies.length && !isLoading && !error && (
                  <div className="text-center text-gray-400 py-12">
                    <p>
                      Ask for movie recommendations and they'll appear here!
                    </p>
                    <p className="text-sm mt-2">
                      Try something like "Action movies from the 90s" or
                      "Feel-good comedies"
                    </p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex justify-center py-12">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-purple-600/50 mb-4"></div>
                      <p className="text-purple-400">
                        Finding the perfect movies for you...
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {/* Prompt suggestions */}
              <div className="mb-8">
                <p className="text-sm text-gray-400 mb-2">Try these prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Action movies from the 90s",
                    "Sci-fi with time travel",
                    "Feel-good comedies",
                    "Animated family movies",
                    "Horror with ghosts",
                    "Romantic comedies",
                    "Crime thrillers",
                    "Fantasy adventures",
                    "Superhero movies",
                    "Documentaries about space",
                    "Melandcholic dramas",
                    "Movies about music",
                    "Movies based on true stories",
                    "Movies with strong characters",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setPrompt(suggestion)}
                      className="px-3 py-1.5 bg-gray-800/70 hover:bg-gray-700/70 text-sm rounded-full text-gray-300 transition-colors border border-gray-700 hover:border-purple-500"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* <div className="movie-list">
                {loading ? (
                  <Box className="skeleton" marginBottom={4}>
                    <Skeleton height="200px" marginBottom={4} />
                    <Skeleton height="200px" marginBottom={4} />
                    <Skeleton height="200px" marginBottom={4} />
                  </Box>
                ) : movies.length === 0 ? (
                  <Text fontSize="lg" color="gray.500"></Text>
                ) : (
                  movies.map((movie) =>
                    movie ? (
                      <MovieCard
                        key={movie.id}
                        title={movie.title}
                        releaseYear={movie.release_date}
                        rating={movie.vote_average}
                        posterPath={movie.poster_path}
                        aireview={movie.overview}
                      />
                    ) : (
                      <Text fontSize="lg" color="gray.500">
                        <Separator />
                      </Text>
                    )
                  )
                )}
              </div> */}
            </VStack>
          </Box>
          <section className="py-12 text-center">
            <Features />
          </section>
        </div>
      </div>
      <Footer />
    </Provider>
  );
}

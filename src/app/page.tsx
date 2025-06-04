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
import { Faq } from "../components/ui/faq";
import { Testimonials } from "@/components/ui/testimonials";
import { SeoSchema } from "@/components/ui/seo-scheme";
import * as React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Send } from "lucide-react";
import { FadeIn } from "@/components/animation/fade-in";
import Head from "next/head";
import Script from "next/script";
import ReactGA from "react-ga4";

import { motion } from "framer-motion";
import { StaggerChildren } from "@/components/animation/stagger-children";
import { StaggerItem } from "@/components/animation/stagger-children";
import { AnimatedText } from "@/components/animation/animated-text";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  let [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  dotenv.config();
  ReactGA.initialize("G-3YKPKP74MD");

  async function run(prompt: string) {
    if (!prompt || prompt.trim() === "") {
      setError("Please enter a valid movie prompt.");
      return;
    }
    if (isLoading) return;
    setMovies([]);
    setIsLoading(true);
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
            console.log("No movies data found", data);
            setError("Sorry, we couldn't get any movie recommendations.");
          } else {
            setMovies(data.movies);
          }
        }
      });
    setLoading(true);
    await promise;
    setIsLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;
    setError("");

    try {
      run(prompt);
    } catch (err) {
      console.error("Error generating movie recommendations:", err);
      setError("Sorry, we couldn't process your request. Please try again.");
    } finally {
    }
  };

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  return (
    <Provider>
      <div className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen">
        <SeoSchema />
        <Head>
          <meta
            name="description"
            content="Find the best movie recommendations with our AI-powered movie recommender. Get personalized suggestions and discover movies you'll love."
          />
        </Head>
        <Header />
        <div className="wrapper">
          <Box p={8}>
            <VStack gap={4}>
              <Box textAlign="center">
                <section className="py-16 text-center flex flex-col items-center relative">
                  {/* Animated background shapes */}
                  <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 blur-3xl opacity-30 w-[600px] h-[300px] bg-gradient-to-r from-purple-500 via-pink-400 to-red-400 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 blur-2xl opacity-20 w-[300px] h-[200px] bg-gradient-to-br from-purple-700 to-purple-900 rounded-full"></div>
                  </div>
                  <div className="w-full max-w-2xl px-4 z-10">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 leading-tight drop-shadow-lg">
                      <AnimatedText text="🎬 Unleash Movie Magic with AI" />
                    </h1>
                    <FadeIn delay={0.2}>
                      <p className="text-base md:text-lg mb-8 text-gray-300" data-lcp>
                        Tired of endless scrolling? Let our <span className="font-semibold text-purple-300">AI Movie Recommender</span> be your personal film curator.<br />
                        Describe your mood, favorite genre, or wildest movie wish—our AI will conjure up the perfect picks for your next movie night!
                      </p>
                    </FadeIn>
                    <FadeIn delay={0.4}>
                      <div className="flex flex-wrap justify-center gap-3 mb-6">
                        {[
                          "Surprise me with a hidden gem",
                          "Epic adventures for a rainy day",
                          "Movies to watch with friends",
                          "Feel-good films for a cozy night",
                        ].map((suggestion) => (
                            <motion.button
                            key={suggestion}
                            onClick={() => {
                              setPrompt(suggestion);
                              run(suggestion);
                            }}
                            className="px-4 py-2 bg-purple-700/80 hover:bg-pink-600/80 text-sm rounded-full text-white font-medium shadow transition-colors border border-purple-500 hover:border-pink-400"
                            whileTap={{ scale: 0.95 }}
                            >
                            {suggestion}
                            </motion.button>
                        ))}
                      </div>
                    </FadeIn>
                    <FadeIn delay={0.6}>
                      
                      <Text className="text-sm text-gray-400 mb-4">
                        Just type your movie wish and let the magic happen!
                      </Text>
                    </FadeIn>
                    <FadeIn delay={0.8}>
                      <div className="mt-8">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900/70 rounded-lg text-sm text-gray-300 shadow">
                          <svg className="w-5 h-5 text-purple-400 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V6M5 12l7-7 7 7" /></svg>
                          Start by telling us what you want to watch!
                        </span>
                      </div>
                    </FadeIn>
                  </div>
                </section>
              </Box>
              <Separator />
              <FadeIn direction="up" delay={0.2}>
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
                      <StaggerChildren delay={0.5}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {movies.map((movie) => {
                            if (!movie) {
                              return null;
                            }
                            return (
                              <StaggerItem key={movie.id}>
                                <MovieCard
                                  id={movie.id}
                                  key={movie.id}
                                  title={movie.title}
                                  releaseYear={movie.release_date}
                                  rating={movie.vote_average}
                                  posterPath={movie.poster_path}
                                  aireview={movie.overview}
                                />
                              </StaggerItem>
                            );
                          })}
                        </div>
                      </StaggerChildren>
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
              </FadeIn>
                

              {/* Prompt suggestions */}
              <div className="mb-8">
                <p className="text-sm text-gray-400 mb-2">Try these prompts:</p>
                <StaggerChildren staggerDelay={0.3}>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Action movies from the 90s",
                      "Feel-good comedies",
                      "Sci-fi movies with time travel",
                      "Horror movies with a twist",
                      "Romantic dramas set in Paris",
                      "Animated movies for all ages",
                      "Documentaries about space exploration",
                      "Thrillers with unexpected endings",
                      "Classic films from the 70s",
                      "Movies based on true stories",
                      "Fantasy adventures with magical creatures",
                    ].map((suggestion) => (
                      <StaggerItem key={suggestion}>
                        <motion.button
                          onClick={() => setPrompt(suggestion)}
                          className="px-3 py-1.5 bg-gray-800/70 hover:bg-gray-700/70 text-sm rounded-full text-gray-300 transition-colors border border-gray-700 hover:border-purple-500"
                        >
                          {suggestion}
                        </motion.button>
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerChildren>
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
            <section className="py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-purple-800/70 to-gray-900/80 rounded-2xl p-8 shadow-lg border border-purple-700/30">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                How Our Movie Recommender Works
              </h2>
              <p className="text-gray-300 text-lg">
                Our AI-powered movie recommender analyzes your preferences and suggests movies you'll love. We use a sophisticated algorithm to understand your taste and provide personalized recommendations.
              </p>
              </div>
              <div className="bg-gradient-to-br from-purple-800/70 to-gray-900/80 rounded-2xl p-8 shadow-lg border border-purple-700/30">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
                Benefits of Using a Movie Recommender
              </h2>
              <p className="text-gray-300 text-lg">
                Discover new movies, save time searching, and get personalized recommendations tailored to your unique taste. Our movie recommender is the perfect way to find your next favorite film.
              </p>
              </div>
            </div>
            </section>
          <section className="py-12">
            <Faq />
          </section>
          <section className="py-12">
            <Testimonials />
          </section>
        </div>
      </div>
      <Footer />
    </Provider>
  );
}

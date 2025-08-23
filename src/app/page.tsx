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
import { Toaster, toaster } from "@/components/ui/toaster";
import { Send, Search, Sparkles, Film } from "lucide-react";
import { FadeIn } from "@/components/animation/fade-in";
import { LoadingCard } from "@/components/ui/loading-card";
import { WhyChooseUs } from "@/components/ui/why-choose-us";
import Head from "next/head";
import Script from "next/script";
import ReactGA from "react-ga4";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerChildren } from "@/components/animation/stagger-children";
import { StaggerItem } from "@/components/animation/stagger-children";
import { useAuth } from "@/contexts/AuthContext";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { AuthModal } from "@/components/auth/AuthModal";
import { UsageLimitBanner } from "@/components/ui/usage-limit-banner";
import { PricingModal } from "@/components/pricing/PricingModal";
export default function Home() {
  const [prompt, setPrompt] = useState("");
  let [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const { usageStats, logUsage, refreshUsage } = useUsageLimit();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  dotenv.config();
  ReactGA.initialize("G-3YKPKP74MD");

  async function run(prompt: string) {
    if (!prompt || prompt.trim() === "") {
      setError("Please enter a valid movie prompt.");
      toaster.create({
        title: "Input Error",
        description: "Please enter a valid movie prompt.",
      });
      return;
    }

    // Check usage limit before proceeding
    if (usageStats && !usageStats.canMakeRequest) {
      setError("Daily limit reached. Please upgrade or try again tomorrow.");
      toaster.create({
        title: "Usage Limit Reached",
        description: user 
          ? "You've reached your daily limit. Upgrade to premium for unlimited searches."
          : "Daily limit reached. Sign up for more searches or try again tomorrow.",
      });
      if (!user) {
        setAuthModalOpen(true);
      } else {
        setPricingModalOpen(true);
      }
      return;
    }

    if (isLoading) return;
    setMovies([]);
    setIsLoading(true);
    
    try {
      // Log usage before making the request
      await logUsage();
      
      const promise = fetch("/api/search?q=" + prompt, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${process.env.API_KEY}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error || data.code) {
            const errorMsg = data.error || "An error occurred.";
            setError(errorMsg);
            toaster.create({
              title: "Error",
              description: errorMsg,
            });
          } else {
            if (data.movies && data.movies.length === 0) {
              setError("Sorry, we couldn't get any movie recommendations.");
              toaster.create({
                title: "No Recommendations",
                description: "Sorry, we couldn't get any movie recommendations.",
              });
            } else {
              setMovies(data.movies);
              // Refresh usage stats after successful search
              refreshUsage();
            }
          }
        });
      
      setLoading(true);
      await promise;
    } catch (err) {
      console.error("Error generating movie recommendations:", err);
      setError("Sorry, we couldn't process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        {/* Skip Link for Accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        
        <SeoSchema />
        <Head>
          <meta
            name="description"
            content="Find the best movie recommendations with our AI-powered movie recommender. Get personalized suggestions and discover movies you'll love."
          />
        </Head>
        <Header />
        
        {/* Hero Section */}
        <main id="main-content" className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
          </div>

          {/* Hero Content */}
          <section className="relative z-10 pt-20 pb-16 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Movie Discovery
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                    Discover Your Next
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
                    Favorite Movie
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Tell us what you're in the mood for, and our AI will curate the perfect movie recommendations just for you. No more endless scrolling.
                </p>
              </motion.div>

              {/* Usage Limit Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <UsageLimitBanner 
                  onSignIn={() => setAuthModalOpen(true)}
                  onUpgrade={() => setPricingModalOpen(true)}
                />
              </motion.div>

              {/* Search Form */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-3xl mx-auto mb-12"
              >
                <form onSubmit={handleSubmit} className="relative">
                  <div className="flex flex-col md:flex-row gap-3 p-2 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl focus-within:border-red-500/50 transition-colors">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="I want a sci-fi thriller with time travel..."
                        className="w-full pl-12 pr-4 py-4 bg-transparent border-none text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-0"
                        disabled={isLoading || (usageStats ? !usageStats.canMakeRequest : false)}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !prompt.trim() || (usageStats ? !usageStats.canMakeRequest : false)}
                      className="px-8 py-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-red-500/50 min-w-[120px]"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          Searching
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Discover
                        </div>
                      )}
                    </Button>
                  </div>
                </form>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </motion.div>

              {/* Quick Suggestions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-16"
              >
                <p className="text-gray-400 mb-4 text-sm uppercase tracking-wide font-medium">
                  Popular Searches
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "Mind-bending thrillers",
                    "Feel-good comedies",
                    "Epic space adventures",
                    "Hidden gems",
                  ].map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => {
                        setPrompt(suggestion);
                        run(suggestion);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 rounded-full text-gray-300 hover:text-white transition-all duration-200 text-sm font-medium"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Results Section */}
          <section className="relative z-10 px-4 pb-20">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20"
                  >
                    <div className="inline-flex flex-col items-center gap-6 mb-12">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-800 rounded-full"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-t-red-500 rounded-full animate-spin"></div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-semibold text-white">Finding perfect movies for you</p>
                        <p className="text-gray-400">Our AI is analyzing thousands of films...</p>
                      </div>
                    </div>
                    
                    {/* Loading skeleton cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                      <LoadingCard count={8} />
                    </div>
                  </motion.div>
                )}

                {movies.length > 0 && !isLoading && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          Your Personalized Recommendations
                        </span>
                      </h2>
                      <p className="text-gray-400 text-lg">
                        {movies.length} movies curated just for you
                      </p>
                    </div>

                    <StaggerChildren delay={0.1}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {movies.map((movie) => {
                          if (!movie) return null;
                          return (
                            <StaggerItem key={movie.id}>
                              <motion.div
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                              >
                                <MovieCard
                                  id={movie.id}
                                  title={movie.title}
                                  releaseYear={movie.release_date}
                                  rating={movie.vote_average}
                                  posterPath={movie.poster_path}
                                  aireview={movie.overview}
                                />
                              </motion.div>
                            </StaggerItem>
                          );
                        })}
                      </div>
                    </StaggerChildren>
                  </motion.div>
                )}

                {!movies.length && !isLoading && !error && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <Film className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-300 mb-4">
                      Ready to discover amazing movies?
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Describe what you're in the mood for and let our AI find the perfect films for your next movie night.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </main>
        
        {/* Additional Sections */}
        <div className="bg-gray-950/50">

          {/* Why Choose Us Section */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <WhyChooseUs />
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-16"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  How It Works
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  AI-Powered Movie Discovery
                </h2>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                  Our sophisticated AI analyzes your preferences, mood, and viewing history to recommend movies you'll genuinely love. No more random suggestions—just personalized picks tailored to your taste.
                </p>
              </motion.div>

              {/* Process Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    step: "1",
                    title: "Describe Your Mood",
                    description: "Tell us what you're in the mood for—genre, era, feeling, or specific themes."
                  },
                  {
                    step: "2", 
                    title: "AI Analysis",
                    description: "Our AI processes thousands of movies to find perfect matches for your request."
                  },
                  {
                    step: "3",
                    title: "Discover & Enjoy", 
                    description: "Get curated recommendations with detailed information about each movie."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="relative p-8 bg-gray-900/30 rounded-2xl border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-red-400 font-bold text-xl">{item.step}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                    
                    {/* Connecting line (except for last item) */}
                    {index < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-red-500/50 to-transparent"></div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <Faq />
            </div>
          </section>

          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <Testimonials />
            </div>
          </section>
        </div>

        <Footer />
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Pricing Modal */}
      <PricingModal 
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
      
      <Toaster />
    </Provider>
  );
}


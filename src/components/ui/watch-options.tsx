"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { StaggerChildren, StaggerItem } from "@/components/animation/stagger-children"
import { motion } from "framer-motion"

interface WatchOptionsProps {
  movieId: string;
  watchProviders: any;
}

export function WatchOptions({ movieId, watchProviders }: WatchOptionsProps) {
  const [activeTab, setActiveTab] = useState("streaming");

  const streamingOptions = watchProviders?.results?.US?.flatrate || [];
  const rentalOptions = watchProviders?.results?.US?.rent || [];
  const buyOptions = watchProviders?.results?.US?.buy || [];

  return (
    <div className="space-y-12">

      {/* Featured Free Option - Cineverse */}
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="relative bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 border border-red-500/20 rounded-2xl p-8 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-4 right-4 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-red-500/5 rounded-full blur-xl"></div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-medium mb-6">
              <ExternalLink className="w-4 h-4" />
              Free to Watch
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Watch Free on Cineverse
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Enjoy this movie completely free with no subscription required. High-quality streaming with subtitles available.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="px-12 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                asChild
              >
                <a
                  href={`https://www.cineverse.fun/movie/${movieId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch Free Now
                  <ExternalLink className="ml-3 h-5 w-5" />
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Other Options */}
      <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8 hover:border-gray-700/50 transition-all duration-300">
        <Tabs defaultValue="streaming" onValueChange={setActiveTab}>
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Other Streaming Options
            </h3>
            <p className="text-gray-400">Available on these platforms with subscription or rental</p>
          </div>

          <TabsList className="grid w-full grid-cols-2 mb-8 bg-transparent border-0 rounded-2xl p-2">
            <TabsTrigger 
              value="streaming" 
              className="relative data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/25 text-gray-400 hover:text-gray-200 rounded-xl font-semibold transition-all duration-300 h-12 px-4 text-sm leading-tight overflow-hidden group flex items-center justify-center bg-gray-800/30 border border-gray-700/30 hover:border-gray-600/50"
            >
              <span className="relative z-10 text-center whitespace-nowrap">Streaming Services</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </TabsTrigger>
            <TabsTrigger 
              value="rental"
              className="relative data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/25 text-gray-400 hover:text-gray-200 rounded-xl font-semibold transition-all duration-300 h-12 px-4 text-sm leading-tight overflow-hidden group flex items-center justify-center bg-gray-800/30 border border-gray-700/30 hover:border-gray-600/50"
            >
              <span className="relative z-10 text-center whitespace-nowrap">Rent or Buy</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="streaming" className="space-y-6">
            {streamingOptions.length > 0 ? (
              <StaggerChildren staggerDelay={0.1}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {streamingOptions.map((option: any) => (
                    <StaggerItem key={option.provider_id}>
                      <motion.div
                        className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 flex flex-col h-full hover:border-gray-600/50 transition-all duration-300 group"
                        whileHover={{
                          y: -8,
                          scale: 1.02,
                          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3)",
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative h-12 w-20 flex-shrink-0 bg-white rounded-lg p-2 group-hover:scale-105 transition-transform duration-200">
                            <img
                              src={`https://image.tmdb.org/t/p/w500${option.logo_path}`}
                              alt={option.provider_name}
                              className="object-contain w-full h-full"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-lg group-hover:text-red-400 transition-colors duration-200">
                              {option.provider_name}
                            </h4>
                            <p className="text-sm text-gray-400">Streaming Service</p>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button
                              className="w-full bg-gray-700 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 border border-gray-600 hover:border-red-500"
                              onClick={() => window.open(watchProviders?.results?.US?.link || `https://www.themoviedb.org/movie/${movieId}/watch?locale=US`, "_blank")}
                            >
                              Watch Now
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerChildren>
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8 text-gray-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-300 mb-2">No Streaming Services Available</h4>
                <p className="text-gray-400">This movie isn't currently available on major streaming platforms in your region.</p>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="rental" className="space-y-6">
            {rentalOptions.length > 0 ? (
              <StaggerChildren staggerDelay={0.1}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rentalOptions.map((option: any) => (
                    <StaggerItem key={option.provider_id}>
                      <motion.div
                        className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 flex flex-col h-full hover:border-gray-600/50 transition-all duration-300 group"
                        whileHover={{
                          y: -8,
                          scale: 1.02,
                          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.3)",
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative h-12 w-20 flex-shrink-0 bg-white rounded-lg p-2 group-hover:scale-105 transition-transform duration-200">
                            <img
                              src={`https://image.tmdb.org/t/p/w500${option.logo_path}`}
                              alt={option.provider_name}
                              className="object-contain w-full h-full"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white text-lg group-hover:text-red-400 transition-colors duration-200">
                              {option.provider_name}
                            </h4>
                            <p className="text-sm text-gray-400">Rental & Purchase</p>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Button
                              className="w-full bg-gray-700 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 border border-gray-600 hover:border-red-500"
                              onClick={() => window.open(watchProviders?.results?.US?.link || `https://www.themoviedb.org/movie/${movieId}/watch?locale=US`, "_blank")}
                            >
                              Rent or Buy
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerChildren>
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-16 h-16 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ExternalLink className="w-8 h-8 text-gray-500" />
                </div>
                <h4 className="text-xl font-semibold text-gray-300 mb-2">No Rental Options Available</h4>
                <p className="text-gray-400">This movie isn't currently available for rent or purchase in your region.</p>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

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
    <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-6">
      <Tabs defaultValue="streaming" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="streaming">Streaming Services</TabsTrigger>
          <TabsTrigger value="rental">Rent or Buy</TabsTrigger>
        </TabsList>

        <TabsContent value="streaming">
          <h2 className="text-2xl font-bold mb-6">Available on Streaming Services</h2>

          <StaggerChildren staggerDelay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {streamingOptions.map((option: any) => (
                <StaggerItem key={option.provider_id}>
                  <motion.div
                    className={`border border-gray-700 rounded-lg p-4 flex flex-col h-full`}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative h-12 w-24 flex-shrink-0">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${option.logo_path}`}
                          alt={option.provider_name}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{option.provider_name}</h3>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant="default"
                          className={`w-full bg-purple-600 hover:bg-purple-700`}
                          onClick={() => window.open(`https://www.themoviedb.org/movie/${movieId}/watch?locale=US`, "_blank")}
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
        </TabsContent>

        <TabsContent value="rental">
          <h2 className="text-2xl font-bold mb-6">Rent or Buy</h2>

          <StaggerChildren staggerDelay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rentalOptions.map((option: any) => (
                <StaggerItem key={option.provider_id}>
                  <motion.div
                    className="border border-gray-700 rounded-lg p-4 flex flex-col h-full"
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative h-12 w-24 flex-shrink-0">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${option.logo_path}`}
                          alt={option.provider_name}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{option.provider_name}</h3>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant="default"
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => window.open(`https://www.themoviedb.org/movie/${movieId}/watch?locale=US`, "_blank")}
                        >
                          Rent or Buy <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </div>
          </StaggerChildren>
        </TabsContent>
      </Tabs>
    </div>
  );
}

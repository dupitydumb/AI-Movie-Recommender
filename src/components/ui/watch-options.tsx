"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { StaggerChildren, StaggerItem } from "@/components/animation/stagger-children"
import { motion } from "framer-motion"

interface WatchOptionsProps {
  movieId: string
}

export function WatchOptions({ movieId }: WatchOptionsProps) {
  const [activeTab, setActiveTab] = useState("streaming")

  // In a real app, this data would come from an API based on the movieId
  const streamingOptions = [
    {
      id: "netflix",
      name: "Netflix",
      logo: "/placeholder.svg?height=60&width=120&text=Netflix",
      included: true,
      subscription: "$15.99/month",
      link: "https://netflix.com",
    },
    {
      id: "prime",
      name: "Amazon Prime Video",
      logo: "/placeholder.svg?height=60&width=120&text=Prime+Video",
      included: true,
      subscription: "$8.99/month",
      link: "https://primevideo.com",
    },
    {
      id: "disney",
      name: "Disney+",
      logo: "/placeholder.svg?height=60&width=120&text=Disney+",
      included: false,
      subscription: "$7.99/month",
      link: "https://disneyplus.com",
    },
    {
      id: "hbo",
      name: "HBO Max",
      logo: "/placeholder.svg?height=60&width=120&text=HBO+Max",
      included: true,
      subscription: "$9.99/month",
      link: "https://hbomax.com",
    },
    {
      id: "hulu",
      name: "Hulu",
      logo: "/placeholder.svg?height=60&width=120&text=Hulu",
      included: false,
      subscription: "$7.99/month",
      link: "https://hulu.com",
    },
    {
      id: "paramount",
      name: "Paramount+",
      logo: "/placeholder.svg?height=60&width=120&text=Paramount+",
      included: true,
      subscription: "$5.99/month",
      link: "https://paramountplus.com",
    },
  ]

  const rentalOptions = [
    {
      id: "youtube",
      name: "YouTube",
      logo: "/placeholder.svg?height=60&width=120&text=YouTube",
      price: "$3.99",
      hdPrice: "$4.99",
      link: "https://youtube.com",
    },
    {
      id: "apple",
      name: "Apple TV",
      logo: "/placeholder.svg?height=60&width=120&text=Apple+TV",
      price: "$3.99",
      hdPrice: "$4.99",
      link: "https://tv.apple.com",
    },
    {
      id: "google",
      name: "Google Play",
      logo: "/placeholder.svg?height=60&width=120&text=Google+Play",
      price: "$3.99",
      hdPrice: "$4.99",
      link: "https://play.google.com",
    },
    {
      id: "vudu",
      name: "Vudu",
      logo: "/placeholder.svg?height=60&width=120&text=Vudu",
      price: "$3.99",
      hdPrice: "$4.99",
      link: "https://vudu.com",
    },
    {
      id: "amazon",
      name: "Amazon",
      logo: "/placeholder.svg?height=60&width=120&text=Amazon",
      price: "$3.99",
      hdPrice: "$4.99",
      link: "https://amazon.com",
    },
  ]

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
              {streamingOptions.map((option) => (
                <StaggerItem key={option.id}>
                  <motion.div
                    className={`border ${option.included ? "border-purple-500" : "border-gray-700"} rounded-lg p-4 flex flex-col h-full`}
                    whileHover={{
                      y: -5,
                      boxShadow: option.included
                        ? "0 10px 25px -5px rgba(168, 85, 247, 0.3)"
                        : "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative h-12 w-24 flex-shrink-0">
                        <img
                          src={option.logo || "/placeholder.svg"}
                          alt={option.name}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{option.name}</h3>
                        <p className="text-sm text-gray-400">{option.subscription}</p>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {option.included ? (
                        <div className="text-green-400 text-sm mb-3">Included with subscription</div>
                      ) : (
                        <div className="text-gray-400 text-sm mb-3">Not available on this service</div>
                      )}

                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant={option.included ? "default" : "outline"}
                          className={`w-full ${option.included ? "bg-purple-600 hover:bg-purple-700" : ""}`}
                          disabled={!option.included}
                          onClick={() => window.open(option.link, "_blank")}
                        >
                          {option.included ? "Watch Now" : "Not Available"}
                          {option.included && <ExternalLink className="ml-2 h-4 w-4" />}
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
              {rentalOptions.map((option) => (
                <StaggerItem key={option.id}>
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
                          src={option.logo || "/placeholder.svg"}
                          alt={option.name}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{option.name}</h3>
                      </div>
                    </div>

                    <div className="flex justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-400">SD Rental</div>
                        <div className="font-semibold">{option.price}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">HD Rental</div>
                        <div className="font-semibold">{option.hdPrice}</div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant="default"
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => window.open(option.link, "_blank")}
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
  )
}


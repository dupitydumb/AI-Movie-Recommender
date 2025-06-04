import {
  Brain,
  Clock,
  Film,
  Layers,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  Zap,
} from "lucide-react";
import { StaggerChildren } from "../animation/stagger-children";
import { StaggerItem } from "../animation/stagger-children";
import { motion } from "framer-motion";
import { FadeIn } from "../animation/fade-in";

export function Features() {
  const features = [
    {
      icon: (
        <div className="flex justify-center">
          <Brain className="h-10 w-10 text-purple-500" />
        </div>
      ),
      title: "AI-Powered Recommendations",
      description:
        "Our advanced AI understands your preferences and suggests movies that match your unique taste.",
    },
    {
      icon: (
        <div className="flex justify-center">
          <MessageSquare className="h-10 w-10 text-purple-500" />
        </div>
      ),
      title: "Natural Language Search",
      description:
        "Simply describe what you're looking for in plain English. No need for complex filters or categories.",
    },
    {
      icon: (
        <div className="flex justify-center">
          <Zap className="h-10 w-10 text-purple-500" />
        </div>
      ),
      title: "Instant Results",
      description:
        "Get personalized movie recommendations in seconds, no matter how specific your request.",
    },
    {
      icon: (
        <div className="flex justify-center">
          <Layers className="h-10 w-10 text-purple-500" />
        </div>
      ),
      title: "Diverse Genres",
      description:
        "From action-packed blockbusters to indie dramas, we cover all genres and styles of filmmaking.",
    },
    {
      icon: (
        <div className="flex justify-center">
          <Clock className="h-10 w-10 text-purple-500" />
        </div>
      ),
      title: "Time Period Filtering",
      description:
        "Looking for 80s classics or recent releases? Specify any era and we'll find the perfect match.",
    },
    {
      icon: (
        <div className="flex justify-center">
          <ThumbsUp className="h-10 w-10 text-purple-500" />
        </div>
      ),
      title: "Personalized Ratings",
      description:
        "We highlight movies with high ratings that match your preferences for quality entertainment.",
    },
    {
      icon: (
        <div className="flex justify-center">
          <Sparkles className="h-10 w-10 text-purple-500" />
        </div>
      ),
      title: "Hidden Gems",
      description:
        "Discover overlooked masterpieces and cult classics you might have missed.",
    },
    {
      icon: (
        <div className="flex justify-center">
          <Film className="h-10 w-10 text-purple-500" />
        </div>
      ),
      title: "Comprehensive Details",
      description:
        "Get all the essential information about each movie to help you decide what to watch.",
    },
  ];

  return (
    <section id="features" className="py-16 border-t border-gray-800">
      <FadeIn delay={0.3}>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Screenpick
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our AI-powered platform makes finding your next favorite movie
            effortless and enjoyable.
          </p>
        </div>
      </FadeIn>
      <StaggerChildren staggerDelay={0.3}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <motion.div
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.3)",
                }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all duration-300 h-full"
              >
                <motion.div
                  className="mb-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-[1px]">
            <a href="https://rapidapi.com/AirFU/api/ai-movie-recommender" target="_blank" rel="noopener noreferrer">
            <button className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full transition-colors">
              Get Started Now
            </button>
            </a>
          </div>
          <p className="mt-4 text-gray-400">
            No sign-up required. Start discovering movies instantly.
          </p>
        </div>
      </StaggerChildren>
    </section>
  );
}

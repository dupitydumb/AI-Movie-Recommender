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
import { motion } from "framer-motion";

export function Features() {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Recommendations",
      description:
        "Our advanced AI understands your preferences and suggests movies that match your unique taste.",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Natural Language Search",
      description:
        "Simply describe what you're looking for in plain English. No need for complex filters or categories.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Results",
      description:
        "Get personalized movie recommendations in seconds, no matter how specific your request.",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Diverse Genres",
      description:
        "From action-packed blockbusters to indie dramas, we cover all genres and styles of filmmaking.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Period Filtering",
      description:
        "Looking for 80s classics or recent releases? Specify any era and we'll find the perfect match.",
    },
    {
      icon: <ThumbsUp className="h-6 w-6" />,
      title: "Personalized Ratings",
      description:
        "We highlight movies with high ratings that match your preferences for quality entertainment.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Hidden Gems",
      description:
        "Discover overlooked masterpieces and cult classics you might have missed.",
    },
    {
      icon: <Film className="h-6 w-6" />,
      title: "Comprehensive Details",
      description:
        "Get all the essential information about each movie to help you decide what to watch.",
    },
  ];

  return (
    <section id="features" className="relative py-20 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Features
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Why Choose
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
              Our Platform
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover the powerful features that make finding your next favorite movie effortless and enjoyable
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-6 bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800/50 hover:border-gray-700/50 rounded-2xl backdrop-blur-sm transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 p-3 bg-red-500/10 group-hover:bg-red-500/20 rounded-xl border border-red-500/20 group-hover:border-red-500/30 transition-all duration-300">
                  <div className="text-red-400 group-hover:text-red-300 transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-lg text-white group-hover:text-gray-100 transition-colors duration-300 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 text-sm leading-relaxed transition-colors duration-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a href="https://rapidapi.com/AirFU/api/ai-movie-recommender" target="_blank" rel="noopener noreferrer">
              <button className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-red-500/50">
                Get Started Now
              </button>
            </a>
          </motion.div>
          <p className="mt-4 text-gray-400">
            No sign-up required. Start discovering movies instantly.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { Film, Zap, Shield, Sparkles, Clock, Star, Target, RefreshCw } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface WhyChooseUsProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: Feature[];
  className?: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: <Target className="w-5 h-5" />,
    title: "Smart Matching",
    description: "Advanced AI algorithms understand your preferences and viewing patterns to deliver precise recommendations"
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Instant Results",
    description: "Get personalized movie recommendations in seconds, not minutes or hours of browsing"
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Quality Curation",
    description: "Handpicked from top-rated, critically acclaimed, and hidden gem films across all genres"
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Always Fresh",
    description: "Discover new releases, timeless classics, and overlooked masterpieces updated continuously"
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Privacy First",
    description: "Your viewing preferences and data are processed securely without storing personal information"
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Save Time",
    description: "Stop endless scrolling and find your next favorite movie in just one search"
  }
];

export function WhyChooseUs({
  title = "Why Choose MovieAI",
  subtitle = "Better Movie Recommendations",
  description = "Stop wasting time scrolling through endless lists. Our AI understands context, emotion, and personal taste to deliver recommendations that truly resonate with you.",
  features = defaultFeatures,
  className = ""
}: WhyChooseUsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      className={`space-y-8 ${className}`}
    >
      {/* Header Section - Clear Visual Hierarchy */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium backdrop-blur-sm">
          <Film className="w-4 h-4" />
          <span className="font-semibold">{title}</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
          <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {subtitle}
          </span>
        </h2>
        
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
          {description}
        </p>
      </div>

      {/* Features Grid - Content-First Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
            className="group p-6 bg-gray-900/50 hover:bg-gray-900/70 rounded-2xl border border-gray-800/50 hover:border-gray-700/50 backdrop-blur-sm transition-all duration-300 cursor-default"
          >
            {/* Icon with Accent Color */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-red-500/10 group-hover:bg-red-500/20 rounded-xl border border-red-500/20 group-hover:border-red-500/30 transition-all duration-300">
                <div className="text-red-400 group-hover:text-red-300 transition-colors duration-300">
                  {feature.icon}
                </div>
              </div>
              
              <div className="space-y-2 flex-1">
                {/* High Contrast Title */}
                <h3 className="font-bold text-lg text-white group-hover:text-gray-100 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                {/* Readable Description */}
                <p className="text-gray-400 group-hover:text-gray-300 text-sm md:text-base leading-relaxed transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Optional CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        viewport={{ once: true }}
        className="pt-4"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-r from-red-500/10 via-red-600/10 to-orange-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm md:text-base">
                Ready to discover your next favorite movie?
              </p>
              <p className="text-gray-400 text-xs md:text-sm">
                Join thousands of movie lovers finding perfect recommendations
              </p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 focus:ring-2 focus:ring-red-500/50 min-h-[44px] whitespace-nowrap"
            onClick={() => {
              // Scroll to search form
              const searchForm = document.querySelector('#main-content');
              searchForm?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

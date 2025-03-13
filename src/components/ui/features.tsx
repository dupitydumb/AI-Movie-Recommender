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

export function Features() {
  const features = [
    {
      icon: <Brain className="h-10 w-10 text-purple-500" />,
      title: "AI-Powered Recommendations",
      description:
        "Our advanced AI understands your preferences and suggests movies that match your unique taste.",
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-purple-500" />,
      title: "Natural Language Search",
      description:
        "Simply describe what you're looking for in plain English. No need for complex filters or categories.",
    },
    {
      icon: <Zap className="h-10 w-10 text-purple-500" />,
      title: "Instant Results",
      description:
        "Get personalized movie recommendations in seconds, no matter how specific your request.",
    },
    {
      icon: <Layers className="h-10 w-10 text-purple-500" />,
      title: "Diverse Genres",
      description:
        "From action-packed blockbusters to indie dramas, we cover all genres and styles of filmmaking.",
    },
    {
      icon: <Clock className="h-10 w-10 text-purple-500" />,
      title: "Time Period Filtering",
      description:
        "Looking for 80s classics or recent releases? Specify any era and we'll find the perfect match.",
    },
    {
      icon: <ThumbsUp className="h-10 w-10 text-purple-500" />,
      title: "Personalized Ratings",
      description:
        "We highlight movies with high ratings that match your preferences for quality entertainment.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-purple-500" />,
      title: "Hidden Gems",
      description:
        "Discover overlooked masterpieces and cult classics you might have missed.",
    },
    {
      icon: <Film className="h-10 w-10 text-purple-500" />,
      title: "Comprehensive Details",
      description:
        "Get all the essential information about each movie to help you decide what to watch.",
    },
  ];

  return (
    <section id="features" className="py-16 border-t border-gray-800">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Why Choose Screenpick
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Our AI-powered platform makes finding your next favorite movie
          effortless and enjoyable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] group"
          >
            <div className="mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-[1px]">
          <button className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full transition-colors">
            Get Started Now
          </button>
        </div>
        <p className="mt-4 text-gray-400">
          No sign-up required. Start discovering movies instantly.
        </p>
      </div>
    </section>
  );
}

import React from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { WhyChooseUs } from "@/components/ui/why-choose-us";
import { motion } from "framer-motion";
import { Users, Heart, Brain, Sparkles, Film, Target, Star, Clock, Zap } from "lucide-react";
import { FadeIn } from "@/components/animation/fade-in";
import { ScaleIn } from "@/components/animation/scale-in";

const aboutFeatures = [
  {
    icon: <Brain className="w-5 h-5" />,
    title: "AI-Powered Recommendations",
    description: "Our advanced machine learning algorithms understand your unique taste in movies and continuously improve suggestions"
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Passion for Cinema",
    description: "Built by movie enthusiasts who understand the joy of discovering the perfect film for any mood or moment"
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Community Driven",
    description: "Powered by feedback from thousands of movie lovers worldwide to create the most accurate recommendations"
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Precision Matching",
    description: "We don't just match genres—we understand context, mood, themes, and personal preferences for perfect suggestions"
  }
];

const stats = [
  {
    icon: <Film className="w-8 h-8" />,
    number: "50,000+",
    label: "Movies Analyzed"
  },
  {
    icon: <Users className="w-8 h-8" />,
    number: "100,000+",
    label: "Happy Users"
  },
  {
    icon: <Star className="w-8 h-8" />,
    number: "4.9/5",
    label: "User Rating"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    number: "< 1s",
    label: "Response Time"
  }
];

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
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
                About Our Mission
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Revolutionizing Movie
                </span>
                <br />
                <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
                  Discovery
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                We're on a mission to help movie lovers discover their next favorite film through 
                the power of artificial intelligence and deep understanding of cinematic preferences.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-red-500/10 group-hover:bg-red-500/20 border border-red-500/20 group-hover:border-red-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300">
                    <div className="text-red-400 group-hover:text-red-300 transition-colors duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white group-hover:text-gray-100 transition-colors duration-300 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                <p>
                  Welcome to MovieAI, where the magic of cinema meets the power of artificial intelligence. 
                  We were born from a simple frustration: spending more time searching for movies than actually watching them.
                </p>
                <p>
                  Our team of movie enthusiasts and AI engineers came together with a mission to create the most intuitive 
                  and accurate movie recommendation system ever built. We believe that every movie has its perfect audience, 
                  and every viewer has their ideal next film waiting to be discovered.
                </p>
                <p>
                  Today, we're proud to help thousands of movie lovers discover their next favorite film through our 
                  advanced AI technology that understands not just what you've watched, but how you feel, what mood 
                  you're in, and what kind of experience you're seeking.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 px-4 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Our Mission
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                To eliminate the paradox of choice in entertainment by connecting every person 
                with movies that will genuinely resonate with them, creating more meaningful 
                and enjoyable viewing experiences.
              </p>
            </motion.div>

            <WhyChooseUs 
              title="What Sets Us Apart"
              subtitle="More Than Just Recommendations"
              description="We're not just another recommendation engine. We're your personal movie curator, understanding the nuances of storytelling, emotion, and personal taste."
              features={aboutFeatures}
            />
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Built by Movie Lovers
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
                Our diverse team combines expertise in artificial intelligence, data science, 
                user experience design, and most importantly, a genuine passion for cinema. 
                We watch, analyze, and obsess over movies so you can simply enjoy them.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "AI Engineers",
                    description: "Building the smartest recommendation algorithms",
                    icon: <Brain className="w-8 h-8" />
                  },
                  {
                    title: "Cinema Experts",
                    description: "Curating and understanding film culture",
                    icon: <Film className="w-8 h-8" />
                  },
                  {
                    title: "UX Designers",
                    description: "Crafting seamless discovery experiences",
                    icon: <Users className="w-8 h-8" />
                  }
                ].map((role, index) => (
                  <motion.div
                    key={role.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="p-6 bg-gray-900/50 rounded-2xl border border-gray-800/50 hover:border-red-500/30 transition-colors"
                  >
                    <div className="text-red-400 mb-4 flex justify-center">
                      {role.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                    <p className="text-gray-400">{role.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default AboutPage;

"use client";

import React from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { WhyChooseUs } from "@/components/ui/why-choose-us";
import { ApiDocumentation } from "@/components/ui/api-documentation";
import { Book, ArrowRight, Zap, Shield, Code2, Globe, Cpu, Database } from "lucide-react";
import { motion } from "framer-motion";

const apiFeatures = [
  {
    icon: <Code2 className="w-5 h-5" />,
    title: "Simple Integration",
    description: "RESTful API with clear endpoints and comprehensive documentation for quick implementation"
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Lightning Fast",
    description: "Sub-second response times with globally distributed infrastructure and optimized caching"
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Enterprise Security",
    description: "API key authentication, rate limiting, and HTTPS encryption for secure data transmission"
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Global CDN",
    description: "Worldwide availability with 99.9% uptime SLA and automatic failover protection"
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    title: "Advanced AI",
    description: "Powered by state-of-the-art machine learning models trained on vast movie databases"
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Rich Metadata",
    description: "Comprehensive movie information including ratings, genres, cast, and detailed descriptions"
  }
];

export default function Docs() {
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
                <Book className="w-4 h-4" />
                API Documentation
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Developer
                </span>
                <br />
                <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
                  Documentation
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Integrate our powerful movie recommendation API into your applications with ease. 
                Get started in minutes with our comprehensive guides and examples.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-red-500/50 flex items-center gap-2 justify-center"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-200"
                >
                  View Examples
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* API Documentation */}
        <section className="relative z-10 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <ApiDocumentation />
          </div>
        </section>
          
        {/* Why Choose Our API Section */}
        <section className="relative z-10 py-20 px-4 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <WhyChooseUs 
              title="Why Choose Our API"
              subtitle="Developer-First Movie Recommendation API"
              description="Built for developers who need reliable, fast, and intelligent movie recommendations. Our API combines cutting-edge AI with developer-friendly design."
              features={apiFeatures}
            />
          </div>
        </section>
        
        <Footer />
      </div>
    </div>
  );
}

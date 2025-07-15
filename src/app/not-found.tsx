import React from 'react';
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animation/fade-in";
import { motion } from "framer-motion";
import { Home, Search, Film, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-purple-900/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="flex items-center justify-center min-h-screen px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <FadeIn>
              {/* 404 Animation */}
              <motion.div
                className="mb-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="relative">
                  <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
                    404
                  </h1>
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Film className="w-16 h-16 text-red-500/30" />
                  </motion.div>
                </div>
              </motion.div>

              <h2 className="text-2xl md:text-4xl font-bold mb-6">
                Oops! This page went to the movies
              </h2>
              
              <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
                The page you're looking for seems to have disappeared faster than a movie credit scene. 
                Let's get you back to the action!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/">
                  <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3">
                    <Search className="w-4 h-4 mr-2" />
                    Search Movies
                  </Button>
                </Link>
              </div>

              {/* Popular Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                {[
                  { title: "Browse Movies", icon: <Film className="w-5 h-5" />, href: "/" },
                  { title: "About Us", icon: <ArrowLeft className="w-5 h-5" />, href: "/about" },
                  { title: "API Docs", icon: <Search className="w-5 h-5" />, href: "/docs" }
                ].map((link, index) => (
                  <motion.div
                    key={link.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  >
                    <Link href={link.href}>
                      <div className="p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl hover:border-red-500/30 transition-colors group cursor-pointer">
                        <div className="text-red-400 mb-2 group-hover:scale-110 transition-transform">
                          {link.icon}
                        </div>
                        <div className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {link.title}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}

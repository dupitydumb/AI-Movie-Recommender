"use client";

import Link from "next/link";
import { Film, Menu, X, Search, BookOpen, Home } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
  { href: "/docs", label: "API Docs", icon: <BookOpen className="w-4 h-4" /> },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo - High Contrast */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="Movie Recommender Home"
        >
          <motion.div
            whileHover={{ rotate: 12 }}
            transition={{ duration: 0.3 }}
            className="p-2 bg-red-500/20 rounded-xl border border-red-500/30"
          >
            <Film className="h-6 w-6 text-red-400" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-white tracking-tight">
              Screenpick
            </span>
            <span className="text-xs text-gray-400 -mt-1">
              AI-Powered Discovery
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Minimal Chrome */}
        <nav className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                pathname === link.href
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "text-gray-300 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          
          {/* Primary CTA - Accent Red */}
          <Button
            asChild
            className="ml-6 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-red-500/50 min-h-[44px]"
          >
            <a
              href="https://rapidapi.com/AirFU/api/ai-movie-recommender"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get API Access
            </a>
          </Button>
        </nav>

        {/* Mobile Menu Button - Touch Friendly */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="md:hidden p-3 text-gray-300 hover:text-white rounded-xl hover:bg-gray-800/50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </motion.button>

        {/* Mobile Navigation - Full Screen Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-gray-950/95 backdrop-blur-md z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800">
                  <Link
                    href="/"
                    className="flex items-center gap-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="p-2 bg-red-500/20 rounded-xl border border-red-500/30">
                      <Film className="h-5 w-5 text-red-400" />
                    </div>
                    <span className="font-bold text-lg text-white">Screenpick</span>
                  </Link>
                  <button
                    className="p-3 text-gray-300 hover:text-white rounded-xl hover:bg-gray-800/50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex-1 px-6 py-8 space-y-2">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 text-lg font-medium min-h-[44px] ${
                          pathname === link.href
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                    className="pt-6"
                  >
                    <Button
                      asChild
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition-all duration-200 min-h-[44px]"
                    >
                      <a
                        href="https://rapidapi.com/AirFU/api/ai-movie-recommender"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Get API Access
                      </a>
                    </Button>
                  </motion.div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
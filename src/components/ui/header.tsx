"use client";

import Link from "next/link";
import { Film, Menu, X, Search, BookOpen, Home, User, LogOut, Crown, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";

const navLinks = [
  { href: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
  { href: "/docs", label: "API Docs", icon: <BookOpen className="w-4 h-4" /> },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

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
          
          {/* User Authentication */}
          <div className="ml-6 flex items-center gap-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user.email?.split('@')[0]}</span>
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50"
                    >
                      <div className="p-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => {
                            signOut()
                            setUserMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                onClick={() => setAuthModalOpen(true)}
                className="bg-gray-800/50 hover:bg-gray-700/50 text-white border border-gray-600 px-4 py-2 rounded-xl transition-colors"
              >
                Sign In
              </Button>
            )}
            
            {/* Primary CTA */}
            <Button
              asChild
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-red-500/50 min-h-[44px]"
            >
              <a
                href="https://rapidapi.com/AirFU/api/ai-movie-recommender"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get API Access
              </a>
            </Button>
          </div>
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
                  
                  {/* Mobile User Authentication */}
                  {user ? (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: navLinks.length * 0.1 }}
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 text-lg font-medium min-h-[44px] text-gray-300 hover:text-white hover:bg-gray-800/50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navLinks.length + 1) * 0.1 }}
                      >
                        <button
                          onClick={() => {
                            signOut()
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 text-lg font-medium min-h-[44px] text-gray-300 hover:text-white hover:bg-gray-800/50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.1 }}
                    >
                      <Button
                        onClick={() => {
                          setAuthModalOpen(true)
                          setIsMenuOpen(false)
                        }}
                        className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white border border-gray-600 py-4 rounded-xl transition-colors min-h-[44px]"
                      >
                        Sign In
                      </Button>
                    </motion.div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navLinks.length + 2) * 0.1 }}
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
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </header>
  );
}
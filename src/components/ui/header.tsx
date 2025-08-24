"use client";

import Link from "next/link";
import { Film, Menu, X, Search, BookOpen, Home, User, LogOut, Heart, BarChart3 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/ui/auth-modal";

const navLinks = [
  { href: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
  { href: "/docs", label: "API Docs", icon: <BookOpen className="w-4 h-4" /> },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const authenticatedNavLinks = [
    { href: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
    { href: "/dashboard", label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { href: "/saved", label: "Saved Movies", icon: <Heart className="w-4 h-4" /> },
    { href: "/docs", label: "API Docs", icon: <BookOpen className="w-4 h-4" /> },
  ];

  const currentNavLinks = user ? authenticatedNavLinks : navLinks;

  const handleSignOut = async () => {
    console.log('Sign out clicked');
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        // Optionally show a toaster notification on error
      } else {
        setShowUserMenu(false);
        // Force a reload to ensure a clean state
        window.location.reload();
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

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
          {currentNavLinks.map((link) => (
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
          
          {!user ? (
            <div className="flex items-center gap-3 ml-6">
              <Button
                onClick={() => openAuthModal('login')}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white font-medium px-4 py-2 rounded-xl transition-all duration-200 min-h-[44px]"
              >
                Sign In
              </Button>
              <Button
                onClick={() => openAuthModal('signup')}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-red-500/50 min-h-[44px]"
              >
                Get Started
              </Button>
            </div>
          ) : (
            <div className="relative ml-6">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800/50 transition-colors group"
              >
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                  <User className="w-4 h-4 text-red-400" />
                </div>
                <span className="text-gray-300 group-hover:text-white font-medium">
                  {profile?.username || 'User'}
                </span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl p-2 shadow-lg z-50"
                  >
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
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
                  {currentNavLinks.map((link, index) => (
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
                  
                  {!user ? (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: currentNavLinks.length * 0.1 }}
                      className="pt-6 space-y-3"
                    >
                      <Button
                        onClick={() => {
                          openAuthModal('login');
                          setIsMenuOpen(false);
                        }}
                        variant="outline"
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white font-medium py-4 rounded-xl transition-all duration-200 min-h-[44px]"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => {
                          openAuthModal('signup');
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl transition-all duration-200 min-h-[44px]"
                      >
                        Get Started
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: currentNavLinks.length * 0.1 }}
                      className="pt-6 space-y-3"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-xl">
                        <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
                          <User className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{profile?.username || 'User'}</p>
                          <p className="text-gray-400 text-sm">{profile?.email}</p>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-5 h-5" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </header>
  );
}
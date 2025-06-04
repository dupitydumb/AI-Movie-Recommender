"use client";

import Link from "next/link";
import { Film, Menu, X, Sparkles, Star, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home", icon: <Star className="w-4 h-4 mr-1" /> },
  { href: "/docs", label: "Docs", icon: <Info className="w-4 h-4 mr-1" /> },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-purple-950 border-b border-purple-800 shadow-lg">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between relative">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Screenpick Home"
        >
          <span className="relative flex items-center">
            <Film className="h-7 w-7 text-purple-500 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-2 -right-2 animate-pulse">
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </span>
          </span>
          <span className="font-extrabold text-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-300 bg-clip-text text-transparent tracking-tight drop-shadow">
            Screenpick
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8 text-gray-200 font-medium" role="navigation" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-1 rounded-full transition-all duration-200 hover:bg-purple-800/30 hover:text-purple-300 ${
                pathname === link.href
                  ? "bg-purple-700/40 text-purple-300 font-bold shadow"
                  : ""
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <Button
            asChild
            variant="default"
            className="ml-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg px-6 py-2 rounded-full font-semibold"
          >
            <a
              href="https://rapidapi.com/AirFU/api/ai-movie-recommender"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
            </a>
          </Button>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-purple-300 p-2 rounded-full hover:bg-purple-800/30 transition"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col z-50 md:hidden animate-fade-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-purple-800">
              <Link
                href="/"
                className="flex items-center gap-2"
                aria-label="Screenpick Home"
                onClick={() => setIsMenuOpen(false)}
              >
                <Film className="h-6 w-6 text-purple-500" />
                <span className="font-bold text-xl text-gray-200">Screenpick</span>
              </Link>
              <button
                className="text-purple-300 p-2 rounded-full hover:bg-purple-800/30 transition"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
              >
                <X className="h-7 w-7" />
              </button>
            </div>
            <nav className="flex flex-col gap-2 px-8 py-8 text-lg font-semibold">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl hover:bg-purple-800/40 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <Button
                asChild
                variant="default"
                className="mt-6 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-lg px-6 py-2 rounded-full font-semibold"
              >
                <a
                  href="https://rapidapi.com/AirFU/api/ai-movie-recommender"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </a>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
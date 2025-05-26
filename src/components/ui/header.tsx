"use client";

import Link from "next/link";
import { Film, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-800 bg-black/90 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Film className="h-6 w-6 text-purple-500" />
          <span className="font-bold text-xl text-gray-200">
            Screenpick
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-6 text-gray-200">
          <Link
            href="/"
            className="text-sm hover:text-purple-400 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/docs"
            className="text-sm hover:text-purple-400 transition-colors"
          >
            Documentation
          </Link>
          <Button
            variant="default"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Get Started
          </Button>
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/95 border-b border-gray-800 md:hidden">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                href="/"
                className="text-sm py-2 hover:text-purple-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="#features"
                className="text-sm py-2 hover:text-purple-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm py-2 hover:text-purple-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

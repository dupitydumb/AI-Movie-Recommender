"use client";

import React from 'react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { UsageAnalytics } from '@/components/ui/usage-analytics';
import { PersistentUsageBar } from '@/components/ui/persistent-usage-bar';
import { AuthProvider } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        <Header />
        <PersistentUsageBar />
        
        <main className="relative overflow-hidden py-20">
          {/* Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Usage Dashboard
                </span>
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Track your AI movie recommendation usage, manage your limits, and upgrade your plan.
              </p>
            </motion.div>

            <UsageAnalytics />
          </div>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}
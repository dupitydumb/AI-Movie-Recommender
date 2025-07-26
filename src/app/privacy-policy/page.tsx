"use client";

import React from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Breadcrumb, BreadcrumbStructuredData } from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function PrivacyPolicy() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Privacy Policy', href: '/privacy-policy', isCurrentPage: true }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-red-500/5 via-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10">
        <Header />
        <section className="relative pt-8 pb-4 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Breadcrumb items={breadcrumbItems} />
            </motion.div>
          </div>
        </section>
        <section className="relative z-10 pt-12 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Privacy Policy
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Your Privacy Matters
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                This Privacy Policy explains how Screenpick collects, uses, and protects your information when you use our website.
              </p>
            </motion.div>
            <div className="text-left space-y-8 text-gray-300 text-lg leading-relaxed bg-gray-900/50 rounded-2xl p-8 border border-gray-800/50">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">1. Information We Collect</h2>
                <ul className="list-disc pl-6">
                  <li>Personal information you provide (such as email, preferences, etc.)</li>
                  <li>Usage data (pages visited, search queries, etc.)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">2. How We Use Your Information</h2>
                <ul className="list-disc pl-6">
                  <li>To provide and improve our services</li>
                  <li>To personalize your experience</li>
                  <li>To communicate updates and offers</li>
                  <li>To ensure security and prevent fraud</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">3. Data Sharing</h2>
                <p>We do not sell your personal information. We may share data with trusted partners for service provision, analytics, or legal compliance.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">4. Your Choices</h2>
                <ul className="list-disc pl-6">
                  <li>You can update or delete your information at any time</li>
                  <li>You can opt out of marketing communications</li>
                  <li>You can manage cookie preferences in your browser</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">5. Security</h2>
                <p>We use industry-standard measures to protect your data, but no system is 100% secure.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">6. Changes to This Policy</h2>
                <p>We may update this Privacy Policy. Changes will be posted on this page with a new effective date.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">7. Contact Us</h2>
                <p>If you have questions about this policy, contact us at support@screenpick.com.</p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
        <BreadcrumbStructuredData items={breadcrumbItems} />
      </div>
    </div>
  );
}

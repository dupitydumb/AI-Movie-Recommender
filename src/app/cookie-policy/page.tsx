"use client";

import React from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Breadcrumb, BreadcrumbStructuredData } from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function CookiePolicy() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cookie Policy', href: '/cookie-policy', isCurrentPage: true }
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
                Cookie Policy
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                How We Use Cookies
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                This Cookie Policy explains how Screenpick uses cookies and similar technologies on our website. We only use Google Analytics for activity tracking and do not store any personal data or search queries ourselves.
              </p>
            </motion.div>
            <div className="text-left space-y-8 text-gray-300 text-lg leading-relaxed bg-gray-900/50 rounded-2xl p-8 border border-gray-800/50">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">1. What Are Cookies?</h2>
                <p>Cookies are small text files stored on your device to help websites remember information about your visit.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">2. How We Use Cookies</h2>
                <ul className="list-disc pl-6">
                  <li>We use cookies only for Google Analytics to understand general site usage.</li>
                  <li>We do not use cookies to store your personal data or search queries.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">3. Types of Cookies We Use</h2>
                <ul className="list-disc pl-6">
                  <li>Analytics cookies (Google Analytics only)</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">4. Managing Cookies</h2>
                <p>You can control and delete cookies through your browser settings. Disabling cookies may affect analytics tracking but will not affect your experience, as we do not store any personal data or queries.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">5. Changes to This Policy</h2>
                <p>We may update this Cookie Policy. Changes will be posted on this page with a new effective date.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">6. Contact Us</h2>
                <p>If you have questions about our use of cookies, contact us at support@screenpick.com.</p>
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

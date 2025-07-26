"use client";

import React from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Breadcrumb, BreadcrumbStructuredData } from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function TermsOfService() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Terms of Service', href: '/terms-of-service', isCurrentPage: true }
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
                Terms of Service
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Website Usage Terms
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Please read these Terms of Service ("Terms") carefully before using Screenpick. We only track website activity using Google Analytics and do not store any personal data or search queries.
              </p>
            </motion.div>
            <div className="text-left space-y-8 text-gray-300 text-lg leading-relaxed bg-gray-900/50 rounded-2xl p-8 border border-gray-800/50">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">1. Acceptance of Terms</h2>
                <p>By accessing or using Screenpick, you agree to be bound by these Terms. If you do not agree, please do not use our website.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">2. Use of Service</h2>
                <ul className="list-disc pl-6">
                  <li>You must be at least 13 years old to use this site.</li>
                  <li>You agree not to misuse the service or attempt to disrupt its operation.</li>
                  <li>All recommendations are for informational purposes only.</li>
                  <li>Screenpick does not store any of your personal data or search queries. Only anonymous usage data is collected via Google Analytics.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">3. Intellectual Property</h2>
                <p>All content, trademarks, and data on Screenpick are the property of their respective owners and protected by copyright laws.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">4. Limitation of Liability</h2>
                <p>Screenpick is provided "as is" without warranties. We are not liable for any damages arising from your use of the site.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">5. Changes to Terms</h2>
                <p>We may update these Terms at any time. Continued use of the site means you accept the new Terms.</p>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">6. Contact</h2>
                <p>For questions about these Terms, contact us at support@screenpick.com.</p>
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

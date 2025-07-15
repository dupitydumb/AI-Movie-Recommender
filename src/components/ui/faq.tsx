"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { FadeIn } from "../animation/fade-in";
import { motion, AnimatePresence } from "framer-motion";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is Screenpick's AI movie recommendation generator?",
      answer:
        "Screenpick is an advanced AI-powered platform that generates personalized movie recommendations based on your preferences, mood, and interests. Simply describe what you're looking for in natural language, and our AI will suggest movies that match your criteria.",
    },
    {
      question: "How accurate are the AI movie recommendations?",
      answer:
        "Our AI movie recommendation engine has been trained on millions of movies and user preferences to provide highly accurate suggestions. The more specific your request, the more tailored the recommendations will be. Our users report a 92% satisfaction rate with their recommended movies.",
    },
    {
      question: "Is Screenpick free to use?",
      answer:
        "Yes! Screenpick offers a free tier that allows you to get up to 10 AI-powered movie recommendations per day. For unlimited recommendations and additional features, we offer affordable Premium and Family subscription plans.",
    },
    {
      question:
        "Can I search for movies by specific criteria like genre, decade, or actor?",
      answer:
        "You can ask for movies from specific genres (e.g., 'sci-fi thrillers'), time periods (e.g., '90s comedies'), featuring certain actors, or even combining multiple criteria (e.g., 'action movies from the 80s with martial arts').",
    },
    {
      question: "How does Screenpick's AI recommendation engine work?",
      answer:
        "Our AI recommendation engine uses advanced natural language processing to understand your preferences and match them with our extensive movie database. It analyzes factors like genre, plot elements, mood, critical reception, and more to find the perfect movies for you.",
    },
    {
      question:
        "Can developers integrate Screenpick into their own applications?",
      answer:
        "Yes! We offer an API for developers who want to integrate our AI movie recommendation engine into their applications. Check out our API documentation for more details and pricing options.",
    },
  ];

  return (
    <section id="faq" className="relative py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            FAQ
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Frequently Asked
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about our AI movie recommendation generator
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800/50 hover:border-gray-700/50 rounded-2xl backdrop-blur-sm transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.button
                className="flex justify-between items-center w-full p-6 text-left group"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                whileTap={{ scale: 0.99 }}
              >
                <h3 className="text-lg font-semibold text-white group-hover:text-gray-100 transition-colors duration-200 pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-red-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-red-400 transition-colors duration-200" />
                  )}
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-300 px-6 pb-6 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

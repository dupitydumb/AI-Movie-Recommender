"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <section id="faq" className="py-16 border-t border-gray-800">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Everything you need to know about our AI movie recommendation
          generator
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-700 last:border-b-0">
            <button
              className="flex justify-between items-center w-full py-5 text-left"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <h3 className="text-lg font-semibold">{faq.question}</h3>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-purple-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? "max-h-96 pb-5" : "max-h-0"
              }`}
            >
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

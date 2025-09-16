"use client";

import React from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { Breadcrumb, BreadcrumbStructuredData } from "@/components/ui/breadcrumb";
import { Check, Star, Zap, Crown } from "lucide-react";
import { FadeIn } from "@/components/animation/fade-in";
import { ScaleIn } from "@/components/animation/scale-in";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const PricePage: React.FC = () => {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Pricing', href: '/price', isCurrentPage: true }
  ];

  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "Forever",
      description: "Perfect for casual movie lovers",
      icon: <Star className="w-6 h-6" />,
      features: [
        "50 movie recommendations per month",
        "Basic genre filtering",
        "Community ratings access",
        "Standard support"
      ],
      popular: false,
      buttonText: "Get Started Free",
      buttonStyle: "outline"
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "For serious film enthusiasts",
      icon: <Zap className="w-6 h-6" />,
      features: [
        "Unlimited movie recommendations",
        "Advanced AI personalization",
        "Mood-based suggestions",
        "Priority support",
        "Early access to new features",
        "Detailed movie analytics"
      ],
      popular: true,
      buttonText: "Start Pro Trial",
      buttonStyle: "default"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For businesses and developers",
      icon: <Crown className="w-6 h-6" />,
      features: [
        "Everything in Pro",
        "API access & documentation",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "White-label solutions"
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonStyle: "outline"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-purple-900/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header />
        
        {/* Breadcrumb Navigation */}
        <section className="relative pt-8 pb-4 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Breadcrumb items={breadcrumbItems} />
            </motion.div>
          </div>
        </section>
        
        {/* Hero Section */}
        <section className="pt-12 pb-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <FadeIn>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent">
                Simple, Transparent
                <br />
                <span className="text-red-400">Pricing</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Choose the perfect plan for your movie discovery needs. Start free and upgrade anytime.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <ScaleIn key={plan.name} delay={index * 0.1}>
                  <motion.div
                    className={`relative p-8 rounded-2xl border transition-all duration-300 hover:scale-105 ${
                      plan.popular
                        ? "border-red-500/50 bg-red-500/5"
                        : "border-gray-700/50 bg-gray-900/50"
                    }`}
                    whileHover={{ y: -5 }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-3 rounded-xl ${
                        plan.popular ? "bg-red-500/20 text-red-400" : "bg-gray-700/50 text-gray-400"
                      }`}>
                        {plan.icon}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-6">{plan.description}</p>

                    <div className="mb-8">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-gray-400 ml-2">/{plan.period}</span>
                      </div>
                    </div>

                    <Button
                      className={`w-full mb-8 ${
                        plan.buttonStyle === "default"
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "border-gray-600 text-gray-300 hover:bg-gray-700"
                      }`}
                      variant={plan.buttonStyle === "default" ? "default" : "outline"}
                    >
                      {plan.buttonText}
                    </Button>

                    <div className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <Check className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </ScaleIn>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-gray-950/50">
          <div className="max-w-4xl mx-auto text-center">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
                Frequently Asked Questions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {[
                  {
                    question: "Can I change plans anytime?",
                    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
                  },
                  {
                    question: "Is there a free trial?",
                    answer: "Yes! Our Pro plan includes a 14-day free trial. No credit card required to start."
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit cards and bank transfers for Enterprise plans."
                  },
                  {
                    question: "Can I cancel anytime?",
                    answer: "Absolutely. You can cancel your subscription at any time with no cancellation fees."
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="p-6 bg-gray-900/50 rounded-xl border border-gray-700/50"
                  >
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                    <p className="text-gray-400">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        <Footer />
        
        {/* Structured Data for Breadcrumbs */}
        <BreadcrumbStructuredData items={breadcrumbItems} />
      </div>
    </div>
  );
};

export default PricePage;

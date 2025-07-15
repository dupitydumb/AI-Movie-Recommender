import { Star, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Movie Enthusiast",
      quote:
        "Screenpick's AI recommendations are spot-on! I was looking for sci-fi movies with time travel elements, and it suggested films I'd never heard of but absolutely loved.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Film Student",
      quote:
        "As a film student, I use Screenpick to discover hidden gems across different genres. The AI understands nuanced requests like 'French new wave films with social commentary'.",
      rating: 5,
    },
    {
      name: "Jessica Rodriguez",
      role: "Family Movie Night Organizer",
      quote:
        "Finding movies that my whole family enjoys used to be a challenge. With Screenpick, I just type 'family-friendly adventure with humor' and get perfect suggestions every time.",
      rating: 4,
    },
  ];

  return (
    <section id="testimonials" className="relative py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Testimonials
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              What Our Users
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
              Say About Us
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied users who have discovered their new favorite movies with our AI recommendation engine
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-8 bg-gray-900/50 hover:bg-gray-900/70 border border-gray-800/50 hover:border-gray-700/50 rounded-2xl backdrop-blur-sm transition-all duration-300"
            >
              {/* Rating Stars */}
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-300 group-hover:text-gray-200 italic leading-relaxed mb-6 text-lg transition-colors duration-300">
                "{testimonial.quote}"
              </blockquote>

              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-red-500/50 transition-all duration-300">
                  <img
                    src={`https://ui-avatars.com/api/?background=dc2626&color=fff&name=${testimonial.name}&bold=true`}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-gray-100 transition-colors duration-300">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-red-400 transition-colors duration-300">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

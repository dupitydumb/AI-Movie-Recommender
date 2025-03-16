import { Star } from "lucide-react";
import Image from "next/image";

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
    <section id="testimonials" className="py-16 border-t border-gray-800">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          What Our Users Say
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Join thousands of satisfied users who have discovered their new
          favorite movies with our AI recommendation engine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-gray-800/30 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={`https://ui-avatars.com/api/?background=random&name=${testimonial.name}`} // Change this to a real image URL
                  alt={testimonial.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{testimonial.name}</h3>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            </div>

            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < testimonial.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-600"
                  }`}
                />
              ))}
            </div>

            <p className="text-gray-300 italic">"{testimonial.quote}"</p>
          </div>
        ))}
      </div>
    </section>
  );
}

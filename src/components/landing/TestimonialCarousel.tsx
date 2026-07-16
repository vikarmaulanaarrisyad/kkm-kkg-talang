"use client";

import { useState, useEffect } from "react";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Testimonial = {
  id: string | number;
  quote: string;
  author: string;
  role: string;
  image: string;
};

export default function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000); // Auto slide every 8 seconds
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="w-full py-24 px-4 bg-white relative overflow-hidden border-t border-slate-100">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-emerald-50 blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-50 blur-3xl opacity-60" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-bold mb-4 shadow-sm border border-slate-200">
            <Quote className="w-4 h-4 text-emerald-600" /> Kata Mereka
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Suara Hati <span className="text-emerald-600">Pendidik</span></h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Dampak nyata dari kolaborasi dan pemanfaatan teknologi di lingkungan KKM-KKG Talang.
          </p>
        </div>

        <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-16 shadow-2xl overflow-hidden">
          {/* Accent glow inside the dark card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 min-h-[250px] md:min-h-[200px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-4xl mx-auto text-center"
              >
                <Quote className="w-12 h-12 md:w-16 md:h-16 text-emerald-400/30 mx-auto mb-6 rotate-180" />
                <p className="text-xl md:text-3xl font-medium text-white leading-relaxed mb-10 px-8">
                  "{testimonials[currentIndex].quote}"
                </p>
                <div className="flex flex-col items-center justify-center gap-4">
                  <img 
                    src={testimonials[currentIndex].image} 
                    alt={testimonials[currentIndex].author}
                    className="w-16 h-16 rounded-full border-2 border-emerald-400 shadow-lg object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-white">{testimonials[currentIndex].author}</h4>
                    <p className="text-emerald-400 text-sm font-medium mt-1">{testimonials[currentIndex].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="absolute inset-y-0 left-2 md:left-8 flex items-center">
            <button 
              onClick={handlePrev}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/10 group focus:outline-none z-20"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-2 md:right-8 flex items-center">
            <button 
              onClick={handleNext}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all border border-white/10 group focus:outline-none z-20"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Dots */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full focus:outline-none ${
                  idx === currentIndex 
                    ? "w-8 h-2 bg-emerald-400" 
                    : "w-2 h-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

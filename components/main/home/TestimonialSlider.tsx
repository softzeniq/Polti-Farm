"use client";

import { useSliderSlides, SliderSlide } from "@/hooks/useShopData";
import { ChevronLeft, ChevronRight, Quote, User } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

export function TestimonialSlider({ initialSlides }: { initialSlides?: SliderSlide[] }) {
  const { data: allSlides = [] } = useSliderSlides(true, initialSlides);
  const slides = allSlides.filter(s => s.type === 'testimonial');
  
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  if (slides.length === 0) {
    return null; // Don't show anything if there are no testimonial slides
  }

  return (
    <section className="w-full my-8">
      {/* Slider Container */}
      <div className="relative overflow-hidden group w-full min-h-[400px] md:min-h-[500px]">
        {/* Slides */}
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image */}
              <Image
                src={slide.image}
                alt="Testimonial Background"
                fill
                priority={index === 0}
                className="w-full h-full object-cover"
                sizes="100vw"
              />

              {/* Overlay for better readability just in case */}
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />

              {/* Content Box */}
              <div className="absolute inset-0 z-20 flex items-center justify-center p-4 md:p-8">
                <div className="bg-white p-6 md:p-10 max-w-4xl w-full shadow-2xl relative">
                  <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 bg-[#1a1a2e] p-3 md:p-4 text-white">
                    <Quote className="h-6 w-6 md:h-8 md:w-8 fill-current" />
                  </div>
                  
                  <p className="text-sm md:text-lg lg:text-xl italic font-serif leading-relaxed text-foreground/90 mt-4 md:mt-2">
                    "{slide.text}"
                  </p>
                  
                  <div className="mt-6 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-sm md:text-base text-foreground/80 italic">
                      {slide.heading}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-foreground flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-foreground flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

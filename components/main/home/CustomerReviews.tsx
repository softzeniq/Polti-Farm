import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useSliderSlides, useReviews } from "@/hooks/useShopData";
import { Quote, Star } from "lucide-react";
import Image from "next/image";

export function CustomerReviews() {
  const { data: reviews = [], isLoading } = useReviews();
  const { data: slides = [] } = useSliderSlides(true);
  const { ref, isVisible } = useScrollReveal();
  
  const bgSlide = slides.find(s => s.type === 'testimonial');

  if (isLoading || reviews.length === 0) return null;

  return (
    <section
      className="relative section-padding border-y border-border/50 text-foreground overflow-hidden"
      ref={ref}
    >
      {bgSlide && (
        <>
          <div className="absolute inset-0 z-0">
            <Image 
              src={bgSlide.image} 
              alt="Testimonial Background" 
              fill 
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 z-0 bg-black/40" />
        </>
      )}
      {!bgSlide && (
        <div className="absolute inset-0 z-0 bg-muted/40" />
      )}
      
      <div className="container-shop relative z-10">
        <div
          className={`text-center mb-12 reveal-base ${isVisible ? "reveal-visible" : ""}`}
        >
          <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${bgSlide ? "text-white" : ""}`}>
            {bgSlide && bgSlide.heading ? bgSlide.heading : "What Our Customers Say"}
          </h2>
          <p className={`mt-2 text-sm ${bgSlide ? "text-white/80" : "text-muted-foreground"}`}>
            {bgSlide && bgSlide.text ? bgSlide.text : "Real reviews from real customers"}
          </p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          className={`w-full reveal-base ${isVisible ? "reveal-visible" : ""}`}
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review, index) => (
              <CarouselItem
                key={review.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <div className="bg-background rounded-2xl p-6 border border-border/50 shadow-sm h-full flex flex-col">
                  <Quote className="h-8 w-8 text-accent/20 mb-4 shrink-0" />
                  <p className="text-foreground/90 mb-6 leading-relaxed flex-1 text-sm">
                    "{review.text}"
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="font-semibold text-sm text-foreground/90">{review.name}</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? "text-accent fill-accent"
                                : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-8">
            <CarouselPrevious className="static translate-y-0 bg-background border-border text-foreground hover:bg-muted" />
            <CarouselNext className="static translate-y-0 bg-background border-border text-foreground hover:bg-muted" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}

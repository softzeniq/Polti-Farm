"use client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCategories } from "@/hooks/useShopData";
import { ArrowRight, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

export function FeaturedCategories() {
  const { data: categories = [], isLoading } = useCategories();
  const { t } = useSiteSettings();
  const { ref: sectionRef, isVisible } = useScrollReveal();

  // Split categories for 2 independent scrolling rows on mobile
  const midIndex = Math.ceil(categories.length / 2);
  const mobileRow1 = categories.slice(0, midIndex);
  const mobileRow2 = categories.slice(midIndex);

  if (isLoading) {
    return (
      <section className="section-padding">
        <div className="container-shop">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl tracking-tight">
              {t("home.shopByCategory") || "Categories"}
            </h2>
          </div>
          {/* Desktop Loading Skeleton */}
          <div className="hidden md:grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4 animate-pulse">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border/80 rounded-xl p-4 flex flex-col items-center justify-center gap-3 aspect-square"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-muted rounded-full" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
          {/* Mobile Loading Skeleton */}
          <div className="flex md:hidden flex-col gap-3">
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-24 bg-card border border-border/80 rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square"
                >
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="h-3.5 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-24 bg-card border border-border/80 rounded-xl p-3 flex flex-col items-center justify-center gap-2 aspect-square"
                >
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="h-3.5 w-12 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding" ref={sectionRef}>
      <div className="container-shop">
        <div
          className={`flex items-center justify-between mb-8 reveal-left ${isVisible ? "reveal-visible" : ""}`}
        >
          <div>
            <h2 className="text-xl md:text-1xl tracking-tight">
              {t("home.shopByCategory") || "Categories"}
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Desktop View: Separate Square Card Layout with Spacing */}
        <div className="hidden md:grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
          {categories.slice(0, 16).map((category, index) => (
            <div
              key={category.id}
              className={`flex flex-col items-center gap-3 select-none group reveal-scale stagger-${index + 1} ${isVisible ? "reveal-visible" : ""}`}
            >
              <Link
                href={`/shop?category=${category.slug}`}
                className="w-full aspect-square bg-white border-2 border-accent/10 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_8px_30px_rgba(34,197,94,0.12)] group-hover:-translate-y-1 relative overflow-hidden ring-4 ring-transparent group-hover:ring-accent/15 group-hover:border-accent/30"
              >
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none rounded-full" />
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  loading="lazy"
                  className="object-cover rounded-full transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 768px) 96px, 128px"
                />
              </Link>

              {/* Category Name */}
              <Link href={`/shop?category=${category.slug}`} className="block w-full text-center">
                <span className="text-sm md:text-[15px] font-extrabold tracking-tight text-foreground/80 group-hover:text-accent transition-colors line-clamp-1 px-1 max-w-full leading-tight">
                  {category.name}
                </span>
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile View: 2-Row Independent Horizontal Touch Scroll Slide */}
        <div className="flex md:hidden flex-col gap-3">
          <ScrollingRow items={mobileRow1} />
          <ScrollingRow items={mobileRow2} />
        </div>
      </div>
    </section>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ScrollingRow({ items }: { items: any[] }) {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-2 px-2 scrollbar-none w-full">
      {items.map((category) => (
        <div
          key={category.id}
          className="flex-shrink-0 w-24 flex flex-col items-center gap-2.5 text-center group"
        >
          <Link
            href={`/shop?category=${category.slug}`}
            draggable={false}
            className="w-[84px] h-[84px] bg-white border-2 border-accent/15 rounded-full flex items-center justify-center relative overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.05)] transition-all duration-300 hover:border-accent/40 hover:ring-4 hover:ring-accent/20"
          >
            <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none rounded-full" />
            <Image
              src={category.image}
              alt={category.name}
              fill
              loading="lazy"
              draggable={false}
              className="object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
              sizes="84px"
            />
          </Link>

          {/* Name */}
          <Link href={`/shop?category=${category.slug}`} draggable={false} className="block w-full text-center">
            <span className="text-[12px] font-extrabold tracking-tight text-foreground/80 group-hover:text-accent transition-colors line-clamp-2 px-0.5 leading-tight">
              {category.name}
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}

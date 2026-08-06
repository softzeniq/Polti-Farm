"use client";
import { useCategories } from "@/hooks/useShopData";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export function CategorySidebar() {
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 flex flex-col gap-4 animate-pulse">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-5 bg-muted rounded w-3/4" />
        ))}
      </div>
    );
  }

  const parentCategories = categories.filter((c) => !c.parent_id);
  const getSubcategories = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  return (
    <div className="w-full h-full bg-background border border-border/50 shadow-sm flex flex-col py-2 overflow-y-auto rounded-xl scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
      {parentCategories.map((category) => {
        const subcategories = getSubcategories(category.id);
        const hasSubcategories = subcategories.length > 0;

        return (
          <div key={category.id} className="group relative">
            <Link
              href={`/shop?category=${category.slug}`}
              className="flex items-center justify-between px-5 py-2.5 hover:bg-accent/5 transition-colors"
            >
              <span className="text-[13px] md:text-sm font-medium text-foreground/80 group-hover:text-accent transition-colors">
                {category.name}
              </span>
              {hasSubcategories && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
              )}
            </Link>

            {hasSubcategories && (
              <div className="absolute left-full top-0 ml-1 w-48 bg-background border border-border/50 shadow-lg rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col py-2">
                {subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/shop?category=${sub.slug}`}
                    className="px-5 py-2 hover:bg-accent/5 text-[13px] md:text-sm font-medium text-foreground/80 hover:text-accent transition-colors"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

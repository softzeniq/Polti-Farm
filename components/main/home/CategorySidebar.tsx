"use client";
import { Category, useCategories } from "@/hooks/useShopData";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

function CategoryItem({ category, subcategories }: { category: Category; subcategories: Category[] }) {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const hasSubcategories = subcategories.length > 0;

  const handleMouseEnter = () => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setCoords({ top: rect.top, left: rect.right });
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={itemRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group"
    >
      <Link
        href={`/shop?category=${category.slug}`}
        className="flex items-center justify-between px-5 py-2.5 hover:bg-accent/5 transition-colors"
      >
        <span className="text-[13px] md:text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
          {category.name}
        </span>
        {hasSubcategories && (
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
        )}
      </Link>

      {hasSubcategories && isHovered && typeof window !== "undefined" &&
        createPortal(
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed z-[100] w-48 min-h-40 -ml-1 bg-background border border-border/50 shadow-xl rounded-xl flex flex-col py-2 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent"
            style={{ top: coords.top, left: coords.left + 4 }}
          >
            {subcategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/shop?category=${sub.slug}`}
                className="px-5 py-2 hover:bg-accent/5 text-[13px] md:text-sm font-medium text-foreground/80 hover:text-accent transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

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
      {parentCategories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          subcategories={getSubcategories(category.id)}
        />
      ))}
    </div>
  );
}

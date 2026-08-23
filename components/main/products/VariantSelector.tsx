"use client";

import { ProductVariant } from "@/hooks/useVariants";
import { cn } from "@/lib/utils";
import { Check, Ruler, Edit2 } from "lucide-react";
import { useEffect, useState } from "react";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
  selectedSize: string | null;
  onSizeSelect: (size: string | null) => void;
  selectedColor: string | null;
  onColorSelect: (color: string | null) => void;
  fabricOptions?: { id: string; name: string; desc?: string }[];
  selectedFabric?: string | null;
  onFabricSelect?: (fabric: string) => void;
}

// Map common color names to CSS color hex/values
const colorMap: Record<string, string> = {
  black: "#0f172a",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  navy: "#1e3a8a",
  green: "#22c55e",
  yellow: "#eab308",
  pink: "#ec4899",
  purple: "#a855f7",
  orange: "#f97316",
  grey: "#64748b",
  gray: "#64748b",
  brown: "#78350f",
  gold: "#d97706",
  beige: "#f5f5dc",
  maroon: "#800000",
};

export function VariantSelector({
  variants,
  selectedVariant,
  onSelect,
  selectedSize,
  onSizeSelect,
  selectedColor,
  onColorSelect,
  fabricOptions,
  selectedFabric,
  onFabricSelect,
}: VariantSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Extract unique sizes
  const sizes = [
    ...new Set(variants.filter((v) => v.size).map((v) => v.size!)),
  ];

  // Extract unique colors (split comma-separated)
  const allColors = [
    ...new Set(
      variants
        .filter((v) => v.color)
        .flatMap((v) => v.color!.split(",").map((c) => c.trim()))
        .filter(Boolean),
    ),
  ];

  // Find best matching variant for given size + color + fabric
  const findVariant = (
    size: string | null,
    color: string | null,
    fabric?: string | null,
  ): ProductVariant | null => {
    const normFabric = fabric ? fabric.toLowerCase().trim() : null;

    if (size && color) {
      const match = variants.find(
        (v) =>
          v.size === size &&
          v.color
            ?.split(",")
            .map((c) => c.trim())
            .includes(color) &&
          (!v.fabric || !normFabric || v.fabric.toLowerCase().trim() === normFabric) &&
          v.is_active &&
          v.stock > 0,
      );
      if (match) return match;
    }

    if (size) {
      const match =
        variants.find((v) => v.size === size && (!v.fabric || !normFabric || v.fabric.toLowerCase().trim() === normFabric) && v.is_active && v.stock > 0) ||
        variants.find((v) => v.size === size && (!v.fabric || !normFabric || v.fabric.toLowerCase().trim() === normFabric)) ||
        variants.find((v) => v.size === size && v.is_active && v.stock > 0) ||
        variants.find((v) => v.size === size);
      if (match) return match;
    }

    if (color) {
      const match =
        variants.find(
          (v) =>
            v.color
              ?.split(",")
              .map((c) => c.trim())
              .includes(color) &&
            (!v.fabric || !normFabric || v.fabric.toLowerCase().trim() === normFabric) &&
            v.is_active &&
            v.stock > 0,
        ) ||
        variants.find((v) =>
          v.color
            ?.split(",")
            .map((c) => c.trim())
            .includes(color) &&
          (!v.fabric || !normFabric || v.fabric.toLowerCase().trim() === normFabric)
        ) ||
        variants.find(
          (v) =>
            v.color
              ?.split(",")
              .map((c) => c.trim())
              .includes(color) &&
            v.is_active &&
            v.stock > 0,
        ) ||
        variants.find((v) =>
          v.color
            ?.split(",")
            .map((c) => c.trim())
            .includes(color),
        );
      if (match) return match;
    }

    return null;
  };


  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    const variant = findVariant(selectedSize, color, selectedFabric);
    if (variant) {
      onSelect(variant);
    }
  };

  const handleSizeSelect = (size: string) => {
    onSizeSelect(size);
    const variant = findVariant(size, selectedColor, selectedFabric);
    if (variant) {
      onSelect(variant);
    }
  };

  const isSizeAvailable = (size: string) =>
    variants.some((v) => v.size === size && v.stock > 0 && v.is_active);

  const isColorAvailable = (color: string) =>
    variants.some(
      (v) =>
        v.color
          ?.split(",")
          .map((c) => c.trim())
          .includes(color) &&
        v.stock > 0 &&
        v.is_active &&
        (!selectedFabric || v.fabric === selectedFabric || !v.fabric)
    );

  const visibleColors = allColors.filter(color => 
    variants.some(v => 
      v.color?.split(",").map((c) => c.trim()).includes(color) && 
      (!selectedFabric || v.fabric === selectedFabric)
    )
  );

  return (
    <div className="space-y-5">
      {/* Fabric Selector */}
      {fabricOptions && fabricOptions.length > 0 && onFabricSelect && (
        <div className="space-y-2.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <span>Breed / Category (ধরন):</span>
            {selectedFabric && (
              <span className="text-accent font-extrabold normal-case bg-accent/10 px-2 py-0.5 rounded-md text-xs">
                {selectedFabric}
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-2.5">
            {fabricOptions.map((fabric) => {
              const isSelected = selectedFabric === fabric.name;
              return (
                <button
                  key={fabric.id}
                  type="button"
                  onClick={() => onFabricSelect(fabric.name)}
                  className={cn(
                    "min-w-[48px] h-10 px-4 rounded-xl border text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 select-none",
                    isSelected
                      ? "border-accent bg-accent/10 text-accent ring-1 ring-accent/40 shadow-2xs scale-105"
                      : "border-border/50 bg-card text-foreground hover:border-accent/40 hover:bg-secondary/30",
                  )}
                >
                  <span>{fabric.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-accent stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selector (Age) */}
      {sizes.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <span>Age (বয়স):</span>
            {selectedSize && (
              <span className="text-accent font-extrabold normal-case bg-accent/10 px-2 py-0.5 rounded-md text-xs">
                {selectedSize}
              </span>
            )}
          </label>

          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => {
              const available = isSizeAvailable(size);
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeSelect(size)}
                  disabled={!available}
                  className={cn(
                    "h-10 px-4 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 select-none",
                    isSelected
                      ? "border-accent bg-accent/10 text-accent ring-1 ring-accent/40 shadow-2xs scale-105"
                      : available
                        ? "border-border/50 bg-card text-foreground hover:border-accent/40 hover:bg-secondary/30"
                        : "border-border/30 bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through",
                  )}
                >
                  <span>{size}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-accent stroke-[3] ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {visibleColors.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <span>Gender (লিঙ্গ):</span>
            {selectedColor && (
              <span className="text-accent font-extrabold normal-case bg-accent/10 px-2 py-0.5 rounded-md text-xs">
                {selectedColor}
              </span>
            )}
          </label>

          <div className="flex flex-wrap gap-2.5">
            {visibleColors.map((color) => {
              const available = isColorAvailable(color);
              const isSelected = selectedColor === color;
              const colorHex = colorMap[color.toLowerCase().trim()];

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  disabled={!available}
                  title={color}
                  className={cn(
                    "h-10 px-4 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 select-none",
                    isSelected
                      ? "border-accent bg-accent/10 text-accent ring-1 ring-accent/40 shadow-2xs scale-105"
                      : available
                        ? "border-border/50 bg-card text-foreground hover:border-accent/40 hover:bg-secondary/30"
                        : "border-border/30 bg-muted/30 text-muted-foreground/40 cursor-not-allowed line-through",
                  )}
                >
                  {/* No Swatch Dot for Gender */}

                  <span>{color}</span>

                  {isSelected && <Check className="h-3.5 w-3.5 text-accent stroke-[3] ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Guide Modal Removed */}
    </div>
  );
}

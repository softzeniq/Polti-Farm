"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Category, Product } from "@/hooks/useShopData";
import { Plus, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProductRatingStats, useHideStockMap } from "@/hooks/useProductReviews";
import { WishlistButton } from "./WishlistButton";

interface ProductCardProps {
  product: Product & { category?: Category | null };
}

export function ProductCard({ product }: ProductCardProps) {
  const { t, formatCurrency } = useSiteSettings();
  const { addItem } = useCart();
  const router = useRouter();
  const { getProductRating } = useProductRatingStats();
  const { data: hideStockMap = {} } = useHideStockMap();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const [isHovered, setIsHovered] = useState(false);

  // Swipe handlers for mobile
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    } else if (isRightSwipe && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  const ratingInfo = getProductRating(product.id);
  const ratingValue = ratingInfo.avgRating;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isStockHidden = hideStockMap[product.id] ?? (product as any)?.hide_stock ?? false;
  const isOutOfStock = product.stock <= 0 || isStockHidden;

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
    : 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price || undefined,
      image: product.images[0] || "/placeholder.svg",
      quantity: 1,
      stock: product.stock || 10,
    });

    router.push("/checkout");
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.sale_price || undefined,
      image: product.images[0] || "/placeholder.svg",
      quantity: 1,
      stock: product.stock || 10,
    });

    toast.success(t("product.addedToCart") || "Product added to cart", {
      description: `1x ${product.name}`,
    });
  };

  const mainImage = product.images?.[currentImageIndex] || product.images?.[0] || "/placeholder.svg";
  const hoverImage = product.images?.[1] && isHovered ? product.images[1] : null;

  return (
    <div 
      className="group relative bg-card/90 backdrop-blur-md rounded-2xl border-2 border-border/30 flex flex-col h-full overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-accent/15 hover:-translate-y-1.5 justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative subtle farm-inspired gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Image wrapper with soft padding/background */}
        <div 
          className="relative aspect-[4/3] overflow-hidden bg-gradient-to-b from-secondary/40 to-secondary/80 border-b border-border/20"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Link href={`/products/${product.slug}`} className="block w-full h-full relative overflow-hidden group-hover:scale-105 transition-transform duration-700 ease-out">
            <Image
              src={hoverImage || mainImage}
              alt={product.name}
              className="w-full h-full object-cover mix-blend-multiply"
              height={320}
              width={320}
              loading="lazy"
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 20vw"
            />
            {/* Soft inner shadow for depth */}
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.03)] pointer-events-none" />
          </Link>

          {/* Farm Fresh Tag - decorative */}
          <div className="absolute top-2 right-2 z-10 pointer-events-none">
             <span className="bg-white/80 backdrop-blur-md text-emerald-600 border border-emerald-100 px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm flex items-center gap-1 opacity-90">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Fresh
             </span>
          </div>

          {/* Top Left Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-0 left-0 z-10 pointer-events-none">
              <span className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-2.5 py-1 text-[11px] font-black tracking-wide rounded-br-xl block shadow-md">
                {discountPercent}% OFF
              </span>
            </div>
          )}

          {/* Out of Stock Overlay Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all duration-300">
              <span className="bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest shadow-lg border border-destructive/50 transform -rotate-6">
                Stock Out
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <WishlistButton
            productId={product.id}
            size="sm"
            className="absolute bottom-2 right-2 z-20 bg-background/95 backdrop-blur-md border border-border/80 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 h-9 w-9 text-muted-foreground hover:text-red-500 rounded-full flex items-center justify-center"
          />
        </div>

        {/* Content Details */}
        <div className="px-3 pt-3 pb-1 flex flex-col relative z-10">
          <Link href={`/products/${product.slug}`} className="block group-hover:text-accent transition-colors duration-300">
            <h3 className="font-bold text-[16px] md:text-[17px] line-clamp-2 leading-tight h-[2.5rem] text-foreground/90 transition-colors group-hover:text-accent">
              {product.name}
            </h3>
          </Link>



          {/* Price Box */}
          <div className="flex items-baseline gap-2 mt-1">
            <div className="flex items-baseline gap-2">
              {hasDiscount ? (
                <>
                  <span className="text-[18px] md:text-[20px] font-black text-accent tracking-tight drop-shadow-sm">
                    {formatCurrency(product.sale_price!)}
                  </span>
                  <span className="text-muted-foreground/60 line-through font-semibold text-xs md:text-sm decoration-destructive/50">
                    {formatCurrency(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-[18px] md:text-[20px] font-black text-foreground tracking-tight drop-shadow-sm">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
            {product.unit && (
              <span className="text-xs md:text-sm text-muted-foreground font-semibold">
                / {product.unit}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="relative z-10 mt-auto w-full px-3 pb-3 pt-2">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full bg-destructive/5 text-destructive/80 border-2 border-destructive/10 font-extrabold py-2.5 px-3 rounded-xl text-sm text-center cursor-not-allowed opacity-90 transition-all duration-300"
          >
            Out of Stock
          </button>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={handleBuyNow}
              className="bg-gradient-to-r from-accent to-accent/90 text-accent-foreground hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5 font-bold py-2.5 px-2 sm:px-4 rounded-xl text-[13px] sm:text-[14px] whitespace-nowrap flex-1 transition-all duration-300 active:scale-[0.97] text-center select-none flex items-center justify-center gap-1.5 cursor-pointer border border-accent/20 overflow-hidden relative group/btn"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Plus className="h-4 w-4 shrink-0 hidden sm:inline-block" />
                {t("product.orderNow")}
              </span>
            </button>
            
            <div className="relative group/cart shrink-0">
              <button
                onClick={handleAddToCartClick}
                className="bg-secondary/50 backdrop-blur-sm text-foreground/80 border-2 border-border/50 p-2 rounded-xl transition-all duration-300 shrink-0 flex items-center justify-center h-10 w-10 md:h-[42px] md:w-[42px] active:scale-[0.96] cursor-pointer hover:border-accent hover:text-accent hover:bg-accent/5 hover:shadow-md"
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-4.5 w-4.5 transition-transform group-hover/cart:scale-110" />
              </button>
              {/* Tooltip */}
              <span className="pointer-events-none absolute -top-8 right-0 opacity-0 group-hover/cart:opacity-100 transition-opacity bg-foreground/90 backdrop-blur-sm text-background text-[11px] font-bold px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap z-40 transform translate-y-1 group-hover/cart:translate-y-0">
                Add to Cart
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

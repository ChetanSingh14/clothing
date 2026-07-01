"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";
import { useProductStore, ProductItem } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ArrowLeft, Star, Plus, Minus, Loader2, Check, Heart, Cuboid } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ModelViewer from "@/components/ModelViewer";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const { user } = useAuthStore();
  const { activeProduct, loading, fetchProductDetails, submitReview, wishlist, toggleWishlist, fetchWishlist } = useProductStore();
  const { addItem, setIsOpen } = useCartStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description"); // description, reviews

  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  useEffect(() => {
    if (!isNaN(productId)) {
      fetchProductDetails(productId).then((prod) => {
        if (prod) {
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
        }
      });
    }
  }, [productId]);

  if (loading || !activeProduct) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-brand-green animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    addItem({
      productId: activeProduct.id,
      title: activeProduct.title,
      price: activeProduct.price,
      image: activeProduct.images[0] || "",
      color: selectedColor,
      size: selectedSize,
    });
    setIsOpen(true);
  };

  const handleBuyNow = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    addItem({
      productId: activeProduct.id,
      title: activeProduct.title,
      price: activeProduct.price,
      image: activeProduct.images[0] || "",
      color: selectedColor,
      size: selectedSize,
    });
    setIsOpen(true);
  };

  const isWishlisted = wishlist.some((w) => w.id === activeProduct.id);

  const productImages = activeProduct.images.filter(img => !img.toLowerCase().endsWith('.glb'));
  const productModel = activeProduct.images.find(img => img.toLowerCase().endsWith('.glb'));


  const handleWishlistToggle = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    toggleWishlist(activeProduct.id);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    const success = await submitReview(activeProduct.id, reviewName, reviewRating, reviewComment);
    if (success) {
      setReviewComment("");
      setReviewName("");
      setReviewRating(5);
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between selection:bg-brand-green selection:text-brand-bg">
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />

      <main className="flex-grow py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60 hover:text-brand-charcoal transition-colors mb-8 cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to collection</span>
        </button>

        {/* Product details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Image switcher (Image 3 style) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-[#f8f9fa] border border-brand-charcoal/5">
              <div className={`absolute inset-0 transition-opacity duration-300 ${activeImageIdx === -1 ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'}`}>
                <ModelViewer 
                  url={productModel}
                  decalUrl={!productModel ? productImages[0] : undefined} 
                  color={selectedColor || "#ffffff"} 
                />
              </div>
              <img
                src={productImages[activeImageIdx] || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"}
                alt={activeProduct.title}
                className={`object-cover h-full w-full transition-opacity duration-300 ${activeImageIdx !== -1 ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0 absolute inset-0'}`}
              />
            </div>
            
            {/* Gallery thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {/* 360 View Button */}
              <button
                onClick={() => setActiveImageIdx(-1)}
                className={`flex-shrink-0 relative h-20 w-16 rounded-xl overflow-hidden bg-brand-gray border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  activeImageIdx === -1 ? "border-brand-charcoal ring-1 ring-brand-charcoal bg-[#f0f0f0]" : "border-brand-charcoal/10 hover:border-brand-charcoal/30 bg-[#f8f9fa]"
                }`}
              >
                <Cuboid className={`w-6 h-6 ${activeImageIdx === -1 ? "text-brand-charcoal" : "text-brand-charcoal/60"}`} />
                <span className={`text-[9px] font-bold uppercase tracking-wider ${activeImageIdx === -1 ? "text-brand-charcoal" : "text-brand-charcoal/60"}`}>360°</span>
              </button>

              {/* Standard Images */}
              {productImages && productImages.length > 0 && productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`flex-shrink-0 relative h-20 w-16 rounded-xl overflow-hidden bg-brand-gray border transition-all cursor-pointer ${
                    activeImageIdx === idx ? "border-brand-charcoal ring-1 ring-brand-charcoal" : "border-brand-charcoal/10 hover:border-brand-charcoal/30"
                  }`}
                >
                  <img src={img} alt="thumbnail" className="object-cover h-full w-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Spec Selector Panel */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">
                {activeProduct.category}
              </span>
              
              <h1 className="text-3xl font-semibold tracking-tight text-brand-charcoal font-serif mt-2 leading-tight">
                {activeProduct.title}
              </h1>

              {/* Stars summary */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4.5 w-4.5 ${
                        s <= Math.round(activeProduct.rating)
                          ? "fill-amber-400 stroke-amber-400"
                          : "fill-transparent stroke-brand-charcoal/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-brand-charcoal/60 mt-0.5">
                  {activeProduct.rating.toFixed(1)} ({activeProduct.reviews?.length || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="text-2xl font-bold font-serif text-brand-charcoal mt-4">
                ${activeProduct.price.toFixed(2)}
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-sm text-brand-charcoal/60 font-light leading-relaxed">
              {activeProduct.description}
            </p>

            {/* Color Selector */}
            {activeProduct.colors && activeProduct.colors.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60">
                  Select Color: <span className="text-brand-charcoal font-medium capitalize ml-1">{selectedColor}</span>
                </label>
                <div className="flex gap-3">
                  {activeProduct.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-7 w-7 rounded-full border transition-all cursor-pointer relative flex items-center justify-center ${
                        selectedColor === color ? "border-brand-charcoal ring-2 ring-brand-charcoal/10" : "border-brand-charcoal/10 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <Check className="h-3.5 w-3.5 text-white mix-blend-difference" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {activeProduct.sizes && activeProduct.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60">
                    Select Size
                  </label>
                  <button className="text-[11px] font-bold text-brand-green hover:underline">
                    View Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {activeProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4.5 py-2 text-xs font-bold rounded-lg border tracking-wider transition-all cursor-pointer uppercase ${
                        selectedSize === size
                          ? "bg-brand-charcoal border-brand-charcoal text-brand-bg shadow-sm"
                          : "border-brand-charcoal/15 bg-brand-bg text-brand-charcoal hover:border-brand-charcoal"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/60">
                Quantity
              </label>
              <div className="flex items-center border border-brand-charcoal/15 rounded-xl bg-brand-gray/30 w-fit p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-brand-charcoal/60 hover:text-brand-charcoal cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-bold px-4 min-w-10 text-center text-brand-charcoal">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-brand-charcoal/60 hover:text-brand-charcoal cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 border border-brand-charcoal bg-transparent text-brand-charcoal rounded-2xl py-4 text-sm font-semibold tracking-wide hover:bg-brand-charcoal/5 transition-all duration-300 cursor-pointer"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-brand-brown text-brand-bg border border-brand-brown rounded-2xl py-4 text-sm font-semibold tracking-wide hover:bg-brand-brown-dark transition-all duration-300 cursor-pointer"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-4 border rounded-2xl transition-all duration-300 cursor-pointer flex items-center justify-center ${
                  isWishlisted 
                    ? "bg-rose-50 border-rose-300 text-rose-500 hover:bg-rose-100" 
                    : "border-brand-charcoal/15 text-brand-charcoal/60 hover:border-brand-charcoal"
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>

            {/* Details panel meta */}
            <div className="pt-6 border-t border-brand-charcoal/5 text-xs text-brand-charcoal/40 space-y-1.5 font-light">
              <div>SKU: <span className="font-semibold text-brand-charcoal/60">FLOW-{activeProduct.id}93245AAA</span></div>
              <div>Category: <span className="font-semibold text-brand-charcoal/60 capitalize">{activeProduct.category}</span></div>
              <div>Fabric: <span className="font-semibold text-brand-charcoal/60">95% Organic Cotton, 5% Cashmere Blend</span></div>
            </div>
          </div>
        </div>

        {/* Tabbed description / reviews section */}
        <div className="mt-20 border-t border-brand-charcoal/5 pt-12">
          {/* Tabs */}
          <div className="flex gap-8 border-b border-brand-charcoal/5 pb-4">
            {["description", "reviews"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`text-sm font-semibold tracking-wider uppercase cursor-pointer relative pb-4.5 ${
                  activeTab === t ? "text-brand-charcoal" : "text-brand-charcoal/40"
                }`}
              >
                {t}
                {activeTab === t && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="py-8">
            {activeTab === "description" ? (
              <div className="max-w-3xl space-y-4 text-sm text-brand-charcoal/70 font-light leading-relaxed">
                <p>
                  Elevate your daily wardrobe with the {activeProduct.title}, featuring standard structured panel fits and a smooth, brushed organic lining. Masterfully spun by expert weavers, this garment delivers unparalleled temperature regulation and active comfort.
                </p>
                <h4 className="font-semibold text-brand-charcoal font-serif text-base pt-2">Product Specifications</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Reinforced double-stitched overlays</li>
                  <li>Flatlock internal seams to prevent chafing</li>
                  <li>Fully recyclable dyes and wash treatments</li>
                  <li>Includes premium linen storage pouch</li>
                </ul>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Reviews List */}
                <div className="lg:col-span-7 space-y-8">
                  <h3 className="text-lg font-semibold font-serif text-brand-charcoal mb-6">
                    Customer Feedback ({activeProduct.reviews?.length || 0})
                  </h3>

                  {activeProduct.reviews && activeProduct.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {activeProduct.reviews.map((rev) => (
                        <div key={rev.id} className="border-b border-brand-charcoal/5 pb-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-semibold text-brand-charcoal">{rev.userName}</h4>
                              <div className="flex items-center gap-0.5 mt-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`h-3.5 w-3.5 ${
                                      s <= rev.rating
                                        ? "fill-amber-400 stroke-amber-400"
                                        : "fill-transparent stroke-brand-charcoal/20"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-brand-charcoal/40 font-light">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-brand-charcoal/70 mt-3 font-light leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-brand-charcoal/40 font-light italic">
                      No reviews submitted yet. Be the first to leave a review!
                    </p>
                  )}
                </div>

                {/* Submit Review Form */}
                <div className="lg:col-span-5 bg-brand-brown/5 p-6 rounded-2xl border border-brand-brown/15 h-fit">
                  <h3 className="text-base font-semibold font-serif text-brand-charcoal mb-4">
                    Write a Review
                  </h3>
                  
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60">
                        Your Rating
                      </label>
                      <div className="flex gap-1.5 mt-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => setReviewRating(s)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                s <= reviewRating
                                  ? "fill-amber-400 stroke-amber-400"
                                  : "fill-transparent stroke-brand-charcoal/20"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="revName">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="revName"
                        required
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="John Doe"
                        className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-xs focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="revMsg">
                        Review Comment
                      </label>
                      <textarea
                        id="revMsg"
                        required
                        rows={4}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your thoughts about this garment's texture, weight, and style fit..."
                        className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3 py-2 text-xs focus:border-brand-green focus:outline-none resize-none"
                      />
                    </div>

                    {reviewSuccess && (
                      <div className="text-xs text-brand-green font-semibold bg-brand-green/10 border border-brand-green/20 rounded-xl p-3">
                        ✓ Review submitted successfully!
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-brand-brown text-brand-bg rounded-xl py-3 text-xs font-semibold tracking-wide hover:bg-brand-brown-dark transition-all cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      <CartDrawer />
    </div>
  );
}

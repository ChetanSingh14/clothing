"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useProductStore } from "@/store/useProductStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ArrowLeft, Star, Loader2, Check } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const { user } = useAuthStore();
  const { products, fetchProducts, activeProduct, loading, fetchProductDetails, submitReview } = useProductStore();

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  useEffect(() => {
    if (!isNaN(productId)) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  if (loading || !activeProduct) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} />
        <PageLoader />
        <Footer />
      </div>
    );
  }

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

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Back navigation */}
        <Link
          href={`/products/${activeProduct.id}`}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60 hover:text-brand-charcoal transition-colors mb-6 cursor-pointer group w-fit"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Product</span>
        </Link>

        {/* Header Section */}
        <div className="mb-12 border-b border-brand-charcoal/10 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-charcoal leading-tight mb-2">
              Reviews
            </h1>
            <h2 className="text-lg text-brand-charcoal/70 font-medium">{activeProduct.title}</h2>
          </div>
          <div className="flex items-center gap-4 bg-white/50 px-6 py-4 rounded-2xl border border-brand-charcoal/5 shadow-sm">
            <div className="text-4xl font-bold font-serif text-brand-charcoal">{activeProduct.rating.toFixed(1)}</div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(activeProduct.rating)
                        ? "fill-amber-400 stroke-amber-400"
                        : "fill-transparent stroke-brand-charcoal/20"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/50">
                Based on {activeProduct.reviews?.length || 0} reviews
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Reviews List */}
          <div className="md:col-span-7 space-y-6">
            <h3 className="text-xl font-semibold font-serif text-brand-charcoal mb-6">All Reviews</h3>
            {activeProduct.reviews && activeProduct.reviews.length > 0 ? (
              activeProduct.reviews.map((rev) => (
                <div key={rev.id} className="bg-white/40 p-6 rounded-3xl shadow-sm border border-brand-charcoal/5 transition-all hover:bg-white/60">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-brand-gray/80 rounded-full overflow-hidden shrink-0">
                       <img src={`https://ui-avatars.com/api/?name=${rev.userName}&background=random`} alt={rev.userName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="text-sm font-bold text-brand-charcoal">{rev.userName}</h4>
                         <span className="text-[10px] uppercase tracking-wider text-brand-charcoal/40 font-semibold">
                           {new Date(rev.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-3">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3 w-3 ${
                              s <= rev.rating
                                ? "fill-amber-400 stroke-amber-400"
                                : "fill-transparent stroke-brand-charcoal/20"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-brand-charcoal/80 font-light leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-brand-gray/20 rounded-3xl border border-dashed border-brand-charcoal/10">
                <p className="text-brand-charcoal/40 font-light italic mb-2">No reviews submitted yet.</p>
                <p className="text-sm font-medium text-brand-charcoal/60">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>

          {/* Write a review Form */}
          <div className="md:col-span-5">
            <div className="bg-brand-brown/5 p-6 rounded-3xl border border-brand-brown/15 sticky top-8">
              <h3 className="text-xl font-semibold font-serif text-brand-charcoal mb-6">
                Write a Review
              </h3>
              
              <AnimatePresence>
                {reviewSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-6 p-4 bg-brand-green/10 text-brand-green rounded-2xl flex items-center gap-3 border border-brand-green/20"
                  >
                    <div className="bg-brand-green/20 p-1.5 rounded-full">
                      <Check className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold">Thank you! Your review has been submitted.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-brand-charcoal mb-2 uppercase tracking-wider">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            s <= reviewRating
                              ? "fill-amber-400 stroke-amber-400"
                              : "fill-transparent stroke-brand-charcoal/20 hover:stroke-brand-charcoal/50"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-xs font-semibold text-brand-charcoal mb-2 uppercase tracking-wider">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full bg-white border border-brand-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-shadow"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="comment" className="block text-xs font-semibold text-brand-charcoal mb-2 uppercase tracking-wider">Comment</label>
                  <textarea
                    id="comment"
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-white border border-brand-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 transition-shadow resize-none"
                    placeholder="Share your thoughts about this product..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-charcoal text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-black transition-colors shadow-sm active:scale-[0.98]"
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>

      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}

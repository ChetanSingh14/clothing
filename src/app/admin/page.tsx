"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminStore } from "@/store/useAdminStore";
import { useProductStore } from "@/store/useProductStore";
import { Plus, Trash2, Tag, Star, Package, Users, Layers, UploadCloud, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { stats, loading, fetchStats, createProduct, deleteProduct, uploadProductImage } = useAdminStore();
  const { products, fetchProducts } = useProductStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Coats");
  const [colorsInput, setColorsInput] = useState("#8B5A2B, #4A3B32, #A0522D");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L"]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const availableSizesList = ["S", "M", "L", "XL", "XXL", "7", "8", "9", "10", "11"];

  useEffect(() => {
    if (initialized) {
      if (!user || user.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchStats();
        fetchProducts();
      }
    }
  }, [user, initialized]);

  if (!initialized || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col justify-between">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} />
        <div className="flex-grow flex flex-col items-center justify-center text-center">
          <Loader2 className="h-10 w-10 text-brand-green animate-spin" />
          <p className="text-xs text-brand-charcoal/50 mt-4 tracking-wide font-light">Checking admin credentials...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      const url = await uploadProductImage(base64Data);
      if (url) {
        setUploadedImageUrl(url);
      } else {
        alert("Failed to upload image. Make sure server is running and upload constraints are met.");
      }
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !uploadedImageUrl) {
      alert("Please fill all required fields and upload an image.");
      return;
    }

    const colors = colorsInput.split(",").map((c) => c.trim()).filter((c) => c !== "");

    const success = await createProduct({
      title,
      description,
      price: Number(price),
      category,
      images: [uploadedImageUrl],
      colors,
      sizes: selectedSizes,
    });

    if (success) {
      setTitle("");
      setDescription("");
      setPrice("");
      setUploadedImageUrl("");
      setFormSuccess(true);
      await fetchProducts(); // reload products listing
      setTimeout(() => setFormSuccess(false), 3000);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const success = await deleteProduct(id);
      if (success) {
        await fetchProducts();
      }
    }
  };

  return (
    <>
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />

      <main className="flex-grow py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-brand-charcoal/5 pb-6 mb-12">
          <div>
            <span className="text-xs font-semibold tracking-widest text-brand-green uppercase">
              back-office
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-charcoal font-serif mt-2">
              Admin Observation Panel
            </h1>
          </div>
          <button
            onClick={() => {
              fetchStats();
              fetchProducts();
            }}
            className="flex items-center gap-1.5 rounded-full border border-brand-charcoal/10 bg-brand-bg px-3.5 py-1.5 text-xs text-brand-charcoal/60 hover:bg-brand-charcoal/5 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            <span>sync stats</span>
          </button>
        </div>

        {/* Dashboard statistics cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                label: "total active items",
                value: stats.totalProducts,
                icon: Package,
                color: "text-blue-600 bg-blue-50 border-blue-100",
              },
              {
                label: "active categories",
                value: stats.totalCategories,
                icon: Layers,
                color: "text-purple-600 bg-purple-50 border-purple-100",
              },
              {
                label: "feedbacks collected",
                value: stats.totalReviews,
                icon: Star,
                color: "text-amber-600 bg-amber-50 border-amber-100",
              },
              {
                label: "avg customer rating",
                value: `${stats.averageRating.toFixed(1)} ★`,
                icon: Users,
                color: "text-brand-green bg-brand-green/10 border-brand-green/20",
              },
            ].map((card, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={card.label}
                className={`p-6 rounded-2xl border flex flex-col justify-between min-h-32 bg-brand-bg`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">
                    {card.label}
                  </span>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.color}`}>
                    <card.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-serif text-brand-charcoal mt-4">
                  {card.value}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Action Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Product Upload Form */}
          <div className="lg:col-span-5 bg-brand-gray/30 p-8 rounded-3xl border border-brand-charcoal/5">
            <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif mb-6 flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-green" />
              <span>Upload New Product</span>
            </h2>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="pTitle">
                  Product Title *
                </label>
                <input
                  type="text"
                  id="pTitle"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Trendy Brown Coat"
                  className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="pDesc">
                  Detailed Description *
                </label>
                <textarea
                  id="pDesc"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide materials, tailoring details, fit recommendations..."
                  className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="pPrice">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    id="pPrice"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="75.00"
                    className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="pCat">
                    Category *
                  </label>
                  <select
                    id="pCat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none cursor-pointer"
                  >
                    <option value="Coats">Coats</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Sneakers">Sneakers</option>
                    <option value="Sweaters">Sweaters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="pColors">
                  Colors Hex Codes (Comma separated)
                </label>
                <input
                  type="text"
                  id="pColors"
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="#8B5A2B, #4A3B32"
                  className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                />
              </div>

              {/* Sizes check boxes */}
              <div>
                <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {availableSizesList.map((size) => {
                    const isChecked = selectedSizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`h-7 min-w-8 px-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer ${
                          isChecked
                            ? "bg-brand-charcoal border-brand-charcoal text-brand-bg"
                            : "border-brand-charcoal/10 bg-brand-bg text-brand-charcoal/60 hover:border-brand-charcoal"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Local File upload */}
              <div>
                <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                  Product Image *
                </label>
                <div className="mt-1.5 relative border border-dashed border-brand-charcoal/20 rounded-xl bg-brand-bg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-charcoal/5 transition-colors">
                  <UploadCloud className="h-6 w-6 text-brand-charcoal/40 mb-1.5" />
                  <span className="text-[10px] font-semibold text-brand-charcoal/60">
                    {uploadingImage ? "Uploading file..." : uploadedImageUrl ? "Image uploaded successfully ✓" : "Attach high-res photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={handleImageFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
                {uploadedImageUrl && (
                  <div className="relative h-20 w-16 rounded-lg overflow-hidden mt-3 border border-brand-charcoal/10">
                    <img src={uploadedImageUrl} alt="preview" className="object-cover h-full w-full" />
                  </div>
                )}
              </div>

              {formSuccess && (
                <div className="text-xs text-brand-green font-semibold bg-brand-green/10 border border-brand-green/20 rounded-xl p-3">
                  ✓ Product published on live catalog successfully!
                </div>
              )}

              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="w-full bg-brand-charcoal text-brand-bg rounded-xl py-3.5 text-xs font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
              >
                {loading ? "Publishing product..." : "Publish Product"}
              </button>
            </form>
          </div>

          {/* Right: Product Database Table */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
              Product Catalog Inventory ({products.length})
            </h2>

            <div className="border border-brand-charcoal/5 rounded-3xl overflow-hidden bg-brand-bg shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-brand-gray/50 border-b border-brand-charcoal/5 text-[10px] uppercase font-bold text-brand-charcoal/50 tracking-wider">
                      <th className="py-4.5 px-6">Garment</th>
                      <th className="py-4.5 px-6">Category</th>
                      <th className="py-4.5 px-6 text-right">Price</th>
                      <th className="py-4.5 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-charcoal/5 text-xs">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-brand-gray/20 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className="relative h-12 w-10 rounded-lg overflow-hidden bg-brand-gray flex-shrink-0">
                            <img src={prod.images[0]} alt={prod.title} className="object-cover h-full w-full" />
                          </div>
                          <span className="font-semibold text-brand-charcoal leading-tight max-w-[160px] truncate">
                            {prod.title}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-brand-charcoal/60 capitalize">
                          {prod.category}
                        </td>
                        <td className="py-4 px-6 font-bold text-right font-serif text-brand-charcoal">
                          ${prod.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 text-brand-charcoal/30 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-all cursor-pointer inline-flex items-center justify-center"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
    </>
  );
}

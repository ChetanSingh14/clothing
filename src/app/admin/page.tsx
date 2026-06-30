"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useAdminStore } from "@/store/useAdminStore";
import { useProductStore } from "@/store/useProductStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { shallow } from "zustand/shallow";
import { Plus, Trash2, Tag, Star, Package, Users, Layers, UploadCloud, Loader2, RefreshCw, BarChart2, UserCheck, Shield, ShoppingBag, DollarSign, Calendar, Edit, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { 
    stats, 
    users, 
    orders, 
    reviews, 
    loading, 
    fetchStats, 
    fetchUsers, 
    fetchOrders, 
    fetchReviews, 
    deleteReview, 
    createProduct, 
    deleteProduct, 
    uploadProductImage,
    adminUpdateUser
  } = useAdminStore();
  
  const { products, fetchProducts } = useProductStore();

  const companyName = useSettingsStore((state) => state.companyName);
  const logoUrl = useSettingsStore((state) => state.logoUrl);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, products, reviews, orders, users, settings

  // Brand customize states
  const [tempCompanyName, setTempCompanyName] = useState("");
  const [tempLogoUrl, setTempLogoUrl] = useState("");
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Edit user account states
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("USER");
  const [editPassword, setEditPassword] = useState("");

  // Form states for Product Upload
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
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (companyName) setTempCompanyName(companyName);
    if (logoUrl) setTempLogoUrl(logoUrl);
  }, [companyName, logoUrl]);

  useEffect(() => {
    if (initialized) {
      if (!user || user.role !== "ADMIN") {
        router.push("/");
      } else {
        syncData();
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
        alert("Failed to upload image. Make sure server is running.");
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
      await fetchStats(); // reload stats
      setTimeout(() => setFormSuccess(false), 3000);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const success = await deleteProduct(id);
      if (success) {
        await fetchProducts();
        await fetchStats();
      }
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (confirm("Are you sure you want to delete this review?")) {
      const success = await deleteReview(id);
      if (success) {
        alert("Review deleted successfully.");
      }
    }
  };

  const syncData = async () => {
    await fetchStats();
    await fetchProducts();
    await fetchUsers();
    await fetchOrders();
    await fetchReviews();
  };

  return (
    <>
      <Header onAuthClick={() => setIsAuthModalOpen(true)} />

      <main className="flex-grow py-12 px-6 sm:px-8 max-w-7xl mx-auto w-full">
        {/* Dashboard Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-charcoal/5 pb-6 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest text-brand-green uppercase">
              back-office management
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-charcoal font-serif mt-2">
              Atelier Dashboard
            </h1>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={syncData}
              className="flex items-center gap-1.5 rounded-xl border border-brand-charcoal/10 bg-brand-bg px-4 py-2.5 text-xs text-brand-charcoal/60 hover:bg-brand-charcoal/5 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span>Sync Server Data</span>
            </button>
          </div>
        </div>

        {/* Sidebar + Content Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-brand-gray border border-brand-charcoal/5 p-4 rounded-3xl space-y-1.5 shadow-xs">
              <span className="px-4 py-2 block text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">
                Menu Navigator
              </span>
              {[
                { id: "overview", label: "Dashboard Overview", icon: BarChart2 },
                { id: "products", label: "Products Inventory", icon: Package },
                { id: "reviews", label: "Reviews Manager", icon: Star },
                { id: "orders", label: "Sales & Orders", icon: ShoppingBag },
                { id: "users", label: "Customer Accounts", icon: Users },
                { id: "settings", label: "Brand Settings", icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? "bg-brand-charcoal text-brand-bg shadow-xs"
                        : "text-brand-charcoal/55 hover:text-brand-charcoal hover:bg-brand-charcoal/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Main Content */}
          <div className="flex-grow w-full">
            
            {/* -------------------- TAB CONTENT: OVERVIEW -------------------- */}
            {activeTab === "overview" && (
              <div className="space-y-12">
                {/* Stats Grid */}
                {stats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        label: "total active items",
                        value: stats.totalProducts,
                        icon: Package,
                        color: "text-blue-600 bg-blue-50 border-blue-100",
                      },
                      {
                        label: "gross revenue",
                        value: `$${(stats.totalRevenue || 0).toFixed(2)}`,
                        icon: DollarSign,
                        color: "text-brand-green bg-brand-green/10 border-brand-green/20",
                      },
                      {
                        label: "feedbacks collected",
                        value: stats.totalReviews,
                        icon: Star,
                        color: "text-amber-600 bg-amber-50 border-amber-100",
                      },
                      {
                        label: "total sales checkout",
                        value: stats.totalOrders || 0,
                        icon: ShoppingBag,
                        color: "text-purple-600 bg-purple-50 border-purple-100",
                      },
                    ].map((card, i) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={card.label}
                        className="p-6 rounded-2xl border border-brand-charcoal/5 flex flex-col justify-between min-h-32 bg-brand-bg"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">
                            {card.label}
                          </span>
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${card.color}`}>
                            <card.icon className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="text-2xl font-bold font-serif text-brand-charcoal mt-4">
                          {card.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Quick Logs */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  {/* Recent Customer Sign-Ups */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold font-serif text-brand-charcoal">
                        Recent Sign-Ups
                      </h3>
                      <button
                        onClick={() => setActiveTab("users")}
                        className="text-xs font-bold text-brand-green hover:underline cursor-pointer"
                      >
                        View Directory
                      </button>
                    </div>
                    
                    <div className="border border-brand-charcoal/5 rounded-2xl bg-brand-bg divide-y divide-brand-charcoal/5 overflow-hidden shadow-xs">
                      {users.slice(0, 5).map((u) => (
                        <div key={u.id} className="p-4 flex items-center justify-between text-xs hover:bg-brand-gray/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-brand-green/10 text-brand-green font-bold flex items-center justify-center text-xs uppercase">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-semibold text-brand-charcoal">{u.name}</h4>
                              <p className="text-[10px] text-brand-charcoal/40 font-light mt-0.5">{u.email}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-brand-charcoal/40 font-light">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {users.length === 0 && (
                        <div className="p-8 text-center text-xs text-brand-charcoal/40 italic">
                          No users registered yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Orders Log */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold font-serif text-brand-charcoal">
                        Recent Sales Orders
                      </h3>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-xs font-bold text-brand-green hover:underline cursor-pointer"
                      >
                        View Orders
                      </button>
                    </div>
                    
                    <div className="border border-brand-charcoal/5 rounded-2xl bg-brand-bg divide-y divide-brand-charcoal/5 overflow-hidden shadow-xs">
                      {orders.slice(0, 5).map((ord) => (
                        <div key={ord.id} className="p-4 flex items-center justify-between text-xs hover:bg-brand-gray/20 transition-colors">
                          <div>
                            <h4 className="font-semibold text-brand-charcoal">Order #{ord.id}</h4>
                            <p className="text-[10px] text-brand-charcoal/40 mt-0.5">By {ord.user.name}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-brand-charcoal font-serif">${ord.totalAmount.toFixed(2)}</div>
                            <span className="text-[9px] text-brand-charcoal/40 font-light">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="p-8 text-center text-xs text-brand-charcoal/40 italic">
                          No checkout orders logged.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: PRODUCTS -------------------- */}
            {activeTab === "products" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                {/* Form */}
                <div className="xl:col-span-5 bg-brand-gray/30 p-8 rounded-3xl border border-brand-charcoal/5">
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
                        placeholder="e.g. Minimalist Wool Coat"
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
                        placeholder="Specify clothing weights, tailored linings details, wool percentage..."
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
                          placeholder="245.00"
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

                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                        Product Image *
                      </label>
                      <div className="mt-1.5 relative border border-dashed border-brand-charcoal/20 rounded-xl bg-brand-bg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-charcoal/5 transition-colors">
                        <UploadCloud className="h-6 w-6 text-brand-charcoal/40 mb-1.5" />
                        <span className="text-[10px] font-semibold text-brand-charcoal/60">
                          {uploadingImage ? "Uploading file..." : uploadedImageUrl ? "Image uploaded ✓" : "Attach high-res photo"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
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

                {/* Inventory List */}
                <div className="xl:col-span-7 space-y-6">
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Active Catalog Inventory ({products.length})
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
            )}

            {/* -------------------- TAB CONTENT: REVIEWS -------------------- */}
            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Feedbacks & Reviews Log
                  </h2>
                  <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-bold border border-amber-200">
                    {reviews.length} customer feedback(s)
                  </span>
                </div>

                <div className="border border-brand-charcoal/5 rounded-3xl overflow-hidden bg-brand-bg shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-brand-gray/50 border-b border-brand-charcoal/5 text-[10px] uppercase font-bold text-brand-charcoal/50 tracking-wider">
                          <th className="py-4.5 px-6">Product</th>
                          <th className="py-4.5 px-6">Customer</th>
                          <th className="py-4.5 px-6">Rating</th>
                          <th className="py-4.5 px-6">Comment</th>
                          <th className="py-4.5 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-charcoal/5 text-xs">
                        {reviews.map((rev) => (
                          <tr key={rev.id} className="hover:bg-brand-gray/20 transition-colors">
                            <td className="py-4.5 px-6 font-semibold text-brand-charcoal max-w-[150px] truncate">
                              {rev.product?.title || "Unknown Product"}
                            </td>
                            <td className="py-4.5 px-6 text-brand-charcoal/70">
                              {rev.userName}
                            </td>
                            <td className="py-4.5 px-6">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-brand-charcoal/10"}`} />
                                ))}
                              </div>
                            </td>
                            <td className="py-4.5 px-6 text-brand-charcoal/60 italic max-w-sm truncate">
                              "{rev.comment}"
                            </td>
                            <td className="py-4.5 px-6 text-center">
                              <button
                                onClick={() => handleDeleteReview(rev.id)}
                                className="p-2 text-brand-charcoal/30 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-all cursor-pointer inline-flex items-center justify-center"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {reviews.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-xs text-brand-charcoal/40 italic">
                              No customer reviews logged.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: ORDERS -------------------- */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Sales Order Logs
                  </h2>
                  <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold border border-purple-200">
                    {orders.length} order(s) processed
                  </span>
                </div>

                <div className="space-y-6">
                  {orders.map((ord) => (
                    <div key={ord.id} className="border border-brand-charcoal/5 rounded-3xl bg-brand-bg p-6 shadow-xs relative overflow-hidden">
                      {/* Header bar of order card */}
                      <div className="flex flex-col sm:flex-row justify-between border-b border-brand-charcoal/5 pb-4 mb-4 text-xs gap-3">
                        <div>
                          <div className="font-bold text-brand-charcoal text-sm flex items-center gap-2">
                            <span>Order #{ord.id}</span>
                            <span className="text-[10px] font-bold bg-brand-green/10 text-brand-green px-2 py-0.5 rounded border border-brand-green/20 uppercase tracking-wide">
                              processed
                            </span>
                          </div>
                          <div className="text-[10px] text-brand-charcoal/40 font-light mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(ord.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                          </div>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal/40">Buyer profile</span>
                          <div className="font-semibold text-brand-charcoal">{ord.user.name}</div>
                          <div className="text-[10px] text-brand-charcoal/50">{ord.user.email}</div>
                        </div>
                      </div>

                      {/* Items details list */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-brand-charcoal/40 block">Purchased Garments ({ord.items.length})</span>
                        <div className="divide-y divide-brand-charcoal/5">
                          {ord.items.map((item: any, idx: number) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <div className="relative h-10 w-8 rounded bg-brand-gray overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.title} className="object-cover h-full w-full" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-semibold text-brand-charcoal">{item.title}</h4>
                                  <div className="flex items-center gap-2 text-[10px] text-brand-charcoal/50 font-light mt-0.5">
                                    <span className="uppercase">size: {item.size}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      color: 
                                      <span className="h-2 w-2 rounded-full border border-brand-charcoal/10 inline-block" style={{ backgroundColor: item.color }} />
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-semibold text-brand-charcoal">${item.price.toFixed(2)}</div>
                                <div className="text-[10px] text-brand-charcoal/40 font-light">Qty: {item.quantity}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer total bar */}
                      <div className="mt-4 border-t border-brand-charcoal/5 pt-4 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-brand-charcoal/40 uppercase tracking-wider">Gross Total</span>
                        <div className="text-xl font-bold font-serif text-brand-charcoal">${ord.totalAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="border border-brand-charcoal/5 rounded-3xl bg-brand-bg p-12 text-center text-xs text-brand-charcoal/40 italic">
                      No customer orders recorded.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: USERS -------------------- */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Customer Accounts Directory
                  </h2>
                  <span className="text-xs bg-brand-green/10 text-brand-green px-3 py-1 rounded-full font-bold border border-brand-green/20">
                    {users.length} customer(s) registered
                  </span>
                </div>

                <div className="border border-brand-charcoal/5 rounded-3xl overflow-hidden bg-brand-bg shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-brand-gray/50 border-b border-brand-charcoal/5 text-[10px] uppercase font-bold text-brand-charcoal/50 tracking-wider">
                          <th className="py-4.5 px-6">ID</th>
                          <th className="py-4.5 px-6">Customer Profile</th>
                          <th className="py-4.5 px-6">Email Address</th>
                          <th className="py-4.5 px-6">Security Authorization Role</th>
                          <th className="py-4.5 px-6">Password Hash</th>
                          <th className="py-4.5 px-6 text-right">Registration Date</th>
                          <th className="py-4.5 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-charcoal/5 text-xs">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-brand-gray/20 transition-colors">
                            <td className="py-4.5 px-6 font-mono font-bold text-brand-charcoal/60">
                              #{u.id}
                            </td>
                            <td className="py-4.5 px-6 flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-brand-green/10 text-brand-green font-bold flex items-center justify-center text-xs uppercase">
                                {u.name.charAt(0)}
                              </div>
                              <span className="font-semibold text-brand-charcoal">{u.name}</span>
                            </td>
                            <td className="py-4.5 px-6 text-brand-charcoal/60 font-mono">
                              {u.email}
                            </td>
                            <td className="py-4.5 px-6">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold rounded-md uppercase border ${
                                u.role === "ADMIN" 
                                  ? "bg-purple-100 text-purple-700 border-purple-200" 
                                  : "bg-brand-gray text-brand-charcoal/60 border-brand-charcoal/10"
                              }`}>
                                <Shield className="h-2.5 w-2.5" />
                                <span>{u.role}</span>
                              </span>
                            </td>
                            <td className="py-4.5 px-6 font-mono text-[10px] text-brand-charcoal/40 truncate max-w-[120px]" title={u.password}>
                              {u.password || "********"}
                            </td>
                            <td className="py-4.5 px-6 text-right text-brand-charcoal/50 font-light">
                              {new Date(u.createdAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="py-4.5 px-6 text-center">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setEditName(u.name);
                                  setEditRole(u.role);
                                  setEditPassword("");
                                }}
                                className="px-3 py-1.5 rounded-lg border border-brand-charcoal/10 bg-brand-bg hover:bg-brand-charcoal/5 font-semibold text-xs tracking-wide transition-all cursor-pointer inline-flex items-center gap-1 text-brand-charcoal/80"
                              >
                                <Edit className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TAB CONTENT: SETTINGS -------------------- */}
            {activeTab === "settings" && (
              <div className="max-w-2xl bg-brand-gray/30 p-8 rounded-3xl border border-brand-charcoal/5 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-brand-charcoal font-serif">
                    Brand Customization Settings
                  </h2>
                  <p className="text-xs text-brand-charcoal/50 mt-1 font-light">
                    Update your brand logo image and set the company name dynamically across all components.
                  </p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setUpdatingSettings(true);
                  const success = await updateSettings({
                    companyName: tempCompanyName,
                    logoUrl: tempLogoUrl
                  });
                  if (success) {
                    alert("Brand settings updated successfully!");
                  } else {
                    alert("Failed to save settings.");
                  }
                  setUpdatingSettings(false);
                }} className="space-y-6 text-xs">
                  <div>
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="sName">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="sName"
                      required
                      value={tempCompanyName}
                      onChange={(e) => setTempCompanyName(e.target.value)}
                      placeholder="e.g. MDFK CLOTHING CO."
                      className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60">
                      Company Logo Graphic
                    </label>
                    <div className="mt-2 flex items-center gap-6">
                      <div className="relative h-16 w-36 overflow-hidden rounded-xl border border-brand-charcoal/10 bg-brand-gray flex items-center justify-center p-2">
                        {tempLogoUrl ? (
                          <img src={tempLogoUrl} alt="Preview logo" className="object-contain h-full w-full" />
                        ) : (
                          <span className="text-[10px] text-brand-charcoal/40 font-bold">NO LOGO</span>
                        )}
                      </div>
                      <div className="relative flex-grow border border-dashed border-brand-charcoal/20 rounded-xl bg-brand-bg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-charcoal/5 transition-colors">
                        <UploadCloud className="h-6 w-6 text-brand-charcoal/40 mb-1.5" />
                        <span className="text-[10px] font-semibold text-brand-charcoal/60">
                          {uploadingImage ? "Uploading file..." : "Upload new brand logo"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setUploadingImage(true);
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const base64Data = reader.result as string;
                              setTempLogoUrl(base64Data);
                              setUploadingImage(false);
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingSettings || uploadingImage}
                    className="w-full bg-brand-charcoal text-brand-bg rounded-xl py-3.5 text-xs font-semibold tracking-wide hover:bg-brand-charcoal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-4"
                  >
                    {updatingSettings ? "Saving settings..." : "Save Settings"}
                  </button>
                </form>
              </div>
            )}

            {/* Edit User Modal Dialog Overlay */}
            {editingUser && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-charcoal/60 backdrop-blur-md p-4">
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-md bg-brand-bg rounded-3xl p-8 border border-brand-charcoal/10 shadow-2xl relative text-brand-charcoal"
                >
                  <h3 className="text-xl font-bold font-serif text-brand-charcoal mb-2">Edit User Account</h3>
                  <p className="text-xs text-brand-charcoal/50 mb-6">Manage settings for user ID #{editingUser.id} ({editingUser.email})</p>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const updateData: any = { name: editName, role: editRole };
                    if (editPassword) {
                      updateData.password = editPassword;
                    }
                    const success = await adminUpdateUser(editingUser.id, updateData);
                    if (success) {
                      setEditingUser(null);
                      alert("User details updated successfully!");
                    } else {
                      alert("Failed to update user details.");
                    }
                  }} className="space-y-4 text-xs text-left">
                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="uName">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="uName"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="uRole">
                        System Role
                      </label>
                      <select
                        id="uRole"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none cursor-pointer"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold uppercase tracking-wider text-brand-charcoal/60" htmlFor="uPassword">
                        New Password (leave empty to keep current)
                      </label>
                      <input
                        type="password"
                        id="uPassword"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Enter new plain text password"
                        className="mt-1.5 w-full rounded-xl border border-brand-charcoal/10 bg-brand-bg px-3.5 py-3 text-xs focus:border-brand-green focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-3 mt-6 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="flex-1 rounded-xl border border-brand-charcoal/10 bg-brand-bg py-3 text-xs font-semibold hover:bg-brand-charcoal/5 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-brand-charcoal text-brand-bg rounded-xl py-3 text-xs font-semibold hover:bg-brand-charcoal/90 transition-all cursor-pointer"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </motion.div>
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
    </>
  );
}

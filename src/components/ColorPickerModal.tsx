"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Check } from "lucide-react";

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColors: string[]; // array of hex codes
  onColorsChange: (colors: string[]) => void;
}

// A curated list of ~140 colors, combining basic hues and shades
const COLOR_PALETTE = [
  // Grays
  { name: "Slate 50", hex: "#f8fafc" }, { name: "Slate 300", hex: "#cbd5e1" }, { name: "Slate 500", hex: "#64748b" }, { name: "Slate 700", hex: "#334155" }, { name: "Slate 900", hex: "#0f172a" },
  { name: "Gray 50", hex: "#f9fafb" }, { name: "Gray 300", hex: "#d1d5db" }, { name: "Gray 500", hex: "#6b7280" }, { name: "Gray 700", hex: "#374151" }, { name: "Gray 900", hex: "#111827" },
  { name: "Zinc 50", hex: "#fafafa" }, { name: "Zinc 300", hex: "#d4d4d8" }, { name: "Zinc 500", hex: "#71717a" }, { name: "Zinc 700", hex: "#3f3f46" }, { name: "Zinc 900", hex: "#18181b" },
  { name: "Neutral 50", hex: "#fafafa" }, { name: "Neutral 300", hex: "#d4d4d4" }, { name: "Neutral 500", hex: "#737373" }, { name: "Neutral 700", hex: "#404040" }, { name: "Neutral 900", hex: "#171717" },
  { name: "Stone 50", hex: "#fafaf9" }, { name: "Stone 300", hex: "#d6d3d1" }, { name: "Stone 500", hex: "#78716c" }, { name: "Stone 700", hex: "#44403c" }, { name: "Stone 900", hex: "#1c1917" },
  
  // Reds
  { name: "Red 50", hex: "#fef2f2" }, { name: "Red 200", hex: "#fecaca" }, { name: "Red 400", hex: "#f87171" }, { name: "Red 500", hex: "#ef4444" }, { name: "Red 700", hex: "#b91c1c" }, { name: "Red 900", hex: "#7f1d1d" },
  { name: "Rose 50", hex: "#fff1f2" }, { name: "Rose 200", hex: "#fecdd3" }, { name: "Rose 400", hex: "#fb7185" }, { name: "Rose 500", hex: "#f43f5e" }, { name: "Rose 700", hex: "#be123c" }, { name: "Rose 900", hex: "#881337" },
  
  // Oranges & Browns
  { name: "Orange 50", hex: "#fff7ed" }, { name: "Orange 200", hex: "#fed7aa" }, { name: "Orange 400", hex: "#fb923c" }, { name: "Orange 500", hex: "#f97316" }, { name: "Orange 700", hex: "#c2410c" }, { name: "Orange 900", hex: "#7c2d12" },
  { name: "Amber 50", hex: "#fffbeb" }, { name: "Amber 200", hex: "#fde68a" }, { name: "Amber 400", hex: "#fbbf24" }, { name: "Amber 500", hex: "#f59e0b" }, { name: "Amber 700", hex: "#b45309" }, { name: "Amber 900", hex: "#78350f" },
  { name: "Brown (Wood)", hex: "#8B5A2B" }, { name: "Brown (Dark)", hex: "#4A3B32" }, { name: "Tan", hex: "#D2B48C" }, { name: "Beige", hex: "#F5F5DC" }, { name: "Khaki", hex: "#F0E68C" },
  
  // Yellows
  { name: "Yellow 50", hex: "#fefce8" }, { name: "Yellow 200", hex: "#fef08a" }, { name: "Yellow 400", hex: "#facc15" }, { name: "Yellow 500", hex: "#eab308" }, { name: "Yellow 700", hex: "#a16207" }, { name: "Yellow 900", hex: "#713f12" },
  
  // Greens
  { name: "Lime 50", hex: "#f7fee7" }, { name: "Lime 200", hex: "#d9f99d" }, { name: "Lime 400", hex: "#a3e635" }, { name: "Lime 500", hex: "#84cc16" }, { name: "Lime 700", hex: "#4d7c0f" }, { name: "Lime 900", hex: "#365314" },
  { name: "Green 50", hex: "#f0fdf4" }, { name: "Green 200", hex: "#bbf7d0" }, { name: "Green 400", hex: "#4ade80" }, { name: "Green 500", hex: "#22c55e" }, { name: "Green 700", hex: "#15803d" }, { name: "Green 900", hex: "#14532d" },
  { name: "Emerald 50", hex: "#ecfdf5" }, { name: "Emerald 200", hex: "#a7f3d0" }, { name: "Emerald 400", hex: "#34d399" }, { name: "Emerald 500", hex: "#10b981" }, { name: "Emerald 700", hex: "#047857" }, { name: "Emerald 900", hex: "#064e3b" },
  { name: "Teal 50", hex: "#f0fdfa" }, { name: "Teal 200", hex: "#99f6e4" }, { name: "Teal 400", hex: "#2dd4bf" }, { name: "Teal 500", hex: "#14b8a6" }, { name: "Teal 700", hex: "#0f766e" }, { name: "Teal 900", hex: "#134e4a" },
  { name: "Olive", hex: "#808000" }, { name: "Olive Drab", hex: "#6B8E23" }, { name: "Dark Olive", hex: "#556B2F" }, { name: "Forest", hex: "#228B22" },
  
  // Blues
  { name: "Cyan 50", hex: "#ecfeff" }, { name: "Cyan 200", hex: "#a5f3fc" }, { name: "Cyan 400", hex: "#22d3ee" }, { name: "Cyan 500", hex: "#06b6d4" }, { name: "Cyan 700", hex: "#0e7490" }, { name: "Cyan 900", hex: "#164e63" },
  { name: "Sky 50", hex: "#f0f9ff" }, { name: "Sky 200", hex: "#bae6fd" }, { name: "Sky 400", hex: "#38bdf8" }, { name: "Sky 500", hex: "#0ea5e9" }, { name: "Sky 700", hex: "#0369a1" }, { name: "Sky 900", hex: "#0c4a6e" },
  { name: "Blue 50", hex: "#eff6ff" }, { name: "Blue 200", hex: "#bfdbfe" }, { name: "Blue 400", hex: "#60a5fa" }, { name: "Blue 500", hex: "#3b82f6" }, { name: "Blue 700", hex: "#1d4ed8" }, { name: "Blue 900", hex: "#1e3a8a" },
  { name: "Indigo 50", hex: "#eef2ff" }, { name: "Indigo 200", hex: "#c7d2fe" }, { name: "Indigo 400", hex: "#818cf8" }, { name: "Indigo 500", hex: "#6366f1" }, { name: "Indigo 700", hex: "#4338ca" }, { name: "Indigo 900", hex: "#312e81" },
  { name: "Navy", hex: "#000080" }, { name: "Midnight Blue", hex: "#191970" }, { name: "Royal Blue", hex: "#4169E1" }, { name: "Steel Blue", hex: "#4682B4" },
  
  // Purples & Pinks
  { name: "Violet 50", hex: "#f5f3ff" }, { name: "Violet 200", hex: "#ddd6fe" }, { name: "Violet 400", hex: "#a78bfa" }, { name: "Violet 500", hex: "#8b5cf6" }, { name: "Violet 700", hex: "#6d28d9" }, { name: "Violet 900", hex: "#4c1d95" },
  { name: "Purple 50", hex: "#faf5ff" }, { name: "Purple 200", hex: "#e9d5ff" }, { name: "Purple 400", hex: "#c084fc" }, { name: "Purple 500", hex: "#a855f7" }, { name: "Purple 700", hex: "#7e22ce" }, { name: "Purple 900", hex: "#581c87" },
  { name: "Fuchsia 50", hex: "#fdf4ff" }, { name: "Fuchsia 200", hex: "#f5d0fe" }, { name: "Fuchsia 400", hex: "#e879f9" }, { name: "Fuchsia 500", hex: "#d946ef" }, { name: "Fuchsia 700", hex: "#a21caf" }, { name: "Fuchsia 900", hex: "#701a75" },
  { name: "Pink 50", hex: "#fdf2f8" }, { name: "Pink 200", hex: "#fbcfe8" }, { name: "Pink 400", hex: "#f472b6" }, { name: "Pink 500", hex: "#ec4899" }, { name: "Pink 700", hex: "#be185d" }, { name: "Pink 900", hex: "#831843" },
  
  // Basics
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Brand Charcoal", hex: "#111111" },
  { name: "Brand Green", hex: "#4A5D23" },
  { name: "Brand Sand", hex: "#EAE6DF" }
];

export default function ColorPickerModal({ isOpen, onClose, selectedColors, onColorsChange }: ColorPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColors = useMemo(() => {
    return COLOR_PALETTE.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.hex.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const toggleColor = (hex: string) => {
    // case insensitive compare
    const lowerHex = hex.toLowerCase();
    const currentLower = selectedColors.map(c => c.toLowerCase());
    
    if (currentLower.includes(lowerHex)) {
      onColorsChange(selectedColors.filter(c => c.toLowerCase() !== lowerHex));
    } else {
      onColorsChange([...selectedColors, hex]);
    }
  };

  const isSelected = (hex: string) => {
    return selectedColors.map(c => c.toLowerCase()).includes(hex.toLowerCase());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-brand-bg rounded-3xl shadow-xl z-[101] overflow-hidden border border-brand-charcoal/10 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-charcoal/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-brand-charcoal">Select Colors</h2>
                <p className="text-xs text-brand-charcoal/50 mt-1">Choose the available colors for this product.</p>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-full bg-brand-charcoal/5 hover:bg-brand-charcoal/10 flex items-center justify-center text-brand-charcoal transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search & Custom Color */}
            <div className="px-6 pt-6 pb-2 flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-charcoal/40" />
                <input
                  type="text"
                  placeholder="Search colors by name or hex (e.g., 'Red' or '#EF4444')"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-brand-gray/50 border border-brand-charcoal/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-green"
                />
              </div>
              
              <div className="flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-charcoal/40 mb-1">Custom</span>
                <div className="h-10 w-10 rounded-full border border-brand-charcoal/20 overflow-hidden relative shadow-sm cursor-pointer hover:scale-105 transition-transform">
                  <input 
                    type="color" 
                    className="absolute inset-[-10px] h-[200%] w-[200%] cursor-pointer p-0 m-0 border-none" 
                    onChange={(e) => {
                      const hex = e.target.value.toUpperCase();
                      if (!selectedColors.map(c => c.toLowerCase()).includes(hex.toLowerCase())) {
                        onColorsChange([...selectedColors, hex]);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Selected Colors Preview */}
            {selectedColors.length > 0 && (
              <div className="px-6 py-4 flex flex-wrap gap-2 border-b border-brand-charcoal/5">
                {selectedColors.map((hex, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-brand-gray px-2.5 py-1.5 rounded-full border border-brand-charcoal/5">
                    <div className="w-3.5 h-3.5 rounded-full shadow-sm border border-brand-charcoal/10" style={{ backgroundColor: hex }} />
                    <span className="text-[10px] font-mono text-brand-charcoal uppercase">{hex}</span>
                    <button onClick={() => toggleColor(hex)} className="ml-1 text-brand-charcoal/40 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Colors Grid */}
            <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
              {filteredColors.length === 0 ? (
                <div className="py-12 text-center text-brand-charcoal/50 text-sm">
                  No colors found matching "{searchTerm}"
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredColors.map((color, idx) => {
                    const active = isSelected(color.hex);
                    // Lightness calculation approximation to know whether to show white or black text
                    const isDark = color.hex.toLowerCase() === "#000000" || color.name.includes("900") || color.name.includes("700") || color.name.includes("Dark");
                    
                    return (
                      <button
                        key={`${color.hex}-${idx}`}
                        onClick={() => toggleColor(color.hex)}
                        className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 aspect-square flex flex-col justify-end p-3 text-left
                          ${active ? 'border-brand-green shadow-md ring-2 ring-brand-green/20 scale-95' : 'border-brand-charcoal/10 hover:shadow-sm hover:scale-105 hover:border-brand-charcoal/30'}`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {/* Overlay to make text readable */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                        
                        {active && (
                          <div className={`absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        
                        <div className="relative z-10">
                          <p className={`text-[11px] font-bold tracking-wide truncate ${isDark ? 'text-white' : 'text-white'}`}>{color.name}</p>
                          <p className={`text-[10px] font-mono font-medium opacity-80 ${isDark ? 'text-white' : 'text-white'}`}>{color.hex.toUpperCase()}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-brand-charcoal/5 bg-brand-gray/20 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-charcoal text-brand-bg rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-charcoal/90 transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

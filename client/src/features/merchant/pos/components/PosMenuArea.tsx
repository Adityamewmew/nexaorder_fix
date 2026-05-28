import { Search, SlidersHorizontal, ChevronDown, UserCircle2, UtensilsCrossed, ShoppingBag, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Product } from "@/types";
import { useState } from "react";
import ModifierModal from "./ModifierModal";

interface PosMenuAreaProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  orderType: "Dine In" | "Take away";
  setOrderType: (type: "Dine In" | "Take away") => void;
  categories: { id: string; name: string }[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  filteredProducts: Product[];
  onAddToCart: (product: Product) => void;
}

export default function PosMenuArea({
  searchQuery,
  setSearchQuery,
  orderType,
  setOrderType,
  categories,
  activeCategory,
  setActiveCategory,
  filteredProducts,
  onAddToCart
}: PosMenuAreaProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    if (product.stock === 0) return;
    
    // Jika produk memiliki modifier/add-on, buka modal
    if (product.modifierGroups && product.modifierGroups.length > 0) {
      setSelectedProduct(product);
    } else {
      // Jika tidak ada add-on, langsung masuk keranjang
      onAddToCart(product);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-background overflow-hidden border-r border-slate-200">
      {/* Top Bar POS (Dalam Menu) */}
      <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
        <div className="flex w-full md:w-auto items-center gap-3 flex-1">
          <div className="relative flex-1 md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari menu, kategori, atau kode"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>
          <button className="p-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="flex w-full md:w-auto items-center gap-4 justify-between md:justify-end">
          <div className="hidden md:flex items-center gap-2 text-slate-700 font-medium px-4 border-r border-slate-200">
            <UserCircle2 className="w-6 h-6 text-slate-400" />
            Kasir
            <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setOrderType("Dine In")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all",
                orderType === "Dine In" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <UtensilsCrossed className="w-4 h-4" /> Dine In
            </button>
            <button
              onClick={() => setOrderType("Take away")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-all",
                orderType === "Take away" ? "bg-brand-secondary text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ShoppingBag className="w-4 h-4" /> Take Away
            </button>
          </div>
        </div>
      </div>

      {/* Content Menu (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <h1 className="text-4xl font-bold text-brand-primary mb-6">Menu</h1>
        
        <div className="flex flex-wrap gap-3 pb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                "px-5 py-2 rounded-lg font-semibold text-sm transition-colors border",
                activeCategory === cat.name
                  ? "bg-brand-secondary text-white border-brand-secondary"
                  : "bg-white text-slate-600 border-slate-200 hover:border-brand-primary/30"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          {activeCategory === "Semua" ? "Semua menu" : activeCategory}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              onClick={() => handleProductClick(product)}
              className={cn(
                "bg-white rounded-xl border overflow-hidden flex flex-col transition-all cursor-pointer group",
                product.stock === 0 ? "opacity-60 border-red-200 cursor-not-allowed" : "border-slate-200 hover:border-brand-primary/50 hover:shadow-md"
              )}
            >
              <div className="h-36 w-full overflow-hidden relative bg-slate-100">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">HABIS</span>
                  </div>
                )}
                {product.modifierGroups && product.modifierGroups.length > 0 && product.stock > 0 && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-brand-primary/90 text-white px-2 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-sm">
                      Bisa Custom
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <h3 className="font-bold text-slate-800 text-sm line-clamp-2">{product.name}</h3>
                <div className="mt-auto pt-3 flex items-center justify-between">
                  <span className="font-bold text-brand-primary text-sm">
                    Rp. {product.price.toLocaleString('id-ID')}
                  </span>
                  <button 
                    disabled={product.stock === 0}
                    className="w-7 h-7 bg-brand-primary text-white rounded-md flex items-center justify-center hover:bg-brand-primaryHover disabled:bg-slate-300 transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add-on / Modifier */}
      {selectedProduct && (
        <ModifierModal 
          product={selectedProduct}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
          onConfirm={(modifiers, finalPrice) => {
            // Kita panggil onAddToCart dengan data yang dimodifikasi
            // Karena Product interface tidak menerima finalPrice/modifiers, 
            // nanti di PointOfSale.tsx akan kita sesuaikan.
            // Untuk sementara, kita pass state ini via fungsi khusus atau extend objectnya.
            // (Akan disesuaikan di PointOfSale utama)
            onAddToCart({
              ...selectedProduct,
              price: finalPrice, // Override harga sementara
              // @ts-expect-error - kita inject data modifier sementara untuk dibaca oleh reducer
              _selectedModifiers: modifiers 
            });
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
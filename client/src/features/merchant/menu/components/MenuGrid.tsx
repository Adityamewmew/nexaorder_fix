import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Image as ImageIcon, Minus, Settings2, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

interface MenuGridProps {
  products: Product[];
  isAdmin: boolean;
  handleUpdateStock: (productId: string, delta: number) => void;
  getCategoryName: (categoryId: string) => string;
  onDelete: (productId: string) => void;
}

export default function MenuGrid({ 
  products, 
  isAdmin, 
  handleUpdateStock,
  getCategoryName,
  onDelete
}: MenuGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
          {/* Image Area */}
          <div className="h-48 w-full bg-slate-100 relative">
            {product.imageUrl ? (
              <img src={product.imageUrl.startsWith('http') ? product.imageUrl : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') + product.imageUrl : `http://localhost:5000${product.imageUrl}`)} alt={product.name} className={cn("w-full h-full object-cover transition-opacity", product.stock === 0 && "opacity-50 grayscale")} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageIcon className="w-10 h-10 opacity-50" />
              </div>
            )}
            {/* Badge Add-on */}
            {product.modifierGroups && product.modifierGroups.length > 0 && (
              <div className="absolute top-3 left-3 bg-brand-primary/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1.5">
                <Settings2 className="w-3 h-3" />
                Bisa Custom
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="p-5 flex flex-col flex-1">
            <div className="flex justify-between items-start gap-2 mb-1">
              <h3 className="font-bold text-slate-800 text-base leading-tight line-clamp-2">{product.name}</h3>
              <span className="font-bold text-slate-600 text-sm whitespace-nowrap shrink-0">Rp{product.price.toLocaleString('id-ID')}</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">{getCategoryName(product.categoryId)}</p>
            
            {/* Controls Area (Bottom) */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                {/* Stock Controls (Bisa diakses Kasir & Admin) */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stok</p>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-0.5 w-fit">
                    <button 
                      onClick={() => handleUpdateStock(product.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white hover:text-brand-primary rounded-md transition-colors shadow-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-slate-700">{product.stock}</span>
                    <button 
                      onClick={() => handleUpdateStock(product.id, 1)}
                      className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-white hover:text-brand-primary rounded-md transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="self-end mb-1">
                  {product.stock > 5 ? (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold inline-block text-center min-w-[80px]">Tersedia</span>
                  ) : product.stock > 0 ? (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold inline-block text-center min-w-[80px]">Hampir Habis</span>
                  ) : (
                    <span className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold inline-block text-center min-w-[80px]">Habis</span>
                  )}
                </div>
              </div>

              {/* Edit & Delete Buttons (HANYA Admin) */}
              {isAdmin && (
                <div className="flex gap-2 w-full mt-2">
                  <button 
                    onClick={() => navigate(`/merchant/menu/edit/${product.id}`)}
                    className="flex-1 h-9 flex items-center justify-center gap-2 border border-slate-200 text-slate-600 hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all text-xs font-bold"
                    title="Edit Menu"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => onDelete(product.id)}
                    className="flex-1 h-9 flex items-center justify-center gap-2 border border-slate-200 text-red-500 hover:border-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all text-xs font-bold"
                    title="Hapus Menu"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Placeholder Card for "Tambah Menu" (HANYA Admin) */}
      {isAdmin && (
        <button 
          onClick={() => navigate('/merchant/menu/add')}
          className="bg-slate-50/50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center min-h-[320px] text-slate-500 hover:text-brand-secondary hover:border-brand-secondary hover:bg-brand-secondary/5 transition-all group"
        >
          <div className="w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:border-brand-secondary/30">
            <Plus className="w-6 h-6 text-brand-secondary" />
          </div>
          <span className="font-bold">Tambah Menu Baru</span>
        </button>
      )}
    </div>
  );
}
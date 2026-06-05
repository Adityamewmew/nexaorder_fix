import { ImagePlus, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

interface MenuBasicInfoProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any;
  categories: { id: string; name: string }[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleToggleAvailability: () => void;
  handleImageUpload: (file: File) => Promise<void>;
  onNext: () => void;
}

export default function MenuBasicInfo({ formData, categories, handleInputChange, handleToggleAvailability, handleImageUpload, onNext }: MenuBasicInfoProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    await handleImageUpload(file);
    setIsUploading(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-secondary/30 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Sisi Kiri: Upload Foto */}
        <div className="md:col-span-4 flex flex-col">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Foto Menu</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-h-[250px] border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group relative overflow-hidden"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={onFileChange}
            />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-secondary animate-spin mb-2" />
                <span className="text-sm font-semibold text-slate-600">Mengunggah...</span>
              </div>
            ) : formData.imageUrl ? (
              <div className="absolute inset-0 w-full h-full p-2">
                <img src={import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') + formData.imageUrl : `http://localhost:5000${formData.imageUrl}`} alt="Preview" className="w-full h-full object-cover rounded-xl shadow-sm" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl m-2">
                  <span className="text-white font-semibold text-sm flex items-center gap-2">
                    <ImagePlus className="w-4 h-4" /> Ganti Foto
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImagePlus className="w-6 h-6 text-brand-secondary" />
                </div>
                <h4 className="font-bold text-slate-700 mb-1">Upload Image</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Format: JPG, PNG (Max. 2MB).<br />
                  Rekomendasi rasio 1:1.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Sisi Kanan: Input Fields */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Nama Menu</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Contoh: Nasi Goreng Spesial"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Kategori</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-colors appearance-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Harga (Rp)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-semibold text-sm">Rp</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Stok Awal</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-800 mb-2 block">Deskripsi Menu</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Jelaskan detail menu seperti bahan utama, rasa, dan porsi..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Status Toggle Area */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 flex items-center justify-between mt-2">
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Status Ketersediaan</h4>
              <p className="text-xs text-slate-500">Tampilkan menu ini di halaman pemesanan pelanggan</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("text-sm font-bold", formData.isAvailable ? "text-brand-secondary" : "text-slate-400")}>
                {formData.isAvailable ? "Tersedia" : "Disembunyikan"}
              </span>
              <button 
                onClick={handleToggleAvailability}
                className={cn(
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none",
                  formData.isAvailable ? "bg-brand-secondary" : "bg-slate-300"
                )}
              >
                <span className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                  formData.isAvailable ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Tab 1 */}
      <div className="mt-auto">
        <div className="bg-red-50/80 px-6 py-3 border-y border-red-100 flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-semibold">Perubahan akan langsung terlihat pada menu pelanggan</span>
        </div>
        <div className="bg-slate-50 p-6 flex justify-end gap-3">
          <button 
            onClick={() => navigate("/merchant/menu")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={onNext}
            className="px-6 py-2.5 bg-brand-secondary hover:bg-brand-secondaryHover text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            Lanjut ke Add-on
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
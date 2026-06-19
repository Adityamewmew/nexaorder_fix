import { useState, useEffect, useRef } from "react";
import { Save, ImagePlus, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

export default function StoreProfileForm() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [storeData, setStoreData] = useState({
    name: "",
    phone: "",
    address: "",
    description: "",
    logo: "",
    openTime: "08:00",
    closeTime: "22:00"
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/dashboard/profile');
        if (res.data) {
          setStoreData({
            name: res.data.name || "",
            phone: res.data.phone || "",
            address: res.data.address || "",
            description: res.data.description || "",
            logo: res.data.logo || "",
            openTime: res.data.openTime || "08:00",
            closeTime: res.data.closeTime || "22:00"
          });
        }
      } catch (err) {
        showToast("Gagal memuat profil toko", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const res = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStoreData(prev => ({ ...prev, logo: res.data.url }));
      showToast("Logo berhasil diunggah", "success");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Gagal mengunggah logo", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveStore = async () => {
    if (!storeData.name.trim()) {
      showToast("Nama toko tidak boleh kosong", "error");
      return;
    }
    
    setSaving(true);
    try {
      await api.put('/dashboard/profile', storeData);
      showToast("Profil toko berhasil disimpan!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Gagal menyimpan profil", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Memuat profil...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10 flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        
        {/* Kiri: Logo Toko */}
        <div className="md:col-span-4 flex flex-col">
          <label className="text-sm font-bold text-slate-800 mb-3">Logo Toko</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-h-[250px] border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group relative overflow-hidden"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleImageUpload}
            />
            {uploadingImage ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-brand-secondary animate-spin mb-2" />
                <span className="text-sm font-semibold text-slate-600">Mengunggah...</span>
              </div>
            ) : storeData.logo ? (
              <div className="absolute inset-0 w-full h-full p-2">
                <img src={storeData.logo.startsWith('http') ? storeData.logo : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') + storeData.logo : `http://localhost:5000${storeData.logo}`)} alt="Logo Toko" className="w-full h-full object-contain rounded-xl" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl m-2">
                  <span className="text-white font-semibold text-sm flex items-center gap-2">
                    <ImagePlus className="w-4 h-4" /> Ganti Logo
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImagePlus className="w-8 h-8 text-brand-secondary" />
                </div>
                <h4 className="font-bold text-slate-700 mb-1">Upload Logo</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Format: JPG, PNG (Max. 2MB)</p>
              </>
            )}
          </div>
        </div>

        {/* Kanan: Form Info Toko */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <div>
            <label className="text-sm font-bold text-slate-800 mb-2 block">Nama Toko</label>
            <input
              type="text"
              value={storeData.name}
              onChange={(e) => setStoreData({...storeData, name: e.target.value})}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Nomor Telepon</label>
              <input
                type="tel"
                value={storeData.phone}
                onChange={(e) => setStoreData({...storeData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 block">Buka</label>
                <input
                  type="time"
                  value={storeData.openTime}
                  onChange={(e) => setStoreData({...storeData, openTime: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 block">Tutup</label>
                <input
                  type="time"
                  value={storeData.closeTime}
                  onChange={(e) => setStoreData({...storeData, closeTime: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-800 mb-2 block">Alamat Lengkap</label>
            <textarea
              value={storeData.address}
              onChange={(e) => setStoreData({...storeData, address: e.target.value})}
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-800 mb-2 block">Deskripsi Singkat</label>
            <textarea
              value={storeData.description}
              onChange={(e) => setStoreData({...storeData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
        <button 
          onClick={handleSaveStore}
          disabled={saving}
          className="px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Menyimpan..." : "Simpan Profil Toko"}
        </button>
      </div>
    </div>
  );
}

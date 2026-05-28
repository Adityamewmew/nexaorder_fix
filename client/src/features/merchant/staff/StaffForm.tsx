import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ImagePlus, Eye, EyeOff, Info, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";

export default function StaffForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "KASIR",
    isActive: true
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = () => {
    // Validasi
    if (!formData.username.trim() || !formData.password || !formData.confirmPassword) {
      showToast("Harap isi semua kolom wajib (Username & Password)!", "error");
      return;
    }
    if (formData.username.trim().toLowerCase() === "andi@nexa.com") {
      showToast("Username sudah digunakan. Harap gunakan yang lain.", "error");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast("Password dan Konfirmasi Password tidak cocok!", "error");
      return;
    }
    
    showToast("Akun kasir berhasil ditambahkan!", "success");
    navigate("/merchant/staff");
  };

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-24">
      
      {/* Tombol Kembali */}
      <button 
        onClick={() => navigate("/merchant/staff")}
        className="flex items-center gap-2 text-slate-800 font-bold hover:text-brand-primary transition-colors w-fit mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Kelola Akun Kasir
      </button>

      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary">Tambah Akun Kasir</h1>
        <p className="text-slate-500 mt-1">Tambahkan akun kasir baru untuk mengakses sistem di halaman ini</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-brand-secondary/30 shadow-sm p-6 md:p-10 flex flex-col">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Kolom Kiri: Input Kredensial */}
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Masukkan username kasir"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-white border border-brand-secondary/30 rounded-xl p-5 flex items-center justify-between shadow-sm">
              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-1">Status Akun</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Tentukan apakah akun aktif saat ini</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-sm font-bold", formData.isActive ? "text-brand-secondary" : "text-slate-400")}>
                  {formData.isActive ? "Aktif" : "Nonaktif"}
                </span>
                <button 
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={cn(
                    "relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none",
                    formData.isActive ? "bg-brand-secondary" : "bg-slate-300"
                  )}
                >
                  <span className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                    formData.isActive ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Foto dan Role */}
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Role Akses</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white transition-colors appearance-none"
              >
                <option value="KASIR">Kasir</option>
                {/* Opsi role lain jika ada di masa depan */}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Foto Profil Kasir</label>
              <div className="w-full aspect-[2/1] border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ImagePlus className="w-5 h-5 text-slate-400 group-hover:text-brand-secondary transition-colors" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm mb-1">Upload Foto</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Format: JPG, PNG (Max. 1MB)
                </p>
              </div>
            </div>

            <div className="bg-red-50/50 border-l-4 border-red-400 p-4 rounded-r-xl flex gap-3 text-red-800 mt-auto">
              <Info className="w-5 h-5 shrink-0 text-red-500" />
              <p className="text-xs leading-relaxed">
                Akun kasir yang dibuat dapat digunakan untuk login ke dashboard kasir.
              </p>
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-slate-100">
          <button 
            onClick={() => navigate("/merchant/staff")}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-2.5 bg-brand-secondary hover:bg-brand-secondaryHover text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            Simpan Akun
          </button>
        </div>

      </div>

    </div>
  );
}
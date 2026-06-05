import { useState, useRef } from "react";
import { Lock, EyeOff, Eye, ShieldCheck, UserCircle, ImagePlus, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useToast } from "@/contexts/ToastContext";
import { updateProfile } from "@/features/auth/authSlice";
import api from "@/lib/api";

export default function SecurityProfileForm() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photo: user?.photo || ""
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

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
      setProfileData(prev => ({ ...prev, photo: res.data.url }));
      showToast("Foto profil berhasil diunggah", "success");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Gagal mengunggah foto profil", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      showToast("Nama tidak boleh kosong", "error");
      return;
    }
    
    setSavingProfile(true);
    try {
      const res = await api.patch(`/users/${user?.id}`, profileData);
      // Update Redux state
      dispatch(updateProfile(res.data));
      showToast("Profil berhasil diperbarui", "success");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Gagal memperbarui profil", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!securityData.newPassword || !securityData.confirmPassword || !securityData.oldPassword) {
      showToast("Semua field password harus diisi!", "error");
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      showToast("Password baru dan konfirmasi tidak cocok!", "error");
      return;
    }
    
    try {
      await api.patch('/auth/change-password', securityData);
      showToast("Password berhasil diubah!", "success");
      setSecurityData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showToast(err.response?.data?.error || "Gagal mengubah password", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      {/* Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10 flex flex-col">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Profil Pengguna</h2>
            <p className="text-sm text-slate-500">Atur informasi pribadi akun Anda.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center relative overflow-hidden group cursor-pointer"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageUpload}
              />
              {uploadingImage ? (
                <Loader2 className="w-8 h-8 text-brand-secondary animate-spin" />
              ) : profileData.photo ? (
                <>
                  <img 
                    src={profileData.photo.startsWith('http') ? profileData.photo : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${profileData.photo}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <UserCircle className="w-16 h-16 text-slate-300" />
              )}
            </div>
            <p className="text-xs font-semibold text-brand-primary mt-3 cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
              Ubah Foto
            </p>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Nama Lengkap</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-800 mb-2 block">Email <span className="text-slate-400 font-normal text-xs">(Opsional)</span></label>
              <input
                type="email"
                value={profileData.email || ""}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 block">Username</label>
                <input
                  type="text"
                  value={user?.username || ""}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-800 mb-2 block">Role</label>
                <input
                  type="text"
                  value={user?.role === 'MERCHANT_ADMIN' ? 'Merchant Admin' : 'Kasir'}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {savingProfile ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10 flex flex-col">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Ubah Password</h2>
            <p className="text-sm text-slate-500">Pastikan akun Anda selalu aman dengan password yang kuat.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-800 mb-2 block">Password Lama</label>
            <div className="relative">
              <input
                type={showPassword.old ? "text" : "password"}
                value={securityData.oldPassword}
                onChange={(e) => setSecurityData({...securityData, oldPassword: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(p => ({...p, old: !p.old}))}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <label className="text-sm font-bold text-slate-800 mb-2 block">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword.new ? "text" : "password"}
                value={securityData.newPassword}
                onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(p => ({...p, new: !p.new}))}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-800 mb-2 block">Konfirmasi Password Baru</label>
            <div className="relative">
              <input
                type={showPassword.confirm ? "text" : "password"}
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(p => ({...p, confirm: !p.confirm}))}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleSaveSecurity}
            className="px-8 py-3 bg-brand-secondary hover:bg-brand-secondaryHover text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            Perbarui Password
          </button>
        </div>
      </div>
    </div>
  );
}

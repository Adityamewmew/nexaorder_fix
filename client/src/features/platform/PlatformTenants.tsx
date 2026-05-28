import { useState } from "react";
import { X } from "lucide-react";
import { MOCK_TENANTS } from "@/utils/mockData";
import { cn } from "@/lib/utils";
import { Tenant } from "@/types";

export default function PlatformTenants() {
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State untuk form tambah tenant
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    adminEmail: "",
  });

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulasi penambahan tenant baru ke state lokal
    const newTenant: Tenant = {
      id: `tenant-00${tenants.length + 1}`,
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      isActive: true,
    };

    setTenants([...tenants, newTenant]);
    setIsModalOpen(false);
    
    // Reset form
    setFormData({ name: "", address: "", phone: "", adminEmail: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header & Tombol Tambah */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Tenant</h1>
          <p className="text-slate-600 text-sm mt-1">Kelola daftar toko dan UMKM yang terdaftar di sistem Nexa Order.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm whitespace-nowrap"
        >
          + Tambah Tenant Baru
        </button>
      </div>

      {/* Tabel Data Tenant */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Nama Toko</th>
                <th className="px-6 py-4">Alamat</th>
                <th className="px-6 py-4">Nomor HP</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{tenant.name}</td>
                  <td className="px-6 py-4 text-slate-600">{tenant.address}</td>
                  <td className="px-6 py-4 text-slate-600">{tenant.phone}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      tenant.isActive 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    )}>
                      {tenant.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-[#0B3B60] hover:underline font-medium px-2">Edit</button>
                    <button className="text-red-500 hover:underline font-medium px-2">Suspend</button>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Belum ada tenant yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Dialog Tambah Tenant */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Tambah Tenant Baru</h3>
                <p className="text-sm text-slate-500">Daftarkan UMKM/Toko baru ke dalam sistem.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTenant} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nama Toko/UMKM</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0B3B60] focus:border-transparent outline-none transition-all"
                  placeholder="Contoh: Bakso Malang Cak Arifin"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Alamat Lengkap</label>
                <textarea 
                  required rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0B3B60] focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Contoh: Jl. Potrosari II, Semarang"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nomor Handphone (WhatsApp)</label>
                <input 
                  type="tel" required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0B3B60] focus:border-transparent outline-none transition-all"
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <h4 className="text-sm font-bold text-[#0B3B60] mb-2">Informasi Akun Pemilik (Merchant Admin)</h4>
                <label className="text-sm font-semibold text-slate-700">Email Pemilik</label>
                <input 
                  type="email" required
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0B3B60] focus:border-transparent outline-none transition-all"
                  placeholder="Contoh: owner@baksomalang.com"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Sistem akan mengirimkan password default ke email ini.
                </p>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  Simpan & Daftarkan
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
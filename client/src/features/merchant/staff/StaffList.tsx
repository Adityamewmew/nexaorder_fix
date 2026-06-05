import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, XSquare, Search, Users, UserCheck, UserX, History, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/contexts/ToastContext";
import api from "@/lib/api";

interface Staff {
  id: number;
  username: string;
  email: string | null;
  name: string;
  role: string;
  status: string;
  photo: string | null;
  createdAt: string;
}

export default function StaffList() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/users?role=CASHIER");
      setStaff(res.data);
    } catch {
      showToast("Gagal memuat data kasir", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchStaff(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === "aktif").length;
  const inactiveStaff = staff.filter(s => s.status !== "aktif").length;

  const filteredStaff = staff.filter(s => {
    const matchesFilter = filter === "all" ||
      (filter === "active" && s.status === "aktif") ||
      (filter === "inactive" && s.status !== "aktif");
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openDeleteModal = (id: number) => {
    setStaffToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;
    try {
      await api.delete(`/users/${staffToDelete}`);
      setStaff(prev => prev.filter(s => s.id !== staffToDelete));
      showToast("Akun kasir berhasil dihapus", "success");
    } catch {
      showToast("Gagal menghapus akun kasir", "error");
    } finally {
      setDeleteModalOpen(false);
      setStaffToDelete(null);
    }
  };

  const handleToggleStatus = async (person: Staff) => {
    const newStatus = person.status === "aktif" ? "nonaktif" : "aktif";
    try {
      await api.patch(`/users/${person.id}`, { status: newStatus });
      setStaff(prev => prev.map(s => s.id === person.id ? { ...s, status: newStatus } : s));
      showToast(`Akun ${person.name} ${newStatus === "aktif" ? "diaktifkan" : "dinonaktifkan"}`, "success");
    } catch {
      showToast("Gagal mengubah status akun", "error");
    }
  };

  const handleResetPassword = async (person: Staff) => {
    const newPassword = prompt(`Reset password untuk ${person.name}. Masukkan password baru:`);
    if (!newPassword || newPassword.length < 6) {
      if (newPassword !== null) showToast("Password minimal 6 karakter", "error");
      return;
    }
    try {
      await api.patch(`/users/${person.id}/reset-password`, { password: newPassword });
      showToast(`Password ${person.name} berhasil direset`, "success");
    } catch {
      showToast("Gagal mereset password", "error");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-slate-400">Memuat data kasir...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-24">
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors shadow-sm"
            placeholder="Cari username kasir atau nama..."
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Kelola Akun Kasir</h1>
          <p className="text-slate-500 mt-1">Pantau dan kelola seluruh akun kasir yang memiliki akses sistem</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-primary appearance-none min-w-[140px] cursor-pointer"
          >
            <option value="all">Semua Akun</option>
            <option value="active">Akun Aktif</option>
            <option value="inactive">Akun Nonaktif</option>
          </select>
          <button
            onClick={() => navigate("/merchant/staff/add")}
            className="bg-brand-secondary hover:bg-brand-secondaryHover text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tambah Kasir
          </button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-brand-primary/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Kasir</p>
            <h3 className="text-3xl font-black text-slate-800">{totalStaff}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-green-500/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kasir Aktif</p>
            <h3 className="text-3xl font-black text-slate-800">{activeStaff}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-red-500/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kasir Nonaktif</p>
            <h3 className="text-3xl font-black text-slate-800">{inactiveStaff}</h3>
          </div>
        </div>
      </div>

      {/* Grid Staff */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredStaff.map((person) => (
          <div key={person.id} className={cn(
            "rounded-3xl border shadow-sm overflow-hidden flex flex-col transition-all relative",
            person.status === "aktif" ? "bg-white border-brand-primary/10 hover:border-brand-primary/30" : "bg-slate-200/60 border-slate-300"
          )}>
            <button
              onClick={() => openDeleteModal(person.id)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors z-10 bg-white/50 rounded-lg"
              title="Hapus Kasir"
            >
              <XSquare className="w-6 h-6" />
            </button>

            <div className="p-8 flex flex-col items-center text-center relative">
              <div className={cn(
                "w-20 h-20 rounded-full mb-4 border-4 shadow-sm overflow-hidden flex items-center justify-center bg-brand-primary/10",
                person.status === "aktif" ? "border-white" : "border-slate-300 filter grayscale"
              )}>
                {person.photo ? (
                  <img 
                    src={person.photo.startsWith('http') ? person.photo : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') + person.photo : `http://localhost:5000${person.photo}`)} 
                    alt={person.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-2xl font-black text-brand-primary">{person.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <h3 className={cn("text-lg font-bold mb-1", person.status === "aktif" ? "text-slate-800" : "text-slate-600")}>
                {person.name}
              </h3>
              <p className="text-xs font-bold text-slate-500 mb-0.5">@{person.username}</p>
              {person.email && <p className="text-xs text-slate-400 mb-3">{person.email}</p>}
              {!person.email && <div className="mb-3"></div>}

              <div className="flex items-center gap-2 mb-6">
                <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[10px] font-bold rounded uppercase tracking-wider">
                  {person.role}
                </span>
                <button
                  onClick={() => handleToggleStatus(person)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors",
                    person.status === "aktif" ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-slate-300 text-slate-600 hover:bg-slate-400"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", person.status === "aktif" ? "bg-green-500" : "bg-slate-500")}></span>
                  {person.status === "aktif" ? "Aktif" : "Nonaktif"}
                </button>
              </div>

              <div className="w-full text-left space-y-2 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Terdaftar</span>
                  <span className={cn("font-semibold", person.status === "aktif" ? "text-slate-700" : "text-slate-500")}>
                    {new Date(person.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 mt-auto border-t border-slate-100/50">
              <button
                onClick={() => handleResetPassword(person)}
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border",
                  person.status === "aktif"
                    ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    : "bg-transparent border-slate-300 text-slate-500 hover:bg-slate-300 hover:text-slate-700"
                )}
              >
                <History className="w-4 h-4" />
                Reset Password
              </button>
            </div>
          </div>
        ))}

        {filteredStaff.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500">Tidak ada kasir yang ditemukan.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Hapus Akun Kasir"
        description="Apakah Anda yakin ingin menghapus akun kasir ini?"
        confirmText="Hapus Kasir"
        cancelText="Batal"
        icon={<Trash2 className="w-8 h-8" />}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

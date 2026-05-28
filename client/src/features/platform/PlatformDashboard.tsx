import { useState, useEffect } from "react";
import { Store, Clock, TrendingUp, Users, Package, LayoutGrid } from "lucide-react";
import api from "@/lib/api";

interface Stats {
  totalMenu: number;
  totalMeja: number;
  totalKasir: number;
  transaksiHariIni: number;
  penjualanHariIni: number;
}

export default function PlatformDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [merchantCount, setMerchantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, usersRes] = await Promise.all([
          api.get("/dashboard"),
          api.get("/users?role=MERCHANT_ADMIN"),
        ]);
        setStats(dashRes.data);
        setMerchantCount(usersRes.data.length);
      } catch (err) {
        console.error("Gagal memuat data platform:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang di Nexa Order Platform</h1>
          <p className="text-slate-500 max-w-2xl">
            Pantau statistik global dan kelola semua Merchant/UMKM yang terdaftar di ekosistem Nexa Order.
          </p>
        </div>
        <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-sm font-semibold border border-amber-100 shrink-0">
          Superadmin Mode
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Memuat statistik...</div>
      ) : (
        <>
          {/* Statistik Platform */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Store className="w-7 h-7 text-[#0B3B60]" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Merchant Admin</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{merchantCount}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Clock className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Transaksi Hari Ini</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats?.transaksiHariIni ?? 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Pendapatan Hari Ini</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  Rp {(stats?.penjualanHariIni ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* Statistik Sistem */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <Package className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Menu Terdaftar</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats?.totalMenu ?? 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                <LayoutGrid className="w-7 h-7 text-purple-500" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Meja</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats?.totalMeja ?? 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center shrink-0">
                <Users className="w-7 h-7 text-pink-500" />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Kasir</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stats?.totalKasir ?? 0}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

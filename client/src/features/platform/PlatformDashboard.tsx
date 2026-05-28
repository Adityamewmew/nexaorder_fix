import { Store, Clock, TrendingUp } from "lucide-react";
import { MOCK_TENANTS } from "@/utils/mockData";

export default function PlatformDashboard() {
  const activeTenants = MOCK_TENANTS.filter(t => t.isActive).length;
  const pendingTenants = MOCK_TENANTS.filter(t => !t.isActive).length;

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Card Statistik 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Store className="w-7 h-7 text-[#0B3B60]" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Tenant Aktif</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{activeTenants}</p>
          </div>
        </div>

        {/* Card Statistik 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Menunggu Approval</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{pendingTenants}</p>
          </div>
        </div>

        {/* Card Statistik 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <TrendingUp className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Transaksi Platform</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">Rp 0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
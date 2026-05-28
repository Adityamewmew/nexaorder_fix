import { Users, Utensils, Receipt, DollarSign, ArrowUpRight, Plus, QrCode } from "lucide-react";
import { Link } from "react-router-dom";

export default function MerchantDashboard() {
  // Data statis sementara untuk UI Dashboard
  const stats = [
    {
      title: "Pendapatan Hari Ini",
      value: "Rp 1.250.000",
      trend: "+12.5%",
      isUp: true,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Total Pesanan",
      value: "45",
      trend: "+5.2%",
      isUp: true,
      icon: Receipt,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Menu Aktif",
      value: "24",
      trend: "Normal",
      isUp: true,
      icon: Utensils,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Total Karyawan / Kasir",
      value: "3",
      trend: "1 Shift Aktif",
      isUp: true,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  const recentOrders = [
    { id: "ORD-001", time: "10:30", customer: "Meja 4", total: 45000, status: "PAID" },
    { id: "ORD-002", time: "10:35", customer: "Takeaway", total: 120000, status: "PROCESS" },
    { id: "ORD-003", time: "10:42", customer: "Meja 1", total: 30000, status: "PENDING" },
    { id: "ORD-004", time: "10:50", customer: "Meja 6", total: 85000, status: "READY" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">Selesai</span>;
      case 'PROCESS': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Diproses</span>;
      case 'READY': return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Siap Saji</span>;
      case 'PENDING': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Menunggu</span>;
      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Ringkasan Toko</h1>
        <p className="text-slate-500 mt-1">Pantau performa dan aktivitas terkini tokomu hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium text-emerald-600">{stat.trend}</span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Aktivitas Pesanan Terkini</h3>
            <Link to="/merchant/orders" className="text-sm font-medium text-brand-primary hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-sm">
                  <th className="p-4 font-medium">ID Pesanan</th>
                  <th className="p-4 font-medium">Waktu</th>
                  <th className="p-4 font-medium">Pelanggan</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-700">{order.id}</td>
                    <td className="p-4 text-slate-500">{order.time}</td>
                    <td className="p-4 text-slate-700">{order.customer}</td>
                    <td className="p-4 font-semibold text-slate-700">
                      Rp {order.total.toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions & Overview */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Aksi Cepat</h3>
            <div className="space-y-3">
              <Link to="/merchant/menu" className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-brand-primary hover:bg-brand-primary/5 transition-all group">
                <div className="w-10 h-10 bg-slate-100 group-hover:bg-brand-primary/10 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-slate-600 group-hover:text-brand-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-700 group-hover:text-brand-primary">Tambah Menu Baru</p>
                  <p className="text-xs text-slate-500">Update katalog produkmu</p>
                </div>
              </Link>

              <Link to="/merchant/tables" className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-brand-primary hover:bg-brand-primary/5 transition-all group">
                <div className="w-10 h-10 bg-slate-100 group-hover:bg-brand-primary/10 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-slate-600 group-hover:text-brand-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-700 group-hover:text-brand-primary">Generate QR Meja</p>
                  <p className="text-xs text-slate-500">Cetak QR untuk pelanggan</p>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Opsional: Info Shift / Status Toko */}
          <div className="bg-brand-primary rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
             <h3 className="font-bold text-lg mb-1 relative z-10">Toko Sedang Buka</h3>
             <p className="text-white/80 text-sm mb-4 relative z-10">Menerima pesanan masuk secara otomatis.</p>
             <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors w-full relative z-10">
               Tutup Toko
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
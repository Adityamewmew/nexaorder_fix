import { useState, useEffect, useMemo } from "react";
import SalesSummaryCards from "./components/SalesSummaryCards";
import SalesChart from "./components/SalesChart";
import SalesTable from "./components/SalesTable";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface SalesSummary {
  totalPendapatan: number;
  totalTransaksi: number;
  totalItemTerjual: number;
}

interface SalesOrder {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  table: { number: string } | null;
  items: Array<{ quantity: number; subtotal: number; product: { name: string; price: number } }>;
  payment: { method: string } | null;
}

export default function SalesReport() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [summary, setSummary] = useState<SalesSummary>({ totalPendapatan: 0, totalTransaksi: 0, totalItemTerjual: 0 });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const setQuickFilter = (type: string) => {
    setActiveFilter(type);
    const today = new Date();
    let start = "";
    let end = today.toISOString().split('T')[0];

    if (type === 'today') {
      start = end;
    } else if (type === 'week') {
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);
      start = lastWeek.toISOString().split('T')[0];
    } else if (type === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = firstDay.toISOString().split('T')[0];
    } else if (type === 'all') {
      start = "";
      end = "";
    }

    setStartDate(start);
    setEndDate(end);
    fetchSales(start, end);
  };

  const fetchSales = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);
      const res = await api.get(`/dashboard/sales?${params.toString()}`);
      setOrders(res.data.orders || []);
      setSummary(res.data.summary || { totalPendapatan: 0, totalTransaksi: 0, totalItemTerjual: 0 });
    } catch (err) {
      console.error("Gagal memuat laporan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchSales(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format data untuk chart (group by date)
  const { chartData, calculatedSummary } = useMemo(() => {
    // Pastikan order terurut dari yang terlama ke terbaru untuk grafik
    const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const groupedData = sortedOrders.reduce((acc: { name: string; total: number }[], order) => {
      const date = new Date(order.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      const existing = acc.find(d => d.name === date);
      if (existing) {
        existing.total += order.total;
      } else {
        acc.push({ name: date, total: order.total });
      }
      return acc;
    }, []);

    // Ambil 14 hari terakhir untuk chart
    const recentChartData = groupedData.slice(-14);

    // Hitung ringkasan
    const highest = groupedData.length > 0 ? Math.max(...groupedData.map(d => d.total)) : 0;
    const lowest = groupedData.length > 0 ? Math.min(...groupedData.map(d => d.total)) : 0;
    const average = groupedData.length > 0 ? groupedData.reduce((sum, d) => sum + d.total, 0) / groupedData.length : 0;

    // Hitung tren (hari terakhir vs hari sebelumnya)
    let trend = 0;
    if (groupedData.length >= 2) {
      const last = groupedData[groupedData.length - 1].total;
      const prev = groupedData[groupedData.length - 2].total;
      if (prev > 0) {
        trend = ((last - prev) / prev) * 100;
      } else if (last > 0) {
        trend = 100; // naik drastis dari 0
      }
    }

    return {
      chartData: recentChartData,
      calculatedSummary: { highest, lowest, average, trend }
    };
  }, [orders]);

  // Format data untuk table
  const tableData = orders.map((order) => ({
    id: `PS${String(order.id).padStart(4, "0")}`,
    date: new Date(order.createdAt).toLocaleDateString("id-ID"),
    itemsCount: order.items.reduce((s, i) => s + i.quantity, 0),
    total: order.total,
    payment: order.payment?.method || "-",
    items: order.items.map(i => ({
      name: i.product?.name || "-",
      qty: i.quantity,
      price: i.product?.price || 0,
      subtotal: i.subtotal,
    })),
    type: order.table ? "Dine In" : "Take Away",
    table: order.table?.number || "-",
    status: order.status === 'PAID' ? 'Selesai' : order.status === 'CANCELLED' ? 'Dibatalkan' : order.status,
  }));

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary">Laporan Penjualan</h1>
        <p className="text-slate-500 mt-1">Pantau performa penjualan dan riwayat transaksi toko Anda</p>
      </div>

      {/* Filter Cepat & Tanggal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5">
        
        {/* Quick Filters */}
        <div className="w-full xl:w-auto">
          <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wider">Filter Cepat</label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'week', label: 'Minggu Ini' },
              { id: 'month', label: 'Bulan Ini' },
              { id: 'all', label: 'Semua Waktu' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setQuickFilter(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-colors border",
                  activeFilter === filter.id 
                    ? "bg-brand-primary text-white border-brand-primary shadow-sm" 
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Filter */}
        <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); setActiveFilter('custom'); }}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary w-full sm:w-auto"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); setActiveFilter('custom'); }}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary w-full sm:w-auto"
            />
          </div>
          <button
            onClick={() => fetchSales(startDate, endDate)}
            className="px-5 py-2 bg-brand-secondary text-white font-bold rounded-xl text-sm hover:bg-brand-secondaryHover transition-colors shadow-sm w-full sm:w-auto mt-2 sm:mt-0"
          >
            Terapkan
          </button>
        </div>
      </div>

      <SalesSummaryCards
        totalPendapatan={summary.totalPendapatan}
        totalTransaksi={summary.totalTransaksi}
        totalItemTerjual={summary.totalItemTerjual}
      />

      {chartData.length > 0 && <SalesChart data={chartData} summaryData={calculatedSummary} />}

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
          Memuat data laporan...
        </div>
      ) : (
        <SalesTable data={tableData} />
      )}
    </div>
  );
}

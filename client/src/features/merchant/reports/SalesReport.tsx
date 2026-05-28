import { useState, useEffect } from "react";
import SalesSummaryCards from "./components/SalesSummaryCards";
import SalesChart from "./components/SalesChart";
import SalesFilter from "./components/SalesFilter";
import SalesTable from "./components/SalesTable";
import api from "@/lib/api";

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

  useEffect(() => { fetchSales(); }, []);

  // Format data untuk chart (group by date)
  const chartData = orders.reduce((acc: { name: string; total: number }[], order) => {
    const date = new Date(order.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    const existing = acc.find(d => d.name === date);
    if (existing) {
      existing.total += order.total;
    } else {
      acc.push({ name: date, total: order.total });
    }
    return acc;
  }, []).slice(-7); // 7 hari terakhir

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
    status: "Selesai",
  }));

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary">Laporan Penjualan</h1>
        <p className="text-slate-500 mt-1">Pantau performa penjualan dan riwayat transaksi toko Anda</p>
      </div>

      {/* Filter tanggal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Tanggal Mulai</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Tanggal Akhir</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary"
          />
        </div>
        <button
          onClick={() => fetchSales(startDate, endDate)}
          className="px-5 py-2 bg-brand-secondary text-white font-bold rounded-xl text-sm hover:bg-brand-secondaryHover transition-colors"
        >
          Terapkan
        </button>
        <button
          onClick={() => { setStartDate(""); setEndDate(""); fetchSales(); }}
          className="px-5 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
        >
          Reset
        </button>
      </div>

      <SalesSummaryCards
        totalPendapatan={summary.totalPendapatan}
        totalTransaksi={summary.totalTransaksi}
        totalItemTerjual={summary.totalItemTerjual}
      />

      {chartData.length > 0 && <SalesChart data={chartData} />}

      <SalesFilter />

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

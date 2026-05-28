import { Banknote, ShoppingCart, Package } from "lucide-react";

interface SalesSummaryCardsProps {
  totalPendapatan?: number;
  totalTransaksi?: number;
  totalItemTerjual?: number;
}

export default function SalesSummaryCards({ totalPendapatan = 0, totalTransaksi = 0, totalItemTerjual = 0 }: SalesSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
        <div className="w-14 h-14 bg-green-50 text-green-500 rounded-xl flex items-center justify-center border border-green-100">
          <Banknote className="w-7 h-7" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Pendapatan</p>
          <h3 className="text-2xl font-black text-slate-800">Rp. {totalPendapatan.toLocaleString("id-ID")}</h3>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
        <div className="w-14 h-14 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center border border-brand-primary/20">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Transaksi</p>
          <h3 className="text-2xl font-black text-slate-800">{totalTransaksi}</h3>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100">
          <Package className="w-7 h-7" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Item Terjual</p>
          <h3 className="text-2xl font-black text-slate-800">{totalItemTerjual}</h3>
        </div>
      </div>
    </div>
  );
}
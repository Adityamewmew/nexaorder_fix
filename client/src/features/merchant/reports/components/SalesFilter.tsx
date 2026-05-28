import { Calendar, Filter, RotateCcw } from "lucide-react";

export default function SalesFilter() {
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 mb-8 flex flex-col md:flex-row items-end gap-4">
      <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Tanggal Mulai</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <input type="date" className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Tanggal Akhir</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <input type="date" className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pilih Rentang</label>
          <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-primary appearance-none">
            <option>Minggu</option>
            <option>Bulan</option>
            <option>Tahun</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
        <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none">
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button className="px-5 py-2.5 bg-brand-secondary hover:bg-brand-secondaryHover text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm flex-1 md:flex-none">
          <Filter className="w-4 h-4" />
          Terapkan Filter
        </button>
      </div>
    </div>
  );
}
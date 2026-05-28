import { FileText, CheckSquare, AlertCircle, XCircle } from "lucide-react";

interface MenuSummaryCardsProps {
  stats: {
    total: number;
    tersedia: number;
    hampirHabis: number;
    habis: number;
  };
}

export default function MenuSummaryCards({ stats }: MenuSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Menu</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Menu Tersedia</p>
          <p className="text-2xl font-bold text-slate-800">{stats.tersedia}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Hampir Habis</p>
          <p className="text-2xl font-bold text-slate-800">{stats.hampirHabis}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 border border-red-100">
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Menu Habis</p>
          <p className="text-2xl font-bold text-slate-800">{stats.habis}</p>
        </div>
      </div>
    </div>
  );
}
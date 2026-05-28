import { AlertCircle, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnsavedChangesBarProps {
  hasUnsavedChanges: boolean;
  onRevert: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export default function UnsavedChangesBar({ hasUnsavedChanges, onRevert, onSave, isSaving }: UnsavedChangesBarProps) {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 transition-transform duration-300 flex items-center justify-between",
      hasUnsavedChanges ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800">Perubahan Belum Disimpan</h4>
          <p className="text-xs text-slate-500">Anda telah mengubah stok beberapa menu.</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onRevert}
          disabled={isSaving}
          className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
        >
          Batalkan
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
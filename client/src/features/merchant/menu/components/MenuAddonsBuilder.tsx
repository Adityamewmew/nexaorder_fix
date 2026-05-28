import { Plus, Trash2, GripVertical, PlusCircle, XCircle, ChevronLeft, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuAddonsBuilderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modifierGroups: any[];
  handleAddGroup: () => void;
  handleRemoveGroup: (index: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleUpdateGroup: (index: number, field: string, value: any) => void;
  handleAddModifier: (groupIndex: number) => void;
  handleRemoveModifier: (groupIndex: number, modifierIndex: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleUpdateModifier: (groupIndex: number, modifierIndex: number, field: string, value: any) => void;
  onBack: () => void;
  onSave: () => void;
  isSaving?: boolean;
}

export default function MenuAddonsBuilder({
  modifierGroups,
  handleAddGroup,
  handleRemoveGroup,
  handleUpdateGroup,
  handleAddModifier,
  handleRemoveModifier,
  handleUpdateModifier,
  onBack,
  onSave,
  isSaving
}: MenuAddonsBuilderProps) {
  return (
    <div className="flex flex-col gap-6">
      {modifierGroups.length === 0 ? (
        // Tampilan Jika Kosong
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6 border border-slate-200">
            <PlusCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Belum Ada Kustomisasi</h2>
          <p className="text-slate-500 max-w-md mb-8">
            Buat grup kustomisasi seperti "Level Pedas", "Pilihan Topping", atau "Ukuran Gelas" agar pelanggan bisa memesan sesuai selera.
          </p>
          <button 
            onClick={handleAddGroup}
            className="px-6 py-3 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tambah Grup Add-on
          </button>
        </div>
      ) : (
        // Tampilan Builder
        <div className="space-y-6">
          {modifierGroups.map((group, groupIdx) => (
            <div key={group.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:border-slate-300">
              
              {/* Header Grup */}
              <div className="bg-slate-50 p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 flex items-center gap-4 w-full">
                  <div className="text-slate-400 cursor-move hidden sm:block">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Nama Grup Add-on</label>
                    <input
                      type="text"
                      value={group.groupName}
                      onChange={(e) => handleUpdateGroup(groupIdx, 'groupName', e.target.value)}
                      placeholder="Contoh: Level Pedas, Pilihan Topping..."
                      className="w-full sm:max-w-md px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors font-bold text-slate-800"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-6 self-end sm:self-auto">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">Wajib Dipilih?</span>
                    <button 
                      onClick={() => handleUpdateGroup(groupIdx, 'isRequired', !group.isRequired)}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                        group.isRequired ? "bg-red-500" : "bg-slate-300"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                        group.isRequired ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                  <button 
                    onClick={() => handleRemoveGroup(groupIdx)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Grup"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Pengaturan Pilihan & Daftar Item */}
              <div className="p-5 md:p-6">
                
                {/* Setting Max/Min */}
                <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-slate-100">
                  <div className="flex-1 max-w-xs">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Minimal Pilihan</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        value={group.minSelections}
                        onChange={(e) => handleUpdateGroup(groupIdx, 'minSelections', parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm text-center"
                        disabled={group.isRequired}
                      />
                      <span className="text-xs text-slate-400 italic">
                        {group.isRequired ? "(Wajib = Minimal 1)" : "(0 = Opsional)"}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Maksimal Pilihan</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        value={group.maxSelections}
                        onChange={(e) => handleUpdateGroup(groupIdx, 'maxSelections', parseInt(e.target.value) || 1)}
                        className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm text-center"
                      />
                      <span className="text-xs text-slate-400 italic">
                        {group.maxSelections > 1 ? "(Checkbox / Bisa pilih banyak)" : "(Radio / Hanya pilih 1)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Modifiers Rows */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Daftar Pilihan</label>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {group.modifiers.map((mod: any, modIdx: number) => (
                    <div key={mod.id} className="flex items-center gap-3 group/row">
                      <div className="text-slate-300 cursor-move px-1 hidden sm:block">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1">
                        <input
                          type="text"
                          value={mod.modifierName}
                          onChange={(e) => handleUpdateModifier(groupIdx, modIdx, 'modifierName', e.target.value)}
                          placeholder="Nama Pilihan (cth: Pedas Sedang, Keju)"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-primary transition-colors"
                        />
                      </div>
                      
                      <div className="w-1/3 max-w-[200px] relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 font-semibold text-xs">+Rp</span>
                        </div>
                        <input
                          type="number"
                          value={mod.price}
                          onChange={(e) => handleUpdateModifier(groupIdx, modIdx, 'price', parseInt(e.target.value) || 0)}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-primary transition-colors"
                        />
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveModifier(groupIdx, modIdx)}
                        disabled={group.modifiers.length === 1}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {/* Tombol Tambah Pilihan */}
                  <button 
                    onClick={() => handleAddModifier(groupIdx)}
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-primaryHover transition-colors px-2 py-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Tambah Pilihan Lain
                  </button>
                </div>

              </div>
            </div>
          ))}

          {/* Tombol Tambah Grup Baru (Bawah) */}
          <button 
            onClick={handleAddGroup}
            className="w-full py-4 border-2 border-dashed border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tambah Grup Add-on Baru
          </button>
        </div>
      )}

      {/* Footer Tab 2 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center mt-4">
        <button 
          onClick={onBack}
          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Info Dasar
        </button>
        <button 
          onClick={onSave}
          disabled={isSaving}
          className="px-8 py-3 bg-brand-primary hover:bg-brand-primaryHover disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-2 shadow-md text-lg"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? "Menyimpan..." : "Simpan Menu"}
        </button>
      </div>

    </div>
  );
}
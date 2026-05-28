import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, XSquare, Download, CalendarCheck, XCircle, LayoutGrid, Info, Check, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/contexts/ToastContext";
import { QRCodeSVG } from "qrcode.react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

// Mock Data Meja
const INITIAL_TABLES = [
  { id: "tbl-1", name: "Meja 01", isActive: true },
  { id: "tbl-2", name: "Meja 02", isActive: false },
  { id: "tbl-3", name: "Meja 03", isActive: true },
  { id: "tbl-4", name: "Meja 04", isActive: true },
];

export default function TableList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Ambil data user yang sedang login untuk mendapatkan tenantId
  const { user } = useSelector((state: RootState) => state.auth);
  const tenantId = user?.tenantId || "tenant-001"; // Fallback ke mock tenant id

  const [tables, setTables] = useState(INITIAL_TABLES);
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'inactive'
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  // Hitung Statistik
  const totalTables = tables.length;
  const activeTables = tables.filter(t => t.isActive).length;
  const inactiveTables = tables.filter(t => !t.isActive).length;

  // Filter Table
  const filteredTables = tables.filter(t => {
    if (filter === "active") return t.isActive;
    if (filter === "inactive") return !t.isActive;
    return true;
  });

  const confirmDelete = (id: string) => {
    setTableToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (tableToDelete) {
      setTables(prev => prev.filter(t => t.id !== tableToDelete));
      setDeleteModalOpen(false);
      setTableToDelete(null);
      showToast("Meja berhasil dihapus", "success");
    }
  };

  const handleToggleActive = (id: string) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  };

  const handleDownloadQR = (tableId: string, tableName: string) => {
    const svg = document.getElementById(`qr-${tableId}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      // Setup resolusi yang cukup untuk diprint (misal: 1024x1024)
      const size = 1024;
      canvas.width = size;
      canvas.height = size;
      
      img.onload = () => {
        if (ctx) {
          // Fill background putih
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, size, size);
          
          // Draw QR
          const padding = size * 0.1;
          const qrSize = size - (padding * 2);
          ctx.drawImage(img, padding, padding, qrSize, qrSize);
          
          // Tambahkan teks nama meja di bawah
          ctx.fillStyle = "black";
          ctx.font = "bold 60px Arial";
          ctx.textAlign = "center";
          ctx.fillText(tableName, size / 2, size - 40);

          // Download image
          const pngFile = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.download = `QR_${tableName.replace(/\s+/g, '_')}.png`;
          downloadLink.href = `${pngFile}`;
          downloadLink.click();
        }
      };
      
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
      showToast(`QR Code ${tableName} berhasil diunduh`, "success");
    }
  };

  const generateCustomerUrl = (tableId: string) => {
    // Generate full URL berdasarkan origin saat ini (misal: http://localhost:5173/m/tenant-001/tbl-1)
    return `${window.location.origin}/m/${tenantId}/${tableId}`;
  };

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Kelola Meja</h1>
          <p className="text-slate-500 mt-1">Pantau dan kelola nomor meja dan QR code di halaman ini</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-primary appearance-none min-w-[140px] cursor-pointer"
          >
            <option value="all">Semua Meja</option>
            <option value="active">Meja Aktif</option>
            <option value="inactive">Meja Nonaktif</option>
          </select>
          <button 
            onClick={() => navigate('/merchant/tables/add')}
            className="bg-brand-secondary hover:bg-brand-secondaryHover text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tambah Meja
          </button>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-brand-primary/10 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Meja</p>
            <h3 className="text-3xl font-black text-slate-800">{totalTables}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-green-500/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Meja Aktif</p>
            <h3 className="text-3xl font-black text-slate-800">{activeTables}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-red-500/20 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Meja Nonaktif</p>
            <h3 className="text-3xl font-black text-slate-800">{inactiveTables}</h3>
          </div>
        </div>
      </div>

      {/* Grid Meja */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-all">
            
            {/* Header Card */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-secondary/10 text-brand-secondary flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{table.name}</h4>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    table.isActive ? "text-green-500" : "text-slate-400"
                  )}>
                    {table.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Tombol Nonaktifkan (Hanya muncul jika meja aktif) */}
                {table.isActive && (
                  <button 
                    onClick={() => handleToggleActive(table.id)}
                    className="text-slate-300 hover:text-amber-500 transition-colors"
                    title="Nonaktifkan Meja"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                )}
                {/* Tombol Hapus */}
                <button 
                  onClick={() => confirmDelete(table.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                  title="Hapus Meja"
                >
                  <XSquare className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* QR Area */}
            <div className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50/50">
              <div className={cn(
                "w-full aspect-square rounded-2xl flex flex-col items-center justify-center mb-4 shadow-inner overflow-hidden",
                table.isActive ? "bg-slate-900" : "bg-slate-300"
              )}>
                {table.isActive ? (
                  <div className="bg-white p-3 rounded-xl shadow-sm">
                    <QRCodeSVG 
                      id={`qr-${table.id}`}
                      value={generateCustomerUrl(table.id)}
                      size={180}
                      level="H" // High error correction
                      includeMargin={false}
                      fgColor="#0f172a" // slate-900
                    />
                  </div>
                ) : (
                  <>
                    <XCircle className="w-12 h-12 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-500">QR TIDAK AKTIF</p>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-3 bg-white">
              {table.isActive ? (
                <>
                  <a 
                    href={generateCustomerUrl(table.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand-primary hover:border-brand-primary transition-colors font-bold text-xs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    BUKA WEB
                  </a>
                  <button 
                    onClick={() => handleDownloadQR(table.id, table.name)}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-brand-secondary hover:bg-brand-secondaryHover text-white transition-colors font-bold text-xs shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleToggleActive(table.id)}
                    className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border border-green-500/30 text-green-600 hover:bg-green-50 transition-colors font-bold text-xs"
                  >
                    <Check className="w-4 h-4" />
                    AKTIFKAN
                  </button>
                  <button disabled className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed">
                    <Download className="w-4 h-4" />
                    DOWNLOAD
                  </button>
                </>
              )}
            </div>

          </div>
        ))}
        
        {filteredTables.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500">Tidak ada meja yang ditemukan.</p>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="mt-auto">
        <div className="bg-red-50/80 p-5 rounded-2xl border border-red-100 flex gap-4 text-red-800">
          <Info className="w-6 h-6 shrink-0 mt-0.5 text-red-500" />
          <div>
            <h4 className="font-bold text-sm mb-1 text-red-600">Panduan Penggunaan QR Code</h4>
            <p className="text-xs leading-relaxed opacity-90">
              Cetak dan tempelkan QR Code yang sudah di-generate ke masing-masing meja. Pelanggan cukup melakukan scan menggunakan kamera smartphone mereka untuk melihat menu digital, melakukan pemesanan, dan membayar langsung tanpa harus memanggil pelayan.
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Hapus Meja"
        description="Apakah Anda yakin ingin menghapus meja ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        icon={<Trash2 className="w-8 h-8" />}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setTableToDelete(null);
        }}
      />
    </div>
  );
}
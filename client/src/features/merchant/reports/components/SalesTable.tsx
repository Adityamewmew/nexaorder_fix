import React, { useState } from "react";
import { Download, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Using the same structure as in SalesReport.tsx
interface SalesTableProps {
  data: Array<{
    id: string;
    date: string;
    itemsCount: number;
    total: number;
    payment: string;
    items: Array<{
      name: string;
      qty: number;
      price: number;
      subtotal: number;
    }>;
    type: string;
    table: string;
    status: string;
  }>;
}

export default function SalesTable({ data }: SalesTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toggleRow = (id: string) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  const handleExport = () => {
    if (data.length === 0) return;

    // Menyiapkan header
    const headers = [
      "No Pesanan",
      "Tanggal",
      "Total Item",
      "Total Penjualan",
      "Metode Pembayaran",
      "Tipe Transaksi",
      "No Meja",
      "Status"
    ];

    // Mengkonversi data ke baris CSV
    const csvData = data.map(row => [
      row.id,
      row.date,
      row.itemsCount,
      row.total,
      row.payment,
      row.type,
      row.table,
      row.status
    ]);

    // Menggabungkan header dan data
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    // Membuat blob dan memicu download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Logika Pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedRow(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-lg text-slate-800">Data Penjualan</h3>
        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-primary text-white text-sm">
              <th className="p-4 font-bold w-16">No</th>
              <th className="p-4 font-bold">No Pesanan</th>
              <th className="p-4 font-bold">Tanggal</th>
              <th className="p-4 font-bold">Total Item</th>
              <th className="p-4 font-bold">Total</th>
              <th className="p-4 font-bold">Metode Pembayaran</th>
              <th className="p-4 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {currentData.length > 0 ? currentData.map((row, index) => (
              <React.Fragment key={row.id}>
                {/* Main Row */}
                <tr className={cn(
                  "border-b border-slate-100 hover:bg-slate-50/50 transition-colors",
                  expandedRow === row.id ? "bg-slate-50/80" : ""
                )}>
                  <td className="p-4 font-medium text-slate-500">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleRow(row.id)} className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-400">
                        {expandedRow === row.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{row.id}</td>
                  <td className="p-4 text-slate-600">{row.date}</td>
                  <td className="p-4 text-slate-600">{row.itemsCount} Item</td>
                  <td className="p-4 font-bold text-slate-800">Rp. {row.total.toLocaleString('id-ID')}</td>
                  <td className="p-4 text-slate-600">{row.payment}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => toggleRow(row.id)}
                      className="px-4 py-1.5 border border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white rounded-lg font-bold text-xs transition-colors"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
                
                {/* Expanded Row Details */}
                {expandedRow === row.id && (
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <td colSpan={7} className="p-0">
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* Detail Item */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Detail Item</h4>
                          <table className="w-full text-sm">
                            <thead className="text-slate-500 border-b border-slate-100">
                              <tr>
                                <th className="pb-2 font-semibold text-left">Nama Menu</th>
                                <th className="pb-2 font-semibold text-center">Qty</th>
                                <th className="pb-2 font-semibold text-right">Harga</th>
                                <th className="pb-2 font-semibold text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.items.map((item, i) => (
                                <tr key={i} className="border-b border-slate-50 last:border-0">
                                  <td className="py-3 text-slate-700">{item.name}</td>
                                  <td className="py-3 text-center font-medium">{item.qty}</td>
                                  <td className="py-3 text-right text-slate-500">Rp. {item.price.toLocaleString('id-ID')}</td>
                                  <td className="py-3 text-right font-bold text-slate-800">Rp. {item.subtotal.toLocaleString('id-ID')}</td>
                                </tr>
                              ))}
                              <tr className="border-t-2 border-slate-100">
                                <td colSpan={3} className="pt-3 pb-1 text-right font-bold text-slate-800">Total Bayar:</td>
                                <td className="pt-3 pb-1 text-right font-bold text-brand-primary text-base">Rp. {row.total.toLocaleString('id-ID')}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Informasi Pesanan */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm h-fit">
                          <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Informasi Pesanan</h4>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-1">Tipe Transaksi</p>
                              <p className="font-bold text-slate-800">{row.type}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-1">No Meja</p>
                              <p className="font-bold text-slate-800">{row.table}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-1">Status</p>
                              <span className="inline-block px-3 py-1 bg-green-50 border border-green-200 text-green-600 rounded-full font-bold text-xs">
                                {row.status}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Tidak ada data penjualan untuk rentang waktu ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex justify-center items-center gap-2 text-sm bg-white">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            &lt;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              onClick={() => handlePageChange(page)}
              className={cn(
                "w-8 h-8 rounded-lg font-medium transition-colors",
                currentPage === page 
                  ? "bg-brand-primary text-white font-bold" 
                  : "hover:bg-slate-100 text-slate-600"
              )}
            >
              {page}
            </button>
          ))}

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      )}

    </div>
  );
}
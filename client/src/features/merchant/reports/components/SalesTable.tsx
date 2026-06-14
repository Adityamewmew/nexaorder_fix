import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, ChevronRight, FileText, Table, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRow = (id: string) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  const handleExportCSV = () => {
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
    setShowExportDropdown(false);
  };

  const handleExportExcel = () => {
    if (data.length === 0) return;

    // 1. Metadata / Summary
    const summaryData = [
      ["LAPORAN PENJUALAN NEXAORDER"],
      [`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`],
      [],
      ["Ringkasan Penjualan"],
      ["Total Transaksi", data.length],
      ["Total Item Terjual", data.reduce((s, r) => s + r.itemsCount, 0)],
      ["Total Pendapatan (Rp)", data.reduce((s, r) => s + r.total, 0)],
      [],
      ["Data Transaksi"]
    ];

    // 2. Headers
    const headers = [
      "No Pesanan",
      "Tanggal",
      "Total Item",
      "Total Penjualan (Rp)",
      "Metode Pembayaran",
      "Tipe Transaksi",
      "No Meja",
      "Status"
    ];

    // 3. Rows
    const rows = data.map(row => [
      row.id,
      row.date,
      row.itemsCount,
      row.total,
      row.payment,
      row.type,
      row.table,
      row.status
    ]);

    // Combine data
    const worksheetData = [...summaryData, headers, ...rows];
    
    // Create Excel worksheet & workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Penjualan");

    // Write file
    XLSX.writeFile(workbook, `Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportDropdown(false);
  };

  const handleExportPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("LAPORAN PENJUALAN NEXAORDER", 14, 20);
    
    // Date print
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")} ${new Date().toLocaleTimeString("id-ID")}`, 14, 26);
    
    // Summary Box
    doc.setDrawColor(230, 235, 245);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 32, 182, 22, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text("RINGKASAN LAPORAN", 18, 38);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Total Transaksi: ${data.length}`, 18, 44);
    doc.text(`Total Item Terjual: ${data.reduce((s, r) => s + r.itemsCount, 0)}`, 18, 49);
    
    const totalRev = data.reduce((s, r) => s + r.total, 0);
    doc.text(`Total Pendapatan: Rp ${totalRev.toLocaleString('id-ID')}`, 100, 44);
    
    // Table Headers
    const headers = [
      ["No Pesanan", "Tanggal", "Item", "Total (Rp)", "Pembayaran", "Tipe", "Meja", "Status"]
    ];

    // Table Rows
    const rows = data.map(row => [
      row.id,
      row.date,
      row.itemsCount,
      row.total.toLocaleString('id-ID'),
      row.payment,
      row.type,
      row.table,
      row.status
    ]);

    // Generate Table
    autoTable(doc, {
      startY: 60,
      head: headers,
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' }, // brand-primary indigo-600
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        3: { halign: 'right' }
      }
    });

    doc.save(`Laporan_Penjualan_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportDropdown(false);
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
        
        {/* Export Dropdown Wrapper */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 text-sm shadow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-brand-primary" />
            <span>Export Laporan</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showExportDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
              <button
                onClick={handleExportExcel}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-primary font-medium text-left transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                <span>Export ke Excel (.xlsx)</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-primary font-medium text-left transition-colors"
              >
                <FileText className="w-4 h-4 text-red-500" />
                <span>Export ke PDF (.pdf)</span>
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-primary font-medium text-left transition-colors"
              >
                <Table className="w-4 h-4 text-blue-500" />
                <span>Export ke CSV (.csv)</span>
              </button>
            </div>
          )}
        </div>
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
                              <span className={cn(
                                "inline-block px-3 py-1 rounded-full font-bold text-xs border",
                                row.status === 'Selesai' && "bg-green-50 border-green-200 text-green-600",
                                row.status === 'Dibatalkan' && "bg-red-50 border-red-200 text-red-600",
                                row.status !== 'Selesai' && row.status !== 'Dibatalkan' && "bg-slate-50 border-slate-200 text-slate-600"
                              )}>
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
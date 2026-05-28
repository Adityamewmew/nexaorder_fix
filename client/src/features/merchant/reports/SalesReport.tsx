import SalesSummaryCards from "./components/SalesSummaryCards";
import SalesChart from "./components/SalesChart";
import SalesFilter from "./components/SalesFilter";
import SalesTable from "./components/SalesTable";

// --- Mock Data ---
// Idealnya, data ini akan diambil dari Redux / API
const CHART_DATA = [
  { name: '15 Mei', total: 300000 },
  { name: '16 Mei', total: 450000 },
  { name: '17 Mei', total: 280000 },
  { name: '18 Mei', total: 380000 },
  { name: '19 Mei', total: 700000 },
];

const TABLE_DATA = [
  { 
    id: "PS0456", date: "15/05/2026", itemsCount: 2, total: 47000, payment: "QRIS",
    items: [
      { name: "Bakso Granat", qty: 1, price: 30000, subtotal: 30000 },
      { name: "Es Jeruk", qty: 1, price: 15000, subtotal: 15000 }
    ],
    type: "Dine In", table: "Meja 01", status: "Selesai"
  },
  { 
    id: "PS0457", date: "15/05/2026", itemsCount: 5, total: 155000, payment: "Tunai",
    items: [
      { name: "Mie Ayam Komplit", qty: 3, price: 29000, subtotal: 87000 },
      { name: "Es Teh Manis", qty: 2, price: 10000, subtotal: 20000 }
    ],
    type: "Take Away", table: "-", status: "Selesai"
  },
  { 
    id: "PS0458", date: "16/05/2026", itemsCount: 3, total: 78000, payment: "Tunai",
    items: [
      { name: "Bakso Polos", qty: 2, price: 20000, subtotal: 40000 },
      { name: "Kerupuk Kulit", qty: 3, price: 5000, subtotal: 15000 }
    ],
    type: "Dine In", table: "Meja 03", status: "Selesai"
  },
];

export default function SalesReport() {
  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-24">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary">Laporan Penjualan</h1>
        <p className="text-slate-500 mt-1">Pantau performa penjualan dan riwayat transaksi toko Anda</p>
      </div>

      <SalesSummaryCards />
      
      <SalesChart data={CHART_DATA} />

      <SalesFilter />

      <SalesTable data={TABLE_DATA} />

    </div>
  );
}
import { useState } from "react";
import { Clock, ChefHat, CheckCircle2, Check, AlertCircle, ShoppingBag, UtensilsCrossed, Coffee } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import OrderDetailModal from "./OrderDetailModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { updateOrderStatus, updatePaymentStatus } from "@/features/merchant/orders/orderSlice";
import { useToast } from "@/contexts/ToastContext";

// --- Definisi Konfigurasi Kolom Kanban ---
const KANBAN_COLUMNS = [
  {
    id: "PENDING" as OrderStatus,
    title: "Pesanan Masuk",
    icon: AlertCircle,
    color: "text-amber-600",
    bgIcon: "bg-amber-100",
    borderColor: "border-t-amber-500",
    bgColor: "bg-amber-50/30",
    nextAction: "Proses Pesanan",
    nextStatus: "PROCESS" as OrderStatus,
  },
  {
    id: "PROCESS" as OrderStatus,
    title: "Sedang Dimasak",
    icon: ChefHat,
    color: "text-blue-600",
    bgIcon: "bg-blue-100",
    borderColor: "border-t-blue-500",
    bgColor: "bg-blue-50/30",
    nextAction: "Selesai Dimasak",
    nextStatus: "READY" as OrderStatus,
  },
  {
    id: "READY" as OrderStatus,
    title: "Siap Disajikan",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgIcon: "bg-emerald-100",
    borderColor: "border-t-emerald-500",
    bgColor: "bg-emerald-50/30",
    nextAction: "Selesaikan", // Biasanya di sini kasir akan memvalidasi pembayaran
    nextStatus: "PAID" as OrderStatus,
  },
];

export default function OrderList() {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  
  // Mengambil data orders dari Redux Store (Global State)
  const orders = useSelector((state: RootState) => state.orders.items);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fungsi simulasi memindahkan status pesanan
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    showToast(`Status pesanan ${orderId} diubah menjadi ${newStatus}`, "success");
    
    // Jika modal sedang terbuka untuk order ini, update datanya juga
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Fungsi simulasi memvalidasi pembayaran
  const handleProcessPayment = (orderId: string, method: "CASH" | "QRIS" | "TRANSFER") => {
    dispatch(updatePaymentStatus({ id: orderId, paymentMethod: method }));
    showToast(`Pembayaran pesanan ${orderId} berhasil dikonfirmasi`, "success");
    
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, paymentMethod: method } : null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] flex flex-col">
      
      {/* Header Halaman */}
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-800">Antrian Pesanan</h1>
        <p className="text-slate-500 mt-1">Pantau pergerakan pesanan dari dapur hingga ke tangan pelanggan.</p>
      </div>

      {/* Area Kanban Board (Bisa di-scroll horizontal jika layar kecil) */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-[1000px]">
          
          {KANBAN_COLUMNS.map((column) => {
            const columnOrders = orders.filter((o) => o.status === column.id);

            return (
              <div 
                key={column.id} 
                className={`flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 border-t-4 ${column.borderColor} shadow-sm overflow-hidden`}
              >
                {/* Header Kolom */}
                <div className={`p-4 border-b border-slate-100 flex items-center justify-between ${column.bgColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${column.bgIcon}`}>
                      <column.icon className={`w-4 h-4 ${column.color}`} />
                    </div>
                    <h3 className="font-bold text-slate-700">{column.title}</h3>
                  </div>
                  <span className="bg-white border border-slate-200 text-slate-600 font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                    {columnOrders.length}
                  </span>
                </div>

                {/* Daftar Kartu Pesanan (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                  {columnOrders.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                      Belum ada pesanan
                    </div>
                  ) : (
                    columnOrders.map((order) => (
                      <div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                      >
                        {/* Info Pelanggan & Waktu */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold mb-2">
                              {order.customerName?.includes('Takeaway') ? <ShoppingBag className="w-3 h-3"/> : <UtensilsCrossed className="w-3 h-3"/>}
                              {order.id}
                            </span>
                            <h4 className="font-bold text-slate-800 text-lg leading-tight">{order.customerName}</h4>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <Clock className="w-3 h-3" />
                            {order.createdAt}
                          </div>
                        </div>

                        {/* Rincian Item (Singkat dengan ikon Kategori dan Addons) */}
                        <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                            {order.items.length} Item Pesanan:
                          </p>
                          <ul className="space-y-2">
                            {order.items.slice(0, 2).map((item) => (
                              <li key={item.id} className="text-sm text-slate-700 flex flex-col">
                                <div className="flex justify-between items-start">
                                  <span className="flex items-start gap-1.5 pr-2">
                                    <span className="font-semibold text-brand-primary min-w-[20px]">{item.quantity}x</span> 
                                    <span>
                                      {item.productName}
                                      {/* Ikon pemisah Makanan/Minuman */}
                                      {item.categoryId === 'cat-2' ? (
                                        <Coffee className="w-3 h-3 inline-block ml-1.5 text-blue-400" />
                                      ) : (
                                        <UtensilsCrossed className="w-3 h-3 inline-block ml-1.5 text-orange-400" />
                                      )}
                                    </span>
                                  </span>
                                </div>
                                {/* Tampilkan Modifiers/Add-ons jika ada */}
                                {item.modifiers && item.modifiers.length > 0 && (
                                  <div className="pl-6 text-[10px] text-slate-500 mt-0.5 leading-tight">
                                    {item.modifiers.map(m => `+ ${m.modifierName}`).join(', ')}
                                  </div>
                                )}
                                {/* Tampilkan Notes Khusus jika ada */}
                                {item.notes && (
                                  <div className="pl-6 text-[10px] text-amber-600 font-medium mt-0.5 italic">
                                    "{item.notes}"
                                  </div>
                                )}
                              </li>
                            ))}
                            {order.items.length > 2 && (
                              <li className="text-xs text-slate-400 font-medium pt-1 border-t border-slate-200 mt-2">
                                + {order.items.length - 2} item lainnya...
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Footer Kartu & Tombol Aksi */}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                          <div className="font-bold text-slate-800">
                            Rp. {order.totalAmount.toLocaleString('id-ID')}
                          </div>
                          
                          {/* Tombol Aksi Pindah Status */}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Mencegah klik tombol membuka modal
                              handleUpdateStatus(order.id, column.nextStatus);
                            }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-sm active:scale-95 opacity-0 group-hover:opacity-100 focus:opacity-100
                              ${column.id === 'PENDING' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                              ${column.id === 'PROCESS' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                              ${column.id === 'READY' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                            `}
                          >
                            <Check className="w-4 h-4" />
                            {column.nextAction}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
          
        </div>
      </div>

      {/* Modal Detail Pesanan */}
      <OrderDetailModal 
        order={selectedOrder}
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        onProcessPayment={handleProcessPayment}
      />
    </div>
  );
}
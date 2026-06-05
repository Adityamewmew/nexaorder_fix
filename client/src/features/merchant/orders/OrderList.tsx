import { useState, useEffect, useCallback } from "react";
import { Clock, ChefHat, CheckCircle2, Check, AlertCircle, ShoppingBag, UtensilsCrossed } from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";
import { useToast } from "@/contexts/ToastContext";
import api from "@/lib/api";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  subtotal: number;
  note: string | null;
  product: { name: string; price: number };
}

interface Order {
  id: number;
  status: string;
  total: number;
  customerName: string | null;
  createdAt: string;
  table: { id: number; number: string } | null;
  items: OrderItem[];
  payment: { method: string; amount: number } | null;
}

const KANBAN_COLUMNS = [
  {
    id: "PENDING",
    title: "Pesanan Masuk",
    icon: AlertCircle,
    color: "text-amber-600",
    bgIcon: "bg-amber-100",
    borderColor: "border-t-amber-500",
    bgColor: "bg-amber-50/30",
    nextAction: "Proses Pesanan",
    nextStatus: "PROCESS",
  },
  {
    id: "PROCESS",
    title: "Sedang Dimasak",
    icon: ChefHat,
    color: "text-blue-600",
    bgIcon: "bg-blue-100",
    borderColor: "border-t-blue-500",
    bgColor: "bg-blue-50/30",
    nextAction: "Siap Disajikan",
    nextStatus: "READY",
  },
  {
    id: "READY",
    title: "Siap Disajikan",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgIcon: "bg-emerald-100",
    borderColor: "border-t-emerald-500",
    bgColor: "bg-emerald-50/30",
    nextAction: "Selesaikan",
    nextStatus: "PAID",
  },
];

export default function OrderList() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch {
      console.error("Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const token = localStorage.getItem('nexa_token');
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const sseUrl = `${baseUrl}/sse?token=${token}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'new-order' || payload.event === 'order-updated') {
          fetchOrders();
        }
      } catch (err) {
        console.error("Error parsing SSE message in OrderList:", err);
      }
    };

    // Do NOT call eventSource.close() here — browser will auto-retry connection
    eventSource.onerror = () => {
      console.warn("SSE connection lost in OrderList. Browser will auto-retry...");
    };

    return () => {
      eventSource.close();
    };
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      showToast(`Status pesanan #${orderId} diubah ke ${newStatus}`, "success");
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      showToast(err.response?.data?.error || "Gagal mengubah status pesanan", "error");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-slate-400">Memuat pesanan...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Antrian Pesanan</h1>
          <p className="text-slate-500 mt-1">Pantau pergerakan pesanan dari dapur hingga ke tangan pelanggan.</p>
        </div>
        <button onClick={fetchOrders} className="text-xs text-brand-primary font-semibold hover:underline">
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-[1000px]">
          {KANBAN_COLUMNS.map((column) => {
            const columnOrders = orders.filter(o => o.status === column.id);

            return (
              <div
                key={column.id}
                className={`flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 border-t-4 ${column.borderColor} shadow-sm overflow-hidden`}
              >
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
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 font-bold text-sm">#{order.id}</span>
                              {order.table ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                                  <UtensilsCrossed className="w-3 h-3" /> Dine In
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                                  <ShoppingBag className="w-3 h-3" /> Takeaway
                                </span>
                              )}
                            </div>
                            <h4 className="font-bold text-slate-800 text-lg leading-tight mt-1">
                              {order.table ? `Meja ${order.table.number}` : (order.customerName || "Takeaway")}
                            </h4>
                            {order.table && order.customerName && (
                              <p className="text-xs text-slate-500 font-medium">{order.customerName}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <Clock className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>

                        <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                            {order.items.length} Item:
                          </p>
                          <ul className="space-y-1">
                            {order.items.slice(0, 2).map((item) => (
                              <li key={item.id} className="text-sm text-slate-700 flex justify-between">
                                <span>
                                  <span className="font-semibold text-brand-primary">{item.quantity}x</span>{" "}
                                  {item.product?.name || "Produk dihapus"}
                                </span>
                              </li>
                            ))}
                            {order.items.length > 2 && (
                              <li className="text-xs text-slate-400 font-medium pt-1 border-t border-slate-200 mt-1">
                                + {order.items.length - 2} item lainnya...
                              </li>
                            )}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                          <div className="font-bold text-slate-800">
                            Rp {order.total.toLocaleString("id-ID")}
                          </div>
                          {column.nextStatus && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(order.id, column.nextStatus!);
                              }}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-sm active:scale-95 opacity-0 group-hover:opacity-100 focus:opacity-100
                                ${column.id === "PENDING" ? "bg-amber-500 hover:bg-amber-600" : ""}
                                ${column.id === "PROCESS" ? "bg-blue-500 hover:bg-blue-600" : ""}
                                ${column.id === "READY" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                              `}
                            >
                              <Check className="w-4 h-4" />
                              {column.nextAction}
                            </button>
                          )}
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

      {selectedOrder && (
        <OrderDetailModal
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          order={selectedOrder as any}
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onUpdateStatus={(id, status) => handleUpdateStatus(Number(id), status as any)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onProcessPayment={(id, method) => {
            api.post('/payments', { orderId: Number(id), method })
              .then(() => {
                showToast("Pembayaran berhasil dicatat", "success");
                fetchOrders();
                setSelectedOrder(null);
              })
              .catch((err: any) => showToast(err.response?.data?.error || "Gagal mencatat pembayaran", "error"));
          }}
        />
      )}
    </div>
  );
}

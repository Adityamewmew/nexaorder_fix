import { X, Printer, CheckCircle2, ChefHat, ShoppingBag, UtensilsCrossed, CreditCard, QrCode, Banknote } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface OrderDetailModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdateStatus: (orderId: string, newStatus: any) => void;
  onProcessPayment: (orderId: string, method: "CASH" | "QRIS" | "TRANSFER") => void;
}

export default function OrderDetailModal({ order, isOpen, onClose, onUpdateStatus, onProcessPayment }: OrderDetailModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "TRANSFER">("CASH");

  if (!isOpen || !order) return null;

  const isTakeaway = order.customerName?.toLowerCase().includes("takeaway");
  
  // Hitung ulang dari items untuk dapatkan pajak (asumsi pajak 10%)
  const subtotal = order.total / 1.1;
  const tax = order.total - subtotal;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between shrink-0 bg-slate-50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-800">{order.id}</h2>
              {/* Badge Status */}
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                order.status === 'PENDING' && "bg-amber-100 text-amber-700",
                order.status === 'PROCESS' && "bg-blue-100 text-blue-700",
                order.status === 'READY' && "bg-emerald-100 text-emerald-700",
                order.status === 'PAID' && "bg-slate-200 text-slate-700",
                order.status === 'CANCELLED' && "bg-red-100 text-red-700"
              )}>
                {order.status === 'PENDING' && "Menunggu"}
                {order.status === 'PROCESS' && "Diproses"}
                {order.status === 'READY' && "Siap"}
                {order.status === 'PAID' && "Selesai"}
                {order.status === 'CANCELLED' && "Dibatalkan"}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              {order.table ? (
                <span className="flex items-center gap-1.5 font-medium px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100">
                  <UtensilsCrossed className="w-4 h-4" />
                  Meja {order.table.number}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-medium px-2 py-1 rounded bg-purple-50 text-purple-600 border border-purple-100">
                  <ShoppingBag className="w-4 h-4" />
                  Takeaway
                </span>
              )}
              {order.customerName && (
                <>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="font-medium text-slate-700">{order.customerName}</span>
                </>
              )}
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>Waktu Pesan: <strong>{order.createdAt}</strong></span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors flex items-center gap-2 font-semibold text-sm shadow-sm">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Struk</span>
            </button>
            <button onClick={onClose} className="p-2.5 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-slate-400 rounded-lg transition-colors shadow-sm">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Konten Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Rincian Pesanan</h3>
          
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {order.items.map((item: any) => {
              // Kalkulasi total per item (harga dasar + addons) * qty
              let parsedToppings: any[] = [];
              try {
                if (item.toppings) {
                  parsedToppings = JSON.parse(item.toppings);
                }
              } catch (e) {
                console.error("Error parsing toppings", e);
              }
              
              const itemAddonsTotal = parsedToppings.reduce((sum: number, mod: any) => sum + (mod.price || 0), 0);
              const basePrice = item.product?.price || 0;
              const itemTotal = (basePrice + itemAddonsTotal) * item.quantity;

              return (
                <div key={item.id} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="bg-slate-100 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-brand-primary shrink-0">
                    {item.quantity}x
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 text-base">{item.product?.name || "Produk dihapus"}</h4>
                      <span className="font-bold text-slate-800">Rp {itemTotal.toLocaleString('id-ID')}</span>
                    </div>
                    
                    <div className="text-sm text-slate-500 mb-1">
                      @ Rp {basePrice.toLocaleString('id-ID')}
                    </div>

                    {/* Render Addons */}
                    {parsedToppings.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {parsedToppings.map((mod: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                            <span className="flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                              {mod.name}
                            </span>
                            {mod.price > 0 && <span className="font-medium">+Rp {mod.price.toLocaleString('id-ID')}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Notes */}
                    {item.note && (
                      <div className="mt-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 italic font-medium">
                        Catatan: "{item.note}"
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bagian Validasi Pembayaran (Hanya muncul jika belum lunas) */}
          {!order.payment && (
            <div className="mt-8 p-5 bg-brand-primary/5 border border-brand-primary/20 rounded-xl">
              <h3 className="font-bold text-brand-primary mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pilih Metode Pembayaran
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("CASH")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all gap-2",
                    paymentMethod === "CASH" ? "border-brand-primary bg-white shadow-sm" : "border-transparent bg-white/50 hover:bg-white"
                  )}
                >
                  <Banknote className={cn("w-6 h-6", paymentMethod === "CASH" ? "text-brand-primary" : "text-slate-400")} />
                  <span className={cn("text-sm font-bold", paymentMethod === "CASH" ? "text-brand-primary" : "text-slate-500")}>Tunai (Kasir)</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("QRIS")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all gap-2",
                    paymentMethod === "QRIS" ? "border-brand-primary bg-white shadow-sm" : "border-transparent bg-white/50 hover:bg-white"
                  )}
                >
                  <QrCode className={cn("w-6 h-6", paymentMethod === "QRIS" ? "text-brand-primary" : "text-slate-400")} />
                  <span className={cn("text-sm font-bold", paymentMethod === "QRIS" ? "text-brand-primary" : "text-slate-500")}>QRIS</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer / Ringkasan Harga & Tombol Aksi */}
        <div className="p-6 border-t border-slate-200 bg-white shrink-0 rounded-b-2xl">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 font-medium">
              <span>Pajak (10%)</span>
              <span>Rp {tax.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-800 text-lg">Total Pembayaran</span>
              <span className="font-bold text-brand-primary text-2xl">Rp {(order.total || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>

          <div className="flex gap-3">
            {/* Tombol Cancel Order jika belum PAID atau CANCELLED */}
            {order.status !== 'PAID' && order.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Apakah Anda yakin ingin membatalkan pesanan #${order.id}?`)) {
                    onUpdateStatus(order.id, 'CANCELLED');
                    onClose();
                  }
                }}
                className="px-5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm"
              >
                Batalkan
              </button>
            )}

            {/* Tombol Utama berubah tergantung status dan pembayaran */}
            {!order.payment ? (
              <button 
                onClick={() => {
                  onProcessPayment(order.id, paymentMethod);
                  // Jika di status PENDING, bisa langsung kita majukan ke PROCESS setelah bayar
                  if (order.status === 'PENDING') onUpdateStatus(order.id, 'PROCESS');
                  onClose();
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                Validasi Pembayaran ({paymentMethod})
              </button>
            ) : order.status === 'PENDING' ? (
              <button 
                onClick={() => { onUpdateStatus(order.id, 'PROCESS'); onClose(); }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-lg"
              >
                <ChefHat className="w-5 h-5" />
                Mulai Masak
              </button>
            ) : order.status === 'PROCESS' ? (
              <button 
                onClick={() => { onUpdateStatus(order.id, 'READY'); onClose(); }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                Pesanan Siap
              </button>
            ) : order.status === 'READY' ? (
              <button 
                onClick={() => { onUpdateStatus(order.id, 'PAID'); onClose(); }}
                className="flex-1 bg-brand-primary hover:bg-brand-primaryHover text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm text-lg"
              >
                <CheckCircle2 className="w-5 h-5" />
                Selesaikan Pesanan
              </button>
            ) : (
              <button 
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Tutup
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
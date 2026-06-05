import { ShoppingBag, UtensilsCrossed, UserCircle2, X, Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/types";

interface PosCartAreaProps {
  cart: CartItem[];
  orderType: "Dine In" | "Take away";
  customerName: string;
  customerPhone: string;
  subtotal: number;
  total: number;
  onUpdateCustomerName: (name: string) => void;
  onUpdateCustomerPhone: (phone: string) => void;
  onRemoveItem: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isProcessing?: boolean;
}

export default function PosCartArea({
  cart, orderType, customerName, customerPhone,
  subtotal, total,
  onUpdateCustomerName, onUpdateCustomerPhone,
  onRemoveItem, onUpdateQty, onClearCart,
  onCheckout, isProcessing
}: PosCartAreaProps) {
  return (
    <div className="w-full lg:w-[400px] bg-white flex flex-col h-full shrink-0 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 relative">
      {/* Header Cart */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-brand-primary">Pesanan Saat Ini</h2>
          <span className="bg-brand-primary text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
            {cart.reduce((acc, item) => acc + item.qty, 0)}
          </span>
        </div>
        <button 
          onClick={onClearCart}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Cart Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Badge Order Type */}
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-center justify-center gap-2 text-brand-secondary font-bold text-sm">
          {orderType === 'Take away' ? <ShoppingBag className="w-4 h-4" /> : <UtensilsCrossed className="w-4 h-4" />}
          {orderType}
        </div>

        {/* Customer Info Form */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nama Customer <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircle2 className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => onUpdateCustomerName(e.target.value)}
                placeholder="Masukkan nama"
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nomor HP (Opsional)</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => onUpdateCustomerPhone(e.target.value)}
              placeholder="0812 3456 7890"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-3 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
              <img src={item.imageUrl?.startsWith('http') ? item.imageUrl : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') + item.imageUrl : `http://localhost:5000${item.imageUrl}`)} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{item.name}</h4>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-slate-400 hover:text-red-500 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Render Modifiers (Add-ons) jika ada */}
                  {item.modifiers && item.modifiers.length > 0 && (
                    <div className="mb-2 space-y-0.5">
                      {item.modifiers.map((mod, idx) => (
                        <div key={idx} className="text-[10px] text-slate-500 flex justify-between">
                          <span>+ {mod.modifierName || mod.name}</span>
                          {mod.price > 0 && <span>+{(mod.price * item.qty).toLocaleString('id-ID')}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                <div className="text-brand-primary font-semibold text-xs mb-2">
                  Rp. {item.price.toLocaleString('id-ID')} <span className="text-slate-400 font-normal">/ item</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-md px-2 py-1 shadow-sm">
                    <button 
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="text-slate-500 hover:text-brand-primary"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                    <button 
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="text-slate-500 hover:text-brand-primary"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    Rp. {(item.price * item.qty).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {cart.length > 0 && (
            <button className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-brand-primary text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Tambah Catatan
            </button>
          )}
          
          {cart.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Keranjang masih kosong
            </div>
          )}
        </div>
      </div>

      {/* Footer Summary & Checkout */}
      <div className="p-6 bg-white border-t border-slate-100 shrink-0">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-slate-500 font-medium">
            <span>Subtotal</span>
            <span>Rp. {subtotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-slate-800 text-lg">Total</span>
          <span className="font-bold text-brand-primary text-xl">Rp. {total.toLocaleString('id-ID')}</span>
        </div>
        <button 
          onClick={onCheckout}
          disabled={cart.length === 0 || isProcessing}
          className="w-full bg-brand-secondary hover:bg-brand-secondaryHover disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <ShoppingBag className="w-5 h-5" />
          {isProcessing ? "Memproses..." : "Bayar"}
        </button>
      </div>
    </div>
  );
}
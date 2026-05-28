import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { updateCustomerItemQuantity, removeFromCustomerCart } from '@/features/customer/store/customerSlice';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tenantId, tableId } = useParams();
  const { items } = useSelector((state: RootState) => state.customer);
  
  // State untuk animasi masuk (Slide Up)
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animasi setelah komponen di-mount
    setIsLoaded(true);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => {
    const modsTotal = item.modifiers.reduce((mSum, mod) => mSum + mod.price, 0);
    return sum + ((item.price + modsTotal) * item.qty);
  }, 0);

  // Jika ingin simulasi PPN 10%
  // const tax = subtotal * 0.1;
  // const grandTotal = subtotal + tax;
  const grandTotal = subtotal; // Untuk saat ini kita pakai net

  const handleBack = () => {
    setIsLoaded(false); // Trigger animasi keluar
    setTimeout(() => {
      navigate(`/m/${tenantId}/${tableId}`);
    }, 300); // Sesuaikan dengan durasi transisi Tailwind
  };

  const handleCheckout = () => {
    setIsLoaded(false); // Trigger animasi keluar
    setTimeout(() => {
      navigate(`/m/${tenantId}/${tableId}/checkout`);
    }, 300);
  };

  if (items.length === 0) {
    return (
      <div className={`min-h-screen bg-brand-background flex flex-col fixed inset-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isLoaded ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-brand-primary text-white p-4 flex items-center gap-4">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Keranjang Pesanan</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Keranjang Masih Kosong</h2>
          <p className="text-slate-500 mb-8 max-w-sm">Yuk, lihat-lihat menu dulu dan temukan makanan favoritmu!</p>
          <button 
            onClick={handleBack}
            className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full hover:bg-brand-primaryHover transition active:scale-95"
          >
            Lihat Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden fixed inset-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isLoaded ? 'translate-y-0' : 'translate-y-full'}`}>
      {/* Header */}
      <div className="bg-brand-primary text-white p-4 flex items-center gap-4 shadow-sm z-10 shrink-0">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Keranjang Pesanan</h1>
      </div>

      {/* Main Content (Scrollable) */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-4">
          {/* List Item */}
          {items.map(item => {
            const modsPrice = item.modifiers.reduce((sum, mod) => sum + mod.price, 0);
            const unitPrice = item.price + modsPrice;
            const totalPrice = unitPrice * item.qty;

            return (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 border border-slate-100">
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight pr-2">{item.name}</h3>
                    <button 
                      onClick={() => dispatch(removeFromCustomerCart(item.id))}
                      className="text-slate-400 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Modifiers List */}
                  {item.modifiers.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.modifiers.map(mod => (
                        <span key={mod.modifierId} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium">
                          {mod.modifierName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-xs text-brand-secondary mt-1 line-clamp-1 italic">
                      "{item.notes}"
                    </p>
                  )}

                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="font-bold text-brand-primary">{formatRupiah(totalPrice)}</span>
                    
                    {/* Qty Controls */}
                    <div className="flex items-center gap-3 bg-slate-50 rounded-full p-1 border border-slate-200">
                      <button 
                        onClick={() => dispatch(updateCustomerItemQuantity({ id: item.id, delta: -1 }))}
                        className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-100 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-slate-800 w-4 text-center">{item.qty}</span>
                      <button 
                        onClick={() => dispatch(updateCustomerItemQuantity({ id: item.id, delta: 1 }))}
                        className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white shadow-sm hover:bg-brand-primaryHover transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Rincian Tagihan */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mt-6">
            <h3 className="font-bold text-slate-800 mb-4">Rincian Pembayaran</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItems} item)</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              {/* Jika pakai PPN */}
              {/* <div className="flex justify-between text-slate-600">
                <span>Pajak Resto (10%)</span>
                <span>{formatRupiah(tax)}</span>
              </div> */}
            </div>
            <div className="border-t border-slate-100 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-slate-800">Total Tagihan</span>
              <span className="text-lg font-black text-brand-primary">{formatRupiah(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="bg-white border-t border-slate-200 p-4 pb-6 px-5 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">Total Harga</p>
            <p className="text-xl font-black text-brand-primary leading-none">{formatRupiah(grandTotal)}</p>
          </div>
          <button 
            onClick={handleCheckout}
            className="bg-brand-secondary text-white font-bold py-3.5 px-8 rounded-xl hover:bg-orange-500 transition shadow-md active:scale-95 flex items-center gap-2"
          >
            Lanjut Checkout
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default CartPage;
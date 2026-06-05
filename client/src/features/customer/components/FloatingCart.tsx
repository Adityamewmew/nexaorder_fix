import React from 'react';
import { ShoppingBasket } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate, useParams } from 'react-router-dom';
import { formatRupiah } from '@/lib/utils';

const FloatingCart: React.FC = () => {
  const { items, tenantId } = useSelector((state: RootState) => state.customer);
  const { tableToken } = useParams();
  const navigate = useNavigate();

  // Hitung total harga & jumlah
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = items.reduce((sum, item) => {
    // Harga dasar item + harga total semua modifiers
    const modifierPrice = item.modifiers.reduce((modSum, mod) => modSum + mod.price, 0);
    return sum + ((item.price + modifierPrice) * item.qty);
  }, 0);

  if (totalQty === 0) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      {/* Constraint width matching layout */}
      <div className="w-full max-w-[448px] bg-brand-success rounded-xl shadow-lg p-4 flex items-center justify-between text-white pointer-events-auto cursor-pointer active:scale-[0.98] transition-transform"
           onClick={() => navigate(`/m/${tenantId}/${tableToken}/cart`)}>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <ShoppingBasket className="w-6 h-6" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 bg-brand-secondary text-white text-xs font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-success">
              {totalQty}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-white/80 font-medium">Total Pesanan</span>
            <span className="font-black text-lg leading-tight">{formatRupiah(totalPrice)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 font-black text-sm bg-white/20 px-4 py-2 rounded-xl">
          CHECKOUT
        </div>
      </div>
    </div>
  );
};

export default FloatingCart;

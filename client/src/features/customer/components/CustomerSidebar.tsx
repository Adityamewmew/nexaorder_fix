import React from 'react';
import { LayoutGrid, ShoppingCart, Coffee, Utensils, Cookie, Receipt } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { NavLink, Link, useParams } from 'react-router-dom';

interface CustomerSidebarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenCheckOrder: () => void;
}

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name === 'semua') return <LayoutGrid className="w-5 h-5" />;
  if (name.includes('makan')) return <Utensils className="w-5 h-5" />;
  if (name.includes('minum')) return <Coffee className="w-5 h-5" />;
  return <Cookie className="w-5 h-5" />;
};

const CustomerSidebar: React.FC<CustomerSidebarProps> = ({ categories, activeCategory, onSelectCategory, onOpenCheckOrder }) => {
  const { tenantId, items, orderId } = useSelector((state: RootState) => state.customer);
  const { tableToken } = useParams();
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[#0A3464] to-[#1469CA] min-h-screen text-white sticky top-0 h-screen overflow-y-auto">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-sm shrink-0">
          <img src="/apple-touch-icon.png" alt="Nexa Order Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-bold tracking-wider">NEXA ORDER</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-2">
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-brand-background text-brand-primary font-bold shadow-md' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white font-medium'
              }`}
            >
              {getCategoryIcon(category)}
              {category}
            </button>
          );
        })}
        
        {/* Tombol Cek Pesanan (Muncul jika ada orderId di Redux) */}
        {orderId && (
          <button 
            onClick={onOpenCheckOrder}
            className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl border border-white/20 text-white/90 hover:bg-white/10 hover:text-white font-bold transition-all"
          >
            <Receipt className="w-5 h-5 text-brand-secondary" />
            Cek Pesanan
          </button>
        )}
      </div>

      {/* Cart Button at Bottom */}
      <div className="p-4 border-t border-white/10 mt-auto">
        <Link
          to={`/m/${tenantId}/${tableToken}/cart`}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-brand-secondary hover:bg-brand-secondaryHover text-white font-bold transition-colors shadow-sm"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5" />
            Keranjang
          </div>
          {totalItems > 0 && (
            <span className="bg-white text-brand-secondary text-xs font-black px-2 py-1 rounded-full">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default CustomerSidebar;

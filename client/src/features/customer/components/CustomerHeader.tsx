import React from 'react';
import { ShoppingCart, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Link, useParams } from 'react-router-dom';

interface CustomerHeaderProps {
  tenantName: string;
  onOpenSearch: () => void;
}

const CustomerHeader: React.FC<CustomerHeaderProps> = ({ tenantName, onOpenSearch }) => {
  const { tableId, tableName, tenantId, items } = useSelector((state: RootState) => state.customer);
  const { tableToken } = useParams();
  
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const formatTableName = (name: string | null, id: string | null) => {
    if (!name) return `MEJA NO. ${id?.replace(/\D/g, '') || '-'}`;
    if (name.toLowerCase().includes('meja')) return name.toUpperCase();
    return `MEJA ${name.toUpperCase()}`;
  };

  const displayTable = formatTableName(tableName, tableId);

  return (
    <>
      {/* MOBILE HEADER (Gradient Biru dari atas ke bawah) */}
      <div className="md:hidden bg-gradient-to-b from-[#0A3464] to-[#1469CA] rounded-b-3xl p-5 pb-6 shadow-md text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-black tracking-wide">{displayTable}</h1>
            <p className="text-sm text-blue-100 mt-1 font-medium">Selamat Datang di {tenantName}</p>
            <p className="text-xs text-blue-200 mt-0.5">Silahkan pilih menu keinginan anda</p>
          </div>
          
          <Link to={`/m/${tenantId}/${tableToken}/cart`} className="relative p-2 bg-white/10 rounded-full hover:bg-white/20 transition shrink-0">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-secondary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-brand-primary">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        <div className="relative mt-2" onClick={onOpenSearch}>
          <input 
            type="text" 
            placeholder="Cari menu kesukaanmu..." 
            readOnly
            className="w-full py-3 pl-4 pr-12 rounded-full text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-secondary shadow-inner cursor-pointer"
          />
          <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-primary p-2 rounded-full text-white hover:bg-brand-primaryHover transition pointer-events-none">
            <Search className="w-4 h-4" />
          </button>
        </div>
        
        {/* Ornamen Garis Kuning di Bawah Header Mobile */}
        <div className="flex justify-center mt-6">
          <div className="w-24 h-1.5 bg-brand-secondary rounded-full"></div>
        </div>
      </div>

      {/* DESKTOP HEADER (Clean) */}
      <div className="hidden md:flex justify-between items-end mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-5xl font-black text-brand-primary tracking-tight">{displayTable}</h1>
          <p className="text-xl text-brand-primary/80 mt-2 font-semibold">Selamat Datang di {tenantName}</p>
        </div>
        
        <div className="relative w-72" onClick={onOpenSearch}>
          <input 
            type="text" 
            placeholder="Cari menu..." 
            readOnly
            className="w-full py-3 pl-4 pr-14 rounded-xl text-slate-800 text-sm font-medium border-2 border-slate-200 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all bg-white cursor-pointer"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary p-2 rounded-lg text-white hover:bg-brand-primaryHover transition shadow-sm pointer-events-none">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default CustomerHeader;

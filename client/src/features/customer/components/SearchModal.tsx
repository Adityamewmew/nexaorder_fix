import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import api from '@/lib/api';

interface Product { id: number; name: string; price: number; image: string | null; description: string | null; }

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick: (productId: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onProductClick }) => {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/products').then(res => setAllProducts(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) { setTimeout(() => inputRef.current?.focus(), 100); }
    else { setQuery(''); }
  }, [isOpen]);

  const recommendations = allProducts.slice(0, 3);
  const searchResults = query.trim() === ''
    ? []
    : allProducts.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      {/* Backdrop Gelap (Bisa diklik untuk menutup) */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[190] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Kontainer Modal dari Atas */}
      <div 
        className={`fixed top-0 left-0 right-0 z-[200] bg-gradient-to-b from-[#0A3464] to-[#1469CA] flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-b-[2rem] ${
          isOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        
        {/* Header Modal (Search Bar) - Ditambah pt-6 untuk memberi ruang di atas */}
        <div className="px-4 pb-4 pt-6 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-brand-secondary rounded-full flex items-center justify-center text-white hover:bg-orange-400 transition-colors shrink-0 shadow-md"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="relative flex-1">
            <input 
              ref={inputRef}
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bakso Komplit..." 
              className="w-full py-3 pl-4 pr-12 rounded-full text-slate-800 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-white/20 shadow-inner"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-primary p-2 rounded-full text-white pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Konten (Rekomendasi vs Hasil Pencarian) */}
        <div className="flex-1 overflow-y-auto pb-2 px-4 hide-scrollbar">
          
          {query.trim() === '' ? (
            // State: Kosong -> Tampilkan Rekomendasi
            <div>
              <h3 className="font-bold text-white text-lg mb-4">Rekomendasi</h3>
              
              <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
                {recommendations.map(product => (
                  <div 
                    key={product.id} 
                    onClick={() => { onProductClick(String(product.id)); onClose(); }}
                    className="w-[140px] shrink-0 bg-brand-background rounded-xl shadow-sm overflow-hidden cursor-pointer active:scale-95 transition-transform flex flex-col"
                  >
                    <img src={product.image || ''} alt={product.name} className="w-full h-[100px] object-cover" />
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-2 mb-2">{product.name}</h4>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-xs text-brand-primary font-bold">{formatRupiah(product.price)}</p>
                        <div className="bg-brand-primary text-white p-1 rounded-md">
                          <Plus className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // State: Sedang Mencari -> Tampilkan Hasil
            <div>
              <h3 className="font-bold text-white mb-4">
                Hasil Pencarian <span className="text-white/70 font-normal text-sm">({searchResults.length})</span>
              </h3>

              {searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map(product => (
                    <div 
                      key={product.id}
                      onClick={() => { onProductClick(String(product.id)); onClose(); }}
                      className="bg-brand-background p-3 rounded-xl shadow-sm flex gap-4 cursor-pointer active:scale-[0.98] transition-transform items-center"
                    >
                      <img src={product.image || ''} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-sm">{product.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{product.description}</p>
                        <p className="text-sm text-brand-primary font-bold mt-1">{formatRupiah(product.price)}</p>
                      </div>
                    </div>
                  ))}
              </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/80 font-medium">Menu "{query}" tidak ditemukan.</p>
                </div>
              )}
            </div>
          )}

        </div>
        
        {/* Garis Oren Bawah (Tarik ke atas untuk tutup) */}
        <div className="w-full flex justify-center pb-4 pt-2 cursor-grab active:cursor-grabbing" onClick={onClose}>
          <div className="w-24 h-1.5 bg-brand-secondary rounded-full"></div>
        </div>
      </div>
    </>
  );
};

export default SearchModal;
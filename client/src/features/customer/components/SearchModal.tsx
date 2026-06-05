import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus } from 'lucide-react';

import { formatRupiah } from '@/lib/utils';
import api from '@/lib/api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick: (productId: number) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onProductClick
}) => {

  const [query, setQuery] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // AUTO FOCUS
  useEffect(() => {

    if (isOpen) {

      setTimeout(() => {

        inputRef.current?.focus();

      }, 100);

    } else {

      setQuery('');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }

  }, [isOpen]);

  // FETCH PRODUCTS
  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const res = await api.get('/products');

        setProducts(res.data);

      } catch (err) {

        console.log(err);
      }
    };

    fetchProducts();

  }, []);

  // REKOMENDASI
  const recommendations = products.slice(0, 3);

  // SEARCH
  const searchResults =
    query.trim() === ''
      ? []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : products.filter((p: any) =>
          p.name.toLowerCase().includes(
            query.toLowerCase()
          )
        );

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/40 z-[190] transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className={`fixed top-0 left-0 right-0 z-[200] bg-gradient-to-b from-[#0A3464] to-[#1469CA] flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] rounded-b-[2rem] ${
          isOpen
            ? 'translate-y-0'
            : '-translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >

        {/* HEADER */}
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
              placeholder="Cari menu..."
              className="w-full py-3 pl-4 pr-12 rounded-full text-slate-800 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-white/20 shadow-inner"
            />

            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-brand-primary p-2 rounded-full text-white pointer-events-none">

              <Search className="w-4 h-4" />

            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto pb-2 px-4 hide-scrollbar">

          {query.trim() === '' ? (

            <div>

              <h3 className="font-bold text-white text-lg mb-4">

                Rekomendasi

              </h3>

              <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">

                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {recommendations.map((product: any) => (

                  <div
                    key={product.id}
                    onClick={() => {

                      onProductClick(product.id);

                      onClose();
                    }}
                    className="w-[140px] shrink-0 bg-brand-background rounded-xl shadow-sm overflow-hidden cursor-pointer active:scale-95 transition-transform flex flex-col"
                  >

                      <div className="w-full h-[100px] bg-slate-200 relative">
                        <img
                          src={product.image ? (product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image}`) : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes("unsplash.com")) {
                              target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop";
                            }
                          }}
                        />
                      </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">

                      <h4 className="font-bold text-xs text-slate-800 line-clamp-2 mb-2">

                        {product.name}

                      </h4>

                      <div className="flex items-center justify-between mt-auto">

                        <p className="text-xs text-brand-primary font-bold">

                          {formatRupiah(product.price)}

                        </p>

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

            <div>

              <h3 className="font-bold text-white mb-4">

                Hasil Pencarian

                <span className="text-white/70 font-normal text-sm">

                  ({searchResults.length})

                </span>

              </h3>

              {searchResults.length > 0 ? (

                <div className="space-y-3">

                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {searchResults.map((product: any) => (

                    <div
                      key={product.id}
                      onClick={() => {

                        onProductClick(product.id);

                        onClose();
                      }}
                      className="bg-brand-background p-3 rounded-xl shadow-sm flex gap-4 cursor-pointer active:scale-[0.98] transition-transform items-center"
                    >

                      <div className="w-16 h-16 rounded-lg bg-slate-200 shrink-0 overflow-hidden relative">
                        <img
                          src={product.image ? (product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.image}`) : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes("unsplash.com")) {
                              target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop";
                            }
                          }}
                        />
                      </div>

                      <div className="flex-1">

                        <h4 className="font-bold text-slate-800 text-sm">

                          {product.name}

                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">

                          {product.description}

                        </p>

                        <p className="text-sm text-brand-primary font-bold mt-1">

                          {formatRupiah(product.price)}

                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              ) : (

                <div className="text-center py-8">

                  <Search className="w-12 h-12 text-white/30 mx-auto mb-3" />

                  <p className="text-white/80 font-medium">

                    Menu "{query}" tidak ditemukan.

                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* HANDLE */}
        <div
          className="w-full flex justify-center pb-4 pt-2 cursor-grab active:cursor-grabbing"
          onClick={onClose}
        >

          <div className="w-24 h-1.5 bg-brand-secondary rounded-full"></div>

        </div>
      </div>
    </>
  );
};

export default SearchModal;
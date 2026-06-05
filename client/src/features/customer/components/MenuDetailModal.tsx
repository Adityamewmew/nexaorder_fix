import React, { useState, useEffect } from 'react';

import {
  X,
  Minus,
  Plus,
  ShoppingBasket,
  CheckCircle2
} from 'lucide-react';

import { formatRupiah } from '@/lib/utils';

import { useDispatch } from 'react-redux';

import { addToCustomerCart } from '@/features/customer/store/customerSlice';

import { useToast } from '@/contexts/ToastContext';

import api from '@/lib/api';

interface MenuDetailModalProps {
  productId: number | null;
  onClose: () => void;
}

const MenuDetailModal: React.FC<MenuDetailModalProps> = ({
  productId,
  onClose
}) => {

  const dispatch = useDispatch();

  const { showToast } = useToast();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null);

  const [quantity, setQuantity] = useState(1);

  const [notes, setNotes] = useState('');

  // FETCH PRODUCT
  useEffect(() => {

    const fetchProduct = async () => {

      if (!productId) return;

      try {

        const res = await api.get(`/products/${productId}`);
        const p = res.data;
        const transformedProduct = {
          ...p,
          modifierGroups: p.modifierGroups ? p.modifierGroups.map((g: any) => ({
            id: String(g.id),
            groupName: g.name,
            isRequired: g.isRequired,
            minSelections: g.minSelections,
            maxSelections: g.maxSelections,
            modifiers: g.modifiers.map((m: any) => ({
              id: String(m.id),
              modifierName: m.name,
              price: m.price
            }))
          })) : []
        };

        setProduct(transformedProduct);

      } catch (err) {

        console.log(err);
      }
    };

    fetchProduct();

  }, [productId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);

  // RESET
  useEffect(() => {

    setQuantity(1);

    setNotes('');
    
    setSelectedModifiers([]);

  }, [product]);

  if (!product) return null;

  const modifiersPrice = selectedModifiers.reduce((sum, mod) => sum + (mod.price || 0), 0);
  const totalPrice = (product.price + modifiersPrice) * quantity;

  // ADD TO CART
  const handleAddToCart = () => {

    // Validasi required modifiers
    if (product.modifierGroups && product.modifierGroups.length > 0) {
      for (const group of product.modifierGroups) {
        if (group.isRequired) {
          const selectedInGroup = selectedModifiers.filter(m => m.groupId === group.id);
          if (selectedInGroup.length < group.minSelections) {
            showToast(`Pilih minimal ${group.minSelections} opsi untuk ${group.groupName}`, "error");
            return;
          }
        }
      }
    }

    dispatch(addToCustomerCart({

      id: product.id,

      name: product.name,

      price: product.price,

      imageUrl: product.image,

      categoryId: product.categoryId,

      qty: quantity,

      modifiers: selectedModifiers.map(m => ({ id: m.id, name: m.name, price: m.price })),

      notes: notes.trim()
    }));

    showToast(
      'Berhasil ditambahkan ke keranjang!',
      'success'
    );

    onClose();
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/60 z-[250] transition-opacity duration-300 ${
          productId
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[300] bg-brand-background rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          productId
            ? 'translate-y-0'
            : 'translate-y-full'
        }`}
        style={{ maxHeight: '90vh' }}
      >

        {/* HANDLE */}
        <div
          className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing bg-white rounded-t-3xl"
          onClick={onClose}
        >

          <div className="w-16 h-1.5 bg-slate-300 rounded-full"></div>

        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">

          <div className="max-w-2xl mx-auto w-full">

            {/* IMAGE */}
            <div className="relative bg-white pb-6 rounded-b-3xl shadow-sm">

              <img
                src={product.image?.startsWith('http') ? product.image : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') + product.image : `http://localhost:5000${product.image}`)}
                alt={product.name}
                className="w-full h-64 md:h-80 object-cover"
              />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition"
              >

                <X className="w-5 h-5" />

              </button>

              <div className="px-5 mt-5">

                <h2 className="text-2xl font-black text-brand-primary">

                  {product.name}

                </h2>

                <p className="text-slate-500 mt-2 text-sm leading-relaxed">

                  {product.description}

                </p>

                <p className="text-xl font-bold text-brand-secondary mt-3">

                  {formatRupiah(product.price)}

                </p>

              </div>
            </div>

            {/* MODIFIERS */}
            {product.modifierGroups && product.modifierGroups.length > 0 && (
              <div className="mt-4 bg-white px-5 py-4 shadow-sm rounded-3xl md:mx-4 space-y-6">
                {product.modifierGroups.map((group: any) => (
                  <div key={group.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-bold text-slate-800">{group.groupName}</h3>
                        <p className="text-xs text-slate-500">
                          {group.isRequired ? `Pilih minimal ${group.minSelections}` : 'Opsional'}
                          {group.maxSelections > 1 ? ` (Maksimal ${group.maxSelections})` : ''}
                        </p>
                      </div>
                      {group.isRequired && (
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          Wajib
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      {group.modifiers.map((mod: any) => {
                        const isSelected = selectedModifiers.some(m => m.id === mod.id);
                        const isRadio = group.maxSelections === 1 && group.minSelections === 1;
                        
                        return (
                          <label key={mod.id} className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center border transition-colors ${
                                isRadio 
                                  ? `w-5 h-5 rounded-full ${isSelected ? 'border-brand-primary border-4' : 'border-slate-300 group-hover:border-brand-primary/50'}`
                                  : `w-5 h-5 rounded ${isSelected ? 'bg-brand-primary border-brand-primary text-white' : 'border-slate-300 group-hover:border-brand-primary/50 bg-transparent'}`
                              }`}>
                                {!isRadio && isSelected && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                              <span className="text-sm font-medium text-slate-700">{mod.modifierName}</span>
                            </div>
                            {mod.price > 0 && (
                              <span className="text-sm font-semibold text-slate-600">+ {formatRupiah(mod.price)}</span>
                            )}
                            <input 
                              type={isRadio ? "radio" : "checkbox"} 
                              className="hidden"
                              checked={isSelected}
                              onChange={(e) => {
                                if (isRadio) {
                                  // Hapus semua pilihan di grup ini, lalu tambah yang baru
                                  const filtered = selectedModifiers.filter(m => m.groupId !== group.id);
                                  setSelectedModifiers([...filtered, { ...mod, name: mod.modifierName, groupId: group.id }]);
                                } else {
                                  if (e.target.checked) {
                                    // Cek max selections
                                    const selectedInGroup = selectedModifiers.filter(m => m.groupId === group.id).length;
                                    if (selectedInGroup < group.maxSelections) {
                                      setSelectedModifiers([...selectedModifiers, { ...mod, name: mod.modifierName, groupId: group.id }]);
                                    }
                                  } else {
                                    setSelectedModifiers(selectedModifiers.filter(m => m.id !== mod.id));
                                  }
                                }
                              }}
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NOTES */}
            <div className="mt-4 bg-white p-5 shadow-sm mb-4 rounded-3xl md:mx-4">

              <h3 className="font-bold text-slate-800 mb-3">

                Catatan Tambahan

              </h3>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Jangan pedas..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors min-h-[100px] resize-none"
              />

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-6 px-5 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">

          <div className="max-w-2xl mx-auto flex items-center gap-4">

            {/* COUNTER */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">

              <button
                onClick={() =>
                  setQuantity(Math.max(1, quantity - 1))
                }
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 bg-white shadow-sm hover:bg-slate-50 transition"
              >

                <Minus className="w-4 h-4" />

              </button>

              <span className="w-10 text-center font-bold text-slate-800">

                {quantity}

              </span>

              <button
                onClick={() =>
                  setQuantity(quantity + 1)
                }
                className="w-10 h-10 rounded-full flex items-center justify-center text-brand-primary bg-white shadow-sm hover:bg-slate-50 transition"
              >

                <Plus className="w-4 h-4" />

              </button>

            </div>

            {/* BUTTON */}
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-between p-4 rounded-xl font-bold transition-all bg-brand-primary text-white hover:bg-brand-primaryHover shadow-lg active:scale-[0.98]"
            >

              <div className="flex flex-col items-start">

                <span className="text-[10px] uppercase tracking-wider opacity-80">

                  Total

                </span>

                <span className="text-lg leading-none">

                  {formatRupiah(totalPrice)}

                </span>

              </div>

              <div className="flex items-center gap-2">

                Tambah

                <ShoppingBasket className="w-5 h-5" />

              </div>

            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuDetailModal;
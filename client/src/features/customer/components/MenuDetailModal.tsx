import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBasket, Loader2 } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { addToCustomerCart } from '@/features/customer/store/customerSlice';
import { useToast } from '@/contexts/ToastContext';
import api from '@/lib/api';

interface Modifier { id: string; name: string; price: number; isDefault: boolean; }
interface ModifierGroup { id: string; name: string; isRequired: boolean; minSelections: number; maxSelections: number; modifiers: Modifier[]; }
interface Product {
  id: string; name: string; price: number; stock: number;
  description: string | null; image: string | null; status: string;
  categoryId: string; modifierGroups?: ModifierGroup[];
}

interface MenuDetailModalProps {
  productId: string | null;
  onClose: () => void;
}

const MenuDetailModal: React.FC<MenuDetailModalProps> = ({ productId, onClose }) => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);

  useEffect(() => {
    if (!productId) { setProduct(null); return; }
    setLoading(true);
    setQuantity(1); setNotes(''); setSelectedModifiers([]);
    api.get(`/products/${productId}`)
      .then(res => {
        const p = res.data;
        setProduct({ ...p, id: String(p.id), categoryId: String(p.categoryId) });
      })
      .catch(() => showToast('Gagal memuat detail menu', 'error'))
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;
  if (loading) return (
    <div className="fixed inset-0 bg-black/60 z-[250] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white animate-spin" />
    </div>
  );
  if (!product) return null;

  // Hitung total harga tambahan dari modifier
  const additionalPrice = product.modifierGroups?.reduce((total, group) => {
    const groupMods = group.modifiers.filter(m => selectedModifiers.includes(m.id));
    return total + groupMods.reduce((sum, m) => sum + m.price, 0);
  }, 0) || 0;

  const unitPrice = product.price + additionalPrice;
  const totalPrice = unitPrice * quantity;

  // Validasi apakah semua modifier Wajib (isRequired) sudah terpenuhi
  const isFormValid = () => {
    if (!product.modifierGroups) return true;
    
    for (const group of product.modifierGroups) {
      if (group.isRequired) {
        const selectedInGroup = group.modifiers.filter(m => selectedModifiers.includes(m.id)).length;
        if (selectedInGroup < group.minSelections) {
          return false;
        }
      }
    }
    return true;
  };

  const handleModifierToggle = (groupId: string, modifierId: string, isRadio: boolean, maxSelections: number) => {
    setSelectedModifiers(prev => {
      const group = product.modifierGroups?.find(g => g.id === groupId);
      if (!group) return prev;

      const groupSelectedIds = prev.filter(id => group.modifiers.some(m => m.id === id));

      if (isRadio) {
        // Jika radio (max 1), hapus pilihan sebelumnya di grup ini, lalu masukkan yang baru
        const otherGroupsMods = prev.filter(id => !group.modifiers.some(m => m.id === id));
        return [...otherGroupsMods, modifierId];
      } else {
        // Jika checkbox (max > 1)
        if (prev.includes(modifierId)) {
          // Uncheck
          return prev.filter(id => id !== modifierId);
        } else {
          // Check (pastikan tidak melebihi max)
          if (groupSelectedIds.length < maxSelections) {
            return [...prev, modifierId];
          }
          return prev; // Abaikan jika sudah penuh
        }
      }
    });
  };

  const handleAddToCart = () => {
    if (!isFormValid()) {
      showToast("Mohon lengkapi pilihan wajib terlebih dahulu", "error");
      return;
    }

    // Siapkan data modifier untuk dimasukkan ke cart
    const modifiersToAdd: { groupId: string, groupName: string, modifierId: string; modifierName: string; price: number }[] = [];
    product.modifierGroups?.forEach(group => {
      group.modifiers.forEach(mod => {
        if (selectedModifiers.includes(mod.id)) {
          modifiersToAdd.push({ 
            groupId: group.id,
            groupName: group.name,
            modifierId: mod.id, 
            modifierName: mod.name, 
            price: mod.price 
          });
        }
      });
    });

    dispatch(addToCustomerCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image || '',
      categoryId: product.categoryId,
      qty: quantity,
      modifiers: modifiersToAdd,
      notes: notes.trim()
    }));

    showToast("Berhasil ditambahkan ke keranjang!", "success");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[250] transition-opacity duration-300 ${productId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[300] bg-brand-background rounded-t-3xl shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          productId ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Handle Garis */}
        <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing bg-white rounded-t-3xl" onClick={onClose}>
          <div className="w-16 h-1.5 bg-slate-300 rounded-full"></div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
          {/* Container Batas Lebar Desktop */}
          <div className="max-w-2xl mx-auto w-full">
            {/* Gambar Produk */}
            <div className="relative bg-white pb-6 rounded-b-3xl shadow-sm">
              <img src={product.image || ''} alt={product.name} className="w-full h-64 md:h-80 object-cover" />
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="px-5 mt-5">
                <h2 className="text-2xl font-black text-brand-primary">{product.name}</h2>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed">{product.description}</p>
                <p className="text-xl font-bold text-brand-secondary mt-3">{formatRupiah(product.price)}</p>
              </div>
            </div>

            {/* Modifier Groups (Add-ons) */}
            {product.modifierGroups?.map(group => {
              const isRadio = group.maxSelections === 1;
              const selectedCount = group.modifiers.filter(m => selectedModifiers.includes(m.id)).length;
              const isFulfilled = !group.isRequired || selectedCount >= group.minSelections;

              return (
                <div key={group.id} className="mt-4 bg-white p-5 shadow-sm rounded-3xl md:mx-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800">{group.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isRadio ? 'Pilih 1' : `Pilih maksimal ${group.maxSelections}`}
                      </p>
                    </div>
                    {group.isRequired ? (
                      <span className="bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold px-2 py-1 rounded-md border border-brand-secondary/20">Wajib</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md">Opsional</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {group.modifiers.map(mod => {
                      const isSelected = selectedModifiers.includes(mod.id);
                      return (
                        <label 
                          key={mod.id} 
                          className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-100 bg-slate-50 hover:border-brand-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 flex items-center justify-center border-2 ${isRadio ? 'rounded-full' : 'rounded-md'} ${
                              isSelected ? 'border-brand-primary bg-brand-primary' : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && (
                                <div className={isRadio ? 'w-2 h-2 bg-white rounded-full' : 'w-2 h-2 bg-white rounded-sm'} />
                              )}
                            </div>
                            <span className={`font-medium text-sm ${isSelected ? 'text-brand-primary' : 'text-slate-700'}`}>
                              {mod.name}
                            </span>
                          </div>
                          <span className="text-sm font-bold text-slate-600">
                            {mod.price > 0 ? `+${formatRupiah(mod.price)}` : 'Gratis'}
                          </span>
                          
                          {/* Hidden input agar bisa diklik di label */}
                          <input 
                            type={isRadio ? 'radio' : 'checkbox'} 
                            className="hidden"
                            checked={isSelected}
                            onChange={() => handleModifierToggle(group.id, mod.id, isRadio, group.maxSelections)}
                          />
                        </label>
                      );
                    })}
                  </div>
                  {!isFulfilled && (
                    <p className="text-red-500 text-xs font-medium mt-3">Pilihan ini wajib diisi.</p>
                  )}
                </div>
              );
            })}

            {/* Catatan Tambahan */}
            <div className="mt-4 bg-white p-5 shadow-sm mb-4 rounded-3xl md:mx-4">
              <h3 className="font-bold text-slate-800 mb-3">Catatan Tambahan</h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Jangan pakai daun bawang, pedasnya sedang saja..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sticky Footer Action */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-6 px-5 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            {/* Counter */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 bg-white shadow-sm hover:bg-slate-50 transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-slate-800">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-brand-primary bg-white shadow-sm hover:bg-slate-50 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              disabled={!isFormValid()}
              className={`flex-1 flex items-center justify-between p-4 rounded-xl font-bold transition-all ${
                isFormValid() 
                  ? 'bg-brand-primary text-white hover:bg-brand-primaryHover shadow-lg active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase tracking-wider opacity-80">Total</span>
                <span className="text-lg leading-none">{formatRupiah(totalPrice)}</span>
              </div>
              <div className="flex items-center gap-2">
                Tambah <ShoppingBasket className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default MenuDetailModal;
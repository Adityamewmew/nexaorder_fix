import React, { useState, useEffect } from 'react';

import {
  X,
  Minus,
  Plus,
  ShoppingBasket
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

  const [product, setProduct] = useState<any>(null);

  const [quantity, setQuantity] = useState(1);

  const [notes, setNotes] = useState('');

  // FETCH PRODUCT
  useEffect(() => {

    const fetchProduct = async () => {

      if (!productId) return;

      try {

        const res = await api.get(`/products/${productId}`);

        setProduct(res.data);

      } catch (err) {

        console.log(err);
      }
    };

    fetchProduct();

  }, [productId]);

  // RESET
  useEffect(() => {

    setQuantity(1);

    setNotes('');

  }, [product]);

  if (!product) return null;

  const totalPrice = product.price * quantity;

  // ADD TO CART
  const handleAddToCart = () => {

    dispatch(addToCustomerCart({

      id: product.id,

      name: product.name,

      price: product.price,

      imageUrl: product.image,

      categoryId: product.categoryId,

      qty: quantity,

      modifiers: [],

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
                src={product.image}
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
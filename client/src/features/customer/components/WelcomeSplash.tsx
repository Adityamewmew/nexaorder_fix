import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setHasSeenSplash } from '@/features/customer/store/customerSlice';

const WelcomeSplash: React.FC = () => {
  const dispatch = useDispatch();
  const hasSeenSplash = useSelector((state: RootState) => state.customer.hasSeenSplash);
  const [isVisible, setIsVisible] = useState(!hasSeenSplash);
  const [isRendered, setIsRendered] = useState(!hasSeenSplash);

  useEffect(() => {
    // Jika sudah pernah melihat splash screen di sesi ini, jangan jalankan lagi
    if (hasSeenSplash) return;

    // Tahan animasi selama 1.5 detik, lalu mulai fade out
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    // Hapus dari DOM setelah animasi fade out selesai (500ms)
    const removeTimer = setTimeout(() => {
      setIsRendered(false);
      dispatch(setHasSeenSplash()); // Tandai sudah dilihat
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [hasSeenSplash, dispatch]);

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-brand-primary flex flex-col items-center justify-center transition-opacity duration-500 w-full ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl animate-bounce">
        <h1 className="text-4xl font-black text-brand-primary tracking-tighter">Nexa</h1>
        <h1 className="text-2xl font-bold text-slate-800 -mt-2">Order</h1>
      </div>
      <p className="text-white mt-6 font-medium animate-pulse">Menyiapkan menu terbaik...</p>
    </div>
  );
};

export default WelcomeSplash;

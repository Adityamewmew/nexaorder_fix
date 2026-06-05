import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setHasSeenSplash } from '@/features/customer/store/customerSlice';
import api from '@/lib/api';

const WelcomeSplash: React.FC = () => {
  const dispatch = useDispatch();
  const hasSeenSplash = useSelector((state: RootState) => state.customer.hasSeenSplash);
  const [isVisible, setIsVisible] = useState(!hasSeenSplash);
  const [isRendered, setIsRendered] = useState(!hasSeenSplash);
  const [storeInfo, setStoreInfo] = useState({ name: 'Nexa Order', logo: '' });

  useEffect(() => {
    // Ambil profil toko dari API (tanpa token, karena customer)
    api.get('/dashboard/profile').then(res => {
      if (res.data) {
        setStoreInfo({
          name: res.data.name || 'Nexa Order',
          logo: res.data.logo || ''
        });
      }
    }).catch(() => {
      // Abaikan jika gagal
    });
  }, []);

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
      <div className="bg-white p-6 rounded-2xl shadow-2xl animate-bounce flex flex-col items-center min-w-[200px]">
        {/* Simulasi Logo */}
        {storeInfo.logo ? (
          <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 shadow-sm border border-slate-100 p-1">
            <img 
              src={storeInfo.logo.startsWith('http') ? storeInfo.logo : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') + storeInfo.logo : `http://localhost:5000${storeInfo.logo}`)} 
              alt={storeInfo.name} 
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-inner">
            {storeInfo.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="text-2xl font-black text-brand-primary tracking-tighter text-center leading-tight">
          {storeInfo.name.split(' ').map((word, i) => (
            <span key={i} className={i % 2 !== 0 ? "text-slate-800" : ""}>{word} </span>
          ))}
        </h1>
      </div>
      <p className="text-white mt-6 font-medium animate-pulse">Menyiapkan menu terbaik...</p>
    </div>
  );
};

export default WelcomeSplash;

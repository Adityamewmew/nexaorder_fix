import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { CheckCircle2, Clock, ChefHat, Utensils, Receipt } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { OrderStatus } from '@/types';

const OrderStatusPage: React.FC = () => {
  const { tenantId, tableId, orderId } = useParams();
  const navigate = useNavigate();
  
  const { customerName, customerPhone } = useSelector((state: RootState) => state.customer);
  const formattedTable = tableId?.replace(/\D/g, '') || '-';

  // Ambil data order asli dari Redux berdasarkan orderId
  const currentOrder = useSelector((state: RootState) => 
    state.orders.items.find(o => o.id === orderId)
  );

  // Fallback data jika reload halaman dan state hilang
  const receiptData = currentOrder || {
    totalAmount: 0,
    paymentMethod: 'QRIS',
    status: 'PENDING' as OrderStatus,
    items: []
  };

  // State untuk animasi slide-up halaman
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleOrderMore = () => {
    setIsLoaded(false);
    setTimeout(() => {
      navigate(`/m/${tenantId}/${tableId}`);
    }, 300);
  };

  const getStatusColor = (stepStatus: OrderStatus) => {
    const steps = ['PENDING', 'PROCESS', 'READY'];
    const currentIndex = steps.indexOf(receiptData.status);
    const stepIndex = steps.indexOf(stepStatus);

    if (stepIndex < currentIndex) return 'bg-brand-success text-white border-brand-success'; // Selesai
    if (stepIndex === currentIndex) return 'bg-white text-brand-secondary border-brand-secondary ring-4 ring-brand-secondary/30 shadow-lg scale-110'; // Sedang aktif
    return 'bg-white text-slate-300 border-slate-200'; // Belum tercapai
  };

  return (
    <div className={`min-h-screen bg-brand-background flex flex-col h-screen overflow-hidden fixed inset-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isLoaded ? 'translate-y-0' : 'translate-y-full'}`}>
      
      {/* Header Sederhana */}
      <div className="bg-brand-primary text-white p-4 text-center shrink-0">
        <h1 className="text-lg font-bold">Status Pesanan</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="w-full max-w-xl mx-auto p-4 md:p-6 space-y-6">
          
          {/* Kartu Nomor Antrean Raksasa */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">
            <p className="text-slate-500 font-medium mb-2">Nomor Antrean Anda</p>
            <h1 className="text-6xl font-black text-brand-primary tracking-tighter mb-4">{orderId}</h1>
            
            {/* Stepper Status (Desain Baru) */}
            <div className="relative mt-8 px-6">
              {/* Garis Penghubung Background */}
              <div className="absolute top-6 left-[15%] right-[15%] h-1.5 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
              {/* Garis Penghubung Aktif (Progress) */}
              <div 
                className="absolute top-6 left-[15%] h-1.5 bg-brand-success -translate-y-1/2 z-0 transition-all duration-1000 rounded-full"
                style={{ 
                  width: receiptData.status === 'PENDING' ? '0%' : receiptData.status === 'PROCESS' ? '50%' : '70%'
                }}
              ></div>

              <div className="relative z-10 flex justify-between">
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative z-10 ${getStatusColor('PENDING')}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${receiptData.status === 'PENDING' ? 'text-brand-secondary' : 'text-slate-600'}`}>Diterima</span>
                </div>
                
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative z-10 ${getStatusColor('PROCESS')}`}>
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${receiptData.status === 'PROCESS' ? 'text-brand-secondary' : 'text-slate-600'}`}>Disiapkan</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative z-10 ${getStatusColor('READY')}`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${receiptData.status === 'READY' ? 'text-brand-success' : 'text-slate-600'}`}>Selesai</span>
                </div>
              </div>
            </div>
            
            {/* Pesan Dinamis Berdasarkan Status */}
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-800">
                {receiptData.status === 'PENDING' && "Pesananmu sudah masuk antrean."}
                {receiptData.status === 'PROCESS' && "Koki kami sedang memasak pesananmu!"}
                {receiptData.status === 'READY' && "Yeay! Pesananmu sudah siap disajikan."}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {receiptData.status === 'READY' ? "Silakan ambil di kasir atau tunggu pelayan mengantar." : "Harap tunggu sebentar ya di Meja " + formattedTable + "."}
              </p>
            </div>
          </div>

          {/* Struk / Rincian Pesanan */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <Receipt className="w-5 h-5 text-brand-primary" />
              <h2 className="font-bold text-slate-800">Rincian Pesanan</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nama Pemesan</span>
                <span className="font-bold text-slate-800">{customerName || 'Tamu'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">No. WhatsApp</span>
                <span className="font-bold text-slate-800">{customerPhone || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Metode Bayar</span>
                <span className="font-bold text-brand-primary">{receiptData.paymentMethod}</span>
              </div>
            </div>

            {/* List Item yang dibeli */}
            <div className="border-t border-dashed border-slate-200 pt-4 space-y-3">
              {receiptData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-bold text-slate-700">{item.quantity}x {item.productName}</p>
                    {item.notes && <p className="text-[10px] text-slate-400 italic">Catatan: {item.notes}</p>}
                    {item.modifiers?.length > 0 && (
                      <p className="text-[10px] text-slate-400">
                        {item.modifiers.map(m => m.modifierName).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-slate-800">{formatRupiah(item.priceAtOrder * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
              <span className="font-bold text-slate-800">Total Harga</span>
              <span className="text-xl font-black text-brand-primary">{formatRupiah(receiptData.totalAmount)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Bar untuk Lanjut Pesan */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-6 px-5 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">Ada yang kurang?</p>
            <p className="font-bold text-slate-800 text-sm">Pesan menu tambahan</p>
          </div>
          <button 
            onClick={handleOrderMore}
            className="bg-brand-primary text-white font-bold py-3.5 px-6 rounded-xl hover:bg-brand-primaryHover transition shadow-md active:scale-95 flex items-center gap-2"
          >
            Pesan Lagi
            <Utensils className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default OrderStatusPage;
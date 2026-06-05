import React, { useEffect, useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import {
  CheckCircle2,
  Clock,
  ChefHat,
  Utensils,
  Receipt
} from 'lucide-react';

import { formatRupiah } from '@/lib/utils';

import api from '@/lib/api';

const OrderStatusPage: React.FC = () => {

  const { tenantId, tableToken, orderId } = useParams();

  const navigate = useNavigate();

  // API STATE
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  // ANIMATION
  const [isLoaded, setIsLoaded] = useState(false);

  // MENDAPATKAN NOMOR MEJA DARI DATA ORDER
  const tableNumber = order?.table?.number 
    ? (order.table.number.toLowerCase().includes('meja') ? order.table.number : `Meja ${order.table.number}`)
    : '-';

  // SLIDE ANIMATION
  useEffect(() => {

    setIsLoaded(true);

  }, []);

  // FETCH ORDER + POLLING
  useEffect(() => {

    const fetchOrder = async () => {

      try {

        const res = await api.get(`/orders/${orderId}`);

        setOrder(res.data);

        setLoading(false);

        // STOP polling jika PAID
        if (res.data.status === 'PAID') {
          clearInterval(interval);
        }

      } catch (err) {

        console.log(err);

        setError('Gagal mengambil status order');

        setLoading(false);
      }
    };

    // FETCH PERTAMA
    fetchOrder();

    // POLLING 5 DETIK
    const interval = setInterval(fetchOrder, 5000);

    // CLEANUP
    return () => clearInterval(interval);

  }, [orderId]);

  // LOADING
  if (loading) {

    return (

      <div className="flex items-center justify-center min-h-screen">

        <p>Loading...</p>

      </div>
    );
  }

  // ERROR
  if (error) {

    return (

      <div className="flex items-center justify-center min-h-screen">

        <p>{error}</p>

      </div>
    );
  }

  // ORDER MORE
  const handleOrderMore = () => {

    setIsLoaded(false);

    setTimeout(() => {

      navigate(`/m/${tenantId}/${tableToken}`);

    }, 300);
  };

  // STATUS COLOR
  const getStatusColor = (stepStatus: string) => {

    const steps = ['PENDING', 'PROCESS', 'READY', 'PAID'];

    const currentIndex = steps.indexOf(order?.status);

    const stepIndex = steps.indexOf(stepStatus);

    if (stepIndex < currentIndex) {
      return 'bg-brand-success text-white border-brand-success';
    }

    if (stepIndex === currentIndex) {
      return 'bg-white text-brand-secondary border-brand-secondary ring-4 ring-brand-secondary/30 shadow-lg scale-110';
    }

    return 'bg-white text-slate-300 border-slate-200';
  };

  return (

    <div className={`min-h-screen bg-brand-background flex flex-col h-screen overflow-hidden fixed inset-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isLoaded ? 'translate-y-0' : 'translate-y-full'}`}>

      {/* HEADER */}
      <div className="bg-brand-primary text-white p-4 text-center shrink-0">

        <h1 className="text-lg font-bold">
          Status Pesanan
        </h1>

      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto pb-32">

        <div className="w-full max-w-xl mx-auto p-4 md:p-6 space-y-6">

          {/* ORDER CARD */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 text-center">

            <p className="text-slate-500 font-medium mb-2">

              Nomor Antrean Anda

            </p>

            <h1 className="text-6xl font-black text-brand-primary tracking-tighter mb-4">

              {orderId}

            </h1>

            {/* STEPPER */}
            <div className="relative mt-8 px-6">

              {/* LINE */}
              <div className="absolute top-6 left-[15%] right-[15%] h-1.5 bg-slate-100 -translate-y-1/2 z-0 rounded-full overflow-hidden">
                {/* ACTIVE LINE */}
                <div
                  className="absolute top-0 left-0 bottom-0 bg-brand-success transition-all duration-1000 rounded-full"
                  style={{
                    width:
                      order?.status === 'PENDING'
                        ? '0%'
                        : order?.status === 'PROCESS'
                        ? '50%'
                        : '100%'
                  }}
                ></div>
              </div>

              <div className="relative z-10 flex justify-between">

                {/* PENDING */}
                <div className="flex flex-col items-center gap-3">

                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative z-10 ${getStatusColor('PENDING')}`}>

                    <Clock className="w-5 h-5" />

                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider ${order?.status === 'PENDING' ? 'text-brand-secondary' : 'text-slate-600'}`}>

                    Diterima

                  </span>

                </div>

                {/* PROCESS */}
                <div className="flex flex-col items-center gap-3">

                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative z-10 ${getStatusColor('PROCESS')}`}>

                    <ChefHat className="w-5 h-5" />

                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider ${order?.status === 'PROCESS' ? 'text-brand-secondary' : 'text-slate-600'}`}>

                    Diproses

                  </span>

                </div>

                {/* PAID/READY (Selesai) */}
                <div className="flex flex-col items-center gap-3">

                  <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative z-10 ${getStatusColor(order?.status === 'PAID' ? 'PAID' : 'READY')}`}>

                    <CheckCircle2 className="w-6 h-6" />

                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider ${order?.status === 'READY' || order?.status === 'PAID' ? 'text-brand-success' : 'text-slate-600'}`}>

                    Selesai

                  </span>

                </div>
              </div>
            </div>

            {/* STATUS MESSAGE */}
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">

              <p className="font-bold text-slate-800">

                {order?.status === 'PENDING' &&
                  'Pesanan diterima, menunggu konfirmasi'}

                {order?.status === 'PROCESS' &&
                  'Pesanan sedang diproses'}

                {(order?.status === 'READY' || order?.status === 'PAID') &&
                  'Pesanan selesai, silakan ambil'}

              </p>

              <p className="text-xs text-slate-500 mt-1">

                {(order?.status === 'READY' || order?.status === 'PAID')
                  ? 'Silakan ambil pesanan Anda.'
                  : `Harap tunggu sebentar ya di Meja ${tableNumber}.`}

              </p>

            </div>
          </div>

          {/* RECEIPT */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">

            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">

              <Receipt className="w-5 h-5 text-brand-primary" />

              <h2 className="font-bold text-slate-800">

                Rincian Pesanan

              </h2>

            </div>

            {/* ORDER INFO */}
            <div className="space-y-4 mb-6">

              <div className="flex justify-between text-sm">

                <span className="text-slate-500">
                  Nama Pemesan
                </span>

                <span className="font-bold text-slate-800">

                  {order?.customerName || 'Tamu'}

                </span>

              </div>

              <div className="flex justify-between text-sm">

                <span className="text-slate-500">
                  No. WhatsApp
                </span>

                <span className="font-bold text-slate-800">

                  {order?.phone || '-'}

                </span>

              </div>

              <div className="flex justify-between text-sm">

                <span className="text-slate-500">
                  Metode Bayar
                </span>

                <span className="font-bold text-brand-primary">

                  {order?.payment?.method || '-'}

                </span>

              </div>

            </div>

            {/* ITEMS */}
            <div className="border-t border-dashed border-slate-200 pt-4 space-y-3">

              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {order?.items?.map((item: any, idx: number) => {
                let parsedToppings: any[] = [];
                try {
                  if (item.toppings) {
                    parsedToppings = JSON.parse(item.toppings);
                  }
                } catch (e) {
                  console.error("Error parsing toppings", e);
                }

                return (
                  <div
                    key={idx}
                    className="flex justify-between text-sm"
                  >

                    <div className="flex-1">

                      <p className="font-bold text-slate-700">

                        {item.quantity}x {item.product?.name || "Produk dihapus"}

                      </p>
                      
                      {parsedToppings.length > 0 && (
                        <div className="mt-1 space-y-0.5 pl-4">
                          {parsedToppings.map((mod: any, mIdx: number) => (
                            <p key={mIdx} className="text-xs text-slate-500">
                              - {mod.name} {mod.price > 0 ? `(+Rp ${mod.price.toLocaleString('id-ID')})` : ''}
                            </p>
                          ))}
                        </div>
                      )}

                      {item.note && (

                        <p className="text-[10px] text-slate-400 italic mt-1">

                          Catatan: {item.note}

                        </p>
                      )}

                    </div>

                    <span className="font-bold text-slate-800">

                      {formatRupiah(item.subtotal)}

                    </span>

                  </div>
                );
              })}
            </div>

            {/* TOTAL */}
            <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">

              <span className="font-bold text-slate-800">

                Total Harga

              </span>

              <span className="text-xl font-black text-brand-primary">

                {formatRupiah(order?.total || 0)}

              </span>

            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-6 px-5 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">

        <div className="max-w-xl mx-auto flex items-center justify-between">

          <div>

            <p className="text-xs text-slate-500 font-medium mb-0.5">

              Ada yang kurang?

            </p>

            <p className="font-bold text-slate-800 text-sm">

              Pesan menu tambahan

            </p>

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
import React, { useState, useEffect, useRef } from 'react';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '@/store';

import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  User,
  CheckCircle2,
  Wallet,
  QrCode,
  ShoppingBag,
  Clock
} from 'lucide-react';

import { formatRupiah } from '@/lib/utils';

import {
  setCustomerProfile,
  clearCustomerCart,
  setCustomerOrderId
} from '@/features/customer/store/customerSlice';

import api from '@/lib/api';

const CheckoutPage: React.FC = () => {

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { tenantId, tableToken } = useParams();

  const {
    items,
    tableId,
    customerName,
    customerPhone
  } = useSelector((state: RootState) => state.customer);

  const [name, setName] = useState(customerName || '');

  const [phone, setPhone] = useState(customerPhone || '');

  const [paymentMethod, setPaymentMethod] =
    useState<'QRIS' | 'CASH'>('QRIS');

  const [isProcessing, setIsProcessing] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const [error, setError] = useState('');

  // QR Payment state
  const [qrData, setQrData] = useState<{ qrImageUrl: string; expiryTime: string; orderId: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll order status + countdown timer saat QR screen ditampilkan
  useEffect(() => {
    if (!qrData) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${qrData.orderId}`);
        if (res.data.status === 'PAID') {
          clearInterval(pollingRef.current!);
          clearInterval(countdownRef.current!);
          setIsSuccess(true);
          setTimeout(() => {
            dispatch(clearCustomerCart());
            navigate(`/m/${tenantId}/${tableToken}/status/${qrData.orderId}`, { replace: true });
          }, 2500);
        }
      } catch (err) {
        console.error('Polling order status error:', err);
      }
    }, 3000);

    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrData]);

  // REDIRECT JIKA CART KOSONG
  if (items.length === 0 && !isSuccess) {

    navigate(`/m/${tenantId}/${tableToken}`);

    return null;
  }

  // HITUNG SUBTOTAL
  const subtotal = items.reduce((sum, item) => {

    const modsTotal = item.modifiers.reduce(
      (mSum, mod) => mSum + mod.price,
      0
    );

    return sum + ((item.price + modsTotal) * item.qty);

  }, 0);

  const handleBack = () => {

    navigate(`/m/${tenantId}/${tableToken}/cart`);
  };

  // HANDLE PAYMENT
  const handlePayment = async () => {

    if (!name.trim()) return;

    try {

      setIsProcessing(true);

      setError('');

      // SAVE PROFILE
      dispatch(setCustomerProfile({
        name,
        phone
      }));

      // CREATE ORDER
      const orderRes = await api.post('/orders', {
        tenantId,
        tableId: Number(tableId),
        customerName: name,
        customerPhone: phone,
        items: items.map((item) => ({
          productId: Number(
            item.id.toString().split('-')[0]
          ),
          quantity: item.qty,
          note: item.notes,
          toppings: item.modifiers && item.modifiers.length > 0 ? JSON.stringify(item.modifiers) : null
        }))
      });

      // AMBIL ORDER ID
      const orderId = orderRes.data.id;

      // SAVE ORDER ID
      dispatch(setCustomerOrderId(orderId));

      // CREATE PAYMENT
      const paymentRes = await api.post('/payments', {
        orderId,
        method: paymentMethod
      });

      if (paymentMethod === 'QRIS') {
        const { qrImageUrl, expiryTime } = paymentRes.data;
        if (!qrImageUrl) {
          throw new Error('Gagal mendapatkan QR Code dari server.');
        }

        // Hitung waktu tersisa dalam detik
        const diffSec = Math.max(0, Math.floor((new Date(expiryTime).getTime() - Date.now()) / 1000));
        setTimeLeft(diffSec);
        setQrData({ qrImageUrl, expiryTime, orderId });
        setIsProcessing(false);
      } else {
        // SUCCESS SCREEN
        setIsSuccess(true);

        // REDIRECT
        setTimeout(() => {
          // Pindahkan Clear Cart ke sini agar komponen tidak me-re-render terlalu cepat
          dispatch(clearCustomerCart());
          navigate(
            `/m/${tenantId}/${tableToken}/status/${orderId}`,
            { replace: true }
          );
        }, 2500);
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {

      console.log(err);

      setError(
        err?.response?.data?.error ||
        'Checkout gagal'
      );
      setIsProcessing(false);

    } finally {
      if (paymentMethod !== 'QRIS') {
        setIsProcessing(false);
      }
    }
  };

  // SUCCESS SCREEN
  if (isSuccess) {

    return (

      <div className="fixed inset-0 z-[999] bg-brand-success flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-500">

        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce">

          <CheckCircle2 className="w-16 h-16 text-brand-success" />

        </div>

        <h1 className="text-3xl font-black mb-2">
          Payment Successful!
        </h1>

        <p className="text-white/90 font-medium">
          Pesananmu sedang diteruskan ke dapur...
        </p>

      </div>
    );
  }

  // QR PAYMENT SCREEN
  if (qrData) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const isExpired = timeLeft <= 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-5">
        {/* Status badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white rounded-full px-4 py-1.5 text-sm font-medium mb-5 border border-white/10">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Menunggu Pembayaran QRIS
        </div>

        {/* Total amount */}
        <p className="text-white/60 text-sm mb-1">Total Tagihan</p>
        <p className="text-3xl font-black text-white mb-7">{formatRupiah(subtotal)}</p>

        {/* QR Code Card */}
        <div className="bg-white rounded-3xl p-5 shadow-2xl mb-5 w-full max-w-[280px]">
          <img
            src={qrData.qrImageUrl}
            alt="QRIS Payment Code"
            className="w-full aspect-square object-contain rounded-xl"
          />
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan dengan e-wallet apapun</span>
          </div>
        </div>

        {/* Countdown */}
        {!isExpired ? (
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <Clock className="w-4 h-4" />
            <span>
              Berlaku:{' '}
              <span className={`font-bold tabular-nums ${
                timeLeft < 60 ? 'text-red-400' : 'text-white'
              }`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </span>
          </div>
        ) : (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 text-sm rounded-xl px-4 py-2.5 mb-4 font-medium text-center">
            QR Code telah kadaluarsa. Silakan buat pesanan baru.
          </div>
        )}

        {/* Supported wallets */}
        <p className="text-white/40 text-xs text-center mb-8 leading-relaxed">
          GoPay · Dana · OVO · ShopeePay · LinkAja<br />dan semua aplikasi yang mendukung QRIS
        </p>

        {/* Back to menu */}
        <button
          onClick={() => navigate(`/m/${tenantId}/${tableToken}`)}
          className="text-white/40 hover:text-white/70 text-sm transition underline underline-offset-2"
        >
          Kembali ke Menu
        </button>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-brand-background flex flex-col h-screen overflow-hidden">

      {/* HEADER */}
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm z-10 shrink-0 border-b border-slate-200">

        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-800 transition"
        >

          <ArrowLeft className="w-6 h-6" />

        </button>

        <h1 className="text-xl font-bold text-slate-800">
          Pembayaran
        </h1>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto pb-32">

        <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6">

          {/* FORM */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">

            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">

              <User className="w-5 h-5 text-brand-primary" />

              Informasi Pemesan

            </h2>

            <div className="space-y-4">

              {/* NAME */}
              <div>

                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">

                  Nama Lengkap
                  <span className="text-red-500">*</span>

                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                />
              </div>

              {/* PHONE */}
              <div>

                <label className="text-xs font-bold text-slate-600 mb-1.5 ml-1 flex justify-between">

                  <span>Nomor WhatsApp</span>

                  <span className="text-slate-400 font-normal">
                    Opsional
                  </span>

                </label>

                <div className="relative">

                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">

                    +62

                  </span>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {

                      const val = e.target.value.replace(/\D/g, '');

                      setPhone(val);
                    }}
                    placeholder="8123456..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pr-3 pl-11 text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                  />

                </div>

              </div>
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">

            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">

              <Wallet className="w-5 h-5 text-brand-primary" />

              Metode Pembayaran

            </h2>

            <div className="space-y-3">

              {/* QRIS */}
              <label
                onClick={() => setPaymentMethod('QRIS')}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'QRIS'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'QRIS'
                    ? 'border-brand-primary bg-brand-primary'
                    : 'border-slate-300 bg-white'
                }`}>

                  {paymentMethod === 'QRIS' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}

                </div>

                <div className="flex-1">

                  <h3 className="font-bold text-slate-800 text-sm">
                    QRIS
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Scan QRIS
                  </p>

                </div>

                <QrCode className="w-6 h-6" />

              </label>

              {/* CASH */}
              <label
                onClick={() => setPaymentMethod('CASH')}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CASH'
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'CASH'
                    ? 'border-brand-primary bg-brand-primary'
                    : 'border-slate-300 bg-white'
                }`}>

                  {paymentMethod === 'CASH' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}

                </div>

                <div className="flex-1">

                  <h3 className="font-bold text-slate-800 text-sm">
                    Bayar di Kasir
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Bayar langsung
                  </p>

                </div>

                <Wallet className="w-6 h-6" />

              </label>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bg-white border-t border-slate-200 p-4 pb-6 px-5 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">

        <div className="max-w-2xl mx-auto">

          {/* ERROR */}
          {error && (

            <p className="text-red-500 text-sm mb-3">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-slate-500 font-medium mb-0.5">

                Total Tagihan

              </p>

              <p className="text-xl font-black text-brand-primary leading-none">

                {formatRupiah(subtotal)}

              </p>

            </div>

            <button
              onClick={handlePayment}
              disabled={!name.trim() || isProcessing}
              className={`font-bold py-3.5 px-8 rounded-xl transition shadow-md flex items-center justify-center gap-2 ${
                !name.trim() || isProcessing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-brand-success text-white hover:bg-green-600 active:scale-95'
              }`}
            >

              {isProcessing ? (

                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>

              ) : (

                <>
                  <ShoppingBag className="w-5 h-5" />
                  Buat Pesanan
                </>
              )}

            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
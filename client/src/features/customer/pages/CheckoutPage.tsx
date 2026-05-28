import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, CheckCircle2, Wallet, QrCode, ShoppingBag } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { setCustomerProfile, clearCustomerCart, setCustomerOrderId } from '@/features/customer/store/customerSlice';
import { addOrder } from '@/features/merchant/orders/orderSlice';
import { OrderItem } from '@/types';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tenantId, tableId } = useParams();
  
  const { items, customerName, customerPhone } = useSelector((state: RootState) => state.customer);
  
  const [name, setName] = useState(customerName || '');
  const [phone, setPhone] = useState(customerPhone || '');
  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'CASH'>('QRIS');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Jika tidak ada item, lempar kembali ke menu
  if (items.length === 0 && !isSuccess) {
    navigate(`/m/${tenantId}/${tableId}`);
    return null;
  }

  const subtotal = items.reduce((sum, item) => {
    const modsTotal = item.modifiers.reduce((mSum, mod) => mSum + mod.price, 0);
    return sum + ((item.price + modsTotal) * item.qty);
  }, 0);

  const handleBack = () => {
    navigate(`/m/${tenantId}/${tableId}/cart`);
  };

  const handlePayment = () => {
    if (!name.trim()) return; // Validasi nama

    setIsProcessing(true);

    // Simulasi proses pembayaran/order
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Simpan profil sesaat sebelum pindah halaman agar efisien
      dispatch(setCustomerProfile({ name, phone }));
      
      // Generate dummy Order ID
      const orderId = `M${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`;
      dispatch(setCustomerOrderId(orderId));

      // Bikin format items yang cocok dengan merchant (OrderItem)
      const orderItems: OrderItem[] = items.map((item, index) => ({
        id: `oi-${Date.now()}-${index}`,
        orderId: orderId,
        productId: item.id.split('-')[0], // Hapus unique suffix jika ada
        productName: item.name,
        categoryId: item.categoryId || "cat-1", // Fallback
        quantity: item.qty,
        priceAtOrder: item.price,
        notes: item.notes,
        modifiers: item.modifiers.map(m => ({
          groupId: m.groupId,
          groupName: m.groupName,
          modifierId: m.modifierId,
          modifierName: m.modifierName,
          price: m.price
        }))
      }));

      // Tembak ke Mock Merchant Orders
      dispatch(addOrder({
        id: orderId,
        tenantId: tenantId || "tenant-001",
        tableId: tableId || "1",
        customerName: `Meja ${tableId?.replace(/\D/g, '') || 'X'} (${name})`,
        status: "PENDING",
        paymentMethod: paymentMethod === "CASH" ? "UNPAID" : "QRIS",
        totalAmount: subtotal,
        createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        items: orderItems
      }));
      
      // Simulasi pindah ke halaman status setelah 1.5 detik
      setTimeout(() => {
        dispatch(clearCustomerCart()); // Kosongkan keranjang setelah order dibuat
        navigate(`/m/${tenantId}/${tableId}/status/${orderId}`, { replace: true });
      }, 1500);

    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-brand-success flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-brand-success" />
        </div>
        <h1 className="text-3xl font-black mb-2">Payment Successful!</h1>
        <p className="text-white/90 font-medium">Pesananmu sedang diteruskan ke dapur...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 shadow-sm z-10 shrink-0 border-b border-slate-200">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-800 transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">Pembayaran</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="w-full max-w-2xl mx-auto p-4 md:p-6 space-y-6">
          
          {/* Identitas Form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-primary" />
              Informasi Pemesan
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 ml-1 flex justify-between">
                  <span>Nomor WhatsApp</span>
                  <span className="text-slate-400 font-normal">Opsional</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">+62</span>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => {
                      // Validasi: Hanya izinkan angka (numeric)
                      const val = e.target.value.replace(/\D/g, '');
                      setPhone(val);
                    }}
                    placeholder="8123456..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pr-3 pl-11 text-sm focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Digunakan jika kasir perlu menghubungi Anda terkait pesanan.</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-brand-primary" />
              Metode Pembayaran
            </h2>
            
            <div className="space-y-3">
              <label 
                onClick={() => setPaymentMethod('QRIS')}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'QRIS' ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'QRIS' ? 'border-brand-primary bg-brand-primary' : 'border-slate-300 bg-white'
                }`}>
                  {paymentMethod === 'QRIS' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm">QRIS (Bayar Langsung)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Scan pakai Gopay, OVO, Dana, M-Banking</p>
                </div>
                <QrCode className={`w-6 h-6 ${paymentMethod === 'QRIS' ? 'text-brand-primary' : 'text-slate-400'}`} />
              </label>

              <label 
                onClick={() => setPaymentMethod('CASH')}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'CASH' ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentMethod === 'CASH' ? 'border-brand-primary bg-brand-primary' : 'border-slate-300 bg-white'
                }`}>
                  {paymentMethod === 'CASH' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm">Bayar di Kasir</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Pesan sekarang, bayar pakai uang tunai</p>
                </div>
                <Wallet className={`w-6 h-6 ${paymentMethod === 'CASH' ? 'text-brand-primary' : 'text-slate-400'}`} />
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="bg-white border-t border-slate-200 p-4 pb-6 px-5 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-0.5">Total Tagihan</p>
            <p className="text-xl font-black text-brand-primary leading-none">{formatRupiah(subtotal)}</p>
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
  );
};

export default CheckoutPage;
import React, { useState } from 'react';
import { Search, X, Clock, ChevronRight, Receipt } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useNavigate, useParams } from 'react-router-dom';
import { formatRupiah } from '@/lib/utils';

interface CheckOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckOrderModal: React.FC<CheckOrderModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { tenantId, tableId } = useParams();
  
  // Ambil semua order dari Redux (Di sistem nyata ini diambil dari API berdasarkan history device/user)
  // Untuk prototipe ini, kita filter order yang berasal dari tenant dan meja ini (atau berdasarkan customerName)
  const allOrders = useSelector((state: RootState) => state.orders.items);
  const { customerName } = useSelector((state: RootState) => state.customer);
  
  const [searchCode, setSearchCode] = useState('');

  // Filter order historis milik pengguna ini (simulasi)
  const myOrders = allOrders.filter(o => 
    o.tenantId === tenantId && 
    (o.customerName?.includes(customerName) || o.tableId === tableId)
  ).slice(0, 5); // Ambil 5 terakhir

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    
    // Cari order berdasarkan ID
    const foundOrder = allOrders.find(o => o.id.toLowerCase() === searchCode.toLowerCase().trim());
    if (foundOrder) {
      onClose();
      navigate(`/m/${tenantId}/${tableId}/status/${foundOrder.id}`);
    } else {
      alert(`Pesanan dengan kode "${searchCode}" tidak ditemukan.`);
    }
  };

  const goToStatus = (orderId: string) => {
    onClose();
    navigate(`/m/${tenantId}/${tableId}/status/${orderId}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[190] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Modal Bottom Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-[200] bg-brand-background rounded-t-3xl flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle Garis Oren */}
        <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing bg-white rounded-t-3xl" onClick={onClose}>
          <div className="w-16 h-1.5 bg-slate-300 rounded-full"></div>
        </div>

        <div className="bg-white px-5 pb-5 rounded-b-3xl shadow-sm relative">
          <button 
            onClick={onClose}
            className="absolute top-0 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <h2 className="text-xl font-black text-brand-primary mb-1">Cek Pesanan</h2>
          <p className="text-sm text-slate-500 mb-5">Lacak status makananmu sekarang.</p>

          {/* Form Pencarian Kode */}
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Masukkan Kode Pesanan (Contoh: M0120)" 
              className="w-full py-3 pl-4 pr-12 rounded-xl border-2 border-slate-200 text-slate-800 text-sm font-bold focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all uppercase"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-primary p-2 rounded-lg text-white hover:bg-brand-primaryHover transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Historis Pesanan */}
        <div className="flex-1 overflow-y-auto p-5 pb-10">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-secondary" />
            Pesanan Terakhir Kamu
          </h3>

          {myOrders.length > 0 ? (
            <div className="space-y-3">
              {myOrders.map(order => (
                <div 
                  key={order.id}
                  onClick={() => goToStatus(order.id)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="w-12 h-12 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800">{order.id}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        order.status === 'READY' ? 'bg-brand-success/10 text-brand-success' : 
                        order.status === 'PROCESS' ? 'bg-blue-100 text-blue-600' : 'bg-brand-secondary/10 text-brand-secondary'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{order.items.length} item • {order.createdAt}</p>
                    <p className="text-sm font-bold text-brand-primary">{formatRupiah(order.totalAmount)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 font-medium text-sm">Belum ada historis pesanan.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default CheckOrderModal;
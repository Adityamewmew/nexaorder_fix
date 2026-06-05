import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSessionInfo } from '@/features/customer/store/customerSlice';
import api from '@/lib/api';

const CustomerLayout = () => {
  const { tenantId, tableToken } = useParams<{ tenantId: string; tableToken: string }>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateTable = async () => {
      if (tenantId && tableToken) {
        try {
          const res = await api.get(`/tables/validate/${tableToken}`);
          const { id, number } = res.data;
          
          dispatch(setSessionInfo({ 
            tenantId, 
            tableId: String(id), 
            tableName: number 
          }));
        } catch (err: any) {
          setError(err.response?.data?.error || 'Meja tidak ditemukan atau tidak aktif');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('URL tidak valid');
      }
    };
    
    validateTable();
  }, [tenantId, tableToken, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <p className="text-brand-primary font-bold animate-pulse">Memuat data meja...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">!</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-background w-full">
      <div className="w-full h-full relative flex flex-col overflow-x-hidden">
        {/* Render child routes di sini */}
        <Outlet />
      </div>
    </div>
  );
};

export default CustomerLayout;

import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSessionInfo } from '@/features/customer/store/customerSlice';

const CustomerLayout = () => {
  const { tenantId, tableId } = useParams<{ tenantId: string; tableId: string }>();
  const dispatch = useDispatch();

  useEffect(() => {
    if (tenantId && tableId) {
      dispatch(setSessionInfo({ tenantId, tableId }));
    }
  }, [tenantId, tableId, dispatch]);

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

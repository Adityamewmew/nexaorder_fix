import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Store, ShieldCheck, Smartphone } from "lucide-react";

// Auth
import MerchantLogin from "@/features/merchant/MerchantLogin";
import ProtectedRoute from "@/components/ProtectedRoute";

// Platform (Superadmin)
import PlatformLayout from "@/layouts/PlatformLayout";
import PlatformLogin from "@/features/platform/PlatformLogin";
import PlatformDashboard from "@/features/platform/PlatformDashboard";
import PlatformTenants from "@/features/platform/PlatformTenants";

// Merchant Layout
import MerchantLayout from "@/layouts/MerchantLayout";

// Merchant pages (dikerjakan Ravi)
import MerchantDashboard from "@/features/merchant/MerchantDashboard";
import PointOfSale from "@/features/merchant/pos/PointOfSale";
import OrderList from "@/features/merchant/orders/OrderList";
import MenuList from "@/features/merchant/menu/MenuList";
import MenuForm from "@/features/merchant/menu/MenuForm";
import TableList from "@/features/merchant/tables/TableList";
import TableForm from "@/features/merchant/tables/TableForm";
import StaffList from "@/features/merchant/staff/StaffList";
import StaffForm from "@/features/merchant/staff/StaffForm";
import SalesReport from "@/features/merchant/reports/SalesReport";
import MerchantProfile from "@/features/merchant/profile/MerchantProfile";

// Customer (dikerjakan Aditya)
import CustomerLayout from "@/features/customer/layouts/CustomerLayout";
import MenuCatalogPage from "@/features/customer/pages/MenuCatalogPage";
import CartPage from "@/features/customer/pages/CartPage";
import CheckoutPage from "@/features/customer/pages/CheckoutPage";
import OrderStatusPage from "@/features/customer/pages/OrderStatusPage";

const MerchantIndexRedirect = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (user?.role === 'CASHIER') return <Navigate to="/merchant/pos" replace />;
  return <Navigate to="/merchant/dashboard" replace />;
};

const LandingPage = () => (
  <div className="min-h-screen bg-brand-background flex flex-col items-center justify-center text-slate-800 p-6 relative overflow-hidden">
    {/* Decorative background blobs */}
    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

    <div className="relative z-10 flex flex-col items-center max-w-2xl text-center w-full">
      <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-6">
        <Store className="w-10 h-10 text-brand-primary" />
      </div>
      
      <h1 className="text-5xl md:text-6xl font-black text-brand-primary mb-4 tracking-tight">
        Nexa<span className="text-brand-secondary">Order</span>
      </h1>
      
      <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-lg leading-relaxed font-medium">
        Platform Self-Order & POS Modern untuk UMKM. Kelola meja, pesanan, dan menu dengan lebih efisien dalam satu ekosistem.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link 
          to="/m/merchant/6b4995d9-ae4c-4c3c-aa47-eafa2c5e5344" 
          className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-success text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
        >
          <Smartphone className="w-5 h-5" />
          Demo Pelanggan
        </Link>

        <Link 
          to="/merchant/login" 
          className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-secondary text-white rounded-xl font-bold hover:bg-brand-secondaryHover transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
        >
          <Store className="w-5 h-5" />
          Portal Merchant
        </Link>

        <Link 
          to="/platform/login" 
          className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:border-brand-primary hover:text-brand-primary transition-all shadow-sm hover:shadow-md hover:-translate-y-1"
        >
          <ShieldCheck className="w-5 h-5" />
          Superadmin
        </Link>
      </div>
      
      <p className="mt-16 text-sm text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} Nexa Order. All rights reserved.
      </p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        {/* Home */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/platform/login" element={<PlatformLogin />} />
        <Route path="/merchant/login" element={<MerchantLogin />} />

        {/* Platform (Superadmin) */}
        <Route path="/platform" element={
          <ProtectedRoute allowedRoles={['SUPERADMIN']}><PlatformLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="/platform/dashboard" replace />} />
          <Route path="dashboard" element={<PlatformDashboard />} />
          <Route path="tenants" element={<PlatformTenants />} />
        </Route>

        {/* Merchant (Admin & Kasir) */}
        <Route path="/merchant" element={
          <ProtectedRoute allowedRoles={['MERCHANT_ADMIN', 'CASHIER']}><MerchantLayout /></ProtectedRoute>
        }>
          <Route index element={<MerchantIndexRedirect />} />
          <Route path="dashboard" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN']}><MerchantDashboard /></ProtectedRoute>
          } />
          <Route path="menu" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN', 'CASHIER']}><MenuList /></ProtectedRoute>
          } />
          <Route path="menu/add" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN']}><MenuForm /></ProtectedRoute>
          } />
          <Route path="menu/edit/:id" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN']}><MenuForm /></ProtectedRoute>
          } />
          <Route path="tables" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN']}><TableList /></ProtectedRoute>
          } />
          <Route path="tables/add" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN']}><TableForm /></ProtectedRoute>
          } />
          <Route path="staff" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN']}><StaffList /></ProtectedRoute>
          } />
          <Route path="staff/add" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN']}><StaffForm /></ProtectedRoute>
          } />
          <Route path="pos" element={
            <ProtectedRoute allowedRoles={['CASHIER']}><PointOfSale /></ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN', 'CASHIER']}><OrderList /></ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN', 'CASHIER']}><SalesReport /></ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute allowedRoles={['MERCHANT_ADMIN', 'CASHIER']}><MerchantProfile /></ProtectedRoute>
          } />
        </Route>

        {/* Customer (QR Code) — tugas Aditya */}
        <Route path="/m/:tenantId/:tableToken" element={<CustomerLayout />}>
          <Route index element={<MenuCatalogPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="status/:orderId" element={<OrderStatusPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard, ClipboardList, Package,
  RectangleHorizontal, Users, BarChart3,
  LogOut, Menu, X, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/features/auth/authSlice";
import { RootState } from "@/store";
import ConfirmModal from "@/components/ui/ConfirmModal";
import api from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

export default function MerchantLayout() {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const prevPendingCount = useRef(pendingOrdersCount);

  // Play a dynamic sound alarm using Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playNote = (freq: number, duration: number, delay: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };
      playNote(880, 0.15, 0);       // Double-beep
      playNote(880, 0.15, 0.2);
    } catch (e) {
      console.error("Web Audio API not supported or blocked", e);
    }
  };

  // Fetch pending orders count and set up SSE connection
  useEffect(() => {
    const token = localStorage.getItem('nexa_token');
    if (!token) return;

    const fetchPendingOrders = async () => {
      try {
        const res = await api.get('/orders?status=PENDING');
        setPendingOrdersCount(res.data.length);
        prevPendingCount.current = res.data.length;
      } catch (err) {
        console.error("Gagal memuat jumlah antrian pesanan", err);
      }
    };

    fetchPendingOrders();

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const sseUrl = `${baseUrl}/sse?token=${token}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.event === 'new-order') {
          playBeep();

          const order = payload.data;
          const detailMsg = order.table
            ? `Pesanan baru #${order.id} dari Meja ${order.table.number}`
            : `Pesanan baru #${order.id} (Takeaway)`;
          showToast(detailMsg, 'success');

          setPendingOrdersCount(prev => prev + 1);
        } else if (payload.event === 'order-updated') {
          fetchPendingOrders();

          const order = payload.data;
          if (order && order.status === 'PAID') {
            playBeep();
            showToast(`Pesanan #${order.id} telah dibayar!`, 'success');
          } else if (order && order.status === 'CANCELLED') {
            showToast(`Pesanan #${order.id} telah dibatalkan!`, 'warning');
          }
        }
      } catch (err) {
        console.error("Error parsing SSE message in MerchantLayout:", err);
      }
    };

    // Do NOT call eventSource.close() here — browser will auto-retry connection
    eventSource.onerror = () => {
      console.warn("SSE connection lost in MerchantLayout. Browser will auto-retry...");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Menu Khusus Merchant Admin
  const adminMenu = [
    { name: "Dashboard", path: "/merchant/dashboard", icon: LayoutDashboard },
    { name: "Manajemen Menu", path: "/merchant/menu", icon: Package },
    { name: "Manajemen Meja", path: "/merchant/tables", icon: RectangleHorizontal },
    { name: "Antrian Pesanan", path: "/merchant/orders", icon: ClipboardList },
    { name: "Akun Kasir", path: "/merchant/staff", icon: Users },
    { name: "Laporan Penjualan", path: "/merchant/reports", icon: BarChart3 },
  ];

  // Menu Khusus Kasir (Sesuai Figma)
  const cashierMenu = [
    { name: "Dashboard", path: "/merchant/pos", icon: LayoutDashboard },
    { name: "Kelola Stok Menu", path: "/merchant/menu", icon: Package },
    { name: "Laporan Penjualan", path: "/merchant/reports", icon: BarChart3 },
    { name: "Pesanan", path: "/merchant/orders", icon: ClipboardList },
  ];

  // Filter menu berdasarkan role
  const navItems = user?.role === 'MERCHANT_ADMIN' ? adminMenu : cashierMenu;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/merchant/login");
  };

  const openLogoutModal = () => {
    setShowProfileDropdown(false);
    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const renderSidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <img src="/apple-touch-icon.png" alt="Nexa Order Logo" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-sm shrink-0" />
        <span className="font-bold text-xl tracking-wide truncate">MERCHANT</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-white/50 mb-4 px-2 uppercase tracking-wider">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          const isOrderMenu = item.path === "/merchant/orders";

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-white text-brand-primary font-semibold shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>

              {/* Badge Notifikasi Pesanan Baru */}
              {isOrderMenu && pendingOrdersCount > 0 && (
                <span className={cn(
                  "text-[10px] font-black px-2 py-0.5 rounded-full",
                  isActive ? "bg-red-500 text-white" : "bg-red-500 text-white animate-pulse"
                )}>
                  {pendingOrdersCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Block */}
      <div className="p-4 mt-auto border-t border-white/10 relative">

        {/* Transparent Overlay for click outside */}
        {showProfileDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileDropdown(false)}
          />
        )}

        {/* Dropdown Menu */}
        {showProfileDropdown && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-lg py-2 border border-slate-100 z-50 animate-in fade-in slide-in-from-bottom-2">
            <Link
              to="/merchant/profile"
              onClick={() => {
                setShowProfileDropdown(false);
                if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-primary transition-colors"
            >
              <User className="w-4 h-4" />
              Pengaturan Profil
            </Link>
            <button
              onClick={openLogoutModal}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Keluar / Logout
            </button>
          </div>
        )}

        <button
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-full bg-brand-secondary text-white flex items-center justify-center font-bold shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-white font-bold text-sm truncate">{user?.name || "User"}</p>
            <p className="text-brand-secondary text-xs font-semibold truncate">{user?.role === 'MERCHANT_ADMIN' ? 'Admin' : 'Kasir'}</p>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-brand-background overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 bg-brand-gradient text-white flex-col shadow-xl z-20">
        {renderSidebarContent()}
      </aside>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-brand-gradient text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="absolute top-4 right-4">
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/80 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>
        {renderSidebarContent()}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between md:justify-start px-4 md:px-8 shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 hidden md:block">
              {navItems.find((i) => location.pathname.includes(i.path))?.name || "Merchant Portal"}
            </h2>
          </div>

          {/* Logo khusus mobile */}
          <div className="md:hidden font-bold text-brand-primary flex items-center gap-2">
            <img src="/apple-touch-icon.png" alt="Nexa Order Logo" className="w-6 h-6 rounded-md object-contain bg-white p-0.5" />
            NEXA ORDER
          </div>
        </header>

        {/* Dynamic Content (Outlet) */}
        <div className="flex-1 overflow-auto bg-brand-background">
          <Outlet />
        </div>
      </main>

      {/* Modal Logout */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Yakin ingin logout?"
        description="Sesi akan berakhir dan Anda harus login kembali untuk mengakses sistem."
        confirmText="Logout"
        cancelText="Batal"
        icon={<LogOut className="w-8 h-8" />}
        variant="danger"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
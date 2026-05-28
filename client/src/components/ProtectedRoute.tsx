import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Role } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Jika belum login, arahkan ke halaman login yang sesuai
  if (!isAuthenticated || !user) {
    // Jika mencoba akses /platform, arahkan ke login platform
    if (location.pathname.startsWith('/platform')) {
      return <Navigate to="/platform/login" replace state={{ from: location }} />;
    }
    // Jika mencoba akses /merchant, arahkan ke login merchant
    if (location.pathname.startsWith('/merchant')) {
      return <Navigate to="/merchant/login" replace state={{ from: location }} />;
    }
    // Default fallback
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Jika sudah login tapi role tidak sesuai (misal: Kasir mencoba buka Platform Admin)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4 text-center">
        <h1 className="text-6xl font-bold text-[#0B3B60] mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-2">Akses Ditolak</h2>
        <p className="text-slate-500 max-w-md">
          Akun Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

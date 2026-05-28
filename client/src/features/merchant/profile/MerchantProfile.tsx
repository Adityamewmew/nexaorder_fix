import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Store, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import StoreProfileForm from "./components/StoreProfileForm";
import SecurityProfileForm from "./components/SecurityProfileForm";

export default function MerchantProfile() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'MERCHANT_ADMIN' || user?.role === 'SUPERADMIN';
  
  const [activeTab, setActiveTab] = useState<"store" | "security">(isAdmin ? "store" : "security");

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-24">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary">Pengaturan Profil</h1>
        <p className="text-slate-500 mt-1">
          {isAdmin ? "Kelola informasi toko dan keamanan akun Anda" : "Kelola keamanan akun kasir Anda"}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-8">
        {isAdmin && (
          <button
            onClick={() => setActiveTab("store")}
            className={cn(
              "px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2",
              activeTab === "store" ? "border-brand-primary text-brand-primary" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            <Store className="w-4 h-4" />
            Profil Toko
          </button>
        )}
        <button
          onClick={() => setActiveTab("security")}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2",
            activeTab === "security" ? "border-brand-primary text-brand-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          Keamanan Akun
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "store" && isAdmin && <StoreProfileForm />}
      {activeTab === "security" && <SecurityProfileForm />}

    </div>
  );
}

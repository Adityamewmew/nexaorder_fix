import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import MenuBasicInfo from "./components/MenuBasicInfo";
import MenuAddonsBuilder from "./components/MenuAddonsBuilder";
import { useToast } from "@/contexts/ToastContext";

export default function MenuForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Tab State: Memisahkan Info Dasar dan Add-on
  const [activeTab, setActiveTab] = useState<"basic" | "addons">("basic");

  // Form State (Info Dasar)
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "cat-1",
    price: "",
    stock: "",
    description: "",
    isAvailable: true,
    imageUrl: "",
  });

  // Form State (Add-ons / Modifier Groups)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);

  // --- Handlers Info Dasar ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleAvailability = () => {
    setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }));
  };

  // --- Handlers Add-on Builder ---
  const handleAddGroup = () => {
    setModifierGroups([...modifierGroups, {
      id: Date.now().toString(), // ID sementara
      groupName: "",
      isRequired: false,
      minSelections: 0,
      maxSelections: 1,
      modifiers: [{ id: Date.now().toString() + '-mod', modifierName: "", price: 0 }]
    }]);
  };

  const handleRemoveGroup = (index: number) => {
    setModifierGroups(prev => prev.filter((_, i) => i !== index));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateGroup = (index: number, field: string, value: any) => {
    setModifierGroups(prev => {
      const newGroups = [...prev];
      newGroups[index] = { ...newGroups[index], [field]: value };
      
      // Auto-adjust min/max based on isRequired toggle
      if (field === 'isRequired') {
        newGroups[index].minSelections = value ? 1 : 0;
      }
      return newGroups;
    });
  };

  const handleAddModifier = (groupIndex: number) => {
    setModifierGroups(prev => {
      const newGroups = [...prev];
      // Clone array modifiers sebelum di-push
      const newModifiers = [...newGroups[groupIndex].modifiers];
      newModifiers.push({ id: Date.now().toString() + Math.random(), modifierName: "", price: 0 });
      newGroups[groupIndex] = { ...newGroups[groupIndex], modifiers: newModifiers };
      return newGroups;
    });
  };

  const handleRemoveModifier = (groupIndex: number, modifierIndex: number) => {
    setModifierGroups(prev => {
      const newGroups = [...prev];
      // Clone dan filter array modifiers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newModifiers = newGroups[groupIndex].modifiers.filter((_: any, i: number) => i !== modifierIndex);
      newGroups[groupIndex] = { ...newGroups[groupIndex], modifiers: newModifiers };
      return newGroups;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateModifier = (groupIndex: number, modifierIndex: number, field: string, value: any) => {
    setModifierGroups(prev => {
      const newGroups = [...prev];
      // Kita harus menduplikasi array modifiers juga agar reference-nya berubah (immutable update)
      const newModifiers = [...newGroups[groupIndex].modifiers];
      newModifiers[modifierIndex] = { ...newModifiers[modifierIndex], [field]: value };
      newGroups[groupIndex] = { ...newGroups[groupIndex], modifiers: newModifiers };
      return newGroups;
    });
  };

  const handleSave = () => {
    // Validasi
    if (!formData.name.trim() || !formData.price || !formData.stock) {
      showToast("Harap isi semua kolom wajib (Nama, Harga, Stok)!", "error");
      setActiveTab("basic");
      return;
    }
    
    // Validasi nama duplikat (Mock)
    if (formData.name.trim().toLowerCase() === "nasi goreng") {
      showToast("Nama menu sudah digunakan. Harap gunakan nama lain.", "error");
      setActiveTab("basic");
      return;
    }

    // Simulasi Save data (menggabungkan formData dan modifierGroups)
    console.log("Menyimpan Data:", { ...formData, modifierGroups });
    showToast("Menu berhasil ditambahkan!", "success");
    navigate("/merchant/menu");
  };

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-24">
      
      {/* Tombol Kembali */}
      <button 
        onClick={() => navigate("/merchant/menu")}
        className="flex items-center gap-2 text-slate-800 font-bold hover:text-brand-primary transition-colors w-fit mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Kelola Menu
      </button>

      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary">Tambah Menu</h1>
        <p className="text-slate-500 mt-1">Tambahkan menu baru di halaman ini</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab("basic")}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-colors",
            activeTab === "basic" ? "border-brand-primary text-brand-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          1. Informasi Dasar
        </button>
        <button
          onClick={() => setActiveTab("addons")}
          className={cn(
            "px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2",
            activeTab === "addons" ? "border-brand-primary text-brand-primary" : "border-transparent text-slate-400 hover:text-slate-600"
          )}
        >
          2. Kustomisasi (Add-on)
          {modifierGroups.length > 0 && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              activeTab === "addons" ? "bg-brand-primary/10 text-brand-primary" : "bg-slate-100 text-slate-500"
            )}>
              {modifierGroups.length}
            </span>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: INFORMASI DASAR                                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "basic" && (
        <MenuBasicInfo 
          formData={formData}
          handleInputChange={handleInputChange}
          handleToggleAvailability={handleToggleAvailability}
          onNext={() => setActiveTab("addons")}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: KUSTOMISASI (ADD-ONS) BUILDER                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "addons" && (
        <MenuAddonsBuilder 
          modifierGroups={modifierGroups}
          handleAddGroup={handleAddGroup}
          handleRemoveGroup={handleRemoveGroup}
          handleUpdateGroup={handleUpdateGroup}
          handleAddModifier={handleAddModifier}
          handleRemoveModifier={handleRemoveModifier}
          handleUpdateModifier={handleUpdateModifier}
          onBack={() => setActiveTab("basic")}
          onSave={handleSave}
        />
      )}

    </div>
  );
}
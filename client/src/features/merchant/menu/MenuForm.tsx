import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import MenuBasicInfo from "./components/MenuBasicInfo";
import MenuAddonsBuilder from "./components/MenuAddonsBuilder";
import { useToast } from "@/contexts/ToastContext";
import api from "@/lib/api";

export default function MenuForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // ada id = edit mode
  const { showToast } = useToast();
  const isEditMode = Boolean(id);

  const [activeTab, setActiveTab] = useState<"basic" | "addons">("basic");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    stock: "",
    description: "",
    isAvailable: true,
    imageUrl: "",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);

  // Fetch categories
  useEffect(() => {
    api.get("/categories").then(res => {
      const cats = res.data.map((c: { id: number; name: string }) => ({ id: String(c.id), name: c.name }));
      setCategories(cats);
      if (cats.length > 0 && !isEditMode) {
        setFormData(prev => ({ ...prev, categoryId: cats[0].id }));
      }
    });
  }, []);

  // Fetch existing product if edit mode
  useEffect(() => {
    if (!isEditMode || !id) return;
    api.get(`/products/${id}`).then(res => {
      const p = res.data;
      setFormData({
        name: p.name || "",
        categoryId: String(p.categoryId) || "",
        price: String(p.price) || "",
        stock: String(p.stock) || "",
        description: p.description || "",
        isAvailable: p.status === "tersedia",
        imageUrl: p.image || "",
      });
    }).catch(() => {
      showToast("Gagal memuat data menu", "error");
      navigate("/merchant/menu");
    });
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleAvailability = () => {
    setFormData(prev => ({ ...prev, isAvailable: !prev.isAvailable }));
  };

  const handleAddGroup = () => {
    setModifierGroups([...modifierGroups, {
      id: Date.now().toString(),
      groupName: "",
      isRequired: false,
      minSelections: 0,
      maxSelections: 1,
      modifiers: [{ id: Date.now().toString() + "-mod", modifierName: "", price: 0 }]
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
      if (field === "isRequired") newGroups[index].minSelections = value ? 1 : 0;
      return newGroups;
    });
  };

  const handleAddModifier = (groupIndex: number) => {
    setModifierGroups(prev => {
      const newGroups = [...prev];
      const newModifiers = [...newGroups[groupIndex].modifiers];
      newModifiers.push({ id: Date.now().toString() + Math.random(), modifierName: "", price: 0 });
      newGroups[groupIndex] = { ...newGroups[groupIndex], modifiers: newModifiers };
      return newGroups;
    });
  };

  const handleRemoveModifier = (groupIndex: number, modifierIndex: number) => {
    setModifierGroups(prev => {
      const newGroups = [...prev];
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
      const newModifiers = [...newGroups[groupIndex].modifiers];
      newModifiers[modifierIndex] = { ...newModifiers[modifierIndex], [field]: value };
      newGroups[groupIndex] = { ...newGroups[groupIndex], modifiers: newModifiers };
      return newGroups;
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price || !formData.stock) {
      showToast("Harap isi semua kolom wajib (Nama, Harga, Stok)!", "error");
      setActiveTab("basic");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        price: parseInt(formData.price),
        stock: parseInt(formData.stock),
        description: formData.description || null,
        image: formData.imageUrl || null,
        categoryId: parseInt(formData.categoryId),
        status: formData.isAvailable ? "tersedia" : "habis",
      };

      if (isEditMode) {
        await api.put(`/products/${id}`, payload);
        showToast("Menu berhasil diperbarui!", "success");
      } else {
        await api.post("/products", payload);
        showToast("Menu berhasil ditambahkan!", "success");
      }
      navigate("/merchant/menu");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      showToast(error.response?.data?.error || "Gagal menyimpan menu", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto min-h-[calc(100vh-64px)] flex flex-col pb-24">
      <button
        onClick={() => navigate("/merchant/menu")}
        className="flex items-center gap-2 text-slate-800 font-bold hover:text-brand-primary transition-colors w-fit mb-6"
      >
        <ChevronLeft className="w-5 h-5" />
        Kelola Menu
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-primary">
          {isEditMode ? "Edit Menu" : "Tambah Menu"}
        </h1>
        <p className="text-slate-500 mt-1">
          {isEditMode ? "Ubah informasi menu di halaman ini" : "Tambahkan menu baru di halaman ini"}
        </p>
      </div>

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

      {activeTab === "basic" && (
        <MenuBasicInfo
          formData={formData}
          categories={categories}
          handleInputChange={handleInputChange}
          handleToggleAvailability={handleToggleAvailability}
          onNext={() => setActiveTab("addons")}
        />
      )}

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
          isSaving={loading}
        />
      )}
    </div>
  );
}

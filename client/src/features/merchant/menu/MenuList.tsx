import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { RootState } from "@/store";
import { Product } from "@/types";
import MenuSummaryCards from "./components/MenuSummaryCards";
import MenuFilterBar from "./components/MenuFilterBar";
import MenuGrid from "./components/MenuGrid";
import UnsavedChangesBar from "./components/UnsavedChangesBar";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/contexts/ToastContext";
import api from "@/lib/api";

interface ApiProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  image: string | null;
  status: string;
  categoryId: number;
  category: { id: number; name: string };
}

interface ApiCategory {
  id: number;
  name: string;
}

// Adapter: convert API product to frontend Product type
function toProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    tenantId: "",
    categoryId: String(p.categoryId),
    name: p.name,
    description: p.description || "",
    price: p.price,
    stock: p.stock,
    imageUrl: p.image || "",
    isAvailable: p.status === "tersedia" && p.stock > 0,
  };
}

export default function MenuList() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "MERCHANT_ADMIN" || user?.role === "SUPERADMIN";
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [savingStock, setSavingStock] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        const mapped = prodRes.data.map(toProduct);
        setProducts(mapped);
        setOriginalProducts(mapped);
        setApiCategories(catRes.data);
      } catch {
        showToast("Gagal memuat data menu", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [products, originalProducts]);

  const categories = [
    { id: "all", name: "Semua Kategori" },
    ...apiCategories.map(c => ({ id: String(c.id), name: c.name })),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === "all") return matchesSearch;
    return matchesSearch && product.categoryId === activeCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return apiCategories.find(c => String(c.id) === categoryId)?.name || "Unknown";
  };

  const hasUnsavedChanges = JSON.stringify(products.map(p => ({ id: p.id, stock: p.stock }))) !==
    JSON.stringify(originalProducts.map(p => ({ id: p.id, stock: p.stock })));

  const handleUpdateStock = (productId: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock, isAvailable: newStock > 0 };
      }
      return p;
    }));
  };

  const handleSaveChanges = async () => {
    setSavingStock(true);
    try {
      const changed = products.filter(p => {
        const orig = originalProducts.find(o => o.id === p.id);
        return orig && orig.stock !== p.stock;
      });
      await Promise.all(
        changed.map(p =>
          api.patch(`/products/${p.id}/stock`, {
            stock: p.stock,
            status: p.stock > 0 ? "tersedia" : "habis",
          })
        )
      );
      setOriginalProducts(products);
      showToast("Perubahan stok berhasil disimpan!", "success");
    } catch {
      showToast("Gagal menyimpan stok", "error");
    } finally {
      setSavingStock(false);
    }
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete}`);
      const newProducts = products.filter(p => p.id !== productToDelete);
      setProducts(newProducts);
      setOriginalProducts(newProducts);
      showToast("Menu berhasil dihapus", "success");
    } catch {
      showToast("Gagal menghapus menu", "error");
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const stats = {
    total: products.length,
    tersedia: products.filter(p => p.stock > 5).length,
    hampirHabis: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    habis: products.filter(p => p.stock === 0).length,
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <p className="text-slate-400">Memuat data menu...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] flex flex-col relative pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Kelola Menu</h1>
          <p className="text-slate-500 mt-1">Pantau dan kelola seluruh menu di halaman ini</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate("/merchant/menu/add")}
            className="bg-brand-secondary hover:bg-brand-secondaryHover text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tambah Menu
          </button>
        )}
      </div>

      <MenuFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <MenuSummaryCards stats={stats} />

      <MenuGrid
        products={filteredProducts}
        isAdmin={isAdmin}
        handleUpdateStock={handleUpdateStock}
        getCategoryName={getCategoryName}
        onDelete={confirmDelete}
      />

      <UnsavedChangesBar
        hasUnsavedChanges={hasUnsavedChanges}
        onRevert={() => setProducts(originalProducts)}
        onSave={handleSaveChanges}
        isSaving={savingStock}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Hapus Menu"
        description="Apakah Anda yakin ingin menghapus menu ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus"
        cancelText="Batal"
        icon={<Trash2 className="w-8 h-8" />}
        variant="danger"
        onConfirm={handleDeleteProduct}
        onCancel={() => { setDeleteModalOpen(false); setProductToDelete(null); }}
      />
    </div>
  );
}

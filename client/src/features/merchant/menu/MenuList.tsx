import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { RootState } from "@/store";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/utils/mockData";
import { Product } from "@/types";
import MenuSummaryCards from "./components/MenuSummaryCards";
import MenuFilterBar from "./components/MenuFilterBar";
import MenuGrid from "./components/MenuGrid";
import UnsavedChangesBar from "./components/UnsavedChangesBar";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { Trash2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function MenuList() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'MERCHANT_ADMIN' || user?.role === 'SUPERADMIN';
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  // State lokal untuk simulasi data
  const [originalProducts, setOriginalProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  
  // State untuk modal hapus
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Deteksi perubahan secara turunan (derived state) untuk memunculkan tombol "Simpan Perubahan"
  const hasUnsavedChanges = JSON.stringify(originalProducts) !== JSON.stringify(products);

  // Peringatan sebelum meninggalkan halaman jika ada perubahan belum disimpan
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const categories = [{ id: "all", name: "Semua Kategori" }, ...MOCK_CATEGORIES];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === "all") return matchesSearch;
    return matchesSearch && product.categoryId === activeCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return MOCK_CATEGORIES.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  // Logika update stok cepat (Hanya ubah angka stok, bisa dilakukan Kasir & Admin)
  const handleUpdateStock = (productId: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + delta);
        // Otomatis ubah status availability jika stok 0
        return { 
          ...p, 
          stock: newStock,
          isAvailable: newStock > 0
        };
      }
      return p;
    }));
  };

  // Simulasi Simpan Perubahan ke Database
  const handleSaveChanges = () => {
    setOriginalProducts(products);
    showToast("Perubahan stok berhasil disimpan!", "success");
  };

  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteProduct = () => {
    if (productToDelete) {
      const newProducts = products.filter(p => p.id !== productToDelete);
      setProducts(newProducts);
      setOriginalProducts(newProducts);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      showToast("Menu berhasil dihapus", "success");
    }
  };

  // Kalkulasi Statistik
  const stats = {
    total: products.length,
    tersedia: products.filter(p => p.stock > 5).length,
    hampirHabis: products.filter(p => p.stock > 0 && p.stock <= 5).length,
    habis: products.filter(p => p.stock === 0).length,
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] flex flex-col relative pb-24">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-brand-primary">Kelola Menu</h1>
          <p className="text-slate-500 mt-1">Pantau dan kelola seluruh menu di halaman ini</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => navigate('/merchant/menu/add')}
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
        onCancel={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}
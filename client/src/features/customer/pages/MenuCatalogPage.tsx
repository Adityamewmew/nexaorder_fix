import React, { useState, useEffect } from 'react';
import CustomerHeader from '@/features/customer/components/CustomerHeader';
import CategoryTabs from '@/features/customer/components/CategoryTabs';
import MenuCard from '@/features/customer/components/MenuCard';
import FloatingCart from '@/features/customer/components/FloatingCart';
import WelcomeSplash from '@/features/customer/components/WelcomeSplash';
import SearchModal from '@/features/customer/components/SearchModal';
import CustomerSidebar from '@/features/customer/components/CustomerSidebar';
import MenuDetailModal from '@/features/customer/components/MenuDetailModal';
import CheckOrderModal from '@/features/customer/components/CheckOrderModal';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_TENANTS } from '@/utils/mockData';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ArrowUp, Receipt } from 'lucide-react';

const MenuCatalogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckOrderOpen, setIsCheckOrderOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const { tenantId, orderId } = useSelector((state: RootState) => state.customer);

  // Deteksi scroll untuk memunculkan tombol Scroll To Top
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setShowScrollTop(target.scrollTop > 300);
    };

    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Ambil nama tenant secara dinamis
  const tenant = MOCK_TENANTS.find(t => t.id === tenantId);
  const tenantName = tenant ? tenant.name : "Nexa Order";

  // Ambil daftar kategori secara dinamis dari mockData
  const dynamicCategories = ['Semua', ...MOCK_CATEGORIES.map(c => c.name)];

  const handleMenuClick = (productId: string) => {
    setSelectedProductId(productId);
  };

  // Fungsi helper untuk merender produk berdasarkan kategori
  const renderProductGrid = (categoryName: string, categoryId: string) => {
    const products = MOCK_PRODUCTS.filter(p => p.categoryId === categoryId);
    if (products.length === 0) return null;

    return (
      <div key={categoryId} className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">{categoryName}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <MenuCard 
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl}
              isAvailable={product.isAvailable}
              onClick={() => handleMenuClick(product.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-background relative flex flex-col md:flex-row">
      {/* Animasi Loading Awal */}
      <WelcomeSplash />

      {/* DESKTOP: Sidebar (Hidden on Mobile) */}
      <CustomerSidebar 
        categories={dynamicCategories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenCheckOrder={() => setIsCheckOrderOpen(true)}
      />

      {/* MAIN CONTENT AREA */}
      <div id="main-scroll-container" className="flex-1 flex flex-col pb-24 md:pb-8 h-screen overflow-y-auto relative scroll-smooth">
        
        {/* Tombol Cek Pesanan (Hanya Mobile) */}
        {orderId && (
          <button 
            onClick={() => setIsCheckOrderOpen(true)}
            className="md:hidden fixed top-24 right-4 z-40 bg-white/90 backdrop-blur-sm text-brand-secondary px-4 py-2 rounded-full font-bold shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce"
          >
            <Receipt className="w-4 h-4" />
            <span className="text-xs">Cek Pesanan</span>
          </button>
        )}

        {/* Container untuk membatasi lebar konten di Desktop agar tidak melebar jelek */}
        <div className="w-full max-w-5xl mx-auto md:p-8">
          
          {/* Header (Responsive: Gradient di Mobile, Clean di Desktop) */}
          <CustomerHeader tenantName={tenantName} onOpenSearch={() => setIsSearchOpen(true)} />

          {/* MOBILE: Sticky Kategori Tabs (Hidden on Desktop) */}
          <div className="md:hidden">
            <CategoryTabs 
              categories={dynamicCategories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>

          {/* Daftar Menu (Grid atau Grouped) */}
          <div className="p-4 md:p-0 md:mt-8">
            {activeCategory === 'Semua' ? (
              // Mode "Semua" -> Render dipisah per kategori
              <>
                {MOCK_CATEGORIES.map(cat => renderProductGrid(cat.name, cat.id))}
                {MOCK_PRODUCTS.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-slate-400 font-medium">Belum ada menu yang tersedia.</p>
                  </div>
                )}
              </>
            ) : (
              // Mode per kategori tunggal
              <>
                {(() => {
                  const activeCatObj = MOCK_CATEGORIES.find(c => c.name === activeCategory);
                  if (!activeCatObj) return null;
                  
                  const products = MOCK_PRODUCTS.filter(p => p.categoryId === activeCatObj.id);
                  
                  if (products.length === 0) {
                    return (
                      <div className="text-center py-16">
                        <p className="text-slate-400 font-medium">Belum ada menu di kategori ini.</p>
                      </div>
                    );
                  }

                  return (
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">{activeCategory}</h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {products.map((product) => (
                          <MenuCard 
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            imageUrl={product.imageUrl}
                            isAvailable={product.isAvailable}
                            onClick={() => handleMenuClick(product.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart (Muncul otomatis jika ada isi keranjang - HANYA DI MOBILE) */}
      <div className="md:hidden">
        <FloatingCart />
      </div>

      {/* Tombol Scroll To Top (Mobile) - Posisi aman di atas Floating Cart */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="md:hidden fixed bottom-24 right-4 z-40 bg-white text-brand-primary p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-slate-100 hover:bg-slate-50 transition-all"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Tombol Scroll To Top (Desktop) */}
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="hidden md:flex fixed bottom-8 right-8 z-40 bg-brand-primary text-white p-4 rounded-full shadow-lg hover:bg-brand-primaryHover transition-all hover:-translate-y-1"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      {/* Modal Pencarian */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onProductClick={handleMenuClick}
      />

      {/* Modal Detail & Topping Menu */}
      <MenuDetailModal 
        productId={selectedProductId} 
        onClose={() => setSelectedProductId(null)} 
      />

      {/* Modal Historis / Cek Pesanan */}
      <CheckOrderModal 
        isOpen={isCheckOrderOpen}
        onClose={() => setIsCheckOrderOpen(false)}
      />
    </div>
  );
};

export default MenuCatalogPage;

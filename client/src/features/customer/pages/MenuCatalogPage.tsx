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
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ArrowUp, Receipt } from 'lucide-react';
import api from '@/lib/api';

interface Product {
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

interface Category {
  id: number;
  name: string;
}

const MenuCatalogPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckOrderOpen, setIsCheckOrderOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const { orderId } = useSelector((state: RootState) => state.customer);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Gagal memuat menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setShowScrollTop(target.scrollTop > 300);
    };
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dynamicCategories = ['Semua', ...categories.map(c => c.name)];
  const handleMenuClick = (productId: string) => setSelectedProductId(productId);

  const renderProductGrid = (categoryName: string, categoryId: number) => {
    const catProducts = products.filter(p => p.categoryId === categoryId);
    if (catProducts.length === 0) return null;
    return (
      <div key={categoryId} className="mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">{categoryName}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {catProducts.map((product) => (
            <MenuCard
              key={product.id}
              id={String(product.id)}
              name={product.name}
              price={product.price}
              imageUrl={product.image || ''}
              isAvailable={product.status === 'tersedia' && product.stock > 0}
              onClick={() => handleMenuClick(String(product.id))}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-background relative flex flex-col md:flex-row">
      <WelcomeSplash />

      <CustomerSidebar
        categories={dynamicCategories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenCheckOrder={() => setIsCheckOrderOpen(true)}
      />

      <div id="main-scroll-container" className="flex-1 flex flex-col pb-24 md:pb-8 h-screen overflow-y-auto relative scroll-smooth">

        {orderId && (
          <button
            onClick={() => setIsCheckOrderOpen(true)}
            className="md:hidden fixed top-24 right-4 z-40 bg-white/90 backdrop-blur-sm text-brand-secondary px-4 py-2 rounded-full font-bold shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce"
          >
            <Receipt className="w-4 h-4" />
            <span className="text-xs">Cek Pesanan</span>
          </button>
        )}

        <div className="w-full max-w-5xl mx-auto md:p-8">
          <CustomerHeader tenantName="Nexa Order" onOpenSearch={() => setIsSearchOpen(true)} />

          <div className="md:hidden">
            <CategoryTabs
              categories={dynamicCategories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>

          <div className="p-4 md:p-0 md:mt-8">
            {loading ? (
              <div className="text-center py-16">
                <p className="text-slate-400 font-medium">Memuat menu...</p>
              </div>
            ) : activeCategory === 'Semua' ? (
              <>
                {categories.map(cat => renderProductGrid(cat.name, cat.id))}
                {products.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-slate-400 font-medium">Belum ada menu yang tersedia.</p>
                  </div>
                )}
              </>
            ) : (
              (() => {
                const activeCatObj = categories.find(c => c.name === activeCategory);
                if (!activeCatObj) return null;
                const catProducts = products.filter(p => p.categoryId === activeCatObj.id);
                if (catProducts.length === 0) {
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
                      {catProducts.map((product) => (
                        <MenuCard
                          key={product.id}
                          id={String(product.id)}
                          name={product.name}
                          price={product.price}
                          imageUrl={product.image || ''}
                          isAvailable={product.status === 'tersedia' && product.stock > 0}
                          onClick={() => handleMenuClick(String(product.id))}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <FloatingCart />
      </div>

      {showScrollTop && (
        <button onClick={scrollToTop} className="md:hidden fixed bottom-24 right-4 z-40 bg-white text-brand-primary p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-slate-100 hover:bg-slate-50 transition-all">
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
      {showScrollTop && (
        <button onClick={scrollToTop} className="hidden md:flex fixed bottom-8 right-8 z-40 bg-brand-primary text-white p-4 rounded-full shadow-lg hover:bg-brand-primaryHover transition-all hover:-translate-y-1">
          <ArrowUp className="w-6 h-6" />
        </button>
      )}

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onProductClick={handleMenuClick} />
      <MenuDetailModal productId={selectedProductId} onClose={() => setSelectedProductId(null)} />
      <CheckOrderModal isOpen={isCheckOrderOpen} onClose={() => setIsCheckOrderOpen(false)} />
    </div>
  );
};

export default MenuCatalogPage;

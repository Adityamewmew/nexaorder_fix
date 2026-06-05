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

const MenuCatalogPage: React.FC = () => {

  const [activeCategory, setActiveCategory] = useState('Semua');

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isCheckOrderOpen, setIsCheckOrderOpen] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);

  // API STATES
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const { orderId } = useSelector(
    (state: RootState) => state.customer
  );

  // SCROLL DETECTION
  useEffect(() => {

    const handleScroll = (e: Event) => {

      const target = e.target as HTMLDivElement;

      setShowScrollTop(target.scrollTop > 300);
    };

    const scrollContainer = document.getElementById('main-scroll-container');

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () =>
      scrollContainer?.removeEventListener('scroll', handleScroll);

  }, []);

  const [storeName, setStoreName] = useState('Nexa Order');

  // FETCH API
  useEffect(() => {

    const fetchData = async () => {

      try {

        setLoading(true);

        // FETCH PRODUCTS
        const productsRes = await api.get('/products');
        
        // Transform the response to ensure modifierGroups are correctly mapped to frontend format
        const transformedProducts = productsRes.data.map((p: any) => ({
          ...p,
          modifierGroups: p.modifierGroups ? p.modifierGroups.map((g: any) => ({
            id: String(g.id),
            groupName: g.name,
            isRequired: g.isRequired,
            minSelections: g.minSelections,
            maxSelections: g.maxSelections,
            modifiers: g.modifiers.map((m: any) => ({
              id: String(m.id),
              modifierName: m.name,
              price: m.price
            }))
          })) : []
        }));

        // FETCH CATEGORIES
        const categoriesRes = await api.get('/categories');
        
        // FETCH STORE PROFILE
        try {
          const profileRes = await api.get('/dashboard/profile');
          if (profileRes.data && profileRes.data.name) {
            setStoreName(profileRes.data.name);
          }
        } catch (e) {
          // ignore profile fetch error
        }

        setProducts(transformedProducts);

        setCategories(categoriesRes.data);

      } catch (err) {

        console.log(err);

        setError('Gagal mengambil data');

      } finally {

        setLoading(false);
      }
    };

    fetchData();

  }, []);

  const scrollToTop = () => {

    const scrollContainer = document.getElementById('main-scroll-container');

    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // DYNAMIC CATEGORIES
  const dynamicCategories = [
    'Semua',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...categories.map((c: any) => c.name)
  ];

  const handleMenuClick = (productId: number) => {
    setSelectedProductId(productId);
  };

  // RENDER PRODUCT GRID
  const renderProductGrid = (
    categoryName: string,
    categoryId: number
  ) => {

    const filteredProducts = products.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p.categoryId === categoryId
    );

    if (filteredProducts.length === 0) return null;

    return (

      <div key={categoryId} className="mb-8">

        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">
          {categoryName}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {filteredProducts.map((product: any) => (

            <MenuCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.image?.startsWith('http') ? product.image : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') + product.image : `http://localhost:5000${product.image}`)}
              isAvailable={product.status === 'tersedia'}
              onClick={() => handleMenuClick(product.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  // LOADING UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // ERROR UI
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{error}</p>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-brand-background relative flex flex-col md:flex-row">

      {/* SPLASH */}
      <WelcomeSplash />

      {/* SIDEBAR */}
      <CustomerSidebar
        categories={dynamicCategories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenCheckOrder={() => setIsCheckOrderOpen(true)}
      />

      {/* MAIN CONTENT */}
      <div
        id="main-scroll-container"
        className="flex-1 flex flex-col pb-24 md:pb-8 h-screen overflow-y-auto relative scroll-smooth w-full"
      >

        {/* MOBILE CHECK ORDER */}
        {orderId && (

          <button
            onClick={() => setIsCheckOrderOpen(true)}
            className="md:hidden fixed bottom-24 right-4 z-40 bg-white/90 backdrop-blur-sm text-brand-secondary px-4 py-2 rounded-full font-bold shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce"
          >

            <Receipt className="w-4 h-4" />

            <span className="text-xs">
              Cek Pesanan
            </span>

          </button>
        )}

        {/* CONTENT WRAPPER */}
        <div className="w-full max-w-5xl mx-auto md:p-8">

          {/* HEADER */}
          <CustomerHeader
            tenantName={storeName}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* MOBILE CATEGORY */}
          <div className="md:hidden">

            <CategoryTabs
              categories={dynamicCategories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>

          {/* MENU LIST */}
          <div className="p-4 md:p-0 md:mt-8">

            {activeCategory === 'Semua' ? (

              <>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {categories.map((cat: any) =>
                  renderProductGrid(cat.name, cat.id)
                )}

                {products.length === 0 && (

                  <div className="text-center py-16">

                    <p className="text-slate-400 font-medium">
                      Belum ada menu yang tersedia.
                    </p>

                  </div>
                )}
              </>

            ) : (

              <>
                {(() => {

                  const activeCatObj = categories.find(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (c: any) => c.name === activeCategory
                  );

                  if (!activeCatObj) return null;

                  const filteredProducts = products.filter(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (p: any) => p.categoryId === activeCatObj.id
                  );

                  if (filteredProducts.length === 0) {

                    return (

                      <div className="text-center py-16">

                        <p className="text-slate-400 font-medium">
                          Belum ada menu di kategori ini.
                        </p>

                      </div>
                    );
                  }

                  return (

                    <div>

                      <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">
                        {activeCategory}
                      </h2>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">

                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {filteredProducts.map((product: any) => (

                          <MenuCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            imageUrl={product.image?.startsWith('http') ? product.image : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') + product.image : `http://localhost:5000${product.image}`)}
                            isAvailable={product.status === 'tersedia'}
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

      {/* FLOATING CART */}
      <div className="md:hidden">
        <FloatingCart />
      </div>

      {/* MOBILE SCROLL TOP */}
      {showScrollTop && (

        <button
          onClick={scrollToTop}
          className="md:hidden fixed bottom-6 right-4 z-40 bg-white text-brand-primary p-3 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-slate-100 hover:bg-slate-50 transition-all"
        >

          <ArrowUp className="w-5 h-5" />

        </button>
      )}

      {/* DESKTOP SCROLL TOP */}
      {showScrollTop && (

        <button
          onClick={scrollToTop}
          className="hidden md:flex fixed bottom-8 right-8 z-40 bg-brand-primary text-white p-4 rounded-full shadow-lg hover:bg-brand-primaryHover transition-all hover:-translate-y-1"
        >

          <ArrowUp className="w-6 h-6" />

        </button>
      )}

      {/* SEARCH MODAL */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onProductClick={handleMenuClick}
      />

      {/* MENU DETAIL */}
      <MenuDetailModal
        productId={selectedProductId}
        onClose={() => setSelectedProductId(null)}
      />

      {/* CHECK ORDER */}
      <CheckOrderModal
        isOpen={isCheckOrderOpen}
        onClose={() => setIsCheckOrderOpen(false)}
      />
    </div>
  );
};

export default MenuCatalogPage;
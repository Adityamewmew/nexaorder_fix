import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/utils/mockData";
import { RootState } from "@/store";
import { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  setOrderInfo, 
  clearCart 
} from "./cartSlice";
import PosMenuArea from "./components/PosMenuArea";
import PosCartArea from "./components/PosCartArea";

export default function PointOfSale() {
  const dispatch = useDispatch();
  
  // State UI Lokal
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State Redux
  const cart = useSelector((state: RootState) => state.cart.items);
  const { orderType, customerName, customerPhone } = useSelector((state: RootState) => state.cart);

  const categories = [{ id: "all", name: "Semua" }, ...MOCK_CATEGORIES];

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === "Semua") return matchesSearch;
    const categoryObj = MOCK_CATEGORIES.find(c => c.name === activeCategory);
    return matchesSearch && product.categoryId === categoryObj?.id;
  });

  // Kalkulasi Harga
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.1; // Pajak 10%
  const total = subtotal + tax;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full">
      <PosMenuArea 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        orderType={orderType}
        setOrderType={(type) => dispatch(setOrderInfo({ type }))}
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        filteredProducts={filteredProducts}
        onAddToCart={(product) => {
          // @ts-expect-error - _selectedModifiers is injected dynamically via ModifierModal
          const selectedModifiers = product._selectedModifiers || [];
          dispatch(addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            categoryId: product.categoryId,
            modifiers: selectedModifiers
          }));
        }}
      />
      
      <PosCartArea 
        cart={cart}
        orderType={orderType}
        customerName={customerName}
        customerPhone={customerPhone}
        subtotal={subtotal}
        tax={tax}
        total={total}
        onUpdateCustomerName={(name) => dispatch(setOrderInfo({ name }))}
        onUpdateCustomerPhone={(phone) => dispatch(setOrderInfo({ phone }))}
        onRemoveItem={(id) => dispatch(removeFromCart(id))}
        onUpdateQty={(id, delta) => dispatch(updateQuantity({ id, delta }))}
        onClearCart={() => dispatch(clearCart())}
      />
    </div>
  );
}
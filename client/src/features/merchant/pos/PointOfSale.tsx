import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { Product } from "@/types";
import {
  addToCart,
  removeFromCart,
  updateQuantity,
  setOrderInfo,
  clearCart
} from "./cartSlice";
import PosMenuArea from "./components/PosMenuArea";
import PosCartArea from "./components/PosCartArea";
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

export default function PointOfSale() {
  const dispatch = useDispatch();

  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [apiCategories, setApiCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const cart = useSelector((state: RootState) => state.cart.items);
  const { orderType, customerName, customerPhone } = useSelector((state: RootState) => state.cart);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get("/products"),
          api.get("/categories"),
        ]);
        setAllProducts(prodRes.data.map(toProduct));
        setApiCategories(catRes.data.map((c: { id: number; name: string }) => ({ id: String(c.id), name: c.name })));
      } catch (err) {
        console.error("Gagal memuat data POS:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = [{ id: "all", name: "Semua" }, ...apiCategories];

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === "Semua") return matchesSearch;
    const categoryObj = apiCategories.find(c => c.name === activeCategory);
    return matchesSearch && product.categoryId === categoryObj?.id;
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-slate-400">Memuat menu...</p>
      </div>
    );
  }

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

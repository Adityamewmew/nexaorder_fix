import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartItemModifier } from '@/types';

interface CartState {
  items: CartItem[];
  orderType: 'Dine In' | 'Take away';
  customerName: string;
  customerPhone: string;
}

const initialState: CartState = {
  items: [],
  orderType: 'Take away',
  customerName: '',
  customerPhone: '',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'qty' | 'notes'> & { modifiers?: CartItemModifier[] }>) => {
      // Kita buat ID unik berdasarkan kombinasi product ID dan modifier yang dipilih
      // Agar jika pelanggan pesan 2 Mie Ayam (satu pedas, satu tidak), mereka tidak tergabung
      const modifiersString = action.payload.modifiers ? JSON.stringify(action.payload.modifiers) : '';
      const uniqueCartId = `${action.payload.id}-${modifiersString}`;

      const existingItem = state.items.find(item => item.id === uniqueCartId);
      
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        state.items.push({ 
          ...action.payload, 
          id: uniqueCartId, // Gunakan ID unik
          qty: 1, 
          notes: '',
          categoryId: action.payload.categoryId || '',
          modifiers: action.payload.modifiers || [] 
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; delta: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        const newQty = item.qty + action.payload.delta;
        if (newQty > 0) {
          item.qty = newQty;
        } else {
          // Hapus item jika kuantitas menjadi 0
          state.items = state.items.filter(i => i.id !== action.payload.id);
        }
      }
    },
    updateNotes: (state, action: PayloadAction<{ id: string; notes: string }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.notes = action.payload.notes;
      }
    },
    setOrderInfo: (state, action: PayloadAction<{ 
      type?: 'Dine In' | 'Take away', 
      name?: string, 
      phone?: string 
    }>) => {
      if (action.payload.type) state.orderType = action.payload.type;
      if (action.payload.name !== undefined) state.customerName = action.payload.name;
      if (action.payload.phone !== undefined) state.customerPhone = action.payload.phone;
    },
    clearCart: (state) => {
      state.items = [];
      state.customerName = '';
      state.customerPhone = '';
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  updateNotes, 
  setOrderInfo, 
  clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartItemModifier } from '@/types';

interface CustomerState {
  tenantId: string | null;
  tableId: string | null;
  tableName: string | null;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  orderId: string | null; // Disimpan jika pesanan sudah dibuat untuk keperluan tracking status
  hasSeenSplash: boolean; // Flag agar animasi welcome tidak diulang-ulang
}

const initialState: CustomerState = {
  tenantId: null,
  tableId: null,
  tableName: null,
  customerName: '',
  customerPhone: '',
  items: [],
  orderId: null,
  hasSeenSplash: false,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    // 1. Setup Sesi Pelanggan
    setSessionInfo: (state, action: PayloadAction<{
      tenantId: string;
      tableId: string;
      tableName: string;
    }>) => {
      state.tenantId = action.payload.tenantId;
      state.tableId = action.payload.tableId;
      state.tableName = action.payload.tableName;
    },
    
    // 2. Setup Data Profil Pelanggan
    setCustomerProfile: (state, action: PayloadAction<{
      name: string;
      phone: string;
    }>) => {
      state.customerName = action.payload.name;
      state.customerPhone = action.payload.phone;
    },

    // 3. Tambah Item ke Keranjang
    addToCustomerCart: (state, action: PayloadAction<{
      id: string; // Product ID
      name: string;
      price: number;
      imageUrl: string;
      categoryId: string;
      qty: number;
      notes: string;
      modifiers: CartItemModifier[];
    }>) => {
      const payload = action.payload;
      // Buat ID unik berdasarkan Product ID + Modifiers (agar varian beda tidak tergabung)
      const modifiersString = payload.modifiers.length > 0 ? JSON.stringify(payload.modifiers) : '';
      const uniqueCartId = `${payload.id}-${modifiersString}`;

      const existingItem = state.items.find(item => item.id === uniqueCartId);

      if (existingItem) {
        existingItem.qty += payload.qty;
        // Jika notes baru tidak kosong, gabungkan atau timpa (di sini kita timpa/update)
        if (payload.notes) {
          existingItem.notes = existingItem.notes ? `${existingItem.notes}, ${payload.notes}` : payload.notes;
        }
      } else {
        state.items.push({
          id: uniqueCartId, // Gunakan uniqueCartId sebagai ID Cart Item
          name: payload.name,
          price: payload.price,
          qty: payload.qty,
          imageUrl: payload.imageUrl,
          categoryId: payload.categoryId,
          notes: payload.notes,
          modifiers: payload.modifiers,
        });
      }
    },

    // 4. Ubah Kuantitas
    updateCustomerItemQuantity: (state, action: PayloadAction<{ id: string; delta: number }>) => {
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

    // 5. Update Catatan Item
    updateCustomerItemNotes: (state, action: PayloadAction<{ id: string; notes: string }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.notes = action.payload.notes;
      }
    },

    // 6. Hapus Item dari Keranjang
    removeFromCustomerCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },

    // 7. Selesaikan Pesanan (Set Order ID dari Backend)
    setCustomerOrderId: (state, action: PayloadAction<string>) => {
      state.orderId = action.payload;
    },

    // 8. Kosongkan Keranjang (misal setelah berhasil checkout atau batal)
    clearCustomerCart: (state) => {
      state.items = [];
    },

    // 9. Tandai Splash Screen sudah dilihat
    setHasSeenSplash: (state) => {
      state.hasSeenSplash = true;
    },

    // 10. Reset Seluruh Sesi Customer
    resetCustomerSession: (state) => {
      state.tenantId = null;
      state.tableId = null;
      state.tableName = null;
      state.customerName = '';
      state.customerPhone = '';
      state.items = [];
      state.orderId = null;
      state.hasSeenSplash = false;
    }
  },
});

export const {
  setSessionInfo,
  setCustomerProfile,
  addToCustomerCart,
  updateCustomerItemQuantity,
  updateCustomerItemNotes,
  removeFromCustomerCart,
  setCustomerOrderId,
  clearCustomerCart,
  setHasSeenSplash,
  resetCustomerSession
} = customerSlice.actions;

export default customerSlice.reducer;

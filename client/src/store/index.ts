import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import cartReducer from '@/features/merchant/pos/cartSlice';
import customerReducer from '@/features/customer/store/customerSlice';
import orderReducer from '@/features/merchant/orders/orderSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  customer: customerReducer,
  orders: orderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// Helper untuk load state dari localStorage (Mencegah state hilang saat refresh)
const loadState = (): Partial<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem('nexa_app_state');
    if (serializedState === null) {
      return undefined; // Biarkan Redux pakai initialState bawaan jika kosong
    }
    return JSON.parse(serializedState) as Partial<RootState>;
  } catch (err) {
    console.error("Error loading state from localStorage:", err);
    return undefined;
  }
};

// Helper untuk save state ke localStorage — hanya auth dan customer
// orders TIDAK disimpan karena selalu fresh dari API
const saveState = (state: RootState) => {
  try {
    const stateToSave = {
      auth: state.auth,
      customer: state.customer,
    };
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem('nexa_app_state', serializedState);
  } catch (err) {
    console.error("Error saving state to localStorage:", err);
  }
};

// Ambil state yang tersimpan (jika ada) — strip orders jika ada dari versi lama
const persistedState = (() => {
  const state = loadState();
  if (state && 'orders' in state) {
    // Hapus orders dari persisted state (versi lama menyimpannya)
    const { orders: _orders, ...rest } = state as RootState & { orders?: unknown };
    void _orders;
    return rest as Partial<RootState>;
  }
  return state;
})();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState, // Timpa initialState dengan data yang tersimpan
});

// Subscribe ke perubahan store, simpan ke localStorage dengan debounce 1000ms (1 detik)
let debounceTimer: ReturnType<typeof setTimeout>;
store.subscribe(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    saveState(store.getState());
  }, 1000);
});

export type AppDispatch = typeof store.dispatch;


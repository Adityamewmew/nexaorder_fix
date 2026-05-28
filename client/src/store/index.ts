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

// Helper untuk save state ke localStorage dengan memilih state yang penting saja
const saveState = (state: RootState) => {
  try {
    // Hanya simpan state auth, customer, dan orders untuk menghemat localStorage
    // State seperti cart kasir yang terlalu besar bisa diabaikan jika tidak diperlukan persist
    const stateToSave = {
      auth: state.auth,
      customer: state.customer,
      orders: state.orders,
    };
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem('nexa_app_state', serializedState);
  } catch (err) {
    console.error("Error saving state to localStorage:", err);
  }
};

// Ambil state yang tersimpan (jika ada)
const persistedState = loadState();

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


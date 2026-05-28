import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '@/types';

interface OrderState {
  items: Order[];
}

// Initial state with mock data so we have something to show
const initialState: OrderState = {
  items: [
    {
      id: "ORD-001",
      tenantId: "tenant-001",
      customerName: "Meja 4 (Budi)",
      status: "PENDING",
      paymentMethod: "UNPAID",
      totalAmount: 45000,
      createdAt: "10:30",
      items: [
        { 
          id: "i1", orderId: "ORD-001", productId: "p1", productName: "Bakso Spesial", categoryId: "cat-1", quantity: 1, priceAtOrder: 25000, notes: "Tanpa seledri",
          modifiers: [
            { groupId: "mg-1", groupName: "Topping", modifierId: "m-1", modifierName: "Ekstra Ayam", price: 5000 }
          ]
        },
        { 
          id: "i2", orderId: "ORD-001", productId: "p2", productName: "Es Teh Manis", categoryId: "cat-2", quantity: 2, priceAtOrder: 10000, notes: "",
          modifiers: [
            { groupId: "mg-4", groupName: "Es", modifierId: "m-10", modifierName: "Less Ice", price: 0 }
          ]
        },
      ],
    },
    {
      id: "ORD-002",
      tenantId: "tenant-001",
      customerName: "Takeaway (Siti)",
      status: "PROCESS",
      paymentMethod: "UNPAID",
      totalAmount: 120000,
      createdAt: "10:35",
      items: [
        { 
          id: "i3", orderId: "ORD-002", productId: "p3", productName: "Mie Ayam Bakso", categoryId: "cat-1", quantity: 4, priceAtOrder: 30000, notes: "Pedas semua",
          modifiers: []
        },
      ],
    },
    {
      id: "ORD-003",
      tenantId: "tenant-001",
      customerName: "Meja 1 (Andi)",
      status: "READY",
      paymentMethod: "QRIS",
      totalAmount: 20000,
      createdAt: "10:40",
      items: [
        { 
          id: "i4", orderId: "ORD-003", productId: "p1", productName: "Bakso Urat", categoryId: "cat-1", quantity: 1, priceAtOrder: 20000, notes: "",
          modifiers: []
        },
      ],
    }
  ]
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      // Masukkan order baru ke paling atas (terbaru)
      state.items.unshift(action.payload);
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: OrderStatus }>) => {
      const order = state.items.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },
    updatePaymentStatus: (state, action: PayloadAction<{ id: string; paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER' }>) => {
      const order = state.items.find(o => o.id === action.payload.id);
      if (order) {
        order.paymentMethod = action.payload.paymentMethod;
      }
    }
  }
});

export const { addOrder, updateOrderStatus, updatePaymentStatus } = orderSlice.actions;
export default orderSlice.reducer;

export type Role = 'SUPERADMIN' | 'MERCHANT_ADMIN' | 'CASHIER' | 'KITCHEN';
export type OrderStatus = 'PENDING' | 'PROCESS' | 'READY' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER' | 'UNPAID';

export interface Tenant {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface User {
  id: string;
  tenantId?: string;
  name: string;
  username?: string;
  email?: string;
  role: Role;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
}

export interface ProductModifier {
  id: string;
  name: string;
  price: number;
  isDefault: boolean;
}

export interface ProductModifierGroup {
  id: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  modifiers: ProductModifier[];
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isAvailable: boolean;
  modifierGroups?: ProductModifierGroup[];
}

export interface CartItemModifier {
  groupId: string;
  groupName: string;
  modifierId: string;
  modifierName: string;
  price: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
  notes: string;
  categoryId: string; // Ditambahkan untuk memisahkan makanan/minuman di pesanan
  modifiers: CartItemModifier[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  categoryId: string; // Ditambahkan untuk filter makanan/minuman di Kanban
  quantity: number;
  priceAtOrder: number;
  notes: string;
  modifiers: CartItemModifier[];
}

export interface Order {
  id: string;
  tenantId: string;
  tableId?: string;
  customerName?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

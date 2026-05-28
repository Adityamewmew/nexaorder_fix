import { Category, Product, Tenant, User } from '../types';

export const MOCK_TENANT_ID = "tenant-001";

// --- MOCK DATA UNTUK PLATFORM ADMIN ---

export const MOCK_TENANTS: Tenant[] = [
  {
    id: MOCK_TENANT_ID,
    name: "Bakso Malang Cak Arifin",
    address: "Jl. Potrosari II, Banyumanik",
    phone: "081234567890",
    isActive: true,
  },
  {
    id: "tenant-002",
    name: "Ayam Geprek Nelongso",
    address: "Jl. Tembalang Raya No. 4",
    phone: "089876543210",
    isActive: true,
  },
  {
    id: "tenant-003",
    name: "Warkop Mas Bro",
    address: "Jl. Ngesrep Timur",
    phone: "081112223334",
    isActive: false, // Contoh tenant yang disuspend/belum aktif
  }
];

export const MOCK_SUPERADMIN: User = {
  id: "sa-1",
  name: "Rio Superadmin",
  email: "admin@nexaorder.com",
  role: "SUPERADMIN",
};

export const MOCK_MERCHANT_ADMIN: User = {
  id: "ma-1",
  tenantId: MOCK_TENANT_ID,
  name: "Arifin (Pemilik)",
  email: "arifin@bakso.com",
  role: "MERCHANT_ADMIN",
};

export const MOCK_CASHIER: User = {
  id: "ca-1",
  tenantId: MOCK_TENANT_ID,
  name: "Budi (Kasir 1)",
  email: "kasir1@bakso.com",
  role: "CASHIER",
};

// --- MOCK DATA UNTUK CUSTOMER & MERCHANT ---

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-1", tenantId: MOCK_TENANT_ID, name: "Makanan" },
  { id: "cat-2", tenantId: MOCK_TENANT_ID, name: "Minuman" },
  { id: "cat-3", tenantId: MOCK_TENANT_ID, name: "Lainnya" },
];

export const MOCK_PRODUCTS: Product[] = [
  // Kategori Makanan
  {
    id: "prod-1",
    tenantId: MOCK_TENANT_ID,
    categoryId: "cat-1",
    name: "Bakso Urat",
    description: "Bakso urat sapi asli dengan kuah kaldu gurih.",
    price: 20000,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400&auto=format&fit=crop",
    isAvailable: true,
  },
  {
    id: "prod-2",
    tenantId: MOCK_TENANT_ID,
    categoryId: "cat-1",
    name: "Bakso Spesial",
    description: "Kombinasi bakso urat, bakso halus, dan tahu.",
    price: 25000,
    stock: 30,
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=400&auto=format&fit=crop",
    isAvailable: true,
  },
  {
    id: "prod-3",
    tenantId: MOCK_TENANT_ID,
    categoryId: "cat-1",
    name: "Mie Ayam",
    description: "Mie ayam lezat dengan potongan ayam manis gurih.",
    price: 15000,
    stock: 40,
    imageUrl: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=400&auto=format&fit=crop",
    isAvailable: true,
  },
  {
    id: "prod-4",
    tenantId: MOCK_TENANT_ID,
    categoryId: "cat-1",
    name: "Mie Ayam Bakso",
    description: "Mie ayam dipadukan dengan bakso sapi asli.",
    price: 22000,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=400&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        id: "mg-1",
        name: "Tambahan Topping (Opsional)",
        isRequired: false,
        minSelections: 0,
        maxSelections: 3,
        modifiers: [
          { id: "m-1", name: "Ekstra Ayam", price: 5000, isDefault: false },
          { id: "m-2", name: "Pangsit Goreng", price: 3000, isDefault: false },
          { id: "m-3", name: "Bakso Kecil (2pcs)", price: 4000, isDefault: false },
        ]
      },
      {
        id: "mg-2",
        name: "Kustomisasi Sayuran",
        isRequired: false,
        minSelections: 0,
        maxSelections: 2,
        modifiers: [
          { id: "m-4", name: "Tanpa Daun Bawang", price: 0, isDefault: false },
          { id: "m-5", name: "Tanpa Sawi", price: 0, isDefault: false },
        ]
      }
    ]
  },
  
  // Kategori Minuman
  {
    id: "prod-5",
    tenantId: MOCK_TENANT_ID,
    categoryId: "cat-2",
    name: "Es Jeruk",
    description: "Es jeruk peras segar manis asam.",
    price: 8000,
    stock: 100,
    imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=400&auto=format&fit=crop",
    isAvailable: true,
    modifierGroups: [
      {
        id: "mg-3",
        name: "Level Gula",
        isRequired: true,
        minSelections: 1,
        maxSelections: 1,
        modifiers: [
          { id: "m-6", name: "Normal", price: 0, isDefault: true },
          { id: "m-7", name: "Less Sugar", price: 0, isDefault: false },
          { id: "m-8", name: "Tanpa Gula", price: 0, isDefault: false },
        ]
      },
      {
        id: "mg-4",
        name: "Level Es",
        isRequired: true,
        minSelections: 1,
        maxSelections: 1,
        modifiers: [
          { id: "m-9", name: "Normal", price: 0, isDefault: true },
          { id: "m-10", name: "Less Ice", price: 0, isDefault: false },
          { id: "m-11", name: "Tanpa Es (Hangat)", price: 0, isDefault: false },
        ]
      }
    ]
  },
  {
    id: "prod-6",
    tenantId: MOCK_TENANT_ID,
    categoryId: "cat-2",
    name: "Es Teh Manis",
    description: "Es teh manis melati segar.",
    price: 5000,
    stock: 200,
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=400&auto=format&fit=crop",
    isAvailable: true,
  },
  {
    id: "prod-7",
    tenantId: MOCK_TENANT_ID,
    categoryId: "cat-2",
    name: "Jus Alpukat",
    description: "Jus alpukat kental dengan susu kental manis.",
    price: 15000,
    stock: 0,
    imageUrl: "https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=400&auto=format&fit=crop",
    isAvailable: false, // Contoh produk habis
  },

  // Kategori Lainnya (Snack)
  {
    id: "prod-8",
    tenantId: MOCK_TENANT_ID,
    categoryId: "cat-3",
    name: "Kerupuk Pangsit",
    description: "Kerupuk pangsit renyah isi 3.",
    price: 3000,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?q=80&w=400&auto=format&fit=crop",
    isAvailable: true,
  }
];
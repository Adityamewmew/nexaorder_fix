import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface MenuFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

export default function MenuFilterBar({ 
  searchQuery, 
  setSearchQuery, 
  categories, 
  activeCategory, 
  setActiveCategory 
}: MenuFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="relative flex-1 max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Cari menu, kategori, atau harga..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        />
      </div>
      
      {/* Kategori Filter */}
      <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={cn(
              "px-4 py-3 text-sm font-semibold transition-colors border-r border-slate-100 last:border-0",
              activeCategory === c.id ? "bg-brand-primary/5 text-brand-primary" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
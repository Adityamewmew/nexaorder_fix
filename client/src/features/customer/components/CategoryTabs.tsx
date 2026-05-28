import React from 'react';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="sticky top-0 z-10 bg-brand-background pt-4 pb-3 px-4 shadow-sm border-b border-slate-200">
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`whitespace-nowrap px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
              activeCategory === category
                ? 'bg-brand-primary text-white border-2 border-brand-primary shadow-sm'
                : 'bg-white text-brand-primary border-2 border-slate-200 hover:border-brand-primary/50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;

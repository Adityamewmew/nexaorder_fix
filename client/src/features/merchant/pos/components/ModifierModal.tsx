import { useState } from "react";
import { X, Check } from "lucide-react";
import { Product, ProductModifierGroup, CartItemModifier } from "@/types";
import { cn } from "@/lib/utils";

interface ModifierModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (modifiers: CartItemModifier[], finalPrice: number) => void;
}

export default function ModifierModal({ product, isOpen, onClose, onConfirm }: ModifierModalProps) {
  // Simpan state pilihan modifier: format { [groupId]: [modifierId1, modifierId2, ...] }
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    product.modifierGroups?.forEach(group => {
      initial[group.id] = group.modifiers.filter(m => m.isDefault).map(m => m.id);
    });
    return initial;
  });

  if (!isOpen) return null;

  const handleToggleSelection = (group: ProductModifierGroup, modifierId: string) => {
    setSelections(prev => {
      const currentSelections = prev[group.id] || [];
      const isSelected = currentSelections.includes(modifierId);
      
      // Jika ini adalah opsi radio (maxSelection = 1)
      if (group.maxSelections === 1) {
        return { ...prev, [group.id]: [modifierId] };
      }

      // Jika checkbox multiple
      if (isSelected) {
        return { ...prev, [group.id]: currentSelections.filter(id => id !== modifierId) };
      } else {
        // Cek limit maxSelections
        if (currentSelections.length >= group.maxSelections) return prev;
        return { ...prev, [group.id]: [...currentSelections, modifierId] };
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = product.price;
    product.modifierGroups?.forEach(group => {
      const selectedIds = selections[group.id] || [];
      group.modifiers.forEach(mod => {
        if (selectedIds.includes(mod.id)) {
          total += mod.price;
        }
      });
    });
    return total;
  };

  const isFormValid = () => {
    if (!product.modifierGroups) return true;
    return product.modifierGroups.every(group => {
      if (!group.isRequired) return true;
      const count = (selections[group.id] || []).length;
      return count >= group.minSelections;
    });
  };

  const handleConfirm = () => {
    const chosenModifiers: CartItemModifier[] = [];
    product.modifierGroups?.forEach(group => {
      const selectedIds = selections[group.id] || [];
      group.modifiers.forEach(mod => {
        if (selectedIds.includes(mod.id)) {
          chosenModifiers.push({
            groupId: group.id,
            groupName: group.name,
            modifierId: mod.id,
            modifierName: mod.name,
            price: mod.price
          });
        }
      });
    });
    onConfirm(chosenModifiers, calculateTotalPrice());
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10 shrink-0">
          <div>
            <h3 className="font-bold text-xl text-slate-800">{product.name}</h3>
            <p className="text-sm font-semibold text-brand-primary">Rp. {product.price.toLocaleString('id-ID')}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {product.modifierGroups?.map((group) => {
            const selectedCount = (selections[group.id] || []).length;
            
            return (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-800">{group.name}</h4>
                    <p className="text-xs text-slate-500">
                      {group.isRequired ? "Wajib pilih" : "Opsional"} • 
                      {group.maxSelections === 1 ? " Pilih 1" : ` Pilih max ${group.maxSelections}`}
                    </p>
                  </div>
                  {group.isRequired && selectedCount < group.minSelections && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                      Wajib
                    </span>
                  )}
                </div>

                <div className="space-y-2 px-1">
                  {group.modifiers.map((mod) => {
                    const isSelected = (selections[group.id] || []).includes(mod.id);
                    const isMaxReached = !isSelected && selectedCount >= group.maxSelections;
                    
                    return (
                      <button
                        key={mod.id}
                        disabled={isMaxReached && group.maxSelections > 1}
                        onClick={() => handleToggleSelection(group, mod.id)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                          isSelected 
                            ? "border-brand-primary bg-brand-primary/5 shadow-sm" 
                            : isMaxReached 
                              ? "opacity-50 cursor-not-allowed border-slate-100 bg-slate-50" 
                              : "border-slate-200 hover:border-brand-primary/40 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {/* Custom Radio/Checkbox UI */}
                          <div className={cn(
                            "flex items-center justify-center border",
                            group.maxSelections === 1 ? "w-5 h-5 rounded-full" : "w-5 h-5 rounded-md",
                            isSelected ? "border-brand-primary bg-brand-primary text-white" : "border-slate-300 bg-white"
                          )}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span className={cn("font-medium text-sm", isSelected ? "text-brand-primary" : "text-slate-700")}>
                            {mod.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-slate-500">
                          {mod.price > 0 ? `+ Rp ${mod.price.toLocaleString('id-ID')}` : 'Gratis'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer / Confirm Button */}
        <div className="p-5 border-t border-slate-100 sticky bottom-0 bg-white rounded-b-2xl z-10 shrink-0">
          <button
            disabled={!isFormValid()}
            onClick={handleConfirm}
            className="w-full bg-brand-secondary hover:bg-brand-secondaryHover disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-between px-6 transition-colors shadow-md"
          >
            <span>Simpan ke Keranjang</span>
            <span>Rp. {calculateTotalPrice().toLocaleString('id-ID')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
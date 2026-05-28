import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: ReactNode;
  variant?: 'danger' | 'warning' | 'primary';
}

export default function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  icon,
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const bgIconClass = {
    danger: "bg-red-50 text-red-500",
    warning: "bg-amber-50 text-amber-500",
    primary: "bg-brand-primary/10 text-brand-primary"
  }[variant];

  const btnConfirmClass = {
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
    primary: "bg-brand-primary hover:bg-brand-primaryHover text-white shadow-sm"
  }[variant];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#FAFAFA] w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {icon && (
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm", bgIconClass)}>
            {icon}
          </div>
        )}
        
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn("flex-1 py-3 px-4 font-bold rounded-xl transition-colors", btnConfirmClass)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
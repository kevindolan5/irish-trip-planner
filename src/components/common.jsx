import React, { useEffect } from "react";
import Icon from "./icons.jsx";

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-stone-900/30 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-[0_12px_48px_rgba(28,25,23,0.18)] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <h3 className="font-display text-lg text-emerald-950 tracking-tight">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="text-stone-400 hover:text-stone-700 -mr-1 p-1 rounded-lg hover:bg-stone-100">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-stone-100 flex gap-2 justify-end sticky bottom-0 bg-white">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-stone-500 uppercase tracking-[0.07em] mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-stone-400 mt-1 leading-snug">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-500 bg-white placeholder:text-stone-400 transition-shadow";

export function Btn({ variant = "primary", className = "", children, ...props }) {
  const base =
    "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-emerald-700 text-white hover:bg-emerald-800",
    amber: "bg-amber-600 text-white hover:bg-amber-700",
    ghost: "text-stone-600 hover:bg-stone-100",
    danger: "text-rose-600 hover:bg-rose-50",
    outline: "border border-stone-200 text-stone-700 hover:bg-stone-50",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

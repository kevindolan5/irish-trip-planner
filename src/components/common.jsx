import React, { useEffect } from "react";

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-stone-900/40 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 sticky top-0 bg-white">
          <h3 className="font-display text-lg font-semibold text-emerald-900">{title}</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-xl leading-none px-1">
            ×
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-stone-100 flex gap-2 justify-end sticky bottom-0 bg-white">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-stone-400 mt-1">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 bg-white";

export function Btn({ variant = "primary", className = "", ...props }) {
  const base = "px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-emerald-700 text-white hover:bg-emerald-800",
    amber: "bg-amber-600 text-white hover:bg-amber-700",
    ghost: "text-stone-600 hover:bg-stone-100",
    danger: "text-rose-600 hover:bg-rose-50",
    outline: "border border-stone-200 text-stone-700 hover:bg-stone-50",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}

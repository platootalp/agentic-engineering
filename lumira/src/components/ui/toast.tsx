"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, newToast.duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "text-emerald-500",
    title: "text-emerald-600 dark:text-emerald-400",
    message: "text-emerald-600/80 dark:text-emerald-400/80",
  },
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    icon: "text-destructive",
    title: "text-destructive",
    message: "text-destructive/80",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "text-amber-500",
    title: "text-amber-600 dark:text-amber-400",
    message: "text-amber-600/80 dark:text-amber-400/80",
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/20",
    icon: "text-primary",
    title: "text-primary",
    message: "text-primary/80",
  },
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const Icon = toastIcons[toast.type];
  const styles = toastStyles[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto",
        "w-[360px] max-w-[calc(100vw-2rem)]",
        "rounded-xl border shadow-lg backdrop-blur-xl",
        "transform transition-all duration-300 ease-out",
        "animate-in slide-in-from-right-full fade-in",
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", styles.icon)} />
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className={cn("font-semibold text-sm mb-0.5", styles.title)}>
              {toast.title}
            </h4>
          )}
          <p className={cn("text-sm leading-relaxed", styles.message)}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </div>
  );
}

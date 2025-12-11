"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, onDismiss, duration = 3500 }: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return undefined;
    }
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [duration, mounted, onDismiss]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className="fixed right-4 top-4 z-50">
      <div className="rounded-2xl bg-brand-blue px-4 py-3 text-sm font-semibold text-white shadow-lg ring-1 ring-white/20">
        {message}
      </div>
    </div>,
    document.body
  );
}

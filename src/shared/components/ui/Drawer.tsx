"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-premium-primary/10 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-premium-surface shadow-2xl transition-transform duration-500 ease-out sm:max-w-md md:max-w-lg lg:max-w-xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-premium-border px-6 py-5">
          <div className="space-y-1">
            {title && <h2 className="text-xl font-bold text-neutral-900">{title}</h2>}
            {description && <p className="text-sm text-premium-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-premium-muted transition-colors hover:bg-premium-subtle hover:text-premium-primary"
            aria-label="Close drawer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-premium-border bg-premium-bg/50 p-6">
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}

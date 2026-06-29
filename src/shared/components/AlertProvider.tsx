"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/shared/components/ui/AlertDialog";
import { Button } from "@/shared/components/ui/Button";
import { toast } from "sonner";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "destructive";
}

interface AlertContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  notify: {
    success: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
    warning: (message: string, description?: string) => void;
    info: (message: string, description?: string) => void;
  };
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        options: {
          confirmText: "Confirm",
          cancelText: "Cancel",
          variant: "primary",
          ...options,
        },
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(() => {
    if (confirmState) {
      confirmState.resolve(false);
      setConfirmState(null);
    }
  }, [confirmState]);

  const handleConfirm = useCallback(async () => {
    if (confirmState) {
      setIsSubmitting(true);
      try {
        confirmState.resolve(true);
        setConfirmState(null);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [confirmState]);

  const notify = {
    success: (message: string, description?: string) => {
      toast.success(message, { description });
    },
    error: (message: string, description?: string) => {
      toast.error(message, { description });
    },
    warning: (message: string, description?: string) => {
      toast.warning(message, { description });
    },
    info: (message: string, description?: string) => {
      toast.info(message, { description });
    },
  };

  return (
    <AlertContext.Provider value={{ confirm, notify }}>
      {children}
      <AlertDialog open={!!confirmState?.isOpen} onOpenChange={(open) => !open && handleClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmState?.options.title}</AlertDialogTitle>
            {confirmState?.options.description && (
              <AlertDialogDescription>{confirmState.options.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              {confirmState?.options.cancelText}
            </AlertDialogCancel>
            <Button
              variant={confirmState?.options.variant === "destructive" ? "destructive" : "primary"}
              onClick={handleConfirm}
              loading={isSubmitting}
            >
              {confirmState?.options.confirmText}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

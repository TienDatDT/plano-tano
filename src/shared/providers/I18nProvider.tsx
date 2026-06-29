// src/shared/providers/I18nProvider.tsx
"use client";

import { useEffect } from "react";
import i18n from "@/lib/i18n";

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lang = localStorage.getItem("language") || "en";
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, []);

  return <>{children}</>;
}
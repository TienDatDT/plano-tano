"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if component has mounted.
 * Useful for handling hydration mismatches in client components.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AdminSearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
};

const AdminSearchContext = createContext<AdminSearchContextValue | null>(null);

export function AdminSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState("");
  const setQuery = useCallback((q: string) => setQueryState(q), []);

  const value = useMemo(
    () => ({ query, setQuery }),
    [query, setQuery],
  );

  return (
    <AdminSearchContext.Provider value={value}>
      {children}
    </AdminSearchContext.Provider>
  );
}

export function useAdminSearch() {
  const ctx = useContext(AdminSearchContext);
  if (!ctx) {
    throw new Error("useAdminSearch must be used within AdminSearchProvider");
  }
  return ctx;
}

export function useAdminSearchOptional() {
  return useContext(AdminSearchContext);
}

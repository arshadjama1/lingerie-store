"use client";

import React, { createContext, useContext, useTransition } from "react";

interface CatalogFilterContextType {
  isPending: boolean;
  startFilterTransition: (callback: () => void) => void;
}

const CatalogFilterContext = createContext<CatalogFilterContextType>({
  isPending: false,
  startFilterTransition: (cb) => cb(),
});

export function CatalogFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <CatalogFilterContext.Provider
      value={{
        isPending,
        startFilterTransition: startTransition,
      }}
    >
      {children}
    </CatalogFilterContext.Provider>
  );
}

export function useCatalogFilter() {
  return useContext(CatalogFilterContext);
}

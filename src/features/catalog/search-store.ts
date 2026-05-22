"use client";

import { create } from "zustand";

type SearchState = {
  query: string;
  setQuery: (query: string) => void;
};

export const useCatalogSearchStore = create<SearchState>((set) => ({
  query: "",
  setQuery: (query) => set({ query })
}));

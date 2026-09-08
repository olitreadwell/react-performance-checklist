import { create } from "zustand";

// A tiny store. The smell is on the subscriber side (ViewCounter):
// subscribe with a selector, or you re-render on every store change.
export const useStore = create((set) => ({
  syncCount: 0,
  lastSync: 0,
  sync: () => set((state) => ({ syncCount: state.syncCount + 1, lastSync: Date.now() })),
}));

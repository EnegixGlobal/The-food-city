import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null, // Initial state for user
      setUser: (userData) => set({ user: userData }),
      getUser: () => get().user,
      clearUser: () => set({ user: null }),
    }),

    {
      name: "user-storage", // Name of the storage (must be unique)
      getStorage: () => localStorage, // Use localStorage as the storage
    }
  )
);

export default useUserStore;

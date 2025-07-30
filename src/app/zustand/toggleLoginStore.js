import { create } from "zustand";

const useToggleLoginStore = create((set) => ({
  isLoginOpen: false, // Initial state for your login modal/sidebar
  toggleLogin: () => set((state) => ({ isLoginOpen: !state.isLoginOpen })),
  openLogin: () => set({ isLoginOpen: true }),
  closeLogin: () => set({ isLoginOpen: false }),
}));

export default useToggleLoginStore;

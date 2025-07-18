// store/cartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // CREATE - Add item to cart
      addToCart: (item) => {
        try {
          const existingItem = get().cart.find((i) => i.id === item.id);
          if (existingItem) {
            // If item exists, increase quantity
            set({
              cart: get().cart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            });
          } else {
            // If item doesn't exist, add new item
            set({ 
              cart: [...get().cart, { ...item, quantity: 1 }] 
            });
          }
        } catch (error) {
          console.error("Error adding item to cart:", error);
        }
      },

      // READ - Get cart items (already available as cart state)
      getCartItems: () => get().cart,

      // READ - Get specific item from cart
      getCartItem: (id) => get().cart.find((item) => item.id === id),

      // UPDATE - Update item quantity
      updateQuantity: (id, quantity) => {
        try {
          if (quantity <= 0) {
            // If quantity is 0 or negative, remove item
            set({
              cart: get().cart.filter((item) => item.id !== id),
            });
          } else {
            set({
              cart: get().cart.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
              ),
            });
          }
        } catch (error) {
          console.error("Error updating quantity:", error);
        }
      },

      // UPDATE - Increment quantity
      incrementQuantity: (id) => {
        try {
          set({
            cart: get().cart.map((item) =>
              item.id === id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
        } catch (error) {
          console.error("Error incrementing quantity:", error);
        }
      },

      // UPDATE - Decrement quantity
      decrementQuantity: (id) => {
        try {
          set({
            cart: get().cart.map((item) =>
              item.id === id 
                ? { ...item, quantity: Math.max(1, item.quantity - 1) } 
                : item
            ).filter((item) => item.quantity > 0),
          });
        } catch (error) {
          console.error("Error decrementing quantity:", error);
        }
      },

      // DELETE - Remove specific item from cart
      removeFromCart: (id) => {
        try {
          set({ 
            cart: get().cart.filter((item) => item.id !== id) 
          });
        } catch (error) {
          console.error("Error removing item from cart:", error);
        }
      },

      // DELETE - Clear entire cart
      clearCart: () => {
        try {
          set({ cart: [] });
        } catch (error) {
          console.error("Error clearing cart:", error);
        }
      },

      // UTILITY - Check if item exists in cart
      isInCart: (id) => get().cart.some((item) => item.id === id),

      // UTILITY - Get total price of all items
      getTotalPrice: () => {
        try {
          return get().cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        } catch (error) {
          console.error("Error calculating total price:", error);
          return 0;
        }
      },

      // UTILITY - Get total number of items
      getTotalItems: () => {
        try {
          return get().cart.reduce((acc, item) => acc + item.quantity, 0);
        } catch (error) {
          console.error("Error calculating total items:", error);
          return 0;
        }
      },

      // UTILITY - Get total unique items count
      getTotalUniqueItems: () => {
        try {
          return get().cart.length;
        } catch (error) {
          console.error("Error calculating unique items:", error);
          return 0;
        }
      },

      // UTILITY - Get subtotal (price without tax/delivery)
      getSubtotal: () => {
        try {
          return get().cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        } catch (error) {
          console.error("Error calculating subtotal:", error);
          return 0;
        }
      },

      // UTILITY - Get tax amount (assuming 10% tax)
      getTax: (taxRate = 0.1) => {
        try {
          const subtotal = get().getSubtotal();
          return subtotal * taxRate;
        } catch (error) {
          console.error("Error calculating tax:", error);
          return 0;
        }
      },

      // UTILITY - Get total with tax and delivery fee
      getTotalWithTaxAndDelivery: (taxRate = 0.1, deliveryFee = 2.99) => {
        try {
          const subtotal = get().getSubtotal();
          const tax = subtotal * taxRate;
          return subtotal + tax + deliveryFee;
        } catch (error) {
          console.error("Error calculating total with tax and delivery:", error);
          return 0;
        }
      },
    }),
    {
      name: "cart-storage", // localStorage key
      getStorage: () => localStorage, // explicitly use localStorage
    }
  )
);

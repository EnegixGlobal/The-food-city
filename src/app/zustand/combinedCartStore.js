// store/combinedCartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCartStore } from "./cartStore";
import { useAddonStore } from "./addonStore";

export const useCombinedCartStore = create(
  persist(
    (set, get) => ({
      // Get combined cart summary
      getCombinedCartSummary: () => {
        try {
          const productSummary = useCartStore.getState().getCartSummary();
          const addonSummary = useAddonStore.getState().getAddonSummary();
          
          const combinedTotal = productSummary.subtotal + addonSummary.totalPrice;
          const combinedItemCount = productSummary.itemCount + addonSummary.itemCount;
          const combinedUniqueItemCount = productSummary.uniqueItemCount + addonSummary.uniqueItemCount;
          
          // Calculate tax and delivery for combined order
          const tax = combinedTotal * 0.1; // 10% tax
          const deliveryFee = combinedTotal > 0 ? 40 : 0;
          const grandTotal = combinedTotal + tax + deliveryFee;
          
          return {
            // Product info
            products: productSummary.products,
            productCount: productSummary.itemCount,
            productTotal: productSummary.subtotal,
            
            // Addon info
            addons: addonSummary.addons,
            addonCount: addonSummary.itemCount,
            addonTotal: addonSummary.totalPrice,
            
            // Combined info
            totalItems: combinedItemCount,
            totalUniqueItems: combinedUniqueItemCount,
            subtotal: combinedTotal,
            discount: productSummary.discount, // Only products have discounts
            tax,
            deliveryFee,
            grandTotal,
            isEmpty: combinedItemCount === 0
          };
        } catch (error) {
          console.error("Error getting combined cart summary:", error);
          return {
            products: [],
            productCount: 0,
            productTotal: 0,
            addons: [],
            addonCount: 0,
            addonTotal: 0,
            totalItems: 0,
            totalUniqueItems: 0,
            subtotal: 0,
            discount: 0,
            tax: 0,
            deliveryFee: 0,
            grandTotal: 0,
            isEmpty: true
          };
        }
      },

      // Clear both product and addon carts
      clearAllCarts: () => {
        try {
          useCartStore.getState().clearCart();
          useAddonStore.getState().clearAddonCart();
        } catch (error) {
          console.error("Error clearing all carts:", error);
        }
      },

      // Format combined cart for order API
      formatCombinedCartForOrder: () => {
        try {
          const productOrder = useCartStore.getState().formatForOrder();
          const addonOrder = useAddonStore.getState().formatAddonsForOrder();
          
          return {
            items: productOrder.items,
            addons: [...productOrder.addons, ...addonOrder] // Combine product addons with standalone addons
          };
        } catch (error) {
          console.error("Error formatting combined cart for order:", error);
          return { items: [], addons: [] };
        }
      }
    }),
    {
      name: "combined-cart-storage",
      getStorage: () => localStorage,
    }
  )
);

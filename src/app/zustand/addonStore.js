// store/addonStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAddonStore = create(
  persist(
    (set, get) => ({
      addons: [], // Separate addon cart items

      // CREATE - Add addon to cart with customization
      addAddonToCart: (addon, quantity = 1, selectedCustomization = null) => {
        console.log("🛒 addAddonToCart called with:");
        console.log("  - addon:", addon);
        console.log("  - quantity:", quantity);
        console.log("  - selectedCustomization:", selectedCustomization);
        
        try {
          // Create unique addon cart item ID
          const customizationId = selectedCustomization 
            ? `-custom-${selectedCustomization.option}` 
            : '';
          const addonCartItemId = `addon-${addon._id}${customizationId}`;
          
          console.log("  - addonCartItemId:", addonCartItemId);
          
          const existingAddon = get().addons.find((item) => item.addonCartItemId === addonCartItemId);
          console.log("  - existingAddon:", existingAddon);
          console.log("  - current addons in store:", get().addons);
          
          if (existingAddon) {
            // If same addon with same customization exists, increase quantity
            console.log("  ✅ Updating existing addon quantity");
            set({
              addons: get().addons.map((item) =>
                item.addonCartItemId === addonCartItemId 
                  ? { ...item, quantity: item.quantity + quantity } 
                  : item
              ),
            });
          } else {
            // Create new addon cart item
            const basePrice = addon.price;
            // If there's a customization, use customization price, otherwise use base price
            const totalPrice = selectedCustomization ? selectedCustomization.price : basePrice;
            
            console.log("  - basePrice:", basePrice);
            console.log("  - customization price:", selectedCustomization?.price);
            console.log("  - totalPrice:", totalPrice);
            
            const newAddonCartItem = {
              addonCartItemId,
              // Addon details
              _id: addon._id,
              title: addon.title,
              description: addon.description,
              price: addon.price,
              basePrice,
              totalPrice,
              imageUrl: addon.imageUrl,
              isVeg: addon.isVeg,
              rating: addon.rating,
              // Cart specific
              quantity,
              // Customization
              selectedCustomization: selectedCustomization ? {
                option: selectedCustomization.option,
                price: selectedCustomization.price
              } : null,
              addedAt: new Date().toISOString()
            };
            
            console.log("  ✅ Adding new addon cart item:", newAddonCartItem);
            set({ 
              addons: [...get().addons, newAddonCartItem] 
            });
            console.log("  🛒 Updated addon cart:", get().addons);
          }
        } catch (error) {
          console.error("❌ Error adding addon to cart:", error);
        }
      },

      // READ - Get all addon items
      getAddonItems: () => get().addons,

      // READ - Get specific addon item from cart
      getAddonItem: (addonCartItemId) => get().addons.find((item) => item.addonCartItemId === addonCartItemId),

      // READ - Check if addon with specific customization is in cart
      isAddonInCart: (addonId, selectedCustomization = null) => {
        const customizationId = selectedCustomization 
          ? `-custom-${selectedCustomization.option}` 
          : '';
        const addonCartItemId = `addon-${addonId}${customizationId}`;
        return get().addons.some((item) => item.addonCartItemId === addonCartItemId);
      },

      // UPDATE - Update addon quantity
      updateAddonQuantity: (addonCartItemId, quantity) => {
        try {
          if (quantity <= 0) {
            // If quantity is 0 or negative, remove addon
            set({
              addons: get().addons.filter((item) => item.addonCartItemId !== addonCartItemId),
            });
          } else {
            set({
              addons: get().addons.map((item) =>
                item.addonCartItemId === addonCartItemId 
                  ? { 
                      ...item, 
                      quantity: Math.max(1, quantity),
                      // Keep totalPrice as per-item price, don't multiply by quantity here
                    } 
                  : item
              ),
            });
          }
        } catch (error) {
          console.error("Error updating addon quantity:", error);
        }
      },

      // UPDATE - Increment addon quantity
      incrementAddonQuantity: (addonCartItemId) => {
        try {
          set({
            addons: get().addons.map((item) =>
              item.addonCartItemId === addonCartItemId 
                ? { 
                    ...item, 
                    quantity: item.quantity + 1,
                    // Keep totalPrice as per-item price, don't multiply by quantity here
                  } 
                : item
            ),
          });
        } catch (error) {
          console.error("Error incrementing addon quantity:", error);
        }
      },

      // UPDATE - Decrement addon quantity
      decrementAddonQuantity: (addonCartItemId) => {
        try {
          set({
            addons: get().addons.map((item) => {
              if (item.addonCartItemId === addonCartItemId) {
                const newQuantity = item.quantity - 1;
                return {
                  ...item,
                  quantity: newQuantity,
                  // Keep totalPrice as per-item price, don't multiply by quantity here
                };
              }
              return item;
            }).filter((item) => item.quantity > 0), // Remove items with 0 or negative quantity
          });
        } catch (error) {
          console.error("Error decrementing addon quantity:", error);
        }
      },

      // DELETE - Remove specific addon from cart
      removeAddonFromCart: (addonCartItemId) => {
        try {
          set({ 
            addons: get().addons.filter((item) => item.addonCartItemId !== addonCartItemId) 
          });
        } catch (error) {
          console.error("Error removing addon from cart:", error);
        }
      },

      // DELETE - Clear all addons
      clearAddonCart: () => {
        try {
          set({ addons: [] });
        } catch (error) {
          console.error("Error clearing addon cart:", error);
        }
      },

      // UTILITY - Get total addon price
      getTotalAddonPrice: () => {
        try {
          console.log("🧮 Calculating total addon price...");
          const total = get().addons.reduce((acc, item) => {
            // Use totalPrice (per item) * quantity, or fallback calculation
            let itemPrice = 0;
            
            if (item.totalPrice && item.totalPrice > 0) {
              itemPrice = item.totalPrice * item.quantity;
              console.log(`  - ${item.title}: totalPrice(${item.totalPrice}) × quantity(${item.quantity}) = ${itemPrice}`);
            } else {
              // Fallback calculation: use customization price if available, otherwise base price
              const pricePerItem = item.selectedCustomization 
                ? item.selectedCustomization.price 
                : (item.price || 0);
              itemPrice = pricePerItem * item.quantity;
              console.log(`  - ${item.title}: fallback pricePerItem(${pricePerItem}) × quantity(${item.quantity}) = ${itemPrice}`);
            }
            
            return acc + itemPrice;
          }, 0);
          console.log(`🧮 Total addon price: ${total}`);
          return total;
        } catch (error) {
          console.error("Error calculating total addon price:", error);
          return 0;
        }
      },

      // UTILITY - Get total addon items count
      getTotalAddonItems: () => {
        try {
          return get().addons.reduce((acc, item) => acc + item.quantity, 0);
        } catch (error) {
          console.error("Error calculating total addon items:", error);
          return 0;
        }
      },

      // UTILITY - Get total unique addon items count
      getTotalUniqueAddonItems: () => {
        try {
          return get().addons.length;
        } catch (error) {
          console.error("Error calculating unique addon items:", error);
          return 0;
        }
      },

      // UTILITY - Get addon summary
      getAddonSummary: () => {
        try {
          const addons = get().addons;
          const totalPrice = get().getTotalAddonPrice();
          const itemCount = get().getTotalAddonItems();
          const uniqueItemCount = get().getTotalUniqueAddonItems();

          return {
            itemCount,
            uniqueItemCount,
            totalPrice,
            addons,
            isEmpty: addons.length === 0
          };
        } catch (error) {
          console.error("Error getting addon summary:", error);
          return {
            itemCount: 0,
            uniqueItemCount: 0,
            totalPrice: 0,
            addons: [],
            isEmpty: true
          };
        }
      },

      // UTILITY - Format addons for order API
      formatAddonsForOrder: () => {
        try {
          const addons = get().addons;
          return addons.map(addonItem => ({
            addOnId: addonItem._id,
            name: addonItem.title,
            price: addonItem.totalPrice,
            quantity: addonItem.quantity,
            image: addonItem.imageUrl,
            customization: addonItem.selectedCustomization ? {
              option: addonItem.selectedCustomization.option,
              price: addonItem.selectedCustomization.price
            } : null
          }));
        } catch (error) {
          console.error("Error formatting addons for order:", error);
          return [];
        }
      },

      // Clear all addons from cart
      clearAddons: () => {
        console.log("🧹 Clearing all addons from cart");
        set({ addons: [] });
      }
    }),
    {
      name: "addon-cart-storage", // localStorage key
      getStorage: () => localStorage, // explicitly use localStorage
    }
  )
);

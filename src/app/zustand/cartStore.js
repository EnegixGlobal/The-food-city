// store/cartStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Cart item types
const ITEM_TYPES = {
  PRODUCT: 'product',
  ADDON: 'addon'
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      // CREATE - Add product to cart
      addProductToCart: (product, quantity = 1, selectedAddons = [], customization = null) => {
        try {
          // Create unique cart item ID by combining product ID, selected addons, and customization
          const addonIds = selectedAddons.map(addon => addon._id).sort().join('-');
          const customizationId = customization ? `-custom-${customization.option}` : '';
          const cartItemId = `${product._id}${addonIds ? `-addons-${addonIds}` : ''}${customizationId}`;
          
          const existingItem = get().cart.find((item) => item.cartItemId === cartItemId);
          
          if (existingItem) {
            // If same product with same addons and customization exists, increase quantity
            set({
              cart: get().cart.map((item) =>
                item.cartItemId === cartItemId 
                  ? { ...item, quantity: item.quantity + quantity } 
                  : item
              ),
            });
          } else {
            // Create new cart item with proper pricing logic
            
            // Step 1: Determine base price (product price or fallback to first customization option)
            let basePrice;
            if (product.discountedPrice) {
              basePrice = product.discountedPrice;
            } else if (product.price) {
              basePrice = product.price;
            } else if (product.customizableOptions && product.customizableOptions.length > 0) {
              // Fallback: use first customization option price if no product price
              basePrice = product.customizableOptions[0].price;
            } else {
              basePrice = 0; // Safety fallback
            }
            
            // Step 2: Add customization price if selected (ON TOP of base price)
            const customizationPrice = customization ? customization.price : 0;
            
            // Step 3: Add addons price
            const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
            
            // Step 4: Calculate total unit price
            const unitPrice = basePrice + customizationPrice + addonsPrice;
            
            const newCartItem = {
              cartItemId,
              type: ITEM_TYPES.PRODUCT,
              // Product details
              _id: product._id,
              title: product.title,
              slug: product.slug,
              description: product.description,
              price: product.price,
              discountedPrice: product.discountedPrice,
              effectivePrice: basePrice, // This is the product base price (without customization/addons)
              category: product.category,
              imageUrl: product.imageUrl,
              isVeg: product.isVeg,
              isBestSeller: product.isBestSeller,
              spicyLevel: product.spicyLevel,
              prepTime: product.prepTime,
              rating: product.rating,
              // Cart specific
              quantity,
              totalPrice: unitPrice * quantity, // Total price for this quantity
              // Associated addons
              selectedAddons: selectedAddons.map(addon => ({
                _id: addon._id,
                title: addon.title,
                description: addon.description,
                price: addon.price,
                imageUrl: addon.imageUrl,
                isVeg: addon.isVeg,
                rating: addon.rating
              })),
              // Customization
              selectedCustomization: customization ? {
                option: customization.option,
                price: customization.price
              } : null,
              addedAt: new Date().toISOString()
            };
            
            set({ 
              cart: [...get().cart, newCartItem] 
            });
          }
        } catch (error) {
          console.error("Error adding product to cart:", error);
        }
      },

      // CREATE - Add standalone addon to cart
      addAddonToCart: (addon, quantity = 1) => {
        try {
          const cartItemId = `addon-${addon._id}`;
          const existingItem = get().cart.find((item) => item.cartItemId === cartItemId);
          
          if (existingItem) {
            // If addon exists, increase quantity
            set({
              cart: get().cart.map((item) =>
                item.cartItemId === cartItemId 
                  ? { ...item, quantity: item.quantity + quantity } 
                  : item
              ),
            });
          } else {
            // Create new addon cart item
            const newCartItem = {
              cartItemId,
              type: ITEM_TYPES.ADDON,
              // Addon details
              _id: addon._id,
              title: addon.title,
              description: addon.description,
              price: addon.price,
              effectivePrice: addon.price,
              totalPrice: addon.price,
              imageUrl: addon.imageUrl,
              isVeg: addon.isVeg,
              rating: addon.rating,
              // Cart specific
              quantity,
              selectedAddons: [],
              addedAt: new Date().toISOString()
            };
            
            set({ 
              cart: [...get().cart, newCartItem] 
            });
          }
        } catch (error) {
          console.error("Error adding addon to cart:", error);
        }
      },

      // Legacy method for backward compatibility
      addToCart: (item) => {
        try {
          // Check if it's a product or addon based on available fields
          if (item.slug && item.category) {
            // It's a product
            get().addProductToCart(item, 1, item.selectedAddons || []);
          } else if (item.title && item.price && !item.category) {
            // It's an addon
            get().addAddonToCart(item, 1);
          } else {
            // Fallback to old behavior for compatibility
            const cartItemId = item.cartItemId || item._id || item.id;
            const existingItem = get().cart.find((i) => (i.cartItemId || i._id || i.id) === cartItemId);
            
            if (existingItem) {
              set({
                cart: get().cart.map((i) =>
                  (i.cartItemId || i._id || i.id) === cartItemId 
                    ? { ...i, quantity: i.quantity + 1 } 
                    : i
                ),
              });
            } else {
              set({ 
                cart: [...get().cart, { 
                  ...item, 
                  cartItemId: cartItemId,
                  quantity: 1,
                  addedAt: new Date().toISOString()
                }] 
              });
            }
          }
        } catch (error) {
          console.error("Error adding item to cart:", error);
        }
      },

      // READ - Get cart items (already available as cart state)
      getCartItems: () => get().cart,

      // READ - Get specific item from cart
      getCartItem: (cartItemId) => get().cart.find((item) => item.cartItemId === cartItemId),

      // READ - Check if product with specific addons is in cart
      isProductInCart: (productId, selectedAddonIds = []) => {
        const addonIds = selectedAddonIds.sort().join('-');
        const cartItemId = `${productId}${addonIds ? `-addons-${addonIds}` : ''}`;
        return get().cart.some((item) => item.cartItemId === cartItemId);
      },

      // READ - Get products only from cart
      getProducts: () => get().cart.filter(item => item.type === ITEM_TYPES.PRODUCT),

      // READ - Get addons only from cart
      getAddons: () => get().cart.filter(item => item.type === ITEM_TYPES.ADDON),

      // UPDATE - Update item quantity
      updateQuantity: (cartItemId, quantity) => {
        try {
          if (quantity <= 0) {
            // If quantity is 0 or negative, remove item
            set({
              cart: get().cart.filter((item) => item.cartItemId !== cartItemId),
            });
          } else {
            set({
              cart: get().cart.map((item) => {
                if (item.cartItemId === cartItemId) {
                  // Calculate proper pricing based on the new logic
                  
                  // Step 1: Get base price from the item
                  let basePrice = item.effectivePrice || item.discountedPrice || item.price || 0;
                  
                  // Step 2: Add customization price if selected
                  const customizationPrice = item.selectedCustomization ? item.selectedCustomization.price : 0;
                  
                  // Step 3: Add addons price
                  const addonsPrice = item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
                  
                  // Step 4: Calculate unit price
                  const unitPrice = basePrice + customizationPrice + addonsPrice;
                  
                  return { 
                    ...item, 
                    quantity: Math.max(1, quantity),
                    totalPrice: unitPrice * Math.max(1, quantity)
                  };
                }
                return item;
              }),
            });
          }
        } catch (error) {
          console.error("Error updating quantity:", error);
        }
      },

      // UPDATE - Increment quantity
      incrementQuantity: (cartItemId) => {
        try {
          set({
            cart: get().cart.map((item) => {
              if (item.cartItemId === cartItemId) {
                const newQuantity = item.quantity + 1;
                
                // Calculate proper pricing based on the new logic
                
                // Step 1: Get base price from the item
                let basePrice = item.effectivePrice || item.discountedPrice || item.price || 0;
                
                // Step 2: Add customization price if selected
                const customizationPrice = item.selectedCustomization ? item.selectedCustomization.price : 0;
                
                // Step 3: Add addons price
                const addonsPrice = item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
                
                // Step 4: Calculate unit price
                const unitPrice = basePrice + customizationPrice + addonsPrice;
                
                return { 
                  ...item, 
                  quantity: newQuantity,
                  totalPrice: unitPrice * newQuantity
                };
              }
              return item;
            }),
          });
        } catch (error) {
          console.error("Error incrementing quantity:", error);
        }
      },

      // UPDATE - Decrement quantity
      decrementQuantity: (cartItemId) => {
        try {
          set({
            cart: get().cart.map((item) => {
              if (item.cartItemId === cartItemId) {
                const newQuantity = item.quantity - 1;
                
                if (newQuantity <= 0) {
                  return null; // Mark for removal
                }
                
                // Calculate proper pricing based on the new logic
                
                // Step 1: Get base price from the item
                let basePrice = item.effectivePrice || item.discountedPrice || item.price || 0;
                
                // Step 2: Add customization price if selected
                const customizationPrice = item.selectedCustomization ? item.selectedCustomization.price : 0;
                
                // Step 3: Add addons price
                const addonsPrice = item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
                
                // Step 4: Calculate unit price
                const unitPrice = basePrice + customizationPrice + addonsPrice;
                
                return {
                  ...item,
                  quantity: newQuantity,
                  totalPrice: unitPrice * newQuantity
                };
              }
              return item;
            }).filter(item => item !== null), // Remove items marked for removal
          });
        } catch (error) {
          console.error("Error decrementing quantity:", error);
        }
      },

      // DELETE - Remove specific item from cart
      removeFromCart: (cartItemId) => {
        try {
          set({ 
            cart: get().cart.filter((item) => item.cartItemId !== cartItemId) 
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

      // UTILITY - Check if item exists in cart (legacy support)
      isInCart: (id) => {
        return get().cart.some((item) => 
          item.cartItemId === id || item._id === id || item.id === id
        );
      },

      // UTILITY - Get total price of all items
      getTotalPrice: () => {
        try {
          return get().cart.reduce((acc, item) => {
            // Use totalPrice if it's properly calculated and available
            if (item.totalPrice && item.totalPrice > 0) {
              return acc + item.totalPrice;
            }
            
            // Fallback calculation with new pricing logic
            
            // Step 1: Get base price from the item
            let basePrice = item.effectivePrice || item.discountedPrice || item.price || 0;
            
            // Step 2: Add customization price if selected
            const customizationPrice = item.selectedCustomization ? item.selectedCustomization.price : 0;
            
            // Step 3: Add addons price
            const addonsPrice = item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
            
            // Step 4: Calculate unit price and total for this item
            const unitPrice = basePrice + customizationPrice + addonsPrice;
            const itemTotal = unitPrice * item.quantity;
            
            return acc + itemTotal;
          }, 0);
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

      // UTILITY - Get effective price for an item (with customization and addons)
      getItemEffectivePrice: (item) => {
        try {
          // Step 1: Get base price from the item
          let basePrice = item.effectivePrice || item.discountedPrice || item.price || 0;
          
          // Step 2: Add customization price if selected
          const customizationPrice = item.selectedCustomization ? item.selectedCustomization.price : 0;
          
          // Step 3: Add addons price
          const addonsPrice = item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
          
          // Step 4: Return unit price
          return basePrice + customizationPrice + addonsPrice;
        } catch (error) {
          console.error("Error calculating item effective price:", error);
          return item.price || 0;
        }
      },

      // UTILITY - Get subtotal (price without tax/delivery)
      getSubtotal: () => {
        try {
          return get().getTotalPrice();
        } catch (error) {
          console.error("Error calculating subtotal:", error);
          return 0;
        }
      },

      // UTILITY - Get total discount amount
      getTotalDiscount: () => {
        try {
          return get().cart.reduce((acc, item) => {
            // Only calculate discount for products (not addons) and only if not customized
            if (item.type === ITEM_TYPES.PRODUCT && 
                !item.selectedCustomization && // No customization applied
                item.discountedPrice && 
                item.price > item.discountedPrice) {
              const discount = (item.price - item.discountedPrice) * item.quantity;
              return acc + discount;
            }
            return acc;
          }, 0);
        } catch (error) {
          console.error("Error calculating total discount:", error);
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
      getTotalWithTaxAndDelivery: (taxRate = 0.1, deliveryFee = 40) => {
        try {
          const subtotal = get().getSubtotal();
          const tax = subtotal * taxRate;
          return subtotal + tax + deliveryFee;
        } catch (error) {
          console.error("Error calculating total with tax and delivery:", error);
          return 0;
        }
      },

      // UTILITY - Get cart summary
      getCartSummary: () => {
        try {
          const cart = get().cart;
          const subtotal = get().getSubtotal();
          const discount = get().getTotalDiscount();
          const tax = get().getTax();
          const deliveryFee = subtotal > 0 ? 40 : 0; // Free delivery above certain amount
          const total = subtotal + tax + deliveryFee;

          return {
            itemCount: get().getTotalItems(),
            uniqueItemCount: get().getTotalUniqueItems(),
            subtotal,
            discount,
            tax,
            deliveryFee,
            total,
            products: get().getProducts(),
            addons: get().getAddons(),
            isEmpty: cart.length === 0
          };
        } catch (error) {
          console.error("Error getting cart summary:", error);
          return {
            itemCount: 0,
            uniqueItemCount: 0,
            subtotal: 0,
            discount: 0,
            tax: 0,
            deliveryFee: 0,
            total: 0,
            products: [],
            addons: [],
            isEmpty: true
          };
        }
      },

      // UTILITY - Format items for order API
      formatForOrder: () => {
        try {
          const cart = get().cart;
          const items = [];
          const addons = [];

          cart.forEach(cartItem => {
            if (cartItem.type === ITEM_TYPES.PRODUCT) {
              // Calculate the correct price for the product using new logic
              
              // Step 1: Get base price
              let basePrice = cartItem.effectivePrice || cartItem.discountedPrice || cartItem.price || 0;
              
              // Step 2: Add customization price if selected
              const customizationPrice = cartItem.selectedCustomization ? cartItem.selectedCustomization.price : 0;
              
              // Step 3: Calculate final product price (base + customization, addons handled separately)
              const productPrice = basePrice + customizationPrice;
              
              // Add main product
              items.push({
                productId: cartItem._id,
                title: cartItem.title,
                slug: cartItem.slug,
                price: productPrice,
                quantity: cartItem.quantity,
                imageUrl: cartItem.imageUrl,
                customization: cartItem.selectedCustomization || null
              });

              // Add associated addons to the addons array
              if (cartItem.selectedAddons && cartItem.selectedAddons.length > 0) {
                cartItem.selectedAddons.forEach(addon => {
                  addons.push({
                    addOnId: addon._id,
                    name: addon.title,
                    price: addon.price,
                    quantity: cartItem.quantity, // Same quantity as parent product
                    image: addon.imageUrl
                  });
                });
              }
            } else if (cartItem.type === ITEM_TYPES.ADDON) {
              // Add standalone addon
              addons.push({
                addOnId: cartItem._id,
                name: cartItem.title,
                price: cartItem.price,
                quantity: cartItem.quantity,
                image: cartItem.imageUrl
              });
            }
          });

          return { items, addons };
        } catch (error) {
          console.error("Error formatting cart for order:", error);
          return { items: [], addons: [] };
        }
      }
    }),
    {
      name: "cart-storage", // localStorage key
      getStorage: () => localStorage, // explicitly use localStorage
    }
  )
);

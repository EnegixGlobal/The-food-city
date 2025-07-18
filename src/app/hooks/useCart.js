// hooks/useCart.js
import { useCartStore } from '../zustand/cartStore';

export const useCart = () => {
  const store = useCartStore();
  
  return {
    // Cart state
    cart: store.cart,
    
    // CRUD operations
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateQuantity: store.updateQuantity,
    incrementQuantity: store.incrementQuantity,
    decrementQuantity: store.decrementQuantity,
    clearCart: store.clearCart,
    
    // Query operations
    getCartItem: store.getCartItem,
    isInCart: store.isInCart,
    
    // Calculations
    getTotalPrice: store.getTotalPrice,
    getTotalItems: store.getTotalItems,
    getTotalUniqueItems: store.getTotalUniqueItems,
    getSubtotal: store.getSubtotal,
    getTax: store.getTax,
    getTotalWithTaxAndDelivery: store.getTotalWithTaxAndDelivery,
    
    // Computed values
    isEmpty: store.cart.length === 0,
    itemCount: store.cart.length,
    
    // Helper functions
    addMultipleItems: (items) => {
      items.forEach(item => store.addToCart(item));
    },
    
    // Format currency
    formatPrice: (price) => `$${price.toFixed(2)}`,
    
    // Get formatted totals
    getFormattedTotals: () => ({
      subtotal: `$${store.getSubtotal().toFixed(2)}`,
      tax: `$${store.getTax().toFixed(2)}`,
      total: `$${store.getTotalPrice().toFixed(2)}`,
      totalWithDelivery: `$${store.getTotalWithTaxAndDelivery().toFixed(2)}`,
    }),
  };
};

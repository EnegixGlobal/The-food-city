// Example usage of the cart store
import { useCartStore } from '../zustand/cartStore';

const CartUsageExample = () => {
  // Get cart state and functions
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartItem,
    isInCart,
    getTotalPrice,
    getTotalItems,
    getTotalUniqueItems,
    getSubtotal,
    getTax,
    getTotalWithTaxAndDelivery,
  } = useCartStore();

  // Example item
  const exampleItem = {
    id: 1,
    name: "Butter Chicken",
    price: 12.99,
    category: "indian",
    image: "https://example.com/butter-chicken.jpg",
    description: "Creamy tomato-based curry",
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Cart Usage Examples</h2>
      
      {/* Cart Actions */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Cart Actions</h3>
        <div className="space-x-2">
          <button 
            onClick={() => addToCart(exampleItem)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Item to Cart
          </button>
          
          <button 
            onClick={() => removeFromCart(1)}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Remove Item
          </button>
          
          <button 
            onClick={() => updateQuantity(1, 3)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Update Quantity to 3
          </button>
          
          <button 
            onClick={() => incrementQuantity(1)}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Increment (+1)
          </button>
          
          <button 
            onClick={() => decrementQuantity(1)}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Decrement (-1)
          </button>
          
          <button 
            onClick={clearCart}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Cart Information */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Cart Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Total Items:</strong> {getTotalItems()}</p>
            <p><strong>Unique Items:</strong> {getTotalUniqueItems()}</p>
            <p><strong>Subtotal:</strong> ${getSubtotal().toFixed(2)}</p>
            <p><strong>Tax (10%):</strong> ${getTax().toFixed(2)}</p>
            <p><strong>Total Price:</strong> ${getTotalPrice().toFixed(2)}</p>
            <p><strong>Total with Tax & Delivery:</strong> ${getTotalWithTaxAndDelivery().toFixed(2)}</p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Is Item 1 in Cart:</strong> {isInCart(1) ? 'Yes' : 'No'}</p>
            <p><strong>Item 1 Details:</strong></p>
            {getCartItem(1) && (
              <div className="ml-4">
                <p>Name: {getCartItem(1).name}</p>
                <p>Quantity: {getCartItem(1).quantity}</p>
                <p>Price: ${getCartItem(1).price}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Items Display */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Cart Items</h3>
        {cart.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded shadow">
                <div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-gray-600">${item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => decrementQuantity(item.id)}
                    className="bg-gray-200 px-2 py-1 rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => incrementQuantity(item.id)}
                    className="bg-gray-200 px-2 py-1 rounded"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartUsageExample;

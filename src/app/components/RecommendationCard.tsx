import Image from "next/image";
import React, { useState } from "react";
import { FiStar } from "react-icons/fi";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa6";
import Button from "./Button";
import { useAddonStore } from "@/app/zustand/addonStore";
import AddonCustomizationModal from "./AddonCustomizationModal";

interface RecommendatedionCardProps {
  item: {
    description: string;
    isVeg: boolean;
    id: number | string; // Allow both number and string IDs
    name: string;
    image: string;
    price: number;
    rating: number;
    // Add customization support
    isCustomizable?: boolean;
    customizableOptions?: Array<{
      option: string;
      price: number;
    }>;
  };
}

function RecommendationCard({ item }: RecommendatedionCardProps) {
  // Addon store
  const {
    addAddonToCart,
    addons,
    incrementAddonQuantity,
    decrementAddonQuantity,
    removeAddonFromCart,
    isAddonInCart,
  } = useAddonStore();

  // State for customization modal
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [cartRefreshKey, setCartRefreshKey] = useState(0); // Force re-render when cart updates

  // Handle cart update callback
  const handleCartUpdate = () => {
    setCartRefreshKey(prev => prev + 1);
  };

  // Get all cart items for this product (regardless of customization)
  const allCartItemsForProduct = addons.filter((cartItem: any) => 
    cartItem._id === item.id.toString()
  );

  // Check if ANY version of this item is in cart
  const isItemInCart = allCartItemsForProduct.length > 0;

  // Get the primary cart item (first one found, could be customized or not)
  const primaryCartItem = allCartItemsForProduct[0] || null;

  const itemQuantityInCart = primaryCartItem ? primaryCartItem.quantity : 0;

  // Get effective price based on item customization
  const getEffectivePrice = () => {
    // If item is customizable, show first customization option price
    if (item.isCustomizable && item.customizableOptions && item.customizableOptions.length > 0) {
      return item.customizableOptions[0].price;
    }
    
    // For non-customizable items, show original price
    return item.price;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // Check if item is customizable - ALWAYS show modal for customizable items
    if (item.isCustomizable) {
      setShowCustomizationModal(true);
      return;
    }

    // For non-customizable items, add directly to cart
    try {
      // Create addon object matching the expected structure
      const addonData = {
        _id: item.id.toString(),
        title: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image,
        isVeg: item.isVeg,
        rating: item.rating,
      };

      addAddonToCart(addonData, 1, null); // No customization for non-customizable items
      console.log(`Added ${item.name} to cart`);
    } catch (error) {
      console.error("Error adding addon to cart:", error);
    }
  };

  // Handle edit customization
  const handleEditCustomization = () => {
    setShowCustomizationModal(true);
  };

  // Handle increment quantity in cart
  const handleIncrementCart = () => {
    try {
      if (primaryCartItem && primaryCartItem.addonCartItemId) {
        incrementAddonQuantity(primaryCartItem.addonCartItemId);
      }
    } catch (error) {
      console.error("Error incrementing quantity:", error);
    }
  };

  // Handle decrement quantity in cart
  const handleDecrementCart = () => {
    try {
      if (primaryCartItem && primaryCartItem.addonCartItemId) {
        if (itemQuantityInCart <= 1) {
          // Remove item if quantity is 1 or less
          removeAddonFromCart(primaryCartItem.addonCartItemId);
        } else {
          decrementAddonQuantity(primaryCartItem.addonCartItemId);
        }
      }
    } catch (error) {
      console.error("Error decrementing quantity:", error);
    }
  };

  // Normalize item data for CustomizationModal
  const normalizedItem = {
    _id: item.id.toString(),
    title: item.name,
    imageUrl: item.image,
    price: item.price,
    isCustomizable: item.isCustomizable || false,
    customizableOptions: item.customizableOptions || [],
    description: item.description,
    isVeg: item.isVeg,
    rating: item.rating,
  };


  return (
    <div
      key={item.id}
      className=" flex  my-2 md:px-20 overflow-hidden border-t border-gray-300 py-4 transition">
      <div className="md:p-4 p-2 flex-8">
        {item.isVeg && (
          <span className=" text-green-800 rounded-full text-xs font-medium">
            <Image
              src="/veg.svg"
              alt="Vegetarian"
              width={16}
              height={16}
              className="inline-block mr-1"
            />
          </span>
        )}
        <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
        <div className="items-center">
          <span className="text-red-600 font-bold">
            ₹{getEffectivePrice().toFixed(2)}
          </span>
          <div className="flex items-center">
            <FiStar className="text-yellow-400 mr-1" />
            <span>{item.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>

        {/* Show selected customization if any */}
        {primaryCartItem?.selectedCustomization && (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border">
              {primaryCartItem.selectedCustomization.option} - ₹
              {primaryCartItem.selectedCustomization.price.toFixed(2)}
            </span>
            {item.isCustomizable && (
              <button
                onClick={handleEditCustomization}
                className="text-xs text-blue-600 underline hover:text-blue-700"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>
      <div>
        <Image
          src={item.image}
          alt={item.name}
          width={160}
          height={160}
          className="w-40 h-40 object-cover rounded-2xl"
        />
        <div className="flex  justify-center -mt-3">
          {isItemInCart ? (
            // Quantity Controls for items already in cart
            <div className="flex items-center bg-green-50 border border-green-200 rounded-md px-3 py-2">
              <button
                onClick={handleDecrementCart}
                className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                <FaMinus className="text-xs" />
              </button>

              <div className="flex flex-col items-center mx-3">
                <span className="text-xs text-green-600 font-medium">
                  In Cart
                </span>
                <span className="text-lg font-bold text-green-700">
                  {itemQuantityInCart}
                </span>
              </div>

              <button
                onClick={handleIncrementCart}
                className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                <FaPlus className="text-xs" />
              </button>
            </div>
          ) : (
            // Regular add to cart button
            <Button
              onClick={handleAddToCart}
              className="relative text-sm flex items-center gap-2">
              <FaCartPlus />
              Add to Cart
            </Button>
          )}
        </div>
        <p className="text-center mt-1 text-sm text-gray-400">
          {item.isCustomizable && "Customisable"}
        </p>
      </div>

      {/* Addon Customization Modal */}
      {showCustomizationModal && (
        <AddonCustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          onCartUpdate={handleCartUpdate}
          item={normalizedItem}
        />
      )}
    </div>
  );
}

export default RecommendationCard;

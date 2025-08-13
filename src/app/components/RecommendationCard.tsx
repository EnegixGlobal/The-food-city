import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { FiStar } from "react-icons/fi";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaCartPlus } from "react-icons/fa6";
import Button from "./Button";
import CustomizationModal from "./CustomizationModal";
import { useCartStore } from "@/app/zustand/cartStore";

interface RecommendatedionCardProps {
  item: {
    id: number | string;
    name: string;
    description: string;
    image: string;
    price: number;
    rating: number;
    isVeg: boolean;
    slug?: string;
    category?: string;
    discountedPrice?: number;
    isBestSeller?: boolean;
    spicyLevel?: number;
    prepTime?: string | number;
    isCustomizable?: boolean;
    customizableOptions?: Array<{ option: string; price: number }>;
  };
}

function RecommendationCard({ item }: RecommendatedionCardProps) {
  // Cart store (products)
  const {
    cart,
    addProductToCart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
  } = useCartStore();

  // State for customization modal
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [cartRefreshKey, setCartRefreshKey] = useState(0); // Force re-render when cart updates
  const [showImageModal, setShowImageModal] = useState(false);

  // Close modal handler
  const closeImageModal = useCallback(() => setShowImageModal(false), []);

  // ESC key close
  useEffect(() => {
    if (!showImageModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeImageModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showImageModal, closeImageModal]);

  // Handle cart update callback
  const handleCartUpdate = () => {
    setCartRefreshKey(prev => prev + 1);
  };

  // Derive cart info for this product (any variant)
  const productCartItems = cart.filter((c: any) => c._id === item.id.toString());
  const primaryCartItem = productCartItems[0] || null;
  const isItemInCart = productCartItems.length > 0;
  const itemQuantityInCart = primaryCartItem ? primaryCartItem.quantity : 0;

  // Get effective price based on item customization
  const getEffectivePrice = () => {
    if (item.discountedPrice) return item.discountedPrice;
    if (item.isCustomizable && item.customizableOptions?.length) {
      return item.customizableOptions[0].price;
    }
    return item.price;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (item.isCustomizable && item.customizableOptions?.length) {
      setShowCustomizationModal(true);
      return;
    }
    try {
      const normalizedProduct = {
        _id: item.id.toString(),
        title: item.name,
        slug: item.slug || item.name.toLowerCase().replace(/ /g, "-"),
        description: item.description,
        price: item.price,
        discountedPrice: item.discountedPrice,
        category: item.category || "",
        imageUrl: item.image,
        isVeg: item.isVeg,
        isBestSeller: item.isBestSeller,
        spicyLevel: item.spicyLevel || 0,
        prepTime: typeof item.prepTime === "string" ? parseInt(item.prepTime) || 30 : item.prepTime || 30,
        rating: item.rating,
      };
      addProductToCart(normalizedProduct, 1, [], null);
      setCartRefreshKey((k) => k + 1);
    } catch (e) {
      console.error("Error adding product to cart from recommendation:", e);
    }
  };

  // Handle edit customization
  const handleEditCustomization = () => {
    setShowCustomizationModal(true);
  };

  // Handle increment quantity in cart
  const handleIncrementCart = () => {
    try {
      if (primaryCartItem?.cartItemId) {
        incrementQuantity(primaryCartItem.cartItemId);
      }
    } catch (e) {
      console.error("Error incrementing quantity:", e);
    }
  };

  // Handle decrement quantity in cart
  const handleDecrementCart = () => {
    try {
      if (primaryCartItem?.cartItemId) {
        if (itemQuantityInCart <= 1) {
          removeFromCart(primaryCartItem.cartItemId);
        } else {
          decrementQuantity(primaryCartItem.cartItemId);
        }
      }
    } catch (e) {
      console.error("Error decrementing quantity:", e);
    }
  };

  // Normalize item data for CustomizationModal
  const normalizedCustomizationItem = {
    _id: item.id.toString(),
    title: item.name,
    imageUrl: item.image,
    price: item.price,
    discountedPrice: item.discountedPrice,
    isCustomizable: item.isCustomizable || false,
    customizableOptions: item.customizableOptions || [],
  };

  const handleCustomizationAdd = (selectedOption: { option: string; price: number }) => {
    try {
      const normalizedProduct = {
        _id: item.id.toString(),
        title: item.name,
        slug: item.slug || item.name.toLowerCase().replace(/ /g, "-"),
        description: item.description,
        price: item.price,
        discountedPrice: item.discountedPrice,
        category: item.category || "",
        imageUrl: item.image,
        isVeg: item.isVeg,
        isBestSeller: item.isBestSeller,
        spicyLevel: item.spicyLevel || 0,
        prepTime: typeof item.prepTime === "string" ? parseInt(item.prepTime) || 30 : item.prepTime || 30,
        rating: item.rating,
      };
      addProductToCart(normalizedProduct, 1, [], selectedOption);
      setShowCustomizationModal(false);
      setCartRefreshKey((k) => k + 1);
    } catch (e) {
      console.error("Error adding customized product to cart:", e);
    }
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
        <button
          type="button"
          aria-label="Preview image"
          onClick={() => setShowImageModal(true)}
          className="group relative focus:outline-none focus:ring-2 focus:ring-red-500 rounded-2xl">
          <Image
            src={item.image}
            alt={item.name}
            width={160}
            height={160}
            className="w-40 h-40 object-cover rounded-2xl shadow-sm transition duration-300 group-hover:shadow-xl group-hover:scale-[1.02]"
          />
          <span className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center text-white opacity-0 group-hover:opacity-100 text-xs font-medium tracking-wide">
            VIEW
          </span>
        </button>
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
        <CustomizationModal
          isOpen={showCustomizationModal}
          onClose={() => setShowCustomizationModal(false)}
          item={normalizedCustomizationItem}
          onAddToCart={handleCustomizationAdd}
        />
      )}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center px-4 py-10 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 animate-fadeIn"
            onClick={closeImageModal}
          />
          {/* Modal content */}
          <div
            className="relative z-10 w-full max-w-md md:max-w-lg bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn"
          >
            <button
              onClick={closeImageModal}
              aria-label="Close image preview"
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur hover:bg-red-600 hover:text-white text-gray-600 shadow transition"
            >
              ✕
            </button>
            <div className="p-3 sm:p-4">
              <div className="relative rounded-xl overflow-hidden group">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={800}
                  height={600}
                  className="w-full h-auto max-h-[70vh] object-cover select-none"
                  priority
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
              </div>
              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">
                    {item.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                <span className="text-red-600 font-bold whitespace-nowrap">
                  ₹{getEffectivePrice().toFixed(2)}
                </span>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={closeImageModal}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeImageModal();
                    handleAddToCart();
                  }}
                  className="px-5 py-2 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 shadow-sm transition flex items-center gap-2"
                >
                  <FaCartPlus /> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecommendationCard;

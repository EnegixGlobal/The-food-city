import React, { useState } from "react";
import { FaRupeeSign, FaTimes, FaCheck } from "react-icons/fa";
import { FiClock, FiStar } from "react-icons/fi";
import Image from "next/image";
import Button from "./Button";

interface CustomizableOption {
  option: string;
  price: number;
}

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    _id: string;
    title: string;
    imageUrl?: string;
    price: number;
    discountedPrice?: number;
    isCustomizable?: boolean;
    customizableOptions?: CustomizableOption[];
  };
  onAddToCart: (selectedOption: CustomizableOption) => void;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
  item,
  onAddToCart,
}) => {
  const [selectedOption, setSelectedOption] =
    useState<CustomizableOption | null>(item.customizableOptions?.[0] || null);

  if (!isOpen || !item.isCustomizable || !item.customizableOptions) {
    return null;
  }

  const handleAddToCart = () => {
    if (selectedOption) {
      onAddToCart(selectedOption);
      onClose();
    }
  };

  // Calculate base price following new pricing logic
  const getBasePrice = () => {
    if (item.discountedPrice) {
      return item.discountedPrice;
    } else if (item.price) {
      return item.price;
    } else if (item.customizableOptions && item.customizableOptions.length > 0) {
      return item.customizableOptions[0].price;
    }
    return 0;
  };

  const basePrice = getBasePrice();
  const customizationPrice = selectedOption ? selectedOption.price : 0;
  const totalPrice = basePrice + customizationPrice;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl transform transition-all duration-300 flex flex-col">
        {/* Header with Product Image */}
        <div className="relative bg-gradient-to-r from-orange-50 to-red-50 p-3 sm:p-4 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 hover:bg-white/80 rounded-full transition-all duration-200 shadow-sm z-10 group">
            <FaTimes className="text-gray-600 group-hover:text-gray-800 transition-colors text-sm sm:text-base" />
          </button>

          <div className="flex items-start gap-2 sm:gap-3 pr-8">
            {item.imageUrl && (
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {item.title}
              </h2>
              {/* Show only base price - simplified */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Starting from:</span>
                {item.discountedPrice ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-lg sm:text-xl font-bold text-green-600">
                      <FaRupeeSign className="text-base" />
                      {item.discountedPrice}
                    </div>
                    <div className="flex items-center text-sm text-gray-400 line-through">
                      <FaRupeeSign className="text-xs" />
                      {item.price}
                    </div>
                  </div>
                ) : item.price ? (
                  <div className="flex items-center text-lg sm:text-xl font-bold text-green-600">
                    <FaRupeeSign className="text-base" />
                    {item.price}
                  </div>
                ) : (
                  <div className="flex items-center text-lg sm:text-xl font-bold text-orange-600">
                    <FaRupeeSign className="text-base" />
                    {Math.min(...item.customizableOptions.map((opt) => opt.price))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                Choose Your Option
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {item.customizableOptions.map((option, index) => (
                <label
                  key={index}
                  className={`group relative flex items-center justify-between p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedOption?.option === option.option
                      ? "bg-orange-50 ring-2 ring-orange-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}>
                  <div className="flex items-center flex-1">
                    <input
                      type="radio"
                      name="customization"
                      value={option.option}
                      checked={selectedOption?.option === option.option}
                      onChange={() => setSelectedOption(option)}
                      className="sr-only"
                    />

                    {/* Custom Radio Button */}
                    <div
                      className={`relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 mr-2 sm:mr-3 transition-all duration-200 ${
                        selectedOption?.option === option.option
                          ? "border-orange-500 bg-orange-500"
                          : "border-gray-300 group-hover:border-gray-400"
                      }`}>
                      {selectedOption?.option === option.option && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FaCheck className="text-white text-xs" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-semibold text-gray-900 text-base sm:text-lg">
                          {option.option}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end ml-2 sm:ml-4">
                    <div className="flex items-center text-lg sm:text-xl font-bold text-gray-900">
                      <span className="text-sm mr-1">+</span>
                      <FaRupeeSign className="text-base sm:text-lg" />
                      {option.price}
                    </div>
                    {selectedOption?.option === option.option && (
                      <span className="text-sm text-orange-600 font-medium">
                        ✓ Selected
                      </span>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {selectedOption ? (
                <div className="flex items-center justify-between font-bold text-gray-900">
                  <span className="text-base sm:text-lg">Total Price:</span>
                  <div className="flex items-center text-xl sm:text-2xl">
                    <FaRupeeSign className="text-lg sm:text-xl" />
                    <span>{totalPrice.toFixed(0)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-lg sm:text-xl font-bold text-gray-900">
                  <span className="text-gray-500 mr-2 text-base sm:text-lg">Select an option</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!selectedOption}
              className={`ml-3 sm:ml-4 py-2.5 sm:py-3 px-4 sm:px-6 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 transform ${
                selectedOption
                  ? ""
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}>
              {selectedOption ? (
                <span>Add to Cart</span>
              ) : (
                <span className="text-sm sm:text-base">Select option</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationModal;

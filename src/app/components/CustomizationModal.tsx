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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl transform transition-all duration-300 animate-in slide-in-from-bottom-4 flex flex-col">
        {/* Header with Product Image */}
        <div className="relative bg-gradient-to-r from-orange-50 to-red-50 p-4 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 hover:bg-white/80 rounded-full transition-all duration-200 shadow-sm z-10 group">
            <FaTimes className="text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>

          <div className="flex items-start gap-3">
            {item.imageUrl && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                {item.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FiStar className="text-yellow-400" />
                  <span>4.5</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock className="text-gray-400" />
                  <span>25-30 min</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                {/* Base Product Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Base Price:</span>
                  {item.discountedPrice ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-base font-bold text-green-600">
                        <FaRupeeSign className="text-sm" />
                        {item.discountedPrice}
                      </div>
                      <div className="flex items-center text-sm text-gray-400 line-through">
                        <FaRupeeSign className="text-xs" />
                        {item.price}
                      </div>
                    </div>
                  ) : item.price ? (
                    <div className="flex items-center text-base font-bold text-green-600">
                      <FaRupeeSign className="text-sm" />
                      {item.price}
                    </div>
                  ) : (
                    <div className="flex items-center text-base font-bold text-orange-600">
                      <FaRupeeSign className="text-sm" />
                      {Math.min(...item.customizableOptions.map((opt) => opt.price))}
                    </div>
                  )}
                </div>
                
                {/* Plus symbol */}
                <span className="text-gray-400 font-bold">+</span>
                
                {/* Customization Price Range */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Customization:</span>
                  <div className="flex items-center text-base font-bold text-orange-600">
                    <FaRupeeSign className="text-sm" />
                    {Math.min(...item.customizableOptions.map((opt) => opt.price))}
                    {Math.min(...item.customizableOptions.map((opt) => opt.price)) !== 
                     Math.max(...item.customizableOptions.map((opt) => opt.price)) && (
                      <>
                        {" - "}
                        <FaRupeeSign className="text-sm" />
                        {Math.max(...item.customizableOptions.map((opt) => opt.price))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Choose Your Preference
              </h3>
              <p className="text-gray-600 text-sm">
                Select one option to customize your order
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {item.customizableOptions.map((option, index) => (
                <label
                  key={index}
                  className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
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
                      className={`relative w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200 ${
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
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-semibold text-gray-900">
                          {option.option}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Additional customization
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end ml-4">
                    <div className="flex items-center text-lg font-bold text-gray-900">
                      <span className="text-sm mr-1">+</span>
                      <FaRupeeSign className="text-base" />
                      {option.price}
                    </div>
                    {selectedOption?.option === option.option && (
                      <span className="text-xs text-orange-600 font-medium">
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
        <div className="bg-gray-50 border-t border-gray-100 p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              {selectedOption ? (
                <div className="space-y-1">
                  {/* Price Breakdown */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Base Price:</span>
                    <div className="flex items-center">
                      <FaRupeeSign className="text-xs" />
                      <span>{basePrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{selectedOption.option}:</span>
                    <div className="flex items-center">
                      <span className="text-xs mr-1">+</span>
                      <FaRupeeSign className="text-xs" />
                      <span>{customizationPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-1">
                    <div className="flex items-center justify-between font-bold text-gray-900">
                      <span>Total:</span>
                      <div className="flex items-center text-xl">
                        <FaRupeeSign className="text-lg" />
                        <span>{totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-xl font-bold text-gray-900">
                  <span className="text-gray-500 mr-2">Select an option</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!selectedOption}
              className={`ml-4 py-3 px-6 text-base font-bold rounded-xl transition-all duration-200 transform ${
                selectedOption
                  ? ""
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}>
              {selectedOption ? (
                <div className="flex items-center justify-center gap-2">
                  <span>Add to Cart</span>
                </div>
              ) : (
                "Please select an option"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationModal;

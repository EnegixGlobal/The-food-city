"use client";

import React, { useState, useEffect } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import {
  FaUser,
  FaRupeeSign,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import {
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiArrowRight,
  FiX,
} from "react-icons/fi";
import Input from "../components/Input";
import Container from "../components/Container";
import Image from "next/image";
import Button from "../components/Button";
import { useCartStore } from "../zustand/cartStore";
import { useAddonStore } from "../zustand/addonStore";
import { useCombinedCartStore } from "../zustand/combinedCartStore";
import useUserStore from "../zustand/userStore";
import useToggleLoginStore from "../zustand/toggleLoginStore";
import { showAlert } from "../zustand/alertStore";
import SideLogin from "../components/SideLogin";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Spinner from "../components/Spinner";

// Declare Razorpay global
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Address interface
interface Address {
  _id: string;
  fullAddress: string;
  doorOrFlatNo?: string;
  pincode: string;
  landmark?: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const user = useUserStore((state) => state.user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    couponId: string;
  } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "online" | "cod"
  >("online");

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Process payment
  const processPayment = async (orderData: any) => {
    try {
      setProcessingPayment(true);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      // Create payment order
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: orderData.orderId }),
      });

      const paymentData = await response.json();
      if (!response.ok || !paymentData.success) {
        throw new Error(paymentData.message || "Failed to create payment");
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentData.data.amount,
        currency: paymentData.data.currency,
        name: "The Food City",
        description: `Payment for Order #${orderData.orderId}`,
        order_id: paymentData.data.razorpayOrderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.orderId,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok && verifyData.success) {
              showAlert.success(
                "Payment Successful!",
                "Your order has been confirmed"
              );

              // Clear cart and redirect
              const { clearCart } = useCartStore.getState();
              clearCart();
              clearAddons();

              setTimeout(() => {
                router.push("/my-account");
              }, 2000);
            } else {
              throw new Error(
                verifyData.message || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            showAlert.error(
              "Payment Verification Failed",
              "Please contact support"
            );
          }
        },
        modal: {
          ondismiss: () => {
            showAlert.warning(
              "Payment Cancelled",
              "You can retry payment anytime"
            );
            setProcessingPayment(false);
          },
        },
        theme: {
          color: "#b91c1c", // red-700
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment processing error:", error);
      showAlert.error(
        "Payment Failed",
        error instanceof Error ? error.message : "Payment processing failed"
      );
      setProcessingPayment(false);
    }
  };

  // Get login modal state
  const { isLoginOpen, openLogin, closeLogin } = useToggleLoginStore();

  // Get cart data from stores
  const { cart, incrementQuantity, decrementQuantity } = useCartStore();

  // Get addon cart data
  const {
    addons,
    incrementAddonQuantity,
    decrementAddonQuantity,
    clearAddons,
  } = useAddonStore();

  // Get combined cart summary
  const { getCombinedCartSummary } = useCombinedCartStore();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Set initial step based on user authentication status
  useEffect(() => {
    if (isHydrated) {
      // If user is logged in, start at address step (step 1)
      // If user is not logged in, start at login step (step 1)
      setActiveStep(1);
    }
  }, [isHydrated, user]);

  // Get combined cart summary with coupon discount applied
  const cartSummary = isHydrated
    ? (() => {
        const baseSummary = getCombinedCartSummary();
        const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
        return {
          ...baseSummary,
          discount: baseSummary.discount + couponDiscount,
          grandTotal:
            baseSummary.subtotal +
            baseSummary.tax +
            baseSummary.deliveryFee -
            (baseSummary.discount + couponDiscount),
        };
      })()
    : {
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
        isEmpty: true,
      };

  // Form states
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    instructions: "",
    flatNumber: "",
    Landmark: "",
    pincode: "",
  });
  const [showAddressSidebar, setShowAddressSidebar] = useState(false);

  // Fetch user addresses
  const fetchAddresses = async () => {
    if (!user) {
      setAddresses([]);
      setSelectedAddress(null);
      return;
    }

    setLoadingAddresses(true);
    try {
      const response = await fetch("/api/users/address", {
        cache: "no-store",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const addressList = data.data || [];
        setAddresses(addressList);
      } else {
        showAlert.warning(
          "No Addresses Found",
          "Please add an address to proceed"
        );
      }
    } catch (error) {
      console.error("Network error fetching addresses:", error);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Fetch addresses when user logs in
  useEffect(() => {
    if (user && isHydrated) {
      fetchAddresses();
    }
  }, [user, isHydrated]);

  // Save new address
  const saveNewAddress = async () => {
    if (!user) {
      showAlert.error(
        "Authentication Required",
        "Please login to save address"
      );
      return;
    }

    // Validate required fields
    if (!address.street.trim()) {
      showAlert.error("Validation Error", "Please enter full address");
      return;
    }

    if (!address.pincode.trim()) {
      showAlert.error("Validation Error", "Please enter pincode");
      return;
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      showAlert.error(
        "Validation Error",
        "Please enter a valid 6-digit pincode"
      );
      return;
    }

    setSavingAddress(true);

    try {
      const addressData = {
        fullAddress: address.street.trim(),
        pincode: address.pincode.trim(),
        doorOfFlat: address.flatNumber.trim() || undefined,
        landmark: address.Landmark.trim() || undefined,
      };

      console.log("Sending address data:", addressData);

      const response = await fetch("/api/users/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(addressData),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.success) {
        // Reset form
        setAddress({
          street: "",
          city: "",
          state: "",
          zip: "",
          instructions: "",
          flatNumber: "",
          Landmark: "",
          pincode: "",
        });

        // Refresh addresses list
        await fetchAddresses();

        // Close sidebar
        setShowAddressSidebar(false);

        // Set the new address as selected
        setSelectedAddress(data.data);

        showAlert.success(
          "Address Saved!",
          "Your delivery address has been saved successfully"
        );
      } else {
        // Handle API errors
        const errorMessage = data.message || "Failed to save address";
        console.error("API Error:", errorMessage);
        showAlert.error("Save Failed", errorMessage);
      }
    } catch (error) {
      console.error("Network Error saving address:", error);
      showAlert.error(
        "Network Error",
        "Please check your connection and try again."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // Dynamic step management based on user authentication
  const [activeStep, setActiveStep] = useState(1); // 1: Login/Address, 2: Payment

  // Determine if user needs to login or can proceed to address
  const needsLogin = !user;
  const maxSteps = needsLogin ? 3 : 2; // 3 steps if login needed, 2 if user exists

  // Handle address input change
  const handleAddressChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Handle address selection
  const selectAddress = (addr: Address) => {
    setSelectedAddress(addr);
  };

  // Apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showAlert.error("Validation Error", "Please enter a coupon code");
      return;
    }

    if (appliedCoupon) {
      showAlert.warning(
        "Coupon Already Applied",
        "Please remove the current coupon before applying a new one"
      );
      return;
    }

    if (!cart.length && !addons.length) {
      showAlert.error(
        "Empty Cart",
        "Please add items to your cart before applying a coupon"
      );
      return;
    }

    setApplyingCoupon(true);

    console.log(cart);

    try {
      // Prepare cart items for API
      const cartItems = [
        ...cart.map((item: any) => ({
          _id: item._id,
          price: item.totalPrice,
          quantity: item.quantity,
        })),
        ...addons.map((item: any) => ({
          _id: item._id,
          price: item.totalPrice,
          quantity: item.quantity,
        })),
      ];

      const response = await fetch("/api/coupon/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          cartItems: cartItems,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAppliedCoupon({
          code: data.data.couponCode,
          discountAmount: data.data.discountAmount,
          couponId: data.data.couponId,
        });
        showAlert.success(
          "Coupon Applied!",
          `You saved ₹${data.data.discountAmount.toFixed(2)} with ${
            data.data.couponCode
          }`
        );
        setCouponCode(""); // Clear input
      } else {
        showAlert.error(
          "Coupon Failed",
          data.message || "Invalid or expired coupon code"
        );
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      showAlert.error(
        "Network Error",
        "Failed to apply coupon. Please try again."
      );
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    showAlert.success(
      "Coupon Removed",
      "Coupon has been removed from your order"
    );
  };

  // Create order function
  const createOrder = async () => {
    if (!user) {
      showAlert.error("Authentication Required", "Please login to place order");
      return false;
    }

    if (!selectedAddress) {
      showAlert.error("Address Required", "Please select a delivery address");
      return false;
    }

    if (cartSummary.isEmpty) {
      showAlert.error("Empty Cart", "Please add items to your cart");
      return false;
    }

    try {
      // Prepare order items from cart
      const orderItems = cart.map((item: any) => ({
        productId: item._id,
        // Combine base title with customization if exists
        title: item.selectedCustomization
          ? `${item.title} with ${item.selectedCustomization.option}`
          : item.title,
        slug: item.slug || item.title.toLowerCase().replace(/\s+/g, "-"),
        // Store combined price (base + customization)
        price: item.selectedCustomization
          ? (item.effectivePrice || item.price) +
            item.selectedCustomization.price
          : item.effectivePrice || item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl || "",
        // Keep customization details for reference
        selectedCustomization: item.selectedCustomization
          ? {
              option: item.selectedCustomization.option,
              price: item.selectedCustomization.price,
              basePrice: item.effectivePrice || item.price,
            }
          : null,
      }));

      // Prepare order addons
      const orderAddons = addons.map((addon: any) => ({
        addOnId: addon._id,
        // Combine base name with customization if exists
        name: addon.selectedCustomization
          ? `${addon.title} with ${addon.selectedCustomization.option}`
          : addon.title,
        // Store combined price (base + customization)
        price: addon.selectedCustomization
          ? (addon.effectivePrice || addon.price) +
            addon.selectedCustomization.price
          : addon.effectivePrice || addon.price,
        quantity: addon.quantity,
        image: addon.imageUrl || "",
        // Keep customization details for reference
        selectedCustomization: addon.selectedCustomization
          ? {
              option: addon.selectedCustomization.option,
              price: addon.selectedCustomization.price,
              basePrice: addon.effectivePrice || addon.price,
            }
          : null,
      }));

      // Prepare customer info
      const customerInfo = {
        name: user.name,
        phone: user.phone || user.mobile || "0000000000", // Fallback phone number
        address: selectedAddress.fullAddress,
        pincode: selectedAddress.pincode,
      };

      // Add door/flat and landmark to address if available
      let fullAddress = selectedAddress.fullAddress;
      if (selectedAddress.doorOrFlatNo) {
        fullAddress += `, Door/Flat: ${selectedAddress.doorOrFlatNo}`;
      }
      if (selectedAddress.landmark) {
        fullAddress += `, Landmark: ${selectedAddress.landmark}`;
      }

      customerInfo.address = fullAddress;

      // Prepare order data
      const orderData = {
        items: orderItems,
        addons: orderAddons,
        customerInfo: customerInfo,
        totalAmount: cartSummary.grandTotal,
        subtotal: cartSummary.subtotal,
        deliveryCharge: cartSummary.deliveryFee,
        onlineDiscount: cartSummary.discount,
        tax: cartSummary.tax || 0,
        paymentMethod: selectedPaymentMethod, // Use selected payment method
        paymentStatus: "pending",
        status: "pending",
      };

      console.log("Creating order with data:", orderData);

      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert.success(
          "Order Created!",
          `Order ${data.data.orderId} has been created successfully`
        );

        // Store order ID for payment processing
        sessionStorage.setItem("currentOrderId", data.data.orderId);
        sessionStorage.setItem("orderData", JSON.stringify(data.data));

        return data.data;
      } else {
        showAlert.error(
          "Order Failed",
          data.message || "Failed to create order"
        );
        return false;
      }
    } catch (error) {
      console.error("Error creating order:", error);
      showAlert.error(
        "Network Error",
        "Failed to create order. Please try again."
      );
      return false;
    }
  };

  // Handle form submission for button click
  const handleSubmit = async () => {
    // For address step, ensure an address is selected
    if (
      ((needsLogin && activeStep === 2) || (!needsLogin && activeStep === 1)) &&
      !selectedAddress
    ) {
      showAlert.warning(
        "Address Required",
        "Please select or add a delivery address to continue"
      );
      return;
    }

    if (activeStep < maxSteps) {
      setActiveStep(activeStep + 1);
    } else {
      // Final step: Create order and process payment
      setCreatingOrder(true);

      try {
        const orderResult = await createOrder();

        if (orderResult) {
          setCreatingOrder(false);

          if (selectedPaymentMethod === "online") {
            // Process online payment with Razorpay
            await processPayment(orderResult);
          } else {
            // COD order - no payment processing needed
            showAlert.success(
              "Order Placed Successfully!",
              `Your COD order ${orderResult.orderId} has been confirmed. Pay cash on delivery.`
            );

            // Clear cart and redirect
            const { clearCart } = useCartStore.getState();
            clearCart();
            clearAddons();

            setTimeout(() => {
              router.push("/my-account");
            }, 2000);
          }
        }
      } catch (error) {
        setCreatingOrder(false);
        showAlert.error(
          "Order Failed",
          "Failed to create order. Please try again."
        );
      }
    }
  };

  // Auto-advance to address step if user logs in
  useEffect(() => {
    if (user && needsLogin && activeStep === 1) {
      setActiveStep(2); // Move to address step
    }
  }, [user, needsLogin, activeStep]);

  return (
    <div className="min-h-screen bg-gray-200 ">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <Container className="py-3! flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Secure Checkout"
              width={50}
              height={50}
              className="inline-block -rotate-12 mr-2 md:mr-3 w-10 h-10 md:w-12 md:h-12"
            />
            <div>
              <span className="text-lg md:text-2xl font-bold text-gray-900 block">
                Secure Checkout
              </span>
              <span className="text-xs md:text-sm text-gray-600 hidden md:block">
                Fast & secure payment processing
              </span>
            </div>
          </div>
          <div className="flex items-center hover:text-red-600 transition-colors cursor-pointer">
            <div className="bg-gray-100 p-2 md:p-3 rounded-full mr-2 md:mr-3">
              <FaUser className="text-sm md:text-lg text-gray-600" />
            </div>
            <div className="text-left ">
              {user ? (
                <Link
                  href="/my-account"
                  className="hover:text-red-600 transition-colors">
                  <div className="text-sm md:text-base font-bold text-gray-900 hover:text-yellow-400 transition-colors">
                    {user.name}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600 hidden md:block">
                    My Account
                  </div>
                </Link>
              ) : (
                <button
                  onClick={openLogin}
                  className="text-sm md:text-base font-bold text-gray-900 hover:text-red-600 transition-colors">
                  Login
                </button>
              )}
            </div>
          </div>
        </Container>
      </header>
      <Container className="py-6!">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:w-2/3">
            <div className="bg-white  shadow-sm p-6 mb-6">
              {/* Progress Steps */}
              <div className="flex justify-between mb-8">
                {/* Step 1: Login (only show if user not logged in) */}
                {needsLogin && (
                  <div
                    className={`flex flex-col items-center ${
                      activeStep >= 1 ? "text-red-900" : "text-gray-400"
                    }`}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activeStep >= 1 ? "bg-red-100" : "bg-gray-100"
                      }`}>
                      <FiUser className="text-lg" />
                    </div>
                    <span className="mt-2 text-sm font-bold">Login</span>
                  </div>
                )}

                {/* Step: Address */}
                <div
                  className={`flex flex-col items-center ${
                    (needsLogin ? activeStep >= 2 : activeStep >= 1)
                      ? "text-red-900"
                      : "text-gray-400"
                  }`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      (needsLogin ? activeStep >= 2 : activeStep >= 1)
                        ? "bg-red-100"
                        : "bg-gray-100"
                    }`}>
                    <FiMapPin className="text-lg" />
                  </div>
                  <span className="mt-2 text-sm font-bold">Address</span>
                </div>

                {/* Step: Payment */}
                <div
                  className={`flex flex-col items-center ${
                    (needsLogin ? activeStep >= 3 : activeStep >= 2)
                      ? "text-red-900"
                      : "text-gray-400"
                  }`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      (needsLogin ? activeStep >= 3 : activeStep >= 2)
                        ? "bg-red-100"
                        : "bg-gray-100"
                    }`}>
                    <FiCreditCard className="text-lg" />
                  </div>
                  <span className="mt-2 text-sm font-bold">Payment</span>
                </div>
              </div>

              {/* Step 1: Login (only if user not logged in) */}
              {needsLogin && activeStep === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Sign in to continue
                  </h2>
                  <p className="text-gray-600">
                    Please log in to proceed with your order
                  </p>
                  <Button
                    onClick={openLogin}
                    className="w-full py-3 px-4 bg-red-900 text-white rounded-none hover:bg-red-800 transition-colors">
                    Sign In / Sign Up
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    New customer? Create an account when you sign in
                  </p>
                </div>
              )}

              {/* Step: Address (Step 1 if user logged in, Step 2 if needs login) */}
              {((needsLogin && activeStep === 2) ||
                (!needsLogin && activeStep === 1)) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Delivery Address
                      </h2>
                      {user && (
                        <p className="text-sm text-gray-600 mt-1">
                          Welcome back, {user.name}!
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Loading state */}
                  {loadingAddresses && (
                    <div className="text-center py-4">
                      <Spinner h={34} />
                      <p className="text-gray-600 mt-2">Loading addresses...</p>
                    </div>
                  )}

                  {/* Existing Addresses */}
                  {!loadingAddresses && addresses.length > 0 && (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`border rounded-none p-4 cursor-pointer transition-all ${
                            selectedAddress?._id === addr._id
                              ? "border-red-900 bg-red-50 shadow-sm"
                              : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm"
                          }`}
                          onClick={() => selectAddress(addr)}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <p className="font-medium text-gray-900">
                                  {addr.fullAddress}
                                </p>
                              </div>
                              {addr.doorOrFlatNo && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    Door/Flat:
                                  </span>{" "}
                                  {addr.doorOrFlatNo}
                                </p>
                              )}
                              {addr.landmark && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Landmark:</span>{" "}
                                  {addr.landmark}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Pincode:</span>{" "}
                                {addr.pincode}
                              </p>
                            </div>
                            <div className="ml-4">
                              {selectedAddress?._id === addr._id ? (
                                <Button className="bg-green-600! text-white px-4 py-2 rounded-none text-sm">
                                  ✓ Selected
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => selectAddress(addr)}
                                  className="bg-white! border border-green-500 text-green-500! px-4 py-2 rounded-none text-sm hover:bg-red-50">
                                  Deliver Here
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No addresses message */}
                  {!loadingAddresses && addresses.length === 0 && (
                    <div className="text-center py-6 bg-gray-50 rounded-none border border-dashed border-gray-300">
                      <FiMapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-4">
                        No saved addresses found
                      </p>
                      <p className="text-sm text-gray-500">
                        Add your first delivery address to continue
                      </p>
                    </div>
                  )}

                  {/* No addresses or Add new address button */}
                  {!loadingAddresses && (
                    <Button
                      onClick={() => setShowAddressSidebar(true)}
                      className="w-full py-3! px-4 border bg-white! border-gray-300 rounded-none text-left flex justify-between items-center hover:bg-gray-50">
                      <span className="text-gray-700">
                        {addresses.length === 0
                          ? "Add delivery address"
                          : "Add new address"}
                      </span>
                      <FiArrowRight className="text-gray-500" />
                    </Button>
                  )}
                </div>
              )}

              {/* Step: Payment (Step 2 if user logged in, Step 3 if needs login) */}
              {((needsLogin && activeStep === 3) ||
                (!needsLogin && activeStep === 2)) && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Choose Payment Method
                  </h2>

                  {/* Payment Method Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Online Payment */}
                    <div
                      onClick={() => setSelectedPaymentMethod("online")}
                      className={`p-4 border-2 rounded-none cursor-pointer transition-all duration-200 ${
                        selectedPaymentMethod === "online"
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-3 rounded-full ${
                            selectedPaymentMethod === "online"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                          <FaCreditCard className="text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Online Payment
                          </h3>
                          <p className="text-sm text-gray-600">
                            Pay securely with UPI, Cards, Net Banking
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Secure & Fast
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPaymentMethod === "online"
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}>
                          {selectedPaymentMethod === "online" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cash on Delivery */}
                    <div
                      onClick={() => setSelectedPaymentMethod("cod")}
                      className={`p-4 border-2 rounded-none cursor-pointer transition-all duration-200 ${
                        selectedPaymentMethod === "cod"
                          ? "border-green-500 bg-green-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-3 rounded-full ${
                            selectedPaymentMethod === "cod"
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                          <FaMoneyBillWave className="text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Cash on Delivery
                          </h3>
                          <p className="text-sm text-gray-600">
                            Pay with cash when your order arrives
                          </p>
                          <div className="flex items-center mt-2">
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              Pay Later
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPaymentMethod === "cod"
                              ? "border-green-500 bg-green-500"
                              : "border-gray-300"
                          }`}>
                          {selectedPaymentMethod === "cod" && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Action Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={creatingOrder || processingPayment}
                    className={`py-4 flex items-center justify-center w-full rounded-none text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      selectedPaymentMethod === "online"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                    }`}>
                    {creatingOrder ? (
                      <>
                        <Spinner h={20} className="mr-3" />
                        Creating Order...
                      </>
                    ) : processingPayment ? (
                      <>
                        <Spinner h={20} className="mr-3" />
                        Processing Payment...
                      </>
                    ) : selectedPaymentMethod === "online" ? (
                      <>
                        <FaCreditCard className="mr-3" />
                        Proceed to Pay{" "}
                        <span className="flex items-center ml-2">
                          <FaRupeeSign size={14} className="mr-1" />
                          {cartSummary.grandTotal?.toFixed(2) || "0.00"}
                        </span>
                      </>
                    ) : (
                      <>
                        <FaMoneyBillWave className="mr-3" />
                        Place Order (COD){" "}
                        <span className="flex items-center ml-2">
                          <FaRupeeSign size={14} className="mr-1" />
                          {cartSummary.grandTotal?.toFixed(2) || "0.00"}
                        </span>
                      </>
                    )}
                  </Button>

                  {/* Payment Method Info */}
                  <div className="bg-gray-50 p-4 rounded-none">
                    {selectedPaymentMethod === "online" ? (
                      <div className="flex items-start space-x-3">
                        <FaCreditCard className="text-blue-500 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Secure Online Payment
                          </h4>
                          <p className="text-sm text-gray-600">
                            Your payment is processed securely through Razorpay.
                            We accept UPI, Credit Cards, Debit Cards, and Net
                            Banking.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3">
                        <FaMoneyBillWave className="text-green-500 mt-1" />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            Cash on Delivery
                          </h4>
                          <p className="text-sm text-gray-600">
                            Pay with cash when your order is delivered to your
                            doorstep. Please keep exact change ready.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="fixed flex md:relative bottom-0 left-0 z-50 mt-8 md:flex md:justify-between bg-white md:bg-none w-full p-4 md:p-0 border-t md:border-none border-gray-200 shadow-lg md:shadow-none">
                {/* Back Button - only show if not on first step */}
                {activeStep > 1 && (
                  <Button
                    onClick={() => setActiveStep(activeStep - 1)}
                    className="px-6 py-3 border bg-white! border-gray-300 rounded-none text-gray-700 font-medium hover:bg-gray-50">
                    Back
                  </Button>
                )}

                {/* Continue/Place Order Button */}
                {/* For logged in users: don't show Continue on login step (it doesn't exist) */}
                {/* For non-logged users: don't show Continue on login step (they use login button instead) */}
                {!(needsLogin && activeStep < 3) &&
                  !(
                    (needsLogin && activeStep === 3) ||
                    (!needsLogin && activeStep === 2)
                  ) && (
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        creatingOrder ||
                        processingPayment ||
                        (needsLogin && activeStep === 1)
                      }
                      className={`ml-auto px-6 py-3 rounded-none font-medium ${
                        activeStep < maxSteps
                          ? "bg-red-900! text-white hover:bg-red-800"
                          : "bg-red-900! text-white hover:bg-red-800"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}>
                      {creatingOrder ? (
                        <div className="flex items-center">
                          <Spinner h={20} className="mr-2 text-white" />
                          Creating Order...
                        </div>
                      ) : processingPayment ? (
                        <div className="flex items-center">
                          <Spinner h={20} className="mr-2 text-white" />
                          Processing Payment...
                        </div>
                      ) : activeStep < maxSteps ? (
                        "Continue"
                      ) : (
                        "Place Order"
                      )}
                    </Button>
                  )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3 mb-20">
            <div className="bg-white shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Product Cart Items */}
              {cart && cart.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    🍽️ Food Items
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                      {cart.length}
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {cart.map((item: any) => (
                      <div
                        key={item.cartItemId}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-none">
                        <div className="flex items-center">
                          <Image
                            src={item.imageUrl || "/placeholder-food.svg"}
                            alt={item.title || "Product"}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-none object-cover"
                          />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.title || "Unknown Product"}
                            </h4>
                            {item.selectedCustomization && (
                              <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded mt-1 inline-block">
                                {item.selectedCustomization.option}
                              </div>
                            )}
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <FaRupeeSign size={10} className="mr-1" />
                              {(item.totalPrice && item.totalPrice > 0
                                ? item.totalPrice
                                : item.selectedCustomization
                                ? item.selectedCustomization.price *
                                  item.quantity
                                : (item.effectivePrice || item.price) *
                                  item.quantity
                              )?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center border border-gray-300 rounded-none">
                            <button
                              onClick={() => {
                                try {
                                  decrementQuantity(item.cartItemId);
                                } catch (error) {
                                  console.error(
                                    "Error decrementing quantity:",
                                    error
                                  );
                                }
                              }}
                              className="p-1 text-gray-600 hover:text-red-900">
                              <FiMinus size={12} />
                            </button>
                            <span className="px-2 text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                try {
                                  incrementQuantity(item.cartItemId);
                                } catch (error) {
                                  console.error(
                                    "Error incrementing quantity:",
                                    error
                                  );
                                }
                              }}
                              className="p-1 text-gray-600 hover:text-red-900">
                              <FiPlus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addon Cart Items */}
              {addons && addons.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    🍟 Add-ons
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {addons.length}
                    </span>
                  </h3>
                  <div className="space-y-4">
                    {addons.map((item: any) => (
                      <div
                        key={item.addonCartItemId}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-none">
                        <div className="flex items-center">
                          <Image
                            src={item.imageUrl || "/placeholder-food.svg"}
                            alt={item.title || "Addon"}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-none object-cover"
                          />
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.title || "Unknown Addon"}
                            </h4>
                            {item.selectedCustomization && (
                              <div className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded mt-1 inline-block">
                                {item.selectedCustomization.option}
                              </div>
                            )}
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <FaRupeeSign size={10} className="mr-1" />
                              {(item.totalPrice && item.totalPrice > 0
                                ? item.totalPrice
                                : item.selectedCustomization
                                ? item.selectedCustomization.price *
                                  item.quantity
                                : (item.effectivePrice || item.price) *
                                  item.quantity
                              )?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center border border-gray-300 rounded-none">
                            <button
                              onClick={() => {
                                try {
                                  decrementAddonQuantity(item.addonCartItemId);
                                } catch (error) {
                                  console.error(
                                    "Error decrementing addon quantity:",
                                    error
                                  );
                                }
                              }}
                              className="p-1 text-gray-600 hover:text-red-900">
                              <FiMinus size={12} />
                            </button>
                            <span className="px-2 text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                try {
                                  incrementAddonQuantity(item.addonCartItemId);
                                } catch (error) {
                                  console.error(
                                    "Error incrementing addon quantity:",
                                    error
                                  );
                                }
                              }}
                              className="p-1 text-gray-600 hover:text-red-900">
                              <FiPlus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coupon Section */}
              {!cartSummary.isEmpty && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    🎟️ Coupon Code
                  </h3>

                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="flex-1 rounded-none"
                        disabled={applyingCoupon}
                      />
                      <Button
                        onClick={applyCoupon}
                        disabled={!couponCode.trim() || applyingCoupon}
                        className="px-4 py-2 bg-red-600 text-white rounded-none hover:bg-red-700 disabled:bg-gray-300">
                        {applyingCoupon ? "Applying..." : "Apply"}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-none flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">
                          ✓ {appliedCoupon.code}
                        </span>
                        <span className="text-sm text-green-600">
                          You saved ₹{appliedCoupon.discountAmount.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        onClick={removeCoupon}
                        className="text-red-600 px-2! py-2! hover:text-red-800 bg-transparent border-none rounded-none">
                        <FiX size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Empty Cart State */}
              {cartSummary.isEmpty && (
                <div className="text-center py-8 text-gray-500">
                  <p>Your cart is empty</p>
                  <Link
                    href="/"
                    className="text-red-600 hover:text-red-800 underline mt-2 inline-block">
                    Continue Shopping
                  </Link>
                </div>
              )}

              {/* Order Totals */}
              {!cartSummary.isEmpty && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  {/* Addons Subtotal */}
                  {cartSummary.addonCount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>🍟 Add-ons ({cartSummary.addonCount})</span>
                      <span className="flex items-center">
                        <FaRupeeSign size={12} className="mr-1" />
                        {cartSummary.addonTotal?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  )}

                  {/* Subtotal */}
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartSummary.totalUniqueItems} items)</span>
                    <span className="flex items-center">
                      <FaRupeeSign size={12} className="mr-1" />
                      {cartSummary.subtotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="flex items-center text-green-500">
                      Free
                    </span>
                  </div>

                  {(cartSummary.discount > 0 || appliedCoupon) && (
                    <>
                      {/* Base discount (if any) */}
                      {cartSummary.discount -
                        (appliedCoupon?.discountAmount || 0) >
                        0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Discount</span>
                          <span className="flex items-center text-green-600">
                            -₹
                            {(
                              cartSummary.discount -
                              (appliedCoupon?.discountAmount || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Coupon discount */}
                      {appliedCoupon && (
                        <div className="flex justify-between text-gray-600">
                          <span>Coupon ({appliedCoupon.code})</span>
                          <span className="flex items-center text-green-600">
                            -₹{appliedCoupon.discountAmount.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {cartSummary.tax > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span className="flex items-center">
                        <FaRupeeSign size={12} className="mr-1" />
                        {cartSummary.tax?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                    <span>Grand Total</span>
                    <span className="flex items-center">
                      <FaRupeeSign size={14} className="mr-1" />
                      {cartSummary.grandTotal?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Address Sidebar */}
      {showAddressSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-black/75 transition-opacity"
              onClick={() => setShowAddressSidebar(false)}></div>
            <div className="fixed inset-y-0 left-0 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        Add Delivery Address
                      </h2>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setShowAddressSidebar(false)}>
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Address*
                        </label>
                        <Input
                          name="street"
                          type="text"
                          placeholder="Enter your full address"
                          value={address.street}
                          onChange={handleAddressChange}
                          className="block w-full px-4 py-3 font-semibold"
                          required
                        />
                        {!address.street.trim() && (
                          <p className="text-xs text-red-500 mt-1">
                            Full address is required
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode*
                        </label>
                        <Input
                          name="pincode"
                          type="text"
                          placeholder="Enter 6-digit pincode"
                          value={address.pincode}
                          onChange={handleAddressChange}
                          className="block w-full px-4 py-3 font-semibold"
                          maxLength={6}
                          pattern="[0-9]{6}"
                          required
                        />
                        {address.pincode &&
                          !/^\d{6}$/.test(address.pincode) && (
                            <p className="text-xs text-red-500 mt-1">
                              Please enter a valid 6-digit pincode
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Door/Flat no.
                        </label>
                        <Input
                          name="flatNumber"
                          type="text"
                          placeholder="Enter your door/flat number"
                          value={address.flatNumber}
                          onChange={handleAddressChange}
                          className="block w-full px-4 py-3 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Landmark (Optional)
                        </label>
                        <Input
                          name="Landmark"
                          type="text"
                          placeholder="Enter nearby landmark"
                          value={address.Landmark}
                          onChange={handleAddressChange}
                          className="block w-full px-4 py-3 font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <Button
                      onClick={saveNewAddress}
                      disabled={savingAddress}
                      className={`w-full py-3 rounded-none! ${
                        savingAddress ? "opacity-50 cursor-not-allowed" : ""
                      }`}>
                      {savingAddress ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        "Save Address"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Login Modal */}
      <SideLogin isOpen={isLoginOpen} onClose={closeLogin} />
    </div>
  );
};

export default CheckoutPage;

import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import axios from "axios";
import Spinner from "./Spinner";
import useUserStore from "../zustand/userStore";
import { useAlertStore } from "../zustand/alertStore";
import Link from "next/link";

const SideLogin = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [data, setData] = useState({
    phone: "",
    name: "",
    email: "",
    otp: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const setUser = useUserStore((state) => state.setUser);
  const addAlert = useAlertStore((state) => state.addAlert);

  // Determine which API endpoint to call based on current state
  const getApiEndpoint = () => {
    if (!isLogin) {
      return "/api/users/signup"; // Sign up flow
    }

    if (isLogin && !isOtpSent) {
      return "/api/users/send-otp"; // Login - Send OTP
    }

    if (isLogin && isOtpSent) {
      return "/api/users/verify-otp"; // Login - Verify OTP
    }
  };

  const onSubmit = async (formData: any) => {
    // Basic validation
    if (!formData.phone || formData.phone.length < 10) {
      addAlert({
        type: "warning",
        title: "Invalid Phone Number",
        message: "Please enter a valid 10-digit phone number.",
        duration: 4000,
      });
      return;
    }

    if (!isLogin && (!formData.name || !formData.email)) {
      addAlert({
        type: "warning",
        title: "Missing Information",
        message: "Please fill in all required fields.",
        duration: 4000,
      });
      return;
    }

    if (isLogin && isOtpSent && (!formData.otp || formData.otp.length !== 6)) {
      addAlert({
        type: "warning",
        title: "Invalid OTP",
        message: "Please enter the complete 6-digit OTP.",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    setData(formData);

    const endpoint = getApiEndpoint();

    if (!endpoint) {
      addAlert({
        type: "error",
        title: "Invalid Operation",
        message: "Please try again or contact support.",
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(endpoint, formData);

      if (response.data.success) {
        if (!isLogin) {
          // Signup successful
          addAlert({
            type: "success",
            title: "Account Created Successfully!",
            message: "Your account has been created. You can now log in.",
            duration: 5000,
          });
          setIsLogin(true);
          reset(); // Clear form
          setData({ phone: "", name: "", email: "", otp: "" });
        } else if (isLogin && !isOtpSent) {
          // OTP sent successfully
          addAlert({
            type: "success",
            title: "OTP Sent Successfully!",
            message: `Please check your phone for the verification code. ${response.data.data.otp}`,
            duration: 6000,
          });
          setIsOtpSent(true);
          setTimer(30);
          setIsResendDisabled(true);
        } else if (isLogin && isOtpSent) {
          addAlert({
            type: "success",
            title: "Login Successful!",
            message: "Welcome back! You have been logged in successfully.",
            duration: 4000,
          });

          // Set user data from the response
          if (response.data.data && response.data.data.user) {
            setUser(response.data.data.user);
          }

          onClose(); // Close the login modal
        }
      } else {
        // Handle case where response is not successful
        addAlert({
          type: "warning",
          title: "Unexpected Response",
          message: response.data.message || "Please try again.",
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error("Error:", error);

      // More specific error handling
      let errorMessage = "Create your account first, then login!";
      let errorTitle = "Operation Failed";

      if (error.response?.status === 400) {
        errorTitle = "Invalid Request";
        errorMessage =
          error.response?.data?.message ||
          "Please check your input and try again.";
      } else if (error.response?.status === 401) {
        errorTitle = "Authentication Failed";
        errorMessage = "Invalid credentials. Please try again.";
      } else if (error.response?.status === 429) {
        errorTitle = "Too Many Attempts";
        errorMessage = "Please wait a moment before trying again.";
      } else if (error.response?.status === 500) {
        errorTitle = "Server Error";
        errorMessage =
          "Our servers are experiencing issues. Please try again later.";
      } else if (error.code === "NETWORK_ERROR") {
        errorTitle = "Network Error";
        errorMessage = "Please check your internet connection and try again.";
      }

      addAlert({
        type: "error",
        title: errorTitle,
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;
    if (isResendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResendDisabled]);

  const resendOtp = async () => {
    if (isResendDisabled) return;

    setLoading(true);

    try {
      const response = await axios.post("/api/users/send-otp", {
        phone: data.phone,
      });

      if (response.data.success) {
        addAlert({
          type: "success",
          title: "OTP Resent Successfully!",
          message: `A new verification code has been sent to your phone. ${response.data.data.otp}`,
          duration: 6000,
        });
        setTimer(30);
        setIsResendDisabled(true);
      } else {
        addAlert({
          type: "warning",
          title: "Resend Failed",
          message:
            response.data.message || "Unable to resend OTP at this time.",
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error("Error resending OTP:", error);

      let errorMessage =
        "Unable to resend verification code. Please try again.";
      let errorTitle = "Failed to Resend OTP";

      if (error.response?.status === 429) {
        errorTitle = "Too Many Requests";
        errorMessage = "Please wait before requesting another OTP.";
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid phone number. Please check and try again.";
      }

      addAlert({
        type: "error",
        title: errorTitle,
        message: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset state when switching between login/signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsOtpSent(false);
    setTimer(30);
    setIsResendDisabled(true);
    reset(); // Clear form
    setData({ phone: "", name: "", email: "", otp: "" });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Login Panel */}
      <div
        className={`fixed 
          md:top-0 md:right-0 md:h-full md:w-96 md:rounded-none 
          top-80 bottom-0 right-0 w-full rounded-t-3xl 
          bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
            isOpen
              ? "md:translate-x-0 translate-y-0"
              : "md:translate-x-full translate-y-full"
          }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute md:top-4 md:left-4 top-4 right-4 text-gray-500 hover:text-red-900 transition p-2 z-10 cursor-pointer"
        >
          <FiX size={24} />
        </button>

        {/* Content */}
        <div className="h-full flex flex-col p-6 md:p-8 pt-16 md:pt-16">
          {/* Header */}
          <div className="text-left mb-8">
            <h2 className="text-3xl font-semibold mb-2">
              {isLogin ? "Login" : "Sign Up"}
            </h2>
            <p className="text-gray-600">
              or{" "}
              <button
                onClick={toggleMode}
                className="text-red-900 text-sm font-bold hover:underline"
              >
                {isLogin ? "Create an account" : "Already have an account?"}
              </button>
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 flex flex-col"
          >
            <div className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <div className="relative group">
                  <span className="absolute font-bold left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    +91
                  </span>
                  <Input
                    type="text"
                    {...register("phone", { required: true })}
                    placeholder="Your Phone Number"
                    className="pl-12"
                  />
                </div>

                {isOtpSent && isLogin && (
                  <>
                    <input
                      type="text"
                      {...register("otp", { required: true })}
                      placeholder="Enter OTP"
                      maxLength={6}
                      className="mt-4 w-full px-5 py-3 text-lg tracking-widest text-center text-gray-800 bg-white border border-gray-300 shadow-sm placeholder-gray-400 outline-noneloca transition-all duration-300 ease-in-out"
                    />
                    <span
                      onClick={resendOtp}
                      className={`mt-2 text-sm font-bold cursor-pointer ${
                        isResendDisabled
                          ? "text-gray-400 pointer-events-none"
                          : "text-red-900 hover:underline"
                      }`}
                    >
                      {isResendDisabled
                        ? `Resend OTP in ${timer}s`
                        : "Resend OTP!"}
                    </span>
                  </>
                )}
              </div>

              {!isLogin && (
                <>
                  {/* Name Field (for signup) */}
                  <div className="relative">
                    <Input
                      type="text"
                      {...register("name", { required: true })}
                      placeholder="Your Name"
                      className=""
                    />
                  </div>

                  {/* Email Field (for signup) */}
                  <div className="relative">
                    <Input
                      type="email"
                      {...register("email", { required: true })}
                      placeholder="Your Email"
                      className=""
                    />
                  </div>
                </>
              )}
            </div>

            {/* Terms and Conditions & Privacy Policy Links */}
            <div className="mt-4 text-sm text-gray-600">
              By continuing, you agree to our{" "}
              <Link
                href="/terms-and-conditions"
                className="text-red-900 font-bold hover:underline"
              >
                Terms and Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-red-900 font-bold hover:underline"
              >
                Privacy Policy
              </Link>.
            </div>

            {/* Submit Button */}
            <Button type="submit" className="mt-6 py-3 rounded-none">
              {loading ? (
                <Spinner />
              ) : !isLogin ? (
                "Create Account"
              ) : !isOtpSent ? (
                "Send OTP"
              ) : (
                "Verify OTP"
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SideLogin;
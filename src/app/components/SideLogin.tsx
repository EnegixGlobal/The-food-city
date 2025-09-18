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

  // Which API to call
  const getApiEndpoint = () => {
    if (!isLogin) {
      return "/api/users/signup"; // signup
    }
    if (isLogin && !isOtpSent) {
      return "/api/users/send-otp"; // send otp
    }
    if (isLogin && isOtpSent) {
      return "/api/users/verify-otp"; // verify otp
    }
  };

  const onSubmit = async (formData: any) => {
    // Validation
    if (!formData.email) {
      addAlert({
        type: "warning",
        title: "Missing Email",
        message: "Please enter a valid email address.",
        duration: 4000,
      });
      return;
    }

    if (!isLogin && !formData.name) {
      addAlert({
        type: "warning",
        title: "Missing Name",
        message: "Please enter your name.",
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
          // Signup
          addAlert({
            type: "success",
            title: "Account Created!",
            message: "Your account has been created. You can now log in.",
            duration: 5000,
          });
          setIsLogin(true);
          reset();
          setData({ name: "", email: "", otp: "" });
        } else if (isLogin && !isOtpSent) {
          // OTP sent
          addAlert({
            type: "success",
            title: "OTP Sent!",
            message: `Please check your email for the verification code.`,
            duration: 6000,
          });
          setIsOtpSent(true);
          setTimer(30);
          setIsResendDisabled(true);
        } else if (isLogin && isOtpSent) {
          // Login success
          addAlert({
            type: "success",
            title: "Login Successful!",
            message: "Welcome back!",
            duration: 4000,
          });

          if (response.data.data && response.data.data.user) {
            setUser(response.data.data.user);
          }
          onClose();
        }
      } else {
        addAlert({
          type: "warning",
          title: "Unexpected Response",
          message: response.data.message || "Please try again.",
          duration: 4000,
        });
      }
    } catch (error: any) {
      console.error("Error:", error);
      let errorMessage = "Something went wrong.";
      let errorTitle = "Error";

      if (error.response?.status === 400) {
        errorTitle = "Invalid Request";
        errorMessage = error.response?.data?.message;
      } else if (error.response?.status === 404) {
        errorTitle = "Not Found";
        errorMessage = error.response?.data?.message;
      } else if (error.response?.status === 500) {
        errorTitle = "Server Error";
        errorMessage = "Please try again later.";
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

  // OTP Resend timer
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
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
        email: data.email,
      });
      if (response.data.success) {
        addAlert({
          type: "success",
          title: "OTP Resent!",
          message: "A new OTP has been sent to your email.",
          duration: 6000,
        });
        setTimer(30);
        setIsResendDisabled(true);
      }
    } catch (err) {
      addAlert({
        type: "error",
        title: "Resend Failed",
        message: "Could not resend OTP. Try again later.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle login/signup
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setIsOtpSent(false);
    setTimer(30);
    setIsResendDisabled(true);
    reset();
    setData({ name: "", email: "", otp: "" });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed md:top-0 md:right-0 md:h-full md:w-96 md:rounded-none 
          top-80 bottom-0 right-0 w-full rounded-t-3xl bg-white z-50 shadow-2xl 
          transform transition-transform duration-300 ease-in-out ${
            isOpen
              ? "md:translate-x-0 translate-y-0"
              : "md:translate-x-full translate-y-full"
          }`}
      >
        <button
          onClick={onClose}
          className="absolute md:top-4 md:left-4 top-4 right-4 text-gray-500 hover:text-red-900 transition p-2 z-10 cursor-pointer"
        >
          <FiX size={24} />
        </button>

        <div className="h-full flex flex-col p-6 md:p-8 pt-16 md:pt-16">
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

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
            <div className="space-y-6">
              {/* Email input */}
              <Input
                type="email"
                {...register("email", { required: true })}
                placeholder="Your Email"
                className=""
              />

              {isOtpSent && isLogin && (
                <>
                  <input
                    type="text"
                    {...register("otp", { required: true })}
                    placeholder="Enter OTP"
                    maxLength={6}
                    className="mt-4 w-full px-5 py-3 text-lg tracking-widest text-center border border-gray-300"
                  />
                  <span
                    onClick={resendOtp}
                    className={`mt-2 text-sm font-bold cursor-pointer ${
                      isResendDisabled
                        ? "text-gray-400 pointer-events-none"
                        : "text-red-900 hover:underline"
                    }`}
                  >
                    {isResendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
                  </span>
                </>
              )}

              {!isLogin && (
                <Input
                  type="text"
                  {...register("name", { required: true })}
                  placeholder="Your Name"
                  className=""
                />
              )}
            </div>

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

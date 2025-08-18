"use client";

import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import toast from "react-hot-toast";
import React, { useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface OtpVerificationState {
  isOpen: boolean;
  newPhone: string;
  otp: string;
  isVerifying: boolean;
  isResending: boolean;
}

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [otpModal, setOtpModal] = useState<OtpVerificationState>({
    isOpen: false,
    newPhone: "",
    otp: "",
    isVerifying: false,
    isResending: false,
  });

  const baseUrl = process.env.PUBLIC_URL;

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/users/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      if (data.success) {
        const userData = data.data;
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });
      } else {
        toast.error(data.message || "Failed to fetch user data");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Send OTP for phone verification
  const sendOtp = async (phone: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/users/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("OTP sent successfully!");
        return true;
      } else {
        toast.error(data.message || "Failed to send OTP");
        return false;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send OTP");
      return false;
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otpModal.otp.trim()) {
      toast.error("Please enter OTP");
      return false;
    }

    try {
      setOtpModal((prev) => ({ ...prev, isVerifying: true }));

      const response = await fetch(`${baseUrl}/api/users/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          otp: otpModal.otp,
          phone: otpModal.newPhone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Phone number verified successfully!");
        return true;
      } else {
        toast.error(data.message || "Invalid OTP");
        return false;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to verify OTP");
      return false;
    } finally {
      setOtpModal((prev) => ({ ...prev, isVerifying: false }));
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
    // Close OTP modal if open
    setOtpModal({
      isOpen: false,
      newPhone: "",
      otp: "",
      isVerifying: false,
      isResending: false,
    });
  };

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    // Check if phone number changed
    const phoneChanged = user?.phone !== formData.phone;

    if (phoneChanged) {
      // Send OTP for phone verification
      const otpSent = await sendOtp(formData.phone);
      if (otpSent) {
        setOtpModal({
          isOpen: true,
          newPhone: formData.phone,
          otp: "",
          isVerifying: false,
          isResending: false,
        });
      }
      return;
    }

    // Update profile without phone verification
    await updateProfile();
  };

  // Update profile data
  const updateProfile = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`${baseUrl}/api/users/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Profile updated successfully!");
        setUser(data.data);
        setIsEditing(false); // Exit edit mode after successful update
        setOtpModal({
          isOpen: false,
          newPhone: "",
          otp: "",
          isVerifying: false,
          isResending: false,
        });
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handle OTP verification and profile update
  const handleOtpVerificationAndUpdate = async () => {
    const isVerified = await verifyOtp();
    if (isVerified) {
      await updateProfile();
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setOtpModal((prev) => ({ ...prev, isResending: true }));
    await sendOtp(otpModal.newPhone);
    setOtpModal((prev) => ({ ...prev, isResending: false, otp: "" }));
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-none shadow-sm p-4 sm:p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-none shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Profile" : "My Profile"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isEditing
                  ? "Update your personal information"
                  : "View and manage your personal information"}
              </p>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="mt-4 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white rounded-none">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-none shadow-sm p-4 sm:p-6">
          {isEditing ? (
            /* Edit Mode */
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="text-base py-3"
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email address"
                  className="text-base py-3"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter your phone number"
                  maxLength={10}
                  className="text-base py-3"
                />
                {user?.phone !== formData.phone && formData.phone && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Phone number change requires OTP verification
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 text-base bg-orange-500 hover:bg-orange-600 text-white rounded-none">
                  {submitting ? "Updating..." : "Update Profile"}
                </Button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-none hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Name Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="w-full px-6 py-3 border border-gray-300 rounded-none bg-gray-50 text-base font-semibold text-gray-900">
                  {user?.name || "Not provided"}
                </div>
              </div>

              {/* Email Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="w-full px-6 py-3 border border-gray-300 rounded-none bg-gray-50 text-base font-semibold text-gray-900">
                  {user?.email || "Not provided"}
                </div>
              </div>

              {/* Phone Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="w-full px-6 py-3 border border-gray-300 rounded-none bg-gray-50 text-base font-semibold text-gray-900">
                  {user?.phone || "Not provided"}
                </div>
              </div>

              {/* Profile Stats */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Member since:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {user
                        ? new Date(
                            parseInt(user._id.toString().substring(0, 8), 16) *
                              1000
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Profile Status:</span>
                    <span className="ml-2 font-medium text-green-600">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* OTP Modal */}
        {otpModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-none w-full max-w-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Verify Phone Number
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                We&apos;ve sent an OTP to <strong>{otpModal.newPhone}</strong>.
                Please enter it below to verify your new phone number.
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    Enter OTP
                  </label>
                  <Input
                    id="otp"
                    type="text"
                    value={otpModal.otp}
                    onChange={(e) =>
                      setOtpModal((prev) => ({ ...prev, otp: e.target.value }))
                    }
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="py-3 text-center text-lg font-mono"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleOtpVerificationAndUpdate}
                    disabled={otpModal.isVerifying || !otpModal.otp.trim()}
                    className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-none">
                    {otpModal.isVerifying ? "Verifying..." : "Verify & Update"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpModal({
                        isOpen: false,
                        newPhone: "",
                        otp: "",
                        isVerifying: false,
                        isResending: false,
                      });
                      setIsEditing(false); // Go back to view mode
                    }}
                    disabled={otpModal.isVerifying}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-none hover:bg-gray-50 transition-colors disabled:opacity-50">
                    Cancel
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpModal.isResending}
                    className="text-sm text-orange-600 hover:text-orange-700 disabled:opacity-50">
                    {otpModal.isResending ? "Resending..." : "Resend OTP"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

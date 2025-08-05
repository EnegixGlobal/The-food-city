import React, { useState, useEffect } from "react";
import { FaTimes, FaStar, FaUpload } from "react-icons/fa";
import Image from "next/image";
import Button from "./Button";
import useUserStore from "../zustand/userStore";
import { useAlertStore } from "../zustand/alertStore";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  productImage?: string;
  onReviewSubmitted?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle,
  productImage,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const user = useUserStore((state) => state.user);
  const { addAlert } = useAlertStore();

  // Cleanup function to revoke object URLs
  useEffect(() => {
    return () => {
      if (selectedFile) {
        URL.revokeObjectURL(URL.createObjectURL(selectedFile));
      }
    };
  }, [selectedFile]);

  if (!isOpen) return null;

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size too large. Please select an image under 5MB.");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return data.url;
      } else {
        addAlert({
          type: "error",
          title: "Image upload failed",
          message: data.error || "Please try uploading again.",
        });
        setError(data.error || "Failed to upload image");
        return null;
      }
    } catch (err) {
      addAlert({
        type: "error",
        title: "Image upload failed",
        message: "Please check your connection and try again.",
      });
      setError("Failed to upload image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a comment");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Upload image if one is selected
      let uploadedImageUrl: string | undefined = imageUrl;
      if (selectedFile) {
        const uploadResult = await uploadImage();
        if (!uploadResult) {
          setIsSubmitting(false);
          return; // Error already set in uploadImage
        }
        uploadedImageUrl = uploadResult;
      }

      // Get user ID from localStorage or wherever you store it

      if (!user) {
        addAlert({
          type: "warning",
          title: "Login required",
          message: "Please login to submit a review.",
        });
        setError("Please login to submit a review");
        return;
      }

      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          userId: user.id,
          rating,
          comment: comment.trim(),
          imageUrl: uploadedImageUrl || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addAlert({
          type: "success",
          title: "Review submitted successfully!",
          message: "Thank you for your feedback.",
        });
        // Reset form
        setRating(0);
        setComment("");
        setImageUrl("");
        setSelectedFile(null);
        setError("");

        // Call callback if provided
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }

        onClose();
      } else {
        addAlert({
          type: "error",
          title: "Failed to submit review",
          message: data.message || "Please try again later.",
        });
        setError(data.message || "Failed to submit review");
      }
    } catch (err) {
      addAlert({
        type: "error",
        title: "Submission failed",
        message:
          "An error occurred while submitting your review. Please try again.",
      });
      setError("An error occurred while submitting the review");
      console.error("Review submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    const ratingTexts = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || "";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl transform transition-all duration-300 flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 hover:bg-white/80 rounded-full transition-all duration-200 shadow-sm z-10 group">
            <FaTimes className="text-gray-600 group-hover:text-gray-800 transition-colors text-sm sm:text-base" />
          </button>

          <div className="flex items-start gap-2 sm:gap-3 pr-8">
            {productImage && (
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                <Image
                  src={productImage}
                  alt={productTitle}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
                Write a Review
              </h2>
              <p className="text-sm text-gray-600">
                How was your experience with{" "}
                <span className="font-semibold">{productTitle}</span>?
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Rating Section */}
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                Rate this product
              </h3>

              <div className="flex justify-center items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    className="transition-colors duration-200 hover:scale-110 transform">
                    <FaStar
                      size={32}
                      className={`${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {(rating > 0 || hoveredRating > 0) && (
                <p className="text-sm font-medium text-gray-600">
                  {getRatingText(hoveredRating || rating)}
                </p>
              )}
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  Help others by sharing your honest experience
                </p>
                <p className="text-xs text-gray-400">{comment.length}/500</p>
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-base sm:text-lg font-bold text-gray-900 mb-2">
                Add Photo (Optional)
              </label>
              {/* File Upload Input */}
              <div className="mb-3">
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <FaUpload className="text-gray-500 text-xl" />
                    <span className="text-sm text-gray-600">
                      {selectedFile
                        ? selectedFile.name
                        : "Click to upload an image"}
                    </span>
                    <span className="text-xs text-gray-400">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Preview */}
              {(selectedFile || imageUrl) && (
                <div className="mt-3">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
                    {selectedFile ? (
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Review preview"
                        className="w-full h-full object-cover"
                      />
                    ) : imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Review preview"
                        fill
                        className="object-cover"
                        onError={() => setImageUrl("")}
                      />
                    ) : null}

                    {/* Remove button */}
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setImageUrl("");
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              onClick={onClose}
              className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 text-base sm:text-lg font-bold rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={
                !rating || !comment.trim() || isSubmitting || isUploading
              }
              className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 text-base sm:text-lg font-bold rounded-xl transition-all duration-200 ${
                !rating || !comment.trim() || isSubmitting || isUploading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}>
              {isUploading
                ? "Uploading..."
                : isSubmitting
                ? "Submitting..."
                : "Submit Review"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

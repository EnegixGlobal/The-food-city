import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { FiStar, FiMoreVertical } from "react-icons/fi";
import Image from "next/image";

interface Review {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  imageUrl?: string;
  isHelpful: boolean;
  helpfullCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Review[];
  productTitle: string;
  onHelpfulUpdate?: (reviewId: string, isHelpful: boolean) => void;
  onDeleteReview?: (reviewId: string) => void;
  onUpdateReview?: (
    reviewId: string,
    updatedData: { rating: number; comment: string; imageUrl?: string }
  ) => void;
  currentUserId?: string;
}

const ReviewsModal: React.FC<ReviewsModalProps> = ({
  isOpen,
  onClose,
  reviews,
  productTitle,
  onHelpfulUpdate,
  onDeleteReview,
  onUpdateReview,
  currentUserId,
}) => {
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    rating: number;
    comment: string;
    imageUrl?: string;
  }>({ rating: 0, comment: "", imageUrl: "" });
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (dropdownOpen && !target.closest(".dropdown-container")) {
        setDropdownOpen(null);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  if (!isOpen) return null;

  // Format date for reviews
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Start editing a review
  const startEditing = (review: Review) => {
    setEditingReviewId(review._id);
    setEditData({
      rating: review.rating,
      comment: review.comment,
      imageUrl: review.imageUrl || "",
    });
    setDropdownOpen(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditData({ rating: 0, comment: "", imageUrl: "" });
    setDropdownOpen(null);
  };

  // Save edited review
  const saveEdit = () => {
    if (editingReviewId && onUpdateReview) {
      onUpdateReview(editingReviewId, editData);
      cancelEditing();
    }
  };

  // Delete review
  const handleDelete = (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      if (onDeleteReview) {
        onDeleteReview(reviewId);
      }
    }
    setDropdownOpen(null);
  };

  // Check if user owns the review
  const isOwner = (review: Review) => {
    return currentUserId && review.userId._id === currentUserId;
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="fixed items-end inset-0 bg-black/60 backdrop-blur-sm flex md:items-center justify-center z-50 md:p-4">
      <div className="bg-white md:rounded-2xl rounded-t-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-50 to-orange-50 p-3 sm:p-4 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 hover:bg-white/80 rounded-full transition-all duration-200 shadow-sm z-10 group">
            <FaTimes className="text-gray-600 group-hover:text-gray-800 transition-colors text-sm" />
          </button>

          <div className="pr-10">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              Customer Reviews
            </h2>
            <p className="text-gray-600 text-xs mb-3">
              Reviews for <span className="font-semibold">{productTitle}</span>
            </p>

            {/* Overall Rating */}
            <div className="flex items-center gap-3">
              <div className="flex text-xs items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(averageRating)
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-500 text-xs">
                Based on {reviews.length} review
                {reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-100 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {review.userId.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* User Name and Rating */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {review.userId.name}
                          </h4>
                          {editingReviewId === review._id ? (
                            // Editing Rating
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() =>
                                    setEditData((prev) => ({
                                      ...prev,
                                      rating: star,
                                    }))
                                  }
                                  className="hover:scale-110 transition-transform">
                                  <FiStar
                                    className={`w-4 h-4 ${
                                      star <= editData.rating
                                        ? "text-yellow-500 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          ) : (
                            // Display Rating
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= review.rating
                                      ? "text-yellow-500 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatDate(review.createdAt)}
                          </span>
                          {/* Three-dot menu for owner */}
                          {isOwner(review) &&
                            editingReviewId !== review._id && (
                              <div className="relative ml-2 dropdown-container">
                                <button
                                  onClick={() =>
                                    setDropdownOpen(
                                      dropdownOpen === review._id
                                        ? null
                                        : review._id
                                    )
                                  }
                                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                  title="More options">
                                  <FiMoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen === review._id && (
                                  <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log(
                                          "Edit clicked for review:",
                                          review._id
                                        );
                                        startEditing(review);
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log(
                                          "Delete clicked for review:",
                                          review._id
                                        );
                                        handleDelete(review._id);
                                      }}
                                      className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Review Comment */}
                      {editingReviewId === review._id ? (
                        // Editing Comment
                        <div className="mb-3">
                          <textarea
                            value={editData.comment}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                comment: e.target.value,
                              }))
                            }
                            className="w-full h-20 p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                            placeholder="Update your review..."
                            maxLength={500}
                          />
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-400">
                              {editData.comment.length}/500
                            </span>
                          </div>

                          {/* Edit Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={saveEdit}
                              disabled={
                                !editData.rating || !editData.comment.trim()
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                !editData.rating || !editData.comment.trim()
                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                  : "bg-blue-500 text-white hover:bg-blue-600"
                              }`}>
                              Save Changes
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs font-medium">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display Comment
                        <p className="text-gray-700 leading-relaxed mb-3 text-sm">
                          {review.comment}
                        </p>
                      )}

                      {/* Review Image */}
                      {review.imageUrl && (
                        <div className="mt-3">
                          <Image
                            src={review.imageUrl}
                            alt="Review image"
                            width={150}
                            height={150}
                            className="rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
                            onClick={() =>
                              window.open(review.imageUrl, "_blank")
                            }
                          />
                        </div>
                      )}

                      {/* Helpful Button */}
                      {onHelpfulUpdate && editingReviewId !== review._id && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() =>
                              onHelpfulUpdate(review._id, !review.isHelpful)
                            }
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              review.isHelpful
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}>
                            <svg
                              className={`w-3.5 h-3.5 ${
                                review.isHelpful ? "fill-current" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V9a2 2 0 00-2-2h-.095c-.5 0-.905.031-1.312.09C10.279 7.224 9.641 7.5 9 7.5c-1.062 0-2.062.5-2.5 1.5-1 2.5-1.5 4-1.5 6.5 0 1.036.208 2.047.61 2.985A2.95 2.95 0 007 19.5c1.216 0 2.357-.596 3.047-1.578l.953-1.354"
                              />
                            </svg>
                            {review.isHelpful ? "Helpful" : "Mark as helpful"}
                          </button>
                          {review.helpfullCount > 0 && (
                            <span className="text-xs text-gray-500">
                              {review.helpfullCount} found this helpful
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl text-gray-300 mb-3">⭐</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No reviews yet
              </h3>
              <p className="text-gray-600 text-sm">
                Be the first to review this product!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 p-3 sm:p-4 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;

import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    isHelpful: {
      type: Boolean,
      default: false,
    },
    helpfullCount: {
      type: Number,
      default: 0,
      min: [0, "Helpful count cannot be less than 0"],
    },
    editDisableAfter: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 2 * 60 * 60 * 1000); // Disable editing after 24 hours
      },
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.virtual("canEdit").get(function () {
  return new Date() < this.editDisableAfter;
});

ReviewSchema.set("toJSON", { virtuals: true });
ReviewSchema.set("toObject", { virtuals: true });

// adding indexes

ReviewSchema.index({ productId: 1, userId: 1 });
ReviewSchema.index({ comment: 1 });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);
export default Review;

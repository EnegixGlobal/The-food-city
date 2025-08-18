import mongoose, { Schema } from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [100, "Product title cannot exceed 100 characters"],
      minlength: [3, "Product title must be at least 3 characters long"],
    },
    slug: {
      type: String,
      required: [true, "Product slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: [500, "Product description cannot exceed 500 characters"],
      minlength: [
        10,
        "Product description must be at least 10 characters long",
      ],
    },
    price: {
      type: Number,
      min: [0, "Product price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      min: [0, "Discounted price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["indian", "chinese", "south-indian", "tandoor"],
    },
    imageUrl: {
      type: String,
      required: [true, "Product image URL is required"],
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot exceed 5"],
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: [0, "Rating count cannot be less than 0"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    spicyLevel: {
      type: Number,
      default: 0,
      min: [0, "Spicy level cannot be less than 0"],
      max: [3, "Spicy level cannot exceed 3"],
    },

    prepTime: {
      type: String,
      default: "30 min",
    },

    isCustomizable: {
      type: Boolean,
      default: false,
    },
    customizableOptions: [
      {
        option: {
          type: String,
          required: function () {
            return this.parent()?.isCustomizable === true;
          },
          trim: true,
          maxlength: [50, "Option cannot exceed 50 characters"],
        },
        price: {
          type: Number,
          required: function () {
            return this.parent()?.isCustomizable === true;
          },
          min: [0, "Option price cannot be negative"],
          default: 0,
        },
      },
    ],

    addOns: [
      {
        type: Schema.Types.ObjectId,
        ref: "AddOn",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// adding indexes for better performance
ProductSchema.index({ title: "text", description: "text", category: "text" }); // for full-text search
ProductSchema.index({ category: 1, isAvailable: 1 }); // for filtering menus
ProductSchema.index({ price: 1 }); // price-based filtering/sorting
ProductSchema.index({ rating: -1 }); // top rated
ProductSchema.index({ isBestSeller: -1 }); // top sellers
ProductSchema.index({ createdAt: -1 }); // latest dishes
ProductSchema.index({ category: 1, isVeg: 1, isAvailable: 1 }); // veg filtering combo

// Pre-save middleware to handle data migration from old structure
ProductSchema.pre("save", function (next) {
  if (this.customizableOptions && Array.isArray(this.customizableOptions)) {
    this.customizableOptions = this.customizableOptions.map((option) => {
      // Convert old structure to new structure
      if (option.label !== undefined || option.value !== undefined) {
        return {
          option: option.label || option.value || "",
          price: option.price || 0,
        };
      }
      // Keep new structure as is
      return {
        option: option.option || "",
        price: option.price || 0,
      };
    });
  }
  next();
});

// Pre-update middleware for findOneAndUpdate operations
ProductSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function (next) {
    const update = this.getUpdate();
    if (
      update &&
      update.customizableOptions &&
      Array.isArray(update.customizableOptions)
    ) {
      update.customizableOptions = update.customizableOptions.map((option) => {
        // Convert old structure to new structure
        if (option.label !== undefined || option.value !== undefined) {
          return {
            option: option.label || option.value || "",
            price: option.price || 0,
          };
        }
        // Keep new structure as is
        return {
          option: option.option || "",
          price: option.price || 0,
        };
      });
    }
    next();
  }
);

// Virtual for discount percentage
ProductSchema.virtual("discountPercentage").get(function () {
  if (this.discountedPrice && this.price > this.discountedPrice) {
    return Math.round(((this.price - this.discountedPrice) / this.price) * 100);
  }
  return 0;
});

// Ensure virtuals are included in JSON output
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;

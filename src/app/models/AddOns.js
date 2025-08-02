
import mongoose from "mongoose";

const AddOnSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
    },
    isVeg : {
      type: Boolean,
      default: false,
    },
    ratingCount: {
      type: Number,
    },
    
    // Customizable options for addons
    isCustomizable: {
      type: Boolean,
      default: false,
    },
    customizableOptions: [
      {
        label: {
          type: String,
          required: function() {
            return this.parent().isCustomizable;
          },
          trim: true,
          maxlength: [50, "Option label cannot exceed 50 characters"],
        },
        value: {
          type: String,
          required: function() {
            return this.parent().isCustomizable;
          },
          trim: true,
          maxlength: [100, "Option value cannot exceed 100 characters"],
        },
        price: {
          type: Number,
          required: function() {
            return this.parent().isCustomizable;
          },
          min: [0, "Option price cannot be negative"],
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        }
      }
    ],
  },
  {
    timestamps: true,
  }
);

// adding indexes for better performance
AddOnSchema.index({ title: 1 });
AddOnSchema.index({ price: 1 });

const AddOn = mongoose.models.AddOn || mongoose.model("AddOn", AddOnSchema);
export default AddOn;
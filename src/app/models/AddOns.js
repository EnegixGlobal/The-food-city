
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
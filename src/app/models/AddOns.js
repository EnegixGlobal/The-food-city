
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
      trim: true,
    },
    price: {
      type: Number,
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
        option: {
          type: String,
          trim: true,
          maxlength: [50, "Option cannot exceed 50 characters"],
        },
        price: {
          type: Number,
          min: [0, "Option price cannot be negative"],
          default: 0,
        },
        // Legacy fields for backward compatibility - will be removed by middleware
        label: {
          type: String,
          trim: true,
        },
        value: {
          type: String,
          trim: true,
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

// Pre-save middleware to handle data migration from old structure
AddOnSchema.pre('save', function(next) {
  if (this.customizableOptions && Array.isArray(this.customizableOptions)) {
    this.customizableOptions = this.customizableOptions.map(option => {
      // Convert old structure to new structure and clean up
      const newOption = {
        option: option.option || option.label || option.value || '',
        price: option.price || 0,
      };
      
      // Validate if customizable
      if (this.isCustomizable) {
        if (!newOption.option) {
          const error = new Error('Customization option name is required when addon is customizable');
          return next(error);
        }
        if (newOption.price < 0) {
          const error = new Error('Customization option price cannot be negative');
          return next(error);
        }
      }
      
      return newOption;
    });
    
    // If not customizable, clear options
    if (!this.isCustomizable) {
      this.customizableOptions = [];
    }
  }
  next();
});

// Pre-update middleware for findOneAndUpdate operations
AddOnSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  const update = this.getUpdate();
  if (update && update.customizableOptions && Array.isArray(update.customizableOptions)) {
    update.customizableOptions = update.customizableOptions.map(option => {
      // Convert old structure to new structure and clean up
      return {
        option: option.option || option.label || option.value || '',
        price: option.price || 0,
      };
    });
    
    // If not customizable, clear options
    if (update.isCustomizable === false) {
      update.customizableOptions = [];
    }
  }
  next();
});

const AddOn = mongoose.models.AddOn || mongoose.model("AddOn", AddOnSchema);
export default AddOn;
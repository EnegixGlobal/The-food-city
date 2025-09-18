import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  selectedCustomization: {
    option: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
  },
});

const orderAddOnSchema = new mongoose.Schema({
  addOnId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  image: {
    type: String,
    default: "",
  },
  selectedCustomization: {
    option: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
  },
});

const customerInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    match: [/^\d{6}$/, "Please enter a valid pincode"],
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    addons: [orderAddOnSchema],
    customerInfo: {
      type: customerInfoSchema,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    onlineDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["online", "cod"],
      default: "online",
    },
    // Razorpay payment fields
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    paymentCompletedAt: {
      type: Date,
      default: null,
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    trackingInfo: {
      orderPlaced: {
        timestamp: { type: Date, default: Date.now },
        status: { type: String, default: "Order placed successfully" },
      },
      confirmed: {
        timestamp: Date,
        status: String,
      },
      preparing: {
        timestamp: Date,
        status: String,
      },
      outForDelivery: {
        timestamp: Date,
        status: String,
        deliveryPersonName: String,
        deliveryPersonPhone: String,
      },
      delivered: {
        timestamp: Date,
        status: String,
        deliveredBy: String,
      },
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
orderSchema.index({ "customerInfo.email": 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ estimatedDeliveryDate: 1 });
orderSchema.index({ "customerInfo.area": 1 });

// Virtual for order total items count
orderSchema.virtual("totalItems").get(function () {
  const itemsCount = this.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const addonsCount = (this.addons || []).reduce(
    (total, addon) => total + addon.quantity,
    0
  );
  return itemsCount + addonsCount;
});

// Virtual for order age in hours
orderSchema.virtual("orderAgeHours").get(function () {
  if (!this.orderDate) return 0;
  return Math.floor((Date.now() - this.orderDate.getTime()) / (1000 * 60 * 60));
});

// Virtual for delivery status
orderSchema.virtual("deliveryStatus").get(function () {
  const now = new Date();

  if (this.status === "delivered") {
    return "delivered";
  } else if (this.status === "cancelled") {
    return "cancelled";
  } else if (this.estimatedDeliveryDate) {
    const deliveryDate = new Date(this.estimatedDeliveryDate);
    if (now > deliveryDate) {
      return "overdue";
    } else {
      return "on_time";
    }
  } else {
    return "pending";
  }
});

// Ensure virtuals are included in JSON output
orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

// Pre-save middleware to update tracking info
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const timestamp = new Date();

    switch (this.status) {
      case "confirmed":
        if (!this.trackingInfo.confirmed.timestamp) {
          this.trackingInfo.confirmed = {
            timestamp,
            status: "Order confirmed and being prepared",
          };
        }
        break;
      case "preparing":
        if (!this.trackingInfo.preparing.timestamp) {
          this.trackingInfo.preparing = {
            timestamp,
            status: "Your Food is being prepared",
          };
        }
        break;
      case "out_for_delivery":
        if (!this.trackingInfo.outForDelivery.timestamp) {
          this.trackingInfo.outForDelivery = {
            timestamp,
            status: "Order is out for delivery",
          };
        }
        break;
      case "delivered":
        if (!this.trackingInfo.delivered.timestamp) {
          this.trackingInfo.delivered = {
            timestamp,
            status: "Order delivered successfully",
          };
          this.actualDeliveryDate = timestamp;
        }
        break;
    }
  }
  next();
});

// Force recreation of the model to ensure schema changes are applied
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model("Order", orderSchema);

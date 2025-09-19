import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is required"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    // Optional phone number (unique when provided). We use sparse so multiple
    // documents without a phone are allowed while still enforcing uniqueness
    // for actual phone values. This avoids duplicate key errors for `null`.
    phone: {
      type: String,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number"],
      unique: true,
      sparse: true, // ensures the unique index ignores documents without this field
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
// Note: `unique: true` on email & phone already creates their indexes.
// We only add non-unique indexes explicitly when beneficial.
userSchema.index({ name: 1 });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

// If an old non-sparse/incorrect phone index exists (from earlier schema),
// it must be dropped manually in MongoDB for the new sparse unique index
// to take effect:
// db.users.dropIndex("phone_1")
// (This comment is informational; it won't execute automatically.)

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

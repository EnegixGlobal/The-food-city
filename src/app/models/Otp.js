import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3, // Maximum 3 verification attempts
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes expiry
  },
});

OtpSchema.index({ phone: 1, otp: 1 });
OtpSchema.index({ phone: 1, createdAt: -1 });

// Clear any existing model to prevent caching issues
if (mongoose.models.Otp) {
  delete mongoose.models.Otp;
}

export default mongoose.model("Otp", OtpSchema);

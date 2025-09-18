import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // 10 min expiry
});


OtpSchema.index({ email: 1, otp: 1 });
OtpSchema.index({ email: 1, createdAt: -1 });

// Clear any existing model to prevent caching issues
if (mongoose.models.Otp) {
  delete mongoose.models.Otp;
}

export default mongoose.model("Otp", OtpSchema);

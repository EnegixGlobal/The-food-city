import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  fullAddress: {
    type: String,
    trim: true,
    required: [true, "Full address is required"],
  },
  doorOrFlatNo: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    match: [/^\d{6}$/, "Please enter a valid pincode"],
    required: [true, "Pincode is required"],
  },
  landmark: {
    type: String,
    trim: true,
  },
});

// Index for better performance
AddressSchema.index({ pincode: 1 });
AddressSchema.index({ fullAddress: 1 });

const Address =
  mongoose.models.Address || mongoose.model("Address", AddressSchema);

export default Address;

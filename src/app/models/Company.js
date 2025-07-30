import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "The Food City",
      required: [true, "Company name is required"],
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Company password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    logo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Company =
  mongoose.models.Company || mongoose.model("Company", CompanySchema);
export default Company;

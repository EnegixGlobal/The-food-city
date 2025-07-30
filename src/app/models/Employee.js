import mongoose from "mongoose";
import { BiTrim } from "react-icons/bi";

const EmployeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v); // Validates if the phone number is 10 digits
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    whatsapp: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v); // Validates if the phone number is 10 digits
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Adding indexes for better performance
EmployeeSchema.index({ name: 1 });
EmployeeSchema.index({ whatsapp: 1 });
EmployeeSchema.index({ phone: 1 });

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
export default Employee;

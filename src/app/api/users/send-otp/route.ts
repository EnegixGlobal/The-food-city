import connectDb from "@/app/db/connectDb";
import bcryptjs from "bcryptjs";
import User from "@/app/models/User";
import { apiError } from "@/app/lib/ApiError";
import { asyncHandler } from "@/app/lib/asyncHandler";
import { apiResponse } from "@/app/lib/apiResponse";
import Otp from "@/app/models/Otp";
import nodemailer from "nodemailer";

export const POST = asyncHandler(async (req) => {
  const { email } = await req.json();

  if (!email) {
    return apiError(400, "Email is required");
  }

  // Validate email format
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail) {
    return apiError(400, "Invalid email format!");
  }

  await connectDb();

  const user = await User.findOne({ email });
  if (!user) {
    return apiError(404, "User not found");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return apiError(500, "Email service not configured. Please try later.");
  }

  let mailSent = false;
  let mailError: unknown = null;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    });
    mailSent = true;
  } catch (e) {
    mailError = e;
    if (process.env.NODE_ENV === "production") {
      return apiError(503, "Failed to send OTP. Please try again shortly.");
    }
    console.warn("[DEV] Email sending failed, continuing with fallback:", e);
  }

  // Hash and save OTP
  const hashedOtp = await bcryptjs.hash(otp, 10);
  const newOtp = new Otp({
    email,
    otp: hashedOtp,
  });

  await newOtp.save();

  return apiResponse(200, mailSent ? "OTP sent successfully" : "OTP generated (email not sent in dev)", {
    otp: process.env.NODE_ENV === "development" ? otp : undefined,
    mailSent,
    mailError: process.env.NODE_ENV === "development" ? (mailError as Error | null)?.message : undefined,
  });
});

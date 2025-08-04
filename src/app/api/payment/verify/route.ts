import { NextRequest } from "next/server";
import { apiResponse } from "@/app/lib/apiResponse";
import { authenticateUser } from "@/app/utils/authMiddleware";
import connectDb from "@/app/db/connectDb";
import Order from "@/app/models/Order";
import crypto from "crypto";

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    // Authenticate user
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return apiResponse(400, "Missing payment details");
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return apiResponse(400, "Invalid payment signature");
    }

    // Find and update order
    const order = await Order.findOneAndUpdate(
      {
        orderId,
        userId: authResult.user!.id,
        razorpayOrderId: razorpay_order_id,
      },
      {
        paymentStatus: "paid",
        razorpayPaymentId: razorpay_payment_id,
        paymentCompletedAt: new Date(),
        status: "confirmed",
        trackingInfo: {
          orderPlaced: {
            status: "Order placed successfully",
            timestamp: new Date(),
          },
          confirmed: {
            status: "Payment confirmed",
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!order) {
      return apiResponse(404, "Order not found or payment mismatch");
    }

    return apiResponse(200, "Payment verified successfully", {
      orderId: order.orderId,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return apiResponse(500, "Payment verification failed");
  }
};

import { NextRequest } from "next/server";
import { apiResponse } from "@/app/lib/apiResponse";
import { authenticateUser } from "@/app/utils/authMiddleware";
import connectDb from "@/app/db/connectDb";
import Order from "@/app/models/Order";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    // Authenticate user
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return apiResponse(400, "Order ID is required");
    }

    // Find the order
    const order = await Order.findOne({ orderId, userId: authResult.user!.id });
    
    if (!order) {
      return apiResponse(404, "Order not found");
    }

    if (order.paymentStatus === "paid") {
      return apiResponse(400, "Order already paid");
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // Amount in paise
      currency: "INR",
      receipt: order.orderId,
      notes: {
        orderId: order.orderId,
        userId: authResult.user!.id
      }
    });

    // Update order with Razorpay order ID
    await Order.findByIdAndUpdate(order._id, {
      razorpayOrderId: razorpayOrder.id
    });

    return apiResponse(200, "Payment order created", {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order.orderId
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    return apiResponse(500, "Failed to create payment order");
  }
};

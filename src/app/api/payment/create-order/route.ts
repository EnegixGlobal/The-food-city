import { NextRequest } from "next/server";
import { apiResponse } from "@/app/lib/apiResponse";
import { authenticateUser } from "@/app/utils/authMiddleware";
import connectDb from "@/app/db/connectDb";
import Order from "@/app/models/Order";
import {
  StandardCheckoutClient,
  Env,
  MetaInfo,
  StandardCheckoutPayRequest,
} from "pg-sdk-node";

// *******************************
// USING PHONEPE PAYMENT GATEWAY INSTEAD OF RAZORPAY

const clientId = String(process.env.PHONEPAY_PG_CLIENT_ID);
const clientSecret = String(process.env.PHONEPAY_PG_CLIENT_SECRET);
const clientVersion = Number(process.env.PHONEPAY_PG_CLIENT_VERSION);
const env = Env.SANDBOX;

const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

export const POST = async (req: NextRequest) => {
  try {
    await connectDb();

    const { orderId } = await req.json();

    const metaInfo = MetaInfo.builder().udf1("udf1").udf2("udf2").build();

    //  Authenticate user
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return authResult.response;
    }

    if (!orderId) {
      return apiResponse(400, "Order ID is required");
    }

    // Find the order
    const order = await Order.findOne({ orderId, userId: authResult.user!.id });
    const redirectUrl = `${process.env.PUBLIC_URL}/my-account/orders/${order?._id}`;

    if (!order) {
      return apiResponse(404, "Order not found");
    }

    if (order.paymentStatus === "paid") {
      return apiResponse(400, "Order already paid");
    }

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(orderId)
      .amount(order.totalAmount * 100)
      .redirectUrl(redirectUrl)
      .metaInfo(metaInfo)
      .build();

    const response = await client.pay(request);

    if (!response) {
      return apiResponse(500, "Failed to create payment order");
    }

    if (response.state == "SUCCESS") {
      // update the orderid
      // Find and update order
      await Order.findOneAndUpdate(
        {
          orderId,
          userId: authResult.user!.id,
          paymentOrderId: orderId,
        },
        {
          paymentStatus: "paid",
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
    }

    // update the orderid
    await Order.findByIdAndUpdate(order._id, {
      paymentOrderId: response.orderId,
    });

    return apiResponse(200, "Payment order created", {
      orderId: order._id,
      paymentOrderId: response.orderId,
      redirectUrl: response.redirectUrl,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return apiResponse(500, "Failed to create payment order");
  }
};

import connectDb from "@/app/db/connectDb";
import { apiError, apiResponse } from "@/app/lib";
import Order from "@/app/models/Order";
import User from "@/app/models/User"; // Import User model for populate to work
import { getCompanyIdFromToken } from "@/app/utils/getCompanyIdFromToken";
import { NextRequest } from "next/server";

// Admin: Get single order details
export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    // Check admin authentication
    const companyId = getCompanyIdFromToken(req);
    if (!companyId) {
      return apiResponse(401, "Unauthorized Access, Admin Login Required");
    }

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Order ID is required");
    }

    // Find order (admin can view any order)
    const order = await Order.findById(id).populate(
      "userId",
      "name phone email"
    );

    if (!order) {
      return apiResponse(404, "Order not found");
    }

    return apiResponse(200, "Order fetched successfully", order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return apiError(500, "Internal server error");
  }
};

// Admin: Update order status
export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    // Check admin authentication
    const companyId = getCompanyIdFromToken(req);
    if (!companyId) {
      return apiResponse(401, "Unauthorized Access, Admin Login Required");
    }

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Order ID is required");
    }

    const body = await req.json().catch(() => ({}));
    const { status, paymentStatus } = body as {
      status?: string;
      paymentStatus?: string;
    };

    if (status === undefined && paymentStatus === undefined) {
      return apiResponse(400, "Nothing to update");
    }

    const order = await Order.findById(id);
    if (!order) {
      return apiResponse(404, "Order not found");
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];
    const allowedPaymentStatuses = ["pending", "paid", "failed", "refunded"];

    let changed = false;

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return apiResponse(
          400,
          `Invalid status. Allowed: ${allowedStatuses.join(", ")}`
        );
      }
      if (order.status !== status) {
        order.status = status as typeof order.status;
        changed = true;
      }
    }

    if (paymentStatus !== undefined) {
      if (!allowedPaymentStatuses.includes(paymentStatus)) {
        return apiResponse(
          400,
          `Invalid paymentStatus. Allowed: ${allowedPaymentStatuses.join(", ")}`
        );
      }
      // Only set paymentCompletedAt when transitioning to paid first time
      if (order.paymentStatus !== paymentStatus) {
        if (paymentStatus === "paid" && order.paymentStatus !== "paid") {
          // @ts-ignore - field exists in schema
          order.paymentCompletedAt = new Date();
        }
        order.paymentStatus = paymentStatus as typeof order.paymentStatus;
        changed = true;
      }
    }

    if (!changed) {
      return apiResponse(200, "No changes applied", order);
    }

    await order.save();
    return apiResponse(200, "Order updated successfully", order);
  } catch (error) {
    console.error("Error updating order status/payment:", error);
    return apiError(500, "Internal server error");
  }
};

// Admin: Delete order
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    // Check admin authentication
    const companyId = getCompanyIdFromToken(req);
    if (!companyId) {
      return apiResponse(401, "Unauthorized Access, Admin Login Required");
    }

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Order ID is required");
    }

    // Find and delete order (admin can delete any order)
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return apiResponse(404, "Order not found");
    }

    return apiResponse(200, "Order deleted successfully", deletedOrder);
  } catch (error) {
    console.error("Error deleting order:", error);
    return apiError(500, "Internal server error");
  }
};

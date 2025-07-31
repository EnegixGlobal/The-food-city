import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import Order from "@/app/models/Order";
import { NextRequest } from "next/server";
import { authenticateUser } from "@/app/utils/authMiddleware";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    // Authenticate user first
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user!;
    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Order ID is required");
    }

    // Find order and verify it belongs to the authenticated user
    const order = await Order.findOne({ _id: id, userId: user.id });

    if (!order) {
      return apiResponse(404, "Order not found or you don't have permission to view this order");
    }

    return apiResponse(200, "Order fetched successfully", order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return apiResponse(500, "Internal server error");
  }
};

// delete the order
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    // Authenticate user first
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user!;
    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Order ID is required");
    }

    // Find and delete order only if it belongs to the authenticated user
    const deletedOrder = await Order.findOneAndDelete({ _id: id, userId: user.id });

    if (!deletedOrder) {
      return apiResponse(404, "Order not found or you don't have permission to delete this order");
    }

    return apiResponse(200, "Order deleted successfully", deletedOrder);
  } catch (error) {
    console.error("Error deleting order:", error);
    return apiResponse(500, "Internal server error");
  }
};

// change order status
export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    // Authenticate user first
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const user = authResult.user!;
    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Order ID is required");
    }

    const { status } = await req.json();

    if (
      status !== "preparing" &&
      status !== "out_for_delivery" &&
      status !== "delivered" &&
      status !== "cancelled"
    ) {
      return apiResponse(
        400,
        "Invalid status. Allowed values are: preparing, out_for_delivery, delivered, cancelled"
      );
    }

    // Find order and verify it belongs to the authenticated user
    const order = await Order.findOne({ _id: id, userId: user.id });

    if (!order) {
      return apiResponse(404, "Order not found or you don't have permission to update this order");
    }

    // Users can only cancel their own orders, not change to other statuses
    if (status !== "cancelled") {
      return apiResponse(403, "You can only cancel your own orders. Other status changes are restricted.");
    }

    // Update order status
    order.status = status;
    await order.save();

    return apiResponse(200, "Order status updated successfully", order);
  } catch (error) {
    console.error("Error updating order status:", error);
    return apiResponse(500, "Internal server error");
  }
};

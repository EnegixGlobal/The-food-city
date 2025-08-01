import connectDb from "@/app/db/connectDb";
import { apiError, apiResponse } from "@/app/lib";
import Order from "@/app/models/Order";
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
    const order = await Order.findById(id)
      .populate('userId', 'name phone email');

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

    const { status } = await req.json();

    if (
      status !== "pending" &&
      status !== "confirmed" &&
      status !== "preparing" &&
      status !== "out_for_delivery" &&
      status !== "delivered" &&
      status !== "cancelled"
    ) {
      return apiResponse(
        400,
        "Invalid status. Allowed values are: pending, confirmed, preparing, out_for_delivery, delivered, cancelled"
      );
    }

    // Find and update order (admin can update any order)
    const order = await Order.findById(id);

    if (!order) {
      return apiResponse(404, "Order not found");
    }

    // Update order status
    order.status = status;
    await order.save();

    return apiResponse(200, "Order status updated successfully", order);
  } catch (error) {
    console.error("Error updating order status:", error);
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

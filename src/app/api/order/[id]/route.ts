import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import Order from "@/app/models/Order";
import { NextRequest } from "next/server";

export const GET = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Order ID is required");
    }

    const order = await Order.findById(id);

    if (!order) {
      return apiResponse(404, "Order not found");
    }

    return apiResponse(200, "Order fetched successfully", order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return apiResponse(500, "Internal server error");
  }
};

// delete the order
export const DELETE = async (
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  try {
    await connectDb();

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Order ID is required");
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return apiResponse(404, "Order not found");
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

    const { id } = await context.params;

    if (!id) {
      return apiResponse(400, "Order ID is required");
    }

    const { status } = await req.json();

    if (
      status !== "preparing" &&
      status !== "out_for_delivery" &&
      status !== "delivered"
    ) {
      return apiResponse(
        400,
        "Invalid status. Allowed values are: preparing, out-for-delivery, delivered"
      );
    }

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
    return apiResponse(500, "Internal server error");
  }
};

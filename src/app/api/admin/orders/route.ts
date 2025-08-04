import connectDb from "@/app/db/connectDb";
import { apiError, apiResponse } from "@/app/lib";
import Order from "@/app/models/Order";
import User from "@/app/models/User"; // Import User model for populate to work
import { getCompanyIdFromToken } from "@/app/utils/getCompanyIdFromToken";
import { NextRequest } from "next/server";

// Admin: Get all orders with pagination and filters
export const GET = async (req: NextRequest) => {
  try {
    await connectDb();

    // Check admin authentication
    const companyId = getCompanyIdFromToken(req);
    if (!companyId) {
      return apiResponse(401, "Unauthorized Access, Admin Login Required");
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "orderDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query filter for admin (no userId filter)
    const queryFilter: any = {};

    if (status) {
      queryFilter.status = status;
    }

    if (search) {
      queryFilter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "customerInfo.name": { $regex: search, $options: "i" } },
        { "customerInfo.phone": { $regex: search, $options: "i" } }
      ];
    }

    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Fetch orders with pagination
    const orders = await Order.find(queryFilter)
      .populate('userId', 'name phone email') // Populate user details
      .select({
        orderId: 1,
        userId: 1,
        orderDate: 1,
        status: 1,
        paymentStatus: 1,
        paymentMethod: 1,
        totalAmount: 1,
        subtotal: 1,
        deliveryCharge: 1,
        onlineDiscount: 1,
        tax: 1,
        'items.title': 1,
        'items.price': 1,
        'items.quantity': 1,
        'items.imageUrl': 1,
        'items.productId': 1,
        'items.slug': 1,
        'items.selectedCustomization': 1,
        'addons.name': 1,
        'addons.price': 1,
        'addons.quantity': 1,
        'addons.image': 1,
        'addons.addOnId': 1,
        'addons.selectedCustomization': 1,
        'customerInfo.name': 1,
        'customerInfo.phone': 1,
        'customerInfo.address': 1,
        'customerInfo.pincode': 1,
        trackingInfo: 1,
        cancellationReason: 1,
        refundAmount: 1,
        createdAt: 1,
        updatedAt: 1
      })
      .sort(sortObject)
      .limit(limit)
      .skip((page - 1) * limit);

    if (!orders || orders.length === 0) {
      return apiResponse(200, "No orders found", {
        orders: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 0,
      });
    }

    // Get total count for pagination
    const totalCount = await Order.countDocuments(queryFilter);

    return apiResponse(200, "Orders fetched successfully", {
      orders,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });

  } catch (error) {
    console.error("Error fetching orders:", error);
    return apiError(500, "Internal server error");
  }
};

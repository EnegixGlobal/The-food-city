// creating order

import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Order from "@/app/models/Order";
import generateOrderId from "@/app/utils/generateOrderId";
import { authenticateUser } from "@/app/utils/authMiddleware";

export const POST = asyncHandler(async (req) => {
  connectDb();

  // Authenticate user first
  const authResult = await authenticateUser(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const user = authResult.user!; // TypeScript knows this exists when success is true
  const orderData = await req.json();

  // Validate required fields
  const requiredFields = ["items", "customerInfo", "totalAmount"];
  for (const field of requiredFields) {
    if (!orderData[field]) {
      return apiResponse(
        400,
        `${field} ${field == "items" ? "are" : "is"} required`
      );
    }
  }

  // validate customerInfo
  const { customerInfo } = orderData;
  const requiredCustomerFields = ["name", "email", "address", "pincode"];

  for (const field of requiredCustomerFields) {
    if (!customerInfo[field]) {
      return apiResponse(400, `${field} is required`);
    }
  }

  // validate phone number
  // const phoneRegex = /^[6-9]\d{9}$/;
  // if (!phoneRegex.test(customerInfo.phone)) {
  //   return apiResponse(400, "Please enter a valid phone number");
  // }

  // validate email instead of phone
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(customerInfo.email)) {
  return apiResponse(400, "Please enter a valid email address");
}

  //   validate items array
  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    return apiResponse(400, "Items array is required and cannot be empty");
  }

  // generating order ID
  const orderId = generateOrderId();

  // creating order document with user information
  const order = new Order({
    orderId,
    userId: user.id, // Associate order with authenticated user
    items: orderData.items,
    addons: orderData.addons || [],
    customerInfo: orderData.customerInfo,
    totalAmount: orderData.totalAmount,
    subtotal: orderData.subtotal || 0,
    deliveryCharge: orderData.deliveryCharge || 0,
    onlineDiscount: orderData.onlineDiscount || 0,
    tax: orderData.tax || 0,
    paymentMethod: orderData.paymentMethod || "online",
    status: "pending",
    paymentStatus: "pending",
    orderDate: new Date(),
  });

  const savedOrder = await order.save();

  return apiResponse(201, "Order Created Successfully", savedOrder);
});

// get all order with pagination and with filter and query

export const GET = asyncHandler(async (req) => {
  connectDb();

  const authResult = await authenticateUser(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const user = authResult.user!;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy") || "orderDate";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  // Build query filter
  const queryFilter: any = {
    userId: user.id, // Only fetch orders for the authenticated user
  };

  if (status) {
    queryFilter.status = status;
  }

  // Build sort object
  const sortObject: any = {};
  sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;

  // const result = await Order.aggregate(aggregation);

  const result = await Order.find(queryFilter)
    .select({
      orderId: 1,
      orderDate: 1,
      status: 1,
      paymentStatus: 1,
      totalAmount: 1,
      'items.title': 1,
      'items.productId': 1,
      'items.price': 1,
      'items.quantity': 1,
      'items.imageUrl': 1,
      'items.selectedCustomization': 1,
      'addons.name': 1,
      'addons.addOnId': 1,
      'addons.price': 1,
      'addons.quantity': 1,
      'addons.selectedCustomization': 1,
      'customerInfo.name': 1,
      'customerInfo.phone': 1,
      'customerInfo.address': 1,
      deliveryCharge: 1,
      subtotal: 1,
      onlineDiscount: 1,
      tax: 1,
      trackingInfo: 1
    })
    .sort(sortObject)
    .limit(limit)
    .skip((page - 1) * limit);

  if (!result || result.length === 0) {
    return apiResponse(200, "No orders found for this user", {
      orders: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0,
    });
  }

  // Get total count for pagination
  const totalCount = await Order.countDocuments(queryFilter);

  return apiResponse(200, "Orders fetched successfully", {
    orders: result,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
  });
});

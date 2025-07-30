// creating order

import connectDb from "@/app/db/connectDb";
import { apiResponse } from "@/app/lib/apiResponse";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Order from "@/app/models/Order";
import generateOrderId from "@/app/utils/generateOrderId";

export const POST = asyncHandler(async (req) => {
  connectDb();
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

  const requiredCustomerFields = ["name", "phone", "address", "pincode"];

  for (const field of requiredCustomerFields) {
    if (!customerInfo[field]) {
      return apiResponse(400, `${field} is required`);
    }
  }

  // validate phone number
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(customerInfo.phone)) {
    return apiResponse(400, "Please enter a valid phone number");
  }

  //   validate items array
  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    return apiResponse(400, "Items array is required and cannot be empty");
  }

  // generating order ID
  const orderId = generateOrderId();

  // creating order document
  const order = new Order({
    orderId,
    items: orderData.items,
    customerInfo: orderData.customerInfo,
    totalAmount: orderData.totalAmount,
    addons: orderData.addons || [],
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

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const orderId = searchParams.get("orderId");
  const sortBy = searchParams.get("sortBy") || "orderDate";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const matchStage: any = {};

  if (status) {
    matchStage.status = status;
  }

  if (orderId) {
    matchStage.orderId = orderId;
  }

  const sortStage: any = {};

  sortStage[sortBy] = sortOrder === "asc" ? 1 : -1;

  const skip = (page - 1) * limit;

  const aggregation = [
    { $match: matchStage },
    {
      $facet: {
        data: [{ $sort: sortStage }, { $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await Order.aggregate(aggregation);

  if (result.length === 0) {
    return apiResponse(404, "No orders found");
  }

  const orders = result[0].data;
  const totalCount = result[0].totalCount[0]?.count || 0;

  return apiResponse(200, "Orders Fetched Successfully!", {
    orders,
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
  });
});

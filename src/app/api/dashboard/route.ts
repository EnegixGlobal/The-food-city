import connectDb from "@/app/db/connectDb";
import { apiError, apiResponse } from "@/app/lib";
import { asyncHandler } from "@/app/lib/asyncHandler";
import Order from "@/app/models/Order";
import Product from "@/app/models/Product";
import User from "@/app/models/User";
import { getCompanyIdFromToken } from "@/app/utils/getCompanyIdFromToken";
import { NextRequest } from "next/server";

// Admin: Get dashboard analytics and statistics
export const GET = asyncHandler(async (req: NextRequest) => {
  await connectDb();

  // Check admin authentication
  const companyId = getCompanyIdFromToken(req);
  if (!companyId) {
    return apiResponse(401, "Unauthorized Access, Admin Login Required");
  }

  try {
    // Get URL search parameters for date filtering
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Set date range - default to last 30 days if not provided
    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      startDate.setHours(0, 0, 0, 0); // Start of day
      
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999); // End of day
    } else {
      // Default to last 30 days
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    // Get current date boundaries for today's stats
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // Yesterday boundaries for comparison
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayStart);

    // This month boundaries
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Last month boundaries for comparison
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel data fetching for better performance
    const [
      // Today's stats (always today regardless of filter)
      todayOrders,
      yesterdayOrders,
      todayRevenue,
      yesterdayRevenue,

      // Filtered date range stats
      filteredRevenue,
      filteredOrders,
      totalCustomers,
      totalProducts,

      // Monthly stats (current month)
      monthlyRevenue,
      lastMonthRevenue,
      monthlyOrders,
      lastMonthOrders,

      // Recent orders (within date range)
      recentOrders,

      // Popular items (within date range)
      popularItems,

      // Order status distribution (within date range)
      orderStatusStats,

      // Payment method stats (within date range)
      paymentMethodStats,
    ] = await Promise.all([
      // Today's orders count
      Order.countDocuments({
        orderDate: { $gte: todayStart, $lt: todayEnd },
      }),

      // Yesterday's orders count
      Order.countDocuments({
        orderDate: { $gte: yesterdayStart, $lt: yesterdayEnd },
      }),

      // Today's revenue
      Order.aggregate([
        {
          $match: {
            orderDate: { $gte: todayStart, $lt: todayEnd },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),

      // Yesterday's revenue
      Order.aggregate([
        {
          $match: {
            orderDate: { $gte: yesterdayStart, $lt: yesterdayEnd },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),

      // Total revenue (within selected date range)
      Order.aggregate([
        {
          $match: { 
            orderDate: { $gte: startDate, $lte: endDate },
            paymentStatus: "paid" 
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),

      // Total orders count (within selected date range)
      Order.countDocuments({
        orderDate: { $gte: startDate, $lte: endDate }
      }),

      // Total customers count
      User.countDocuments(),

      // Total products count
      Product.countDocuments(),

      // This month's revenue
      Order.aggregate([
        {
          $match: {
            orderDate: { $gte: monthStart, $lt: nextMonthStart },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),

      // Last month's revenue
      Order.aggregate([
        {
          $match: {
            orderDate: { $gte: lastMonthStart, $lt: lastMonthEnd },
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),

      // This month's orders
      Order.countDocuments({
        orderDate: { $gte: monthStart, $lt: nextMonthStart },
      }),

      // Last month's orders
      Order.countDocuments({
        orderDate: { $gte: lastMonthStart, $lt: lastMonthEnd },
      }),

      // Recent orders (within date range, last 10)
      Order.find({
        orderDate: { $gte: startDate, $lte: endDate }
      })
        .populate("userId", "name phone email")
        .select({
          orderId: 1,
          userId: 1,
          orderDate: 1,
          status: 1,
          paymentStatus: 1,
          totalAmount: 1,
          "items.title": 1,
          "items.quantity": 1,
          "customerInfo.name": 1,
          "customerInfo.phone": 1,
        })
        .sort({ orderDate: -1 })
        .limit(10),

      // Popular items (most ordered within date range)
      Order.aggregate([
        { 
          $match: { 
            orderDate: { $gte: startDate, $lte: endDate } 
          } 
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: {
              productId: "$items.productId",
              title: "$items.title",
              slug: "$items.slug",
            },
            totalOrders: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { totalOrders: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            productId: "$_id.productId",
            title: "$_id.title",
            slug: "$_id.slug",
            totalOrders: 1,
            totalRevenue: 1,
          },
        },
      ]),

      // Order status distribution (within date range)
      Order.aggregate([
        {
          $match: { 
            orderDate: { $gte: startDate, $lte: endDate } 
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Payment method stats (within date range)
      Order.aggregate([
        {
          $match: { 
            orderDate: { $gte: startDate, $lte: endDate } 
          }
        },
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Process revenue data
    const todayRevenueAmount = todayRevenue[0]?.total || 0;
    const yesterdayRevenueAmount = yesterdayRevenue[0]?.total || 0;
    const filteredRevenueAmount = filteredRevenue[0]?.total || 0;
    const monthlyRevenueAmount = monthlyRevenue[0]?.total || 0;
    const lastMonthRevenueAmount = lastMonthRevenue[0]?.total || 0;

    // Calculate percentage changes
    const ordersChange = calculatePercentageChange(
      todayOrders,
      yesterdayOrders
    );
    const revenueChange = calculatePercentageChange(
      todayRevenueAmount,
      yesterdayRevenueAmount
    );
    const monthlyOrdersChange = calculatePercentageChange(
      monthlyOrders,
      lastMonthOrders
    );
    const monthlyRevenueChange = calculatePercentageChange(
      monthlyRevenueAmount,
      lastMonthRevenueAmount
    );

    // Dashboard stats
    const dashboardStats = [
      {
        title: "Today's Orders",
        value: todayOrders.toString(),
        change: `${ordersChange >= 0 ? "+" : ""}${ordersChange}%`,
        trend: ordersChange >= 0 ? "up" : "down",
        icon: "orders",
        description: "from yesterday",
      },
      {
        title: "Today's Revenue",
        value: `₹${todayRevenueAmount.toLocaleString("en-IN")}`,
        change: `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
        trend: revenueChange >= 0 ? "up" : "down",
        icon: "revenue",
        description: "from yesterday",
      },
      {
        title: "Period Revenue",
        value: `₹${filteredRevenueAmount.toLocaleString("en-IN")}`,
        change: `${
          monthlyRevenueChange >= 0 ? "+" : ""
        }${monthlyRevenueChange}%`,
        trend: monthlyRevenueChange >= 0 ? "up" : "down",
        icon: "totalRevenue",
        description: "in selected range",
      },
      {
        title: "Menu Items",
        value: totalProducts.toString(),
        change: "Active",
        trend: "neutral",
        icon: "products",
        description: "total products",
      },
      {
        title: "Total Customers",
        value: totalCustomers.toString(),
        change: "Registered",
        trend: "neutral",
        icon: "customers",
        description: "all time",
      },
      {
        title: "Monthly Orders",
        value: monthlyOrders.toString(),
        change: `${monthlyOrdersChange >= 0 ? "+" : ""}${monthlyOrdersChange}%`,
        trend: monthlyOrdersChange >= 0 ? "up" : "down",
        icon: "monthlyOrders",
        description: "from last month",
      },
    ];

    // Process recent orders
    const processedRecentOrders = recentOrders.map((order) => ({
      id: order.orderId,
      customer: order.customerInfo?.name || "Unknown Customer",
      phone: order.customerInfo?.phone || "",
      items: order.items?.length || 0,
      total: `₹${order.totalAmount.toLocaleString("en-IN")}`,
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderDate: order.orderDate,
    }));

    // Process popular items
    const processedPopularItems = popularItems.map((item) => ({
      name: item.title,
      orders: item.totalOrders,
      revenue: `₹${item.totalRevenue.toLocaleString("en-IN")}`,
      slug: item.slug,
    }));

    // Process order status stats
    const processedOrderStats = orderStatusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    // Process payment method stats
    const processedPaymentStats = paymentMethodStats.reduce((acc, stat) => {
      acc[stat._id] = {
        count: stat.count,
        revenue: stat.revenue,
      };
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    // Prepare response data
    const dashboardData = {
      stats: dashboardStats,
      recentOrders: processedRecentOrders,
      popularItems: processedPopularItems,
      orderStatusDistribution: processedOrderStats,
      paymentMethodStats: processedPaymentStats,
      summary: {
        totalOrders: filteredOrders,
        totalCustomers,
        totalProducts,
        totalRevenue: filteredRevenueAmount,
        todayOrders,
        todayRevenue: todayRevenueAmount,
        monthlyOrders,
        monthlyRevenue: monthlyRevenueAmount,
        averageOrderValue:
          filteredOrders > 0 ? Math.round(filteredRevenueAmount / filteredOrders) : 0,
      },
      trends: {
        ordersChange,
        revenueChange,
        monthlyOrdersChange,
        monthlyRevenueChange,
      },
    };

    return apiResponse(
      200,
      "Dashboard data retrieved successfully",
      dashboardData
    );
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return apiError(500, "Failed to retrieve dashboard data", error);
  }
});

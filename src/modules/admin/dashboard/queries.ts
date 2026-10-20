import { db } from "@/db";
import {
  inventory,
  orders,
  profiles,
  returnRequests,
  reviews,
} from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import "server-only";

import type { OrderStatus } from "@/modules/orders";

export interface DashboardMetrics {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  todayOrders: number;
  averageOrderValue: number;
  lowStockCount: number;
  pendingReviewsCount: number;
  pendingReturnsCount: number;
  totalCustomers: number;
  ordersByStatus: Record<OrderStatus, number>;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: string;
    customerEmail: string | null;
    createdAt: Date;
  }[];
}

const DEFAULT_METRICS: DashboardMetrics = {
  totalRevenue: 0,
  todayRevenue: 0,
  totalOrders: 0,
  todayOrders: 0,
  averageOrderValue: 0,
  lowStockCount: 0,
  pendingReviewsCount: 0,
  pendingReturnsCount: 0,
  totalCustomers: 0,
  ordersByStatus: {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  },
  recentOrders: [],
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayIso = startOfToday.toISOString();

  try {
    const [
      ordersSummaryResult,
      statusCountsResult,
      lowStockResult,
      pendingReviewsResult,
      pendingReturnsResult,
      customersResult,
      recentOrdersRows,
    ] = await Promise.all([
      // 1. Consolidated revenue and order volume in a single query
      db
        .select({
          totalRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.status} NOT IN ('cancelled', 'refunded') THEN ${orders.total}::numeric ELSE 0 END), 0)`,
          todayRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.status} NOT IN ('cancelled', 'refunded') AND ${orders.createdAt} >= ${startOfTodayIso}::timestamptz THEN ${orders.total}::numeric ELSE 0 END), 0)`,
          totalOrders: sql<number>`COUNT(*)::int`,
          todayOrders: sql<number>`COUNT(CASE WHEN ${orders.createdAt} >= ${startOfTodayIso}::timestamptz THEN 1 END)::int`,
        })
        .from(orders),

      // 2. Orders grouped by status
      db
        .select({
          status: orders.status,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(orders)
        .groupBy(orders.status),

      // 3. Low stock count (quantity <= lowStockAlert)
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(inventory)
        .where(sql`${inventory.quantity} <= ${inventory.lowStockAlert}`),

      // 4. Pending reviews moderation count
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(reviews)
        .where(eq(reviews.isApproved, false)),

      // 5. Pending returns count
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(returnRequests)
        .where(eq(returnRequests.status, "requested")),

      // 6. Total registered customers
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(profiles)
        .where(eq(profiles.role, "customer")),

      // 7. Recent 8 orders
      db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          total: orders.total,
          customerEmail: profiles.email,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(profiles, eq(profiles.id, orders.userId))
        .orderBy(desc(orders.createdAt))
        .limit(8),
    ]);

    const summary = ordersSummaryResult[0];
    const totalRevenue = parseFloat(summary?.totalRevenue ?? "0") || 0;
    const todayRevenue = parseFloat(summary?.todayRevenue ?? "0") || 0;
    const totalOrders = summary?.totalOrders ?? 0;
    const todayOrders = summary?.todayOrders ?? 0;
    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const ordersByStatus = { ...DEFAULT_METRICS.ordersByStatus };
    statusCountsResult.forEach((row) => {
      if (row.status && row.status in ordersByStatus) {
        ordersByStatus[row.status as OrderStatus] = row.count;
      }
    });

    return {
      totalRevenue,
      todayRevenue,
      totalOrders,
      todayOrders,
      averageOrderValue,
      lowStockCount: lowStockResult[0]?.count ?? 0,
      pendingReviewsCount: pendingReviewsResult[0]?.count ?? 0,
      pendingReturnsCount: pendingReturnsResult[0]?.count ?? 0,
      totalCustomers: customersResult[0]?.count ?? 0,
      ordersByStatus,
      recentOrders: recentOrdersRows.map((r) => ({
        id: r.id,
        orderNumber: r.orderNumber,
        status: r.status,
        total: r.total,
        customerEmail: r.customerEmail ?? null,
        createdAt: r.createdAt,
      })),
    };
  } catch (err) {
    console.error("[getDashboardMetrics] Query failed:", err);
    return DEFAULT_METRICS;
  }
}

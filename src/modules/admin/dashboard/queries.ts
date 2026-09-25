import { db } from "@/db";
import {
  inventory,
  orders,
  profiles,
  returnRequests,
  reviews,
} from "@/db/schema";
import { and, desc, eq, gte, ne, sql } from "drizzle-orm";
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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    revenueResult,
    todayRevenueResult,
    totalOrdersResult,
    todayOrdersResult,
    statusCountsResult,
    lowStockResult,
    pendingReviewsResult,
    pendingReturnsResult,
    customersResult,
    recentOrdersRows,
  ] = await Promise.all([
    // Total Revenue (excluding cancelled/refunded)
    db
      .select({
        revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(ne(orders.status, "cancelled"), ne(orders.status, "refunded"))
      ),

    // Today's Revenue
    db
      .select({
        revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
      })
      .from(orders)
      .where(
        and(
          ne(orders.status, "cancelled"),
          ne(orders.status, "refunded"),
          gte(orders.createdAt, startOfToday)
        )
      ),

    // Total Orders count
    db.select({ count: sql<number>`COUNT(*)::int` }).from(orders),

    // Today's Orders count
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(orders)
      .where(gte(orders.createdAt, startOfToday)),

    // Orders grouped by status
    db
      .select({
        status: orders.status,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(orders)
      .groupBy(orders.status),

    // Low stock count (quantity <= lowStockAlert)
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(inventory)
      .where(sql`${inventory.quantity} <= ${inventory.lowStockAlert}`),

    // Pending reviews moderation count
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(reviews)
      .where(eq(reviews.isApproved, false)),

    // Pending returns count
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(returnRequests)
      .where(eq(returnRequests.status, "requested")),

    // Total registered customers
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(profiles)
      .where(eq(profiles.role, "customer")),

    // Recent 8 orders
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

  const totalRevenue = parseFloat(revenueResult[0]?.revenue ?? "0") || 0;
  const todayRevenue = parseFloat(todayRevenueResult[0]?.revenue ?? "0") || 0;
  const totalOrders = totalOrdersResult[0]?.count ?? 0;
  const todayOrders = todayOrdersResult[0]?.count ?? 0;
  const averageOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const ordersByStatus: Record<OrderStatus, number> = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    refunded: 0,
  };

  statusCountsResult.forEach((row) => {
    if (row.status in ordersByStatus) {
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
}

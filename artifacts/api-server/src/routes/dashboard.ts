import { Router, type IRouter } from "express";
import { db, parentsTable, tutorsTable, requirementsTable, demosTable, paymentsTable } from "@workspace/db";
import { eq, count, sum, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [parentCount] = await db.select({ count: count() }).from(parentsTable);
  const [tutorCount] = await db.select({ count: count() }).from(tutorsTable).where(eq(tutorsTable.status, "active"));
  const [activeReqCount] = await db.select({ count: count() }).from(requirementsTable).where(eq(requirementsTable.status, "open"));
  const [demoCount] = await db.select({ count: count() }).from(demosTable).where(eq(demosTable.status, "scheduled"));
  const [paidCount] = await db.select({ count: count() }).from(paymentsTable).where(eq(paymentsTable.status, "paid"));
  const [revenueResult] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable).where(eq(paymentsTable.status, "paid"));

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);
  const [newLeads] = await db.select({ count: count() }).from(parentsTable)
    .where(sql`${parentsTable.createdAt} >= ${thisMonth}`);

  res.json({
    totalLeads: parentCount.count,
    totalTutors: tutorCount.count,
    activeRequirements: activeReqCount.count,
    demosScheduled: demoCount.count,
    paidTuitions: paidCount.count,
    totalRevenue: parseFloat(revenueResult.total ?? "0"),
    newLeadsThisMonth: newLeads.count,
  });
});

router.get("/dashboard/lead-sources", async (_req, res): Promise<void> => {
  const results = await db.select({
    source: parentsTable.leadSource,
    count: count(),
  }).from(parentsTable).groupBy(parentsTable.leadSource);

  res.json(results.map(r => ({ source: r.source, count: r.count })));
});

router.get("/dashboard/revenue", async (_req, res): Promise<void> => {
  const results = await db.select({
    month: sql<string>`to_char(${paymentsTable.createdAt}, 'YYYY-MM')`,
    revenue: sum(paymentsTable.amount),
    count: count(),
  }).from(paymentsTable)
    .where(eq(paymentsTable.status, "paid"))
    .groupBy(sql`to_char(${paymentsTable.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${paymentsTable.createdAt}, 'YYYY-MM')`);

  res.json(results.map(r => ({
    month: r.month,
    revenue: parseFloat(r.revenue ?? "0"),
    count: r.count,
  })));
});

router.get("/dashboard/pipeline", async (_req, res): Promise<void> => {
  const results = await db.select({
    status: parentsTable.leadStatus,
    count: count(),
  }).from(parentsTable).groupBy(parentsTable.leadStatus);

  const order = ["new", "contacted", "qualified", "demo_scheduled", "demo_done", "converted", "lost"];
  const sorted = order.map(s => {
    const found = results.find(r => r.status === s);
    return { status: s, count: found?.count ?? 0 };
  });

  res.json(sorted);
});

export default router;

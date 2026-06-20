import { Router, type IRouter } from "express";
import { db, paymentsTable, parentsTable, tutorsTable, requirementsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

async function formatPayment(p: typeof paymentsTable.$inferSelect) {
  const [parent] = await db.select({ name: parentsTable.name }).from(parentsTable).where(eq(parentsTable.id, p.parentId));
  const [req] = await db.select({ subject: requirementsTable.subject }).from(requirementsTable).where(eq(requirementsTable.id, p.requirementId));
  let tutorName: string | null = null;
  if (p.tutorId) {
    const [t] = await db.select({ name: tutorsTable.name }).from(tutorsTable).where(eq(tutorsTable.id, p.tutorId));
    tutorName = t?.name ?? null;
  }

  return {
    id: p.id,
    requirementId: p.requirementId,
    tutorId: p.tutorId,
    parentId: p.parentId,
    parentName: parent?.name ?? "",
    tutorName,
    subject: req?.subject ?? "",
    amount: parseFloat(p.amount),
    type: p.type,
    status: p.status,
    paidAt: p.paidAt?.toISOString() ?? null,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/payments", async (req, res): Promise<void> => {
  const { status } = req.query;

  let payments = await db.select().from(paymentsTable).orderBy(sql`${paymentsTable.createdAt} DESC`);

  if (status && typeof status === "string") {
    payments = payments.filter(p => p.status === status);
  }

  const formatted = await Promise.all(payments.map(formatPayment));
  res.json(formatted);
});

router.post("/payments", async (req, res): Promise<void> => {
  const { requirementId, parentId, tutorId, amount, type, notes } = req.body;
  if (!requirementId || !parentId || !amount || !type) {
    res.status(400).json({ error: "requirementId, parentId, amount, type required" });
    return;
  }

  const [payment] = await db.insert(paymentsTable).values({
    requirementId, parentId, tutorId,
    amount: String(amount),
    type, status: "pending", notes,
  }).returning();

  res.status(201).json(await formatPayment(payment));
});

router.patch("/payments/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const updates: Record<string, unknown> = {};
  if (req.body.status) updates["status"] = req.body.status;
  if (req.body.paidAt) updates["paidAt"] = new Date(req.body.paidAt);
  if (req.body.status === "paid" && !req.body.paidAt) updates["paidAt"] = new Date();
  if (req.body.amount !== undefined) updates["amount"] = String(req.body.amount);
  if (req.body.notes !== undefined) updates["notes"] = req.body.notes;

  const [payment] = await db.update(paymentsTable).set(updates).where(eq(paymentsTable.id, id)).returning();
  if (!payment) {
    res.status(404).json({ error: "Payment not found" });
    return;
  }

  // If paid, update lead status to converted
  if (req.body.status === "paid") {
    await db.update(parentsTable).set({ leadStatus: "converted", updatedAt: new Date() }).where(eq(parentsTable.id, payment.parentId));
  }

  res.json(await formatPayment(payment));
});

export default router;

import { Router, type IRouter } from "express";
import { db, demosTable, tutorsTable, parentsTable, requirementsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

async function formatDemo(d: typeof demosTable.$inferSelect) {
  const [tutor] = await db.select({ name: tutorsTable.name }).from(tutorsTable).where(eq(tutorsTable.id, d.tutorId));
  const [parent] = await db.select({ name: parentsTable.name, phone: parentsTable.phone }).from(parentsTable).where(eq(parentsTable.id, d.parentId));
  const [req] = await db.select({ subject: requirementsTable.subject, area: requirementsTable.area }).from(requirementsTable).where(eq(requirementsTable.id, d.requirementId));

  return {
    id: d.id,
    requirementId: d.requirementId,
    tutorId: d.tutorId,
    tutorName: tutor?.name ?? "",
    parentId: d.parentId,
    parentName: parent?.name ?? "",
    parentPhone: parent?.phone ?? "",
    subject: req?.subject ?? "",
    area: req?.area ?? "",
    scheduledAt: d.scheduledAt.toISOString(),
    status: d.status,
    feedback: d.feedback,
    outcome: d.outcome,
    assignedTo: d.assignedTo,
    createdAt: d.createdAt.toISOString(),
  };
}

router.get("/demos", async (req, res): Promise<void> => {
  const { status, assignedTo } = req.query;

  let demos = await db.select().from(demosTable).orderBy(sql`${demosTable.scheduledAt} DESC`);

  if (status && typeof status === "string") demos = demos.filter(d => d.status === status);
  if (assignedTo && typeof assignedTo === "string") {
    const aid = parseInt(assignedTo, 10);
    demos = demos.filter(d => d.assignedTo === aid);
  }

  const formatted = await Promise.all(demos.map(formatDemo));
  res.json(formatted);
});

router.post("/demos", async (req, res): Promise<void> => {
  const { requirementId, tutorId, scheduledAt, assignedTo, notes } = req.body;
  if (!requirementId || !tutorId || !scheduledAt) {
    res.status(400).json({ error: "requirementId, tutorId, scheduledAt required" });
    return;
  }

  // Get parent from requirement
  const [r] = await db.select({ parentId: requirementsTable.parentId }).from(requirementsTable).where(eq(requirementsTable.id, requirementId));
  if (!r) {
    res.status(404).json({ error: "Requirement not found" });
    return;
  }

  const [demo] = await db.insert(demosTable).values({
    requirementId,
    tutorId,
    parentId: r.parentId,
    scheduledAt: new Date(scheduledAt),
    status: "scheduled",
    assignedTo,
    notes,
  }).returning();

  // Also update parent lead status to demo_scheduled
  await db.update(parentsTable).set({ leadStatus: "demo_scheduled", updatedAt: new Date() }).where(eq(parentsTable.id, r.parentId));

  res.status(201).json(await formatDemo(demo));
});

router.get("/demos/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [demo] = await db.select().from(demosTable).where(eq(demosTable.id, id));
  if (!demo) {
    res.status(404).json({ error: "Demo not found" });
    return;
  }

  res.json(await formatDemo(demo));
});

router.patch("/demos/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const updates: Record<string, unknown> = {};
  if (req.body.scheduledAt) updates["scheduledAt"] = new Date(req.body.scheduledAt);
  if (req.body.status) updates["status"] = req.body.status;
  if (req.body.feedback !== undefined) updates["feedback"] = req.body.feedback;
  if (req.body.outcome !== undefined) updates["outcome"] = req.body.outcome;
  if (req.body.assignedTo !== undefined) updates["assignedTo"] = req.body.assignedTo;

  const [demo] = await db.update(demosTable).set(updates).where(eq(demosTable.id, id)).returning();
  if (!demo) {
    res.status(404).json({ error: "Demo not found" });
    return;
  }

  // If demo completed, update parent lead status
  if (req.body.status === "completed") {
    await db.update(parentsTable).set({ leadStatus: "demo_done", updatedAt: new Date() }).where(eq(parentsTable.id, demo.parentId));
  }

  res.json(await formatDemo(demo));
});

export default router;

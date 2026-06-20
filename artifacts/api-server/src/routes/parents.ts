import { Router, type IRouter } from "express";
import { db, parentsTable, requirementsTable, demosTable, paymentsTable, staffTable, tutorsTable } from "@workspace/db";
import { eq, and, ilike, or, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/parents", async (req, res): Promise<void> => {
  const { status, search, source } = req.query;

  let query = db.select({
    id: parentsTable.id,
    name: parentsTable.name,
    phone: parentsTable.phone,
    email: parentsTable.email,
    area: parentsTable.area,
    city: parentsTable.city,
    leadStatus: parentsTable.leadStatus,
    leadSource: parentsTable.leadSource,
    assignedTo: parentsTable.assignedTo,
    notes: parentsTable.notes,
    createdAt: parentsTable.createdAt,
    updatedAt: parentsTable.updatedAt,
  }).from(parentsTable).$dynamic();

  const conditions = [];
  if (status && typeof status === "string") {
    conditions.push(eq(parentsTable.leadStatus, status));
  }
  if (source && typeof source === "string") {
    conditions.push(eq(parentsTable.leadSource, source));
  }
  if (search && typeof search === "string") {
    conditions.push(
      or(
        ilike(parentsTable.name, `%${search}%`),
        ilike(parentsTable.phone, `%${search}%`),
        ilike(parentsTable.area, `%${search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  const parents = await query.orderBy(sql`${parentsTable.createdAt} DESC`);

  res.json(parents.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  })));
});

router.post("/parents", async (req, res): Promise<void> => {
  const { name, phone, email, area, city, leadSource, notes } = req.body;
  if (!name || !phone || !area || !leadSource) {
    res.status(400).json({ error: "name, phone, area, leadSource are required" });
    return;
  }

  const [parent] = await db.insert(parentsTable).values({
    name, phone, email, area, city: city || "Lucknow",
    leadSource, leadStatus: "new", notes,
  }).returning();

  res.status(201).json({
    ...parent,
    createdAt: parent.createdAt.toISOString(),
    updatedAt: parent.updatedAt.toISOString(),
  });
});

router.get("/parents/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [parent] = await db.select().from(parentsTable).where(eq(parentsTable.id, id));
  if (!parent) {
    res.status(404).json({ error: "Parent not found" });
    return;
  }

  const requirements = await db.select().from(requirementsTable).where(eq(requirementsTable.parentId, id));
  const demos = await db.select().from(demosTable).where(eq(demosTable.parentId, id));
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.parentId, id));

  // Get tutor names for demos
  const demosWithNames = await Promise.all(demos.map(async (d) => {
    const [tutor] = await db.select({ name: tutorsTable.name }).from(tutorsTable).where(eq(tutorsTable.id, d.tutorId));
    const [req_] = await db.select({ subject: requirementsTable.subject, area: requirementsTable.area }).from(requirementsTable).where(eq(requirementsTable.id, d.requirementId));
    return {
      ...d,
      tutorName: tutor?.name ?? "",
      parentName: parent.name,
      parentPhone: parent.phone,
      subject: req_?.subject ?? "",
      area: req_?.area ?? "",
      scheduledAt: d.scheduledAt.toISOString(),
      createdAt: d.createdAt.toISOString(),
    };
  }));

  res.json({
    ...parent,
    createdAt: parent.createdAt.toISOString(),
    updatedAt: parent.updatedAt.toISOString(),
    requirements: requirements.map(r => ({
      ...r,
      budget: r.budget ? parseFloat(r.budget) : null,
      parentName: parent.name,
      createdAt: r.createdAt.toISOString(),
    })),
    demos: demosWithNames,
    payments: payments.map(p => ({
      ...p,
      amount: parseFloat(p.amount),
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      parentName: parent.name,
      tutorName: null,
      subject: "",
    })),
  });
});

router.patch("/parents/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const allowed = ["name", "phone", "email", "area", "city", "leadStatus", "leadSource", "notes", "assignedTo"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      // Map camelCase to snake_case for db fields
      const dbKey = key === "leadStatus" ? "leadStatus" : key === "leadSource" ? "leadSource" : key === "assignedTo" ? "assignedTo" : key;
      updates[dbKey] = req.body[key];
    }
  }
  updates["updatedAt"] = new Date();

  const [parent] = await db.update(parentsTable)
    .set(updates)
    .where(eq(parentsTable.id, id))
    .returning();

  if (!parent) {
    res.status(404).json({ error: "Parent not found" });
    return;
  }

  res.json({
    ...parent,
    createdAt: parent.createdAt.toISOString(),
    updatedAt: parent.updatedAt.toISOString(),
  });
});

export default router;

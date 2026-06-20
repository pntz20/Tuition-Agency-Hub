import { Router, type IRouter } from "express";
import { db, parentsTable, staffTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/leads", async (req, res): Promise<void> => {
  const { status, assignedTo, source } = req.query;

  const parents = await db.select().from(parentsTable).orderBy(sql`${parentsTable.updatedAt} DESC`);

  let leads = parents.map(p => ({
    id: p.id,
    parentId: p.id,
    parentName: p.name,
    parentPhone: p.phone,
    area: p.area,
    status: p.leadStatus,
    source: p.leadSource,
    assignedTo: p.assignedTo,
    assignedName: null as string | null,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  if (status && typeof status === "string") {
    leads = leads.filter(l => l.status === status);
  }
  if (source && typeof source === "string") {
    leads = leads.filter(l => l.source === source);
  }
  if (assignedTo && typeof assignedTo === "string") {
    const assignedId = parseInt(assignedTo, 10);
    leads = leads.filter(l => l.assignedTo === assignedId);
  }

  // Fetch assigned staff names
  const staffIds = [...new Set(leads.filter(l => l.assignedTo).map(l => l.assignedTo!))];
  if (staffIds.length > 0) {
    const staffMembers = await db.select({ id: staffTable.id, name: staffTable.name }).from(staffTable);
    const staffMap = new Map(staffMembers.map(s => [s.id, s.name]));
    leads = leads.map(l => ({
      ...l,
      assignedName: l.assignedTo ? (staffMap.get(l.assignedTo) ?? null) : null,
    }));
  }

  res.json(leads);
});

router.patch("/leads/:id/status", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { status, notes } = req.body;

  if (!status) {
    res.status(400).json({ error: "status required" });
    return;
  }

  const updates: Record<string, unknown> = { leadStatus: status, updatedAt: new Date() };
  if (notes !== undefined) updates.notes = notes;

  const [parent] = await db.update(parentsTable)
    .set(updates)
    .where(eq(parentsTable.id, id))
    .returning();

  if (!parent) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  res.json({
    id: parent.id,
    parentId: parent.id,
    parentName: parent.name,
    parentPhone: parent.phone,
    area: parent.area,
    status: parent.leadStatus,
    source: parent.leadSource,
    assignedTo: parent.assignedTo,
    assignedName: null,
    notes: parent.notes,
    createdAt: parent.createdAt.toISOString(),
    updatedAt: parent.updatedAt.toISOString(),
  });
});

router.patch("/leads/:id/assign", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { staffId } = req.body;

  const [parent] = await db.update(parentsTable)
    .set({ assignedTo: staffId, updatedAt: new Date() })
    .where(eq(parentsTable.id, id))
    .returning();

  if (!parent) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  let assignedName: string | null = null;
  if (staffId) {
    const [s] = await db.select({ name: staffTable.name }).from(staffTable).where(eq(staffTable.id, staffId));
    assignedName = s?.name ?? null;
  }

  res.json({
    id: parent.id,
    parentId: parent.id,
    parentName: parent.name,
    parentPhone: parent.phone,
    area: parent.area,
    status: parent.leadStatus,
    source: parent.leadSource,
    assignedTo: parent.assignedTo,
    assignedName,
    notes: parent.notes,
    createdAt: parent.createdAt.toISOString(),
    updatedAt: parent.updatedAt.toISOString(),
  });
});

export default router;

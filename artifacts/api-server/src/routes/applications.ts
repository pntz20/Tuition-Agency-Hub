import { Router, type IRouter } from "express";
import { db, applicationsTable, tutorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/requirements/:id/applications", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const requirementId = parseInt(raw, 10);

  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.requirementId, requirementId));

  const appsWithTutors = await Promise.all(apps.map(async (a) => {
    const [t] = await db.select({ name: tutorsTable.name, phone: tutorsTable.phone }).from(tutorsTable).where(eq(tutorsTable.id, a.tutorId));
    return {
      ...a,
      tutorName: t?.name ?? "",
      tutorPhone: t?.phone ?? "",
      createdAt: a.createdAt.toISOString(),
    };
  }));

  res.json(appsWithTutors);
});

router.post("/requirements/:id/applications", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const requirementId = parseInt(raw, 10);
  const { tutorId, notes } = req.body;

  if (!tutorId) {
    res.status(400).json({ error: "tutorId required" });
    return;
  }

  const [app] = await db.insert(applicationsTable).values({
    requirementId,
    tutorId,
    status: "pending",
    notes,
  }).returning();

  const [t] = await db.select({ name: tutorsTable.name, phone: tutorsTable.phone }).from(tutorsTable).where(eq(tutorsTable.id, tutorId));

  res.status(201).json({
    ...app,
    tutorName: t?.name ?? "",
    tutorPhone: t?.phone ?? "",
    createdAt: app.createdAt.toISOString(),
  });
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const { status, notes } = req.body;

  const updates: Record<string, unknown> = {};
  if (status) updates["status"] = status;
  if (notes !== undefined) updates["notes"] = notes;

  const [app] = await db.update(applicationsTable).set(updates).where(eq(applicationsTable.id, id)).returning();
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const [t] = await db.select({ name: tutorsTable.name, phone: tutorsTable.phone }).from(tutorsTable).where(eq(tutorsTable.id, app.tutorId));

  res.json({
    ...app,
    tutorName: t?.name ?? "",
    tutorPhone: t?.phone ?? "",
    createdAt: app.createdAt.toISOString(),
  });
});

export default router;

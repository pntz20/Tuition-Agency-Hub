import { Router, type IRouter } from "express";
import { db, requirementsTable, parentsTable, applicationsTable, tutorsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

function makeSlug(subject: string, grade: string, area: string, id?: number): string {
  const base = `${subject}-${grade}-${area}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return id ? `${base}-${id}` : `${base}-${Date.now()}`;
}

function formatReq(r: typeof requirementsTable.$inferSelect, parentName?: string) {
  return {
    id: r.id,
    parentId: r.parentId,
    parentName: parentName ?? "",
    subject: r.subject,
    grade: r.grade,
    area: r.area,
    daysPerWeek: r.daysPerWeek,
    duration: r.duration,
    budget: r.budget ? parseFloat(r.budget) : null,
    teachingMode: r.teachingMode,
    gender: r.gender,
    description: r.description,
    status: r.status,
    slug: r.slug,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/requirements", async (req, res): Promise<void> => {
  const { status, subject, area, grade } = req.query;

  let reqs = await db.select().from(requirementsTable).orderBy(sql`${requirementsTable.createdAt} DESC`);

  if (status && typeof status === "string") reqs = reqs.filter(r => r.status === status);
  if (subject && typeof subject === "string") reqs = reqs.filter(r => r.subject.toLowerCase().includes(subject.toLowerCase()));
  if (area && typeof area === "string") reqs = reqs.filter(r => r.area.toLowerCase().includes(area.toLowerCase()));
  if (grade && typeof grade === "string") reqs = reqs.filter(r => r.grade === grade);

  const parentIds = [...new Set(reqs.map(r => r.parentId))];
  const parents = await db.select({ id: parentsTable.id, name: parentsTable.name }).from(parentsTable);
  const parentMap = new Map(parents.map(p => [p.id, p.name]));

  res.json(reqs.map(r => formatReq(r, parentMap.get(r.parentId))));
});

router.post("/requirements", async (req, res): Promise<void> => {
  const { parentId, subject, grade, area, daysPerWeek, duration, budget, teachingMode, gender, description } = req.body;
  if (!parentId || !subject || !grade || !area || !teachingMode) {
    res.status(400).json({ error: "parentId, subject, grade, area, teachingMode required" });
    return;
  }

  const slug = makeSlug(subject, grade, area);
  const [r] = await db.insert(requirementsTable).values({
    parentId, subject, grade, area,
    daysPerWeek, duration,
    budget: budget ? String(budget) : null,
    teachingMode, gender, description,
    status: "open", slug,
  }).returning();

  // Update slug with id
  const finalSlug = makeSlug(subject, grade, area, r.id);
  const [updated] = await db.update(requirementsTable).set({ slug: finalSlug }).where(eq(requirementsTable.id, r.id)).returning();

  const [parent] = await db.select({ name: parentsTable.name }).from(parentsTable).where(eq(parentsTable.id, parentId));

  res.status(201).json(formatReq(updated, parent?.name));
});

router.get("/requirements/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [r] = await db.select().from(requirementsTable).where(eq(requirementsTable.id, id));
  if (!r) {
    res.status(404).json({ error: "Requirement not found" });
    return;
  }

  const [parent] = await db.select({ name: parentsTable.name }).from(parentsTable).where(eq(parentsTable.id, r.parentId));
  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.requirementId, id));

  const appsWithTutors = await Promise.all(apps.map(async (a) => {
    const [t] = await db.select({ name: tutorsTable.name, phone: tutorsTable.phone }).from(tutorsTable).where(eq(tutorsTable.id, a.tutorId));
    return {
      ...a,
      tutorName: t?.name ?? "",
      tutorPhone: t?.phone ?? "",
      createdAt: a.createdAt.toISOString(),
    };
  }));

  res.json({
    ...formatReq(r, parent?.name),
    applications: appsWithTutors,
  });
});

router.patch("/requirements/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const allowed = ["subject", "grade", "area", "daysPerWeek", "duration", "teachingMode", "gender", "description", "status"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (req.body.budget !== undefined) updates["budget"] = req.body.budget ? String(req.body.budget) : null;
  updates["updatedAt"] = new Date();

  const [r] = await db.update(requirementsTable).set(updates).where(eq(requirementsTable.id, id)).returning();
  if (!r) {
    res.status(404).json({ error: "Requirement not found" });
    return;
  }

  const [parent] = await db.select({ name: parentsTable.name }).from(parentsTable).where(eq(parentsTable.id, r.parentId));
  res.json(formatReq(r, parent?.name));
});

export default router;

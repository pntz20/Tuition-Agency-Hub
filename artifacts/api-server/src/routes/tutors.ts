import { Router, type IRouter } from "express";
import { db, tutorsTable } from "@workspace/db";
import { eq, and, ilike, or, sql, arrayContains } from "drizzle-orm";

const router: IRouter = Router();

function formatTutor(t: typeof tutorsTable.$inferSelect) {
  return {
    id: t.id,
    name: t.name,
    phone: t.phone,
    email: t.email,
    qualifications: t.qualifications,
    experience: t.experience,
    subjects: t.subjects ?? [],
    areas: t.areas ?? [],
    grades: t.grades ?? [],
    expectedFee: t.expectedFee ? parseFloat(t.expectedFee) : null,
    status: t.status,
    gender: t.gender,
    teachingMode: t.teachingMode,
    bio: t.bio,
    createdAt: t.createdAt.toISOString(),
  };
}

router.get("/tutors", async (req, res): Promise<void> => {
  const { status, search } = req.query;

  let tutors = await db.select().from(tutorsTable).orderBy(sql`${tutorsTable.createdAt} DESC`);

  if (status && typeof status === "string") {
    tutors = tutors.filter(t => t.status === status);
  }
  if (req.query.subject && typeof req.query.subject === "string") {
    tutors = tutors.filter(t => t.subjects.includes(req.query.subject as string));
  }
  if (req.query.area && typeof req.query.area === "string") {
    tutors = tutors.filter(t => t.areas.includes(req.query.area as string));
  }
  if (search && typeof search === "string") {
    const s = search.toLowerCase();
    tutors = tutors.filter(t =>
      t.name.toLowerCase().includes(s) ||
      t.phone.includes(s) ||
      t.qualifications.toLowerCase().includes(s)
    );
  }

  res.json(tutors.map(formatTutor));
});

router.post("/tutors", async (req, res): Promise<void> => {
  const { name, phone, email, qualifications, experience, subjects, areas, grades, expectedFee, gender, teachingMode, bio } = req.body;
  if (!name || !phone || !qualifications || !subjects || !areas || !teachingMode) {
    res.status(400).json({ error: "name, phone, qualifications, subjects, areas, teachingMode required" });
    return;
  }

  const [tutor] = await db.insert(tutorsTable).values({
    name, phone, email,
    qualifications, experience,
    subjects: Array.isArray(subjects) ? subjects : [subjects],
    areas: Array.isArray(areas) ? areas : [areas],
    grades: Array.isArray(grades) ? grades : (grades ? [grades] : []),
    expectedFee: expectedFee ? String(expectedFee) : null,
    gender, teachingMode, bio,
  }).returning();

  res.status(201).json(formatTutor(tutor));
});

router.get("/tutors/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [tutor] = await db.select().from(tutorsTable).where(eq(tutorsTable.id, id));
  if (!tutor) {
    res.status(404).json({ error: "Tutor not found" });
    return;
  }

  res.json({ ...formatTutor(tutor), applications: [], demos: [] });
});

router.patch("/tutors/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const updates: Record<string, unknown> = {};
  const allowed = ["name", "phone", "email", "qualifications", "experience", "subjects", "areas", "grades", "gender", "teachingMode", "status", "bio"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (req.body.expectedFee !== undefined) updates["expectedFee"] = req.body.expectedFee ? String(req.body.expectedFee) : null;

  const [tutor] = await db.update(tutorsTable)
    .set(updates)
    .where(eq(tutorsTable.id, id))
    .returning();

  if (!tutor) {
    res.status(404).json({ error: "Tutor not found" });
    return;
  }

  res.json(formatTutor(tutor));
});

export default router;

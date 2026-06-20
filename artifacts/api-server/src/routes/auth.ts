import { Router, type IRouter } from "express";
import { db, staffTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Simple password check (no bcrypt for simplicity - compare plain in dev)
function checkPassword(plain: string, stored: string): boolean {
  return plain === stored;
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const [staff] = await db.select().from(staffTable).where(eq(staffTable.email, email));
  if (!staff || !checkPassword(password, staff.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Simple token: base64 of id:role (not for production)
  const token = Buffer.from(`${staff.id}:${staff.role}`).toString("base64");

  res.json({
    token,
    user: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      createdAt: staff.createdAt.toISOString(),
    },
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const [idStr] = decoded.split(":");
    const id = parseInt(idStr, 10);
    const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, id));
    if (!staff) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      createdAt: staff.createdAt.toISOString(),
    });
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.get("/staff", async (_req, res): Promise<void> => {
  const staff = await db.select().from(staffTable);
  res.json(staff.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    role: s.role,
    createdAt: s.createdAt.toISOString(),
  })));
});

router.post("/staff", async (req, res): Promise<void> => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "All fields required" });
    return;
  }
  try {
    const [s] = await db.insert(staffTable).values({
      name,
      email,
      passwordHash: password,
      role,
    }).returning();
    res.status(201).json({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      createdAt: s.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Failed to create staff");
    res.status(400).json({ error: "Email already exists" });
  }
});

export default router;

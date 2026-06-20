import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const requirementsTable = pgTable("requirements", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull(),
  subject: text("subject").notNull(),
  grade: text("grade").notNull(),
  area: text("area").notNull(),
  daysPerWeek: integer("days_per_week"),
  duration: integer("duration"),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  teachingMode: text("teaching_mode").notNull().default("home"),
  gender: text("gender"),
  description: text("description"),
  status: text("status").notNull().default("open"),
  slug: text("slug").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRequirementSchema = createInsertSchema(requirementsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRequirement = z.infer<typeof insertRequirementSchema>;
export type Requirement = typeof requirementsTable.$inferSelect;

import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const demosTable = pgTable("demos", {
  id: serial("id").primaryKey(),
  requirementId: integer("requirement_id").notNull(),
  tutorId: integer("tutor_id").notNull(),
  parentId: integer("parent_id").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull().default("scheduled"),
  feedback: text("feedback"),
  outcome: text("outcome"),
  assignedTo: integer("assigned_to"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDemoSchema = createInsertSchema(demosTable).omit({ id: true, createdAt: true });
export type InsertDemo = z.infer<typeof insertDemoSchema>;
export type Demo = typeof demosTable.$inferSelect;

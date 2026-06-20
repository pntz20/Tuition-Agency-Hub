import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const parentsTable = pgTable("parents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  area: text("area").notNull(),
  city: text("city").default("Lucknow"),
  leadStatus: text("lead_status").notNull().default("new"),
  leadSource: text("lead_source").notNull().default("website"),
  assignedTo: integer("assigned_to"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertParentSchema = createInsertSchema(parentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertParent = z.infer<typeof insertParentSchema>;
export type Parent = typeof parentsTable.$inferSelect;

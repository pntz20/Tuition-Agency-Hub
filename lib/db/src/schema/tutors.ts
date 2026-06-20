import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tutorsTable = pgTable("tutors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  qualifications: text("qualifications").notNull(),
  experience: integer("experience"),
  subjects: text("subjects").array().notNull().default([]),
  areas: text("areas").array().notNull().default([]),
  grades: text("grades").array().notNull().default([]),
  expectedFee: numeric("expected_fee", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("active"),
  gender: text("gender"),
  teachingMode: text("teaching_mode").notNull().default("home"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTutorSchema = createInsertSchema(tutorsTable).omit({ id: true, createdAt: true });
export type InsertTutor = z.infer<typeof insertTutorSchema>;
export type Tutor = typeof tutorsTable.$inferSelect;

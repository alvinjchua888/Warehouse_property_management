import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, numeric, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const warehouses = pgTable("warehouses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  unitNumber: text("unit_number").notNull().unique(),
  location: text("location").notNull(),
  sizeSqm: integer("size_sqm").notNull(),
  rentalRate: numeric("rental_rate", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["vacant", "occupied", "maintenance"] }).notNull().default("vacant"),
  amenities: text("amenities"),
  description: text("description"),
});

export const tenants = pgTable("tenants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  fullName: text("full_name").notNull(),
  businessName: text("business_name"),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
});

export const leases = pgTable("leases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  rentalAmount: numeric("rental_amount", { precision: 10, scale: 2 }).notNull(),
  paymentFrequency: text("payment_frequency", { enum: ["monthly", "quarterly", "annually"] }).notNull().default("monthly"),
  securityDeposit: numeric("security_deposit", { precision: 10, scale: 2 }).notNull().default("0"),
  lateFeePercentage: numeric("late_fee_percentage", { precision: 5, scale: 2 }).notNull().default("5"),
  gracePeriodDays: integer("grace_period_days").notNull().default(5),
  status: text("status", { enum: ["active", "expired", "terminated"] }).notNull().default("active"),
  termsAndConditions: text("terms_and_conditions"),
  notes: text("notes"),
});

export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  leaseId: integer("lease_id").notNull().references(() => leases.id),
  amountDue: numeric("amount_due", { precision: 10, scale: 2 }).notNull(),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull().default("0"),
  dueDate: text("due_date").notNull(),
  paymentDate: text("payment_date"),
  status: text("status", { enum: ["pending", "paid", "overdue", "partial"] }).notNull().default("pending"),
  paymentMethod: text("payment_method", { enum: ["bank_transfer", "check", "cash", "online"] }),
  transactionReference: text("transaction_reference"),
  lateFee: numeric("late_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
});

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  warehouseId: integer("warehouse_id").notNull().references(() => warehouses.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category", { enum: ["electrical", "plumbing", "structural", "cleaning", "hvac", "other"] }).notNull(),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).notNull().default("medium"),
  status: text("status", { enum: ["submitted", "in_progress", "completed", "cancelled"] }).notNull().default("submitted"),
  assignedTo: text("assigned_to"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  actualCost: numeric("actual_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  completedAt: text("completed_at"),
  notes: text("notes"),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertWarehouseSchema = createInsertSchema(warehouses).omit({ id: true });
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true });
export const insertLeaseSchema = createInsertSchema(leases).omit({ id: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({ id: true });

export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Lease = typeof leases.$inferSelect;
export type InsertLease = z.infer<typeof insertLeaseSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;

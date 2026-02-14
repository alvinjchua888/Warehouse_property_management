import { db } from "./db";
import { warehouses, tenants, leases, payments, maintenanceRequests } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  const existingWarehouses = await db.select().from(warehouses);
  if (existingWarehouses.length > 0) return;

  console.log("Seeding database with sample data...");

  const [w1, w2, w3, w4, w5] = await db.insert(warehouses).values([
    { unitNumber: "WH-A101", location: "Building A, Ground Floor", sizeSqm: 232, rentalRate: "3500.00", status: "occupied", amenities: "Loading dock, Climate control, 24/7 security", description: "Large ground-floor warehouse with direct truck access and climate control system." },
    { unitNumber: "WH-A102", location: "Building A, Ground Floor", sizeSqm: 167, rentalRate: "2800.00", status: "occupied", amenities: "Loading dock, Overhead crane", description: "Medium warehouse unit with overhead crane for heavy equipment storage." },
    { unitNumber: "WH-B201", location: "Building B, Second Floor", sizeSqm: 297, rentalRate: "4200.00", status: "vacant", amenities: "Freight elevator, Fire suppression, Climate control", description: "Spacious second-floor unit accessible via freight elevator. Ideal for temperature-sensitive goods." },
    { unitNumber: "WH-B202", location: "Building B, Second Floor", sizeSqm: 139, rentalRate: "2200.00", status: "maintenance", amenities: "Basic storage", description: "Compact storage unit currently undergoing HVAC system upgrade." },
    { unitNumber: "WH-C301", location: "Building C, Ground Floor", sizeSqm: 465, rentalRate: "6500.00", status: "occupied", amenities: "Multiple loading docks, Office space, Climate control, 24/7 security", description: "Premium large warehouse with attached office space and multiple loading docks." },
  ]).returning();

  const [t1, t2, t3] = await db.insert(tenants).values([
    { fullName: "James Chen", businessName: "Pacific Logistics Co.", email: "james.chen@pacificlogistics.com", phone: "+1-555-0101", emergencyContactName: "Sarah Chen", emergencyContactPhone: "+1-555-0102", notes: "Long-term tenant since 2022. Excellent payment history.", isActive: true },
    { fullName: "Maria Santos", businessName: "Fresh Harvest Distribution", email: "maria@freshharvestdist.com", phone: "+1-555-0201", emergencyContactName: "Carlos Santos", emergencyContactPhone: "+1-555-0202", notes: "Requires climate-controlled space for perishable goods.", isActive: true },
    { fullName: "Robert Kim", businessName: "TechStore Fulfillment", email: "robert.kim@techstorefulfill.com", phone: "+1-555-0301", emergencyContactName: "Lisa Kim", emergencyContactPhone: "+1-555-0302", notes: "E-commerce fulfillment center. High volume shipping.", isActive: true },
  ]).returning();

  const [l1, l2, l3] = await db.insert(leases).values([
    { warehouseId: w1.id, tenantId: t1.id, startDate: "2025-01-01", endDate: "2026-12-31", rentalAmount: "3500.00", paymentFrequency: "monthly", securityDeposit: "7000.00", lateFeePercentage: "5.00", gracePeriodDays: 5, status: "active", notes: "Two-year lease with option to renew." },
    { warehouseId: w2.id, tenantId: t2.id, startDate: "2025-03-01", endDate: "2026-02-28", rentalAmount: "2800.00", paymentFrequency: "monthly", securityDeposit: "5600.00", lateFeePercentage: "5.00", gracePeriodDays: 7, status: "active", notes: "One-year lease. Tenant requires 24-hour access." },
    { warehouseId: w5.id, tenantId: t3.id, startDate: "2025-06-01", endDate: "2026-05-31", rentalAmount: "6500.00", paymentFrequency: "monthly", securityDeposit: "13000.00", lateFeePercentage: "3.00", gracePeriodDays: 10, status: "active", notes: "Premium lease with dedicated parking and office space." },
  ]).returning();

  await db.insert(payments).values([
    { leaseId: l1.id, amountDue: "3500.00", amountPaid: "3500.00", dueDate: "2026-01-01", paymentDate: "2025-12-28", status: "paid", paymentMethod: "bank_transfer", transactionReference: "TXN-2026-001", lateFee: "0", notes: "January rent - paid early" },
    { leaseId: l1.id, amountDue: "3500.00", amountPaid: "3500.00", dueDate: "2026-02-01", paymentDate: "2026-02-01", status: "paid", paymentMethod: "bank_transfer", transactionReference: "TXN-2026-002", lateFee: "0", notes: "February rent" },
    { leaseId: l2.id, amountDue: "2800.00", amountPaid: "2800.00", dueDate: "2026-01-01", paymentDate: "2026-01-03", status: "paid", paymentMethod: "check", transactionReference: "CHK-4521", lateFee: "0", notes: "January rent" },
    { leaseId: l2.id, amountDue: "2800.00", amountPaid: "1400.00", dueDate: "2026-02-01", paymentDate: "2026-02-10", status: "partial", paymentMethod: "online", transactionReference: "ONL-7890", lateFee: "0", notes: "February rent - partial payment received" },
    { leaseId: l3.id, amountDue: "6500.00", amountPaid: "6500.00", dueDate: "2026-01-01", paymentDate: "2025-12-30", status: "paid", paymentMethod: "bank_transfer", transactionReference: "TXN-2026-010", lateFee: "0", notes: "January rent - paid early" },
    { leaseId: l3.id, amountDue: "6500.00", amountPaid: "0", dueDate: "2026-02-01", status: "overdue", lateFee: "195.00", notes: "February rent - overdue" },
  ]);

  await db.insert(maintenanceRequests).values([
    { warehouseId: w4.id, title: "HVAC System Upgrade", description: "Complete replacement of the aging HVAC system with a modern, energy-efficient unit. Current system is insufficient for climate control requirements.", category: "hvac", priority: "high", status: "in_progress", assignedTo: "HVAC Solutions Inc.", estimatedCost: "12000.00", actualCost: "0", notes: "Parts ordered, installation scheduled for next week." },
    { warehouseId: w1.id, title: "Loading Dock Door Repair", description: "Dock door #2 is not closing properly. The roller mechanism appears to be damaged and needs replacement.", category: "structural", priority: "medium", status: "submitted", assignedTo: "", estimatedCost: "800.00", actualCost: "0", notes: "Reported by tenant on Feb 10." },
    { warehouseId: w5.id, title: "Electrical Panel Inspection", description: "Annual electrical panel inspection and certification. Required by insurance policy.", category: "electrical", priority: "low", status: "submitted", assignedTo: "", estimatedCost: "350.00", actualCost: "0", notes: "Scheduled for end of month." },
    { warehouseId: w2.id, title: "Water Leak in Storage Area", description: "Small water leak detected near the north wall. Appears to be coming from a pipe joint above the ceiling tiles.", category: "plumbing", priority: "urgent", status: "in_progress", assignedTo: "QuickFix Plumbing", estimatedCost: "500.00", actualCost: "0", notes: "Plumber on-site, temporary fix in place." },
  ]);

  console.log("Database seeded successfully.");
}

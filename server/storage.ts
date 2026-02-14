import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  warehouses,
  tenants,
  leases,
  payments,
  maintenanceRequests,
  type User,
  type InsertUser,
  type Warehouse,
  type InsertWarehouse,
  type Tenant,
  type InsertTenant,
  type Lease,
  type InsertLease,
  type Payment,
  type InsertPayment,
  type MaintenanceRequest,
  type InsertMaintenanceRequest,
} from "@shared/schema";

export interface IStorage {
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  getWarehouses(): Promise<Warehouse[]>;
  getWarehouse(id: number): Promise<Warehouse | undefined>;
  createWarehouse(data: InsertWarehouse): Promise<Warehouse>;
  updateWarehouse(id: number, data: Partial<InsertWarehouse>): Promise<Warehouse | undefined>;
  deleteWarehouse(id: number): Promise<boolean>;

  getTenants(): Promise<Tenant[]>;
  getTenant(id: number): Promise<Tenant | undefined>;
  createTenant(data: InsertTenant): Promise<Tenant>;
  updateTenant(id: number, data: Partial<InsertTenant>): Promise<Tenant | undefined>;
  deleteTenant(id: number): Promise<boolean>;

  getLeases(): Promise<Lease[]>;
  getLease(id: number): Promise<Lease | undefined>;
  createLease(data: InsertLease): Promise<Lease>;
  updateLease(id: number, data: Partial<InsertLease>): Promise<Lease | undefined>;
  deleteLease(id: number): Promise<boolean>;

  getPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(data: InsertPayment): Promise<Payment>;
  updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;

  getMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined>;
  createMaintenanceRequest(data: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, data: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined>;
  deleteMaintenanceRequest(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.username, username));
    return result;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
  }

  async createUser(data: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(data).returning();
    return result;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const [result] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }

  async getWarehouses(): Promise<Warehouse[]> {
    return db.select().from(warehouses);
  }

  async getWarehouse(id: number): Promise<Warehouse | undefined> {
    const [result] = await db.select().from(warehouses).where(eq(warehouses.id, id));
    return result;
  }

  async createWarehouse(data: InsertWarehouse): Promise<Warehouse> {
    const [result] = await db.insert(warehouses).values(data).returning();
    return result;
  }

  async updateWarehouse(id: number, data: Partial<InsertWarehouse>): Promise<Warehouse | undefined> {
    const [result] = await db.update(warehouses).set(data).where(eq(warehouses.id, id)).returning();
    return result;
  }

  async deleteWarehouse(id: number): Promise<boolean> {
    const result = await db.delete(warehouses).where(eq(warehouses.id, id)).returning();
    return result.length > 0;
  }

  async getTenants(): Promise<Tenant[]> {
    return db.select().from(tenants);
  }

  async getTenant(id: number): Promise<Tenant | undefined> {
    const [result] = await db.select().from(tenants).where(eq(tenants.id, id));
    return result;
  }

  async createTenant(data: InsertTenant): Promise<Tenant> {
    const [result] = await db.insert(tenants).values(data).returning();
    return result;
  }

  async updateTenant(id: number, data: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const [result] = await db.update(tenants).set(data).where(eq(tenants.id, id)).returning();
    return result;
  }

  async deleteTenant(id: number): Promise<boolean> {
    const result = await db.delete(tenants).where(eq(tenants.id, id)).returning();
    return result.length > 0;
  }

  async getLeases(): Promise<Lease[]> {
    return db.select().from(leases);
  }

  async getLease(id: number): Promise<Lease | undefined> {
    const [result] = await db.select().from(leases).where(eq(leases.id, id));
    return result;
  }

  async createLease(data: InsertLease): Promise<Lease> {
    const [result] = await db.insert(leases).values(data).returning();
    return result;
  }

  async updateLease(id: number, data: Partial<InsertLease>): Promise<Lease | undefined> {
    const [result] = await db.update(leases).set(data).where(eq(leases.id, id)).returning();
    return result;
  }

  async deleteLease(id: number): Promise<boolean> {
    const result = await db.delete(leases).where(eq(leases.id, id)).returning();
    return result.length > 0;
  }

  async getPayments(): Promise<Payment[]> {
    return db.select().from(payments);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [result] = await db.select().from(payments).where(eq(payments.id, id));
    return result;
  }

  async createPayment(data: InsertPayment): Promise<Payment> {
    const [result] = await db.insert(payments).values(data).returning();
    return result;
  }

  async updatePayment(id: number, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [result] = await db.update(payments).set(data).where(eq(payments.id, id)).returning();
    return result;
  }

  async deletePayment(id: number): Promise<boolean> {
    const result = await db.delete(payments).where(eq(payments.id, id)).returning();
    return result.length > 0;
  }

  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return db.select().from(maintenanceRequests);
  }

  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined> {
    const [result] = await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, id));
    return result;
  }

  async createMaintenanceRequest(data: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const [result] = await db.insert(maintenanceRequests).values(data).returning();
    return result;
  }

  async updateMaintenanceRequest(id: number, data: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const [result] = await db.update(maintenanceRequests).set(data).where(eq(maintenanceRequests.id, id)).returning();
    return result;
  }

  async deleteMaintenanceRequest(id: number): Promise<boolean> {
    const result = await db.delete(maintenanceRequests).where(eq(maintenanceRequests.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();

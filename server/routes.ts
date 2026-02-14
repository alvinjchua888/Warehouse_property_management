import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import {
  insertWarehouseSchema,
  insertTenantSchema,
  insertLeaseSchema,
  insertPaymentSchema,
  insertMaintenanceRequestSchema,
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await storage.getUserById(req.session.userId);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const allUsers = await storage.getUsers();
    const isFirstUser = allUsers.length === 0;
    const user = await storage.createUser({ username, password: hashedPassword, isAdmin: isFirstUser });
    req.session.userId = user.id;
    res.status(201).json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    req.session.userId = user.id;
    res.json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to logout" });
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json({ id: user.id, username: user.username, isAdmin: user.isAdmin });
  });

  // Protect all data routes
  app.use("/api/warehouses", requireAuth);
  app.use("/api/tenants", requireAuth);
  app.use("/api/leases", requireAuth);
  app.use("/api/payments", requireAuth);
  app.use("/api/maintenance", requireAuth);

  // Admin routes
  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    const allUsers = await storage.getUsers();
    res.json(allUsers.map((u) => ({ id: u.id, username: u.username, isAdmin: u.isAdmin })));
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { username, isAdmin } = req.body;
    const updateData: Record<string, any> = {};
    if (username !== undefined) updateData.username = username;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    const updated = await storage.updateUser(id, updateData);
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ id: updated.id, username: updated.username, isAdmin: updated.isAdmin });
  });

  app.post("/api/admin/users/:id/reset-password", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await storage.updateUser(id, { password: hashedPassword });
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Password reset successfully" });
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (req.session.userId === id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }
    const deleted = await storage.deleteUser(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  });

  // Warehouses
  app.get("/api/warehouses", async (_req, res) => {
    const data = await storage.getWarehouses();
    res.json(data);
  });

  app.get("/api/warehouses/:id", async (req, res) => {
    const data = await storage.getWarehouse(parseInt(req.params.id));
    if (!data) return res.status(404).json({ message: "Warehouse not found" });
    res.json(data);
  });

  app.post("/api/warehouses", async (req, res) => {
    const parsed = insertWarehouseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const data = await storage.createWarehouse(parsed.data);
    res.status(201).json(data);
  });

  app.patch("/api/warehouses/:id", async (req, res) => {
    const parsed = insertWarehouseSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const data = await storage.updateWarehouse(parseInt(req.params.id), parsed.data);
    if (!data) return res.status(404).json({ message: "Warehouse not found" });
    res.json(data);
  });

  app.delete("/api/warehouses/:id", async (req, res) => {
    const deleted = await storage.deleteWarehouse(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Warehouse not found" });
    res.json({ message: "Deleted" });
  });

  // Tenants
  app.get("/api/tenants", async (_req, res) => {
    const data = await storage.getTenants();
    res.json(data);
  });

  app.get("/api/tenants/:id", async (req, res) => {
    const data = await storage.getTenant(parseInt(req.params.id));
    if (!data) return res.status(404).json({ message: "Tenant not found" });
    res.json(data);
  });

  app.post("/api/tenants", async (req, res) => {
    const parsed = insertTenantSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const data = await storage.createTenant(parsed.data);
    res.status(201).json(data);
  });

  app.patch("/api/tenants/:id", async (req, res) => {
    const parsed = insertTenantSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const data = await storage.updateTenant(parseInt(req.params.id), parsed.data);
    if (!data) return res.status(404).json({ message: "Tenant not found" });
    res.json(data);
  });

  app.delete("/api/tenants/:id", async (req, res) => {
    const deleted = await storage.deleteTenant(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Tenant not found" });
    res.json({ message: "Deleted" });
  });

  // Leases
  app.get("/api/leases", async (_req, res) => {
    const data = await storage.getLeases();
    res.json(data);
  });

  app.get("/api/leases/:id", async (req, res) => {
    const data = await storage.getLease(parseInt(req.params.id));
    if (!data) return res.status(404).json({ message: "Lease not found" });
    res.json(data);
  });

  app.post("/api/leases", async (req, res) => {
    const parsed = insertLeaseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const data = await storage.createLease(parsed.data);
    res.status(201).json(data);
  });

  app.patch("/api/leases/:id", async (req, res) => {
    const parsed = insertLeaseSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const data = await storage.updateLease(parseInt(req.params.id), parsed.data);
    if (!data) return res.status(404).json({ message: "Lease not found" });
    res.json(data);
  });

  app.delete("/api/leases/:id", async (req, res) => {
    const deleted = await storage.deleteLease(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Lease not found" });
    res.json({ message: "Deleted" });
  });

  // Payments
  app.get("/api/payments", async (_req, res) => {
    const data = await storage.getPayments();
    res.json(data);
  });

  app.get("/api/payments/:id", async (req, res) => {
    const data = await storage.getPayment(parseInt(req.params.id));
    if (!data) return res.status(404).json({ message: "Payment not found" });
    res.json(data);
  });

  app.post("/api/payments", async (req, res) => {
    const parsed = insertPaymentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const data = await storage.createPayment(parsed.data);
    res.status(201).json(data);
  });

  app.patch("/api/payments/:id", async (req, res) => {
    const parsed = insertPaymentSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const data = await storage.updatePayment(parseInt(req.params.id), parsed.data);
    if (!data) return res.status(404).json({ message: "Payment not found" });
    res.json(data);
  });

  app.delete("/api/payments/:id", async (req, res) => {
    const deleted = await storage.deletePayment(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Payment not found" });
    res.json({ message: "Deleted" });
  });

  // Maintenance Requests
  app.get("/api/maintenance", async (_req, res) => {
    const data = await storage.getMaintenanceRequests();
    res.json(data);
  });

  app.get("/api/maintenance/:id", async (req, res) => {
    const data = await storage.getMaintenanceRequest(parseInt(req.params.id));
    if (!data) return res.status(404).json({ message: "Maintenance request not found" });
    res.json(data);
  });

  app.post("/api/maintenance", async (req, res) => {
    const parsed = insertMaintenanceRequestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const data = await storage.createMaintenanceRequest(parsed.data);
    res.status(201).json(data);
  });

  app.patch("/api/maintenance/:id", async (req, res) => {
    const parsed = insertMaintenanceRequestSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const data = await storage.updateMaintenanceRequest(parseInt(req.params.id), parsed.data);
    if (!data) return res.status(404).json({ message: "Maintenance request not found" });
    res.json(data);
  });

  app.delete("/api/maintenance/:id", async (req, res) => {
    const deleted = await storage.deleteMaintenanceRequest(parseInt(req.params.id));
    if (!deleted) return res.status(404).json({ message: "Maintenance request not found" });
    res.json({ message: "Deleted" });
  });

  return httpServer;
}

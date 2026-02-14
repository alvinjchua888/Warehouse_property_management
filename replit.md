# Warehouse Rental Property Management

## Overview
A full-stack web application for managing warehouse rental properties, tenants, leases, payments, and maintenance requests. Built with Express + React + Drizzle ORM + PostgreSQL.

## Recent Changes
- Feb 14, 2026: Added PWA support (manifest, service worker, iOS meta tags) for Add to Home Screen on mobile
- Feb 14, 2026: Added admin portal for user management (edit users, reset passwords, toggle admin role, delete users)
- Feb 14, 2026: Added user registration/login with username & password, session-based auth, protected API routes
- Feb 14, 2026: Added square meter (sqm) as default area unit, multi-currency support (PHP, SGD, USD) with PHP as default
- Feb 14, 2026: Initial build - complete MVP with all CRUD operations, dashboard, and seed data

## Tech Stack
- **Frontend**: React + TypeScript + TailwindCSS + Shadcn UI + Wouter (routing) + TanStack Query
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Styling**: Shadcn components with dark/light mode support

## Project Architecture
```
client/src/
  components/
    app-sidebar.tsx        - Main sidebar navigation
    currency-provider.tsx  - Currency context (PHP/SGD/USD) with formatCurrency
    currency-selector.tsx  - Currency picker dropdown
    theme-provider.tsx     - Dark/light theme context
    theme-toggle.tsx       - Theme toggle button
    ui/                    - Shadcn UI components
  pages/
    dashboard.tsx        - Dashboard with stats and quick actions
    warehouses.tsx       - Warehouse CRUD management
    tenants.tsx          - Tenant CRUD management
    leases.tsx           - Lease agreement management
    payments.tsx         - Payment tracking
    maintenance.tsx      - Maintenance request management
  lib/
    queryClient.ts       - TanStack Query client + apiRequest helper

server/
  db.ts                  - Database connection (PostgreSQL via pg)
  storage.ts             - Storage layer (CRUD interface + implementation)
  routes.ts              - API routes (all /api/* endpoints)
  seed.ts                - Database seeding with sample data
  index.ts               - Express app entry point

shared/
  schema.ts              - Drizzle schema definitions + Zod validation
```

## Data Models
- **Users**: username (unique), password (bcrypt hashed), isAdmin (boolean, first user auto-admin)
- **Warehouses**: unit_number, location, size_sqm, rental_rate, status (vacant/occupied/maintenance), amenities, description
- **Tenants**: full_name, business_name, email, phone, emergency contacts, notes, is_active
- **Leases**: warehouse_id, tenant_id, dates, rental_amount, payment_frequency, security_deposit, late_fee_percentage, grace_period_days, status
- **Payments**: lease_id, amount_due/paid, due_date, payment_date, status (pending/paid/overdue/partial), payment_method, transaction_reference, late_fee
- **Maintenance Requests**: warehouse_id, title, description, category, priority, status, assigned_to, estimated/actual cost

## API Endpoints
All endpoints are prefixed with `/api/`:
- POST /auth/register, POST /auth/login, POST /auth/logout, GET /user
- GET/POST /warehouses, GET/PATCH/DELETE /warehouses/:id (auth required)
- GET/POST /tenants, GET/PATCH/DELETE /tenants/:id (auth required)
- GET/POST /leases, GET/PATCH/DELETE /leases/:id (auth required)
- GET/POST /payments, GET/PATCH/DELETE /payments/:id (auth required)
- GET/POST /maintenance, GET/PATCH/DELETE /maintenance/:id (auth required)
- GET /admin/users, PATCH /admin/users/:id, POST /admin/users/:id/reset-password, DELETE /admin/users/:id (admin required)

## User Preferences
- None recorded yet

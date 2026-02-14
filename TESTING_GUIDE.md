# Testing Guide - Current Implementation

## What's Been Completed

✅ **Phase 1**: UI Component Library (8 components)
✅ **Phase 2**: Tenants Module (full CRUD)
✅ **Dashboard**: Displays key metrics
✅ **Warehouses**: List view (read-only)

## Starting the Application

### Option 1: Using Docker (Recommended)

```bash
cd "/Users/alvinchua/Real Estate Rental Management App"

# Start all services
docker-compose up --build

# Wait for services to start (may take 2-3 minutes first time)
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Create Admin User (First Time Only):**
```bash
# After services are running, create default admin user
docker exec -it warehouse_backend python create_admin.py
```

**Default Login Credentials:**
- Email: `admin@warehouse.com`
- Password: `admin123`
- Role: Admin (full access)

### Option 2: Manual Setup

**Terminal 1 - Backend:**
```bash
cd "/Users/alvinchua/Real Estate Rental Management App/backend"

# Create virtual environment (first time only)
python3 -m venv venv
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Create .env file (first time only)
cp .env.example .env
# Edit .env and update SECRET_KEY to a random string

# Start PostgreSQL (if not using Docker)
# brew services start postgresql  # on macOS

# Run migrations (first time only)
alembic upgrade head

# Start backend
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd "/Users/alvinchua/Real Estate Rental Management App/frontend"

# Install dependencies (first time only)
npm install

# Start frontend
npm run dev
```

## Initial Setup

### 1. Create Admin User

Since the app requires authentication, create your first admin user via API:

**Using curl:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@warehouse.com",
    "password": "admin123",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

**Using the API Docs:**
1. Go to http://localhost:8000/docs
2. Click on `POST /api/auth/register`
3. Click "Try it out"
4. Enter:
   ```json
   {
     "email": "admin@warehouse.com",
     "password": "admin123",
     "full_name": "Admin User",
     "role": "admin"
   }
   ```
5. Click "Execute"

### 2. Login

1. Go to http://localhost:5173
2. Login with:
   - **Email**: admin@warehouse.com
   - **Password**: admin123

## Testing Checklist

### ✅ Dashboard (Should Work)

1. After login, you should see the Dashboard
2. Verify 6 stat cards display:
   - Total Warehouse Units
   - Occupancy Rate
   - Total Revenue
   - Overdue Payments
   - Pending Maintenance
   - Upcoming Lease Expirations
3. All should show "0" or "0%" initially (no data yet)
4. Quick Actions section should display

**Expected Result**: ✅ Dashboard loads and displays metrics

---

### ✅ Warehouses Page (Read-Only)

1. Click "Warehouses" in navigation
2. Should show empty table with message: "No warehouse units found"
3. "Add Warehouse" button is visible but **NOT functional yet** (Phase 6)

**Expected Result**: ✅ Empty table displays correctly

**To Test with Data:**
Use the API to create a warehouse:
```bash
# Get your auth token first (save from login response)
TOKEN="your-jwt-token-here"

curl -X POST "http://localhost:8000/api/warehouses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "unit_number": "WH-001",
    "location": "Building A, Floor 1",
    "size_sqft": 5000,
    "rental_rate": 2500,
    "status": "vacant",
    "description": "Large warehouse unit with loading dock"
  }'
```

Refresh the Warehouses page - you should now see the warehouse in the table.

---

### ✅ Tenants Page (Full CRUD - Should Work Perfectly)

#### Test 1: Create Tenant

1. Click "Tenants" in navigation
2. Click "Add Tenant" button
3. Fill in the form:
   - Full Name: "John Smith" (required)
   - Business Name: "Smith Logistics"
   - Email: "john@smithlogistics.com" (required)
   - Phone: "555-0100" (required)
   - Emergency Contact Name: "Jane Smith"
   - Emergency Contact Phone: "555-0101"
   - Notes: "Preferred tenant, always pays on time"
4. Click "Create Tenant"

**Expected Result**: ✅
- Toast notification: "Tenant created successfully"
- Modal closes
- Tenant appears in the table
- Status badge shows "Active" (green)

#### Test 2: Search & Filter

1. Create 2-3 more tenants with different names
2. Use the search box to search by name
3. Try searching by email
4. Click "Active" filter - should show all tenants
5. Click "Inactive" filter - should show empty (all are active)

**Expected Result**: ✅ Search and filters work correctly

#### Test 3: View Tenant Details

1. Click on any tenant row in the table
2. Modal opens showing "Tenant Details"
3. Verify all information is displayed:
   - Contact Information
   - Emergency Contact (if provided)
   - Notes (if provided)
   - Status badge
   - Associated Leases (currently 0)
   - Created date

**Expected Result**: ✅ Detail modal displays all tenant information

#### Test 4: Edit Tenant

1. Click "Edit" button on a tenant row
2. Modal opens with form pre-filled
3. Change the phone number
4. Add or modify notes
5. Click "Update Tenant"

**Expected Result**: ✅
- Toast notification: "Tenant updated successfully"
- Changes reflected in table
- Modal closes

#### Test 5: Delete Tenant

1. Click "Delete" button on a tenant
2. Confirmation dialog appears with warning message
3. Click "Cancel" - nothing happens
4. Click "Delete" again
5. Click "Delete" in confirmation

**Expected Result**: ✅
- Toast notification: "Tenant deleted successfully"
- Tenant removed from table

#### Test 6: Validation

1. Click "Add Tenant"
2. Try to submit empty form
3. Should see error messages:
   - "Full name is required"
   - "Email is required"
   - "Phone number is required"
4. Enter invalid email (no @ symbol)
5. Should see "Email is invalid"
6. Enter valid data and submit

**Expected Result**: ✅ Form validation prevents invalid submissions

---

### ❌ Leases Page (Placeholder - Not Ready Yet)

1. Click "Leases" in navigation
2. Should show "Coming soon" message

**Expected Result**: ⏳ Placeholder page (will be completed next)

---

### ❌ Payments Page (Placeholder - Not Ready Yet)

1. Click "Payments" in navigation
2. Should show "Coming soon" message

**Expected Result**: ⏳ Placeholder page

---

### ❌ Maintenance Page (Placeholder - Not Ready Yet)

1. Click "Maintenance" in navigation
2. Should show "Coming soon" message

**Expected Result**: ⏳ Placeholder page

---

## Common Issues & Solutions

### Issue: "Failed to load tenants" error

**Solution**: Backend is not running or database connection failed
```bash
# Check backend logs
docker-compose logs backend

# Or if running manually, check terminal output
```

### Issue: "Could not validate credentials" after login

**Solution**: Token expired (expires after 30 minutes)
- Logout and login again
- Token auto-refreshes on API calls

### Issue: Frontend won't start - "Cannot find module"

**Solution**: Dependencies not installed
```bash
cd frontend
npm install
```

### Issue: Backend error "relation does not exist"

**Solution**: Database migrations not run
```bash
cd backend
alembic upgrade head
```

### Issue: Port 5173 or 8000 already in use

**Solution**: Kill existing process
```bash
# Find process using port
lsof -ti:5173
lsof -ti:8000

# Kill process
kill -9 <PID>
```

### Issue: Docker containers won't start

**Solution**: Clean up and rebuild
```bash
docker-compose down -v
docker-compose up --build
```

## Browser Console

Open Browser DevTools (F12) and check:

**Console Tab:**
- Should have no errors
- May see React DevTools messages (normal)

**Network Tab:**
- Login request should return 200 with token
- API calls should return 200/201 for success
- 401 means authentication failed

## Next Steps After Testing

Once you've verified the Tenants page works correctly:

1. **Report any bugs or issues you find**
2. **I'll continue building:**
   - LeaseDetail component
   - Leases main page
   - Then Payments, Maintenance, etc.

## Quick Test Script

Run this to quickly populate test data:

```bash
#!/bin/bash
# Save as test_data.sh and run: bash test_data.sh

TOKEN="your-token-here"  # Get from login response
API="http://localhost:8000/api"

# Create warehouses
for i in {1..5}; do
  curl -X POST "$API/warehouses" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"unit_number\": \"WH-00$i\",
      \"location\": \"Building A, Floor $i\",
      \"size_sqft\": $((5000 + i * 1000)),
      \"rental_rate\": $((2000 + i * 500)),
      \"status\": \"vacant\"
    }"
done

echo "Created 5 warehouses!"
```

## Success Criteria

After testing, you should have:

✅ Successfully logged in
✅ Dashboard showing 6 metric cards
✅ Warehouses page displaying (empty or with data)
✅ Tenants page fully functional:
  - ✅ Create tenant
  - ✅ Search tenants
  - ✅ View tenant details
  - ✅ Edit tenant
  - ✅ Delete tenant
  - ✅ Toast notifications working
✅ No console errors
✅ Smooth navigation between pages

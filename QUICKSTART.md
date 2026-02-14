# Quick Start Guide

## Get Started in 5 Minutes

### 1. Start the Application

Open a terminal in the project directory and run:

```bash
docker-compose up --build
```

Wait for all services to start (this may take a few minutes the first time).

### 2. Create Your First Admin User

Once the services are running, open a new terminal and create an admin user:

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

### 3. Access the Application

Open your browser and go to: **http://localhost:5173**

Login with:
- **Email**: admin@warehouse.com
- **Password**: admin123

### 4. Explore the Features

You now have access to:
- **Dashboard**: View key metrics and analytics
- **Warehouses**: Manage warehouse units
- **Tenants**: Manage tenant information
- **Leases**: Create and track lease agreements
- **Payments**: Record and track rent payments
- **Maintenance**: Submit and track maintenance requests

## Next Steps

1. **Add Warehouse Units**: Click on "Warehouses" and add your first warehouse unit
2. **Add Tenants**: Click on "Tenants" to register tenants
3. **Create Leases**: Link tenants to warehouse units with lease agreements
4. **Track Payments**: Record rent payments and monitor overdue amounts

## Useful Commands

### Stop the Application
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Access API Documentation
Open: http://localhost:8000/docs

### Reset Database
```bash
docker-compose down -v
docker-compose up --build
```

## Troubleshooting

**Can't connect to the application?**
- Make sure Docker is running
- Check if ports 5173, 8000, and 5432 are available
- Wait a few seconds for all services to fully start

**Login not working?**
- Make sure you created the admin user first
- Check that you're using the correct email and password
- Look at the backend logs: `docker-compose logs backend`

## Need Help?

- API Documentation: http://localhost:8000/docs
- Check the full README.md for detailed information
- View logs: `docker-compose logs -f`

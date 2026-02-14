# Warehouse Rental Management Application

A full-stack web application for managing warehouse units, tenants, lease agreements, rent payments, and maintenance requests.

## Features

- **Warehouse Management**: Create, view, update, and delete warehouse units
- **Tenant Management**: Manage tenant information and contacts
- **Lease Management**: Track lease agreements, renewal dates, and terms
- **Payment Tracking**: Record payments, track overdue amounts, and generate receipts
- **Maintenance Requests**: Submit and track maintenance issues with priority levels
- **Dashboard Analytics**: View key metrics, occupancy rates, and financial reports
- **Authentication**: Secure JWT-based authentication with role-based access control

## Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Relational database
- **SQLAlchemy**: ORM for database operations
- **Alembic**: Database migrations
- **Pydantic**: Data validation
- **JWT**: Token-based authentication

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client

### DevOps
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration

## Prerequisites

- Docker and Docker Compose installed
- OR
- Python 3.10+
- Node.js 18+
- PostgreSQL 13+

## Quick Start with Docker

1. **Clone the repository** (or navigate to the project directory)

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

4. **Create your first admin user:**
   - Go to http://localhost:5173
   - You'll need to register a user via API first (see below)

## Manual Setup (Without Docker)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secret key
   ```

5. **Create database:**
   ```bash
   createdb warehouse_db
   ```

6. **Run migrations:**
   ```bash
   alembic upgrade head
   ```

7. **Start the backend server:**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Creating Your First Admin User

Since the application requires authentication, you need to create your first user. You can do this via the API:

**Using curl:**
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

**Or use the API documentation:**
1. Go to http://localhost:8000/docs
2. Expand POST `/api/auth/register`
3. Click "Try it out"
4. Fill in the user details
5. Execute the request

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get access token

### Warehouses
- `GET /api/warehouses` - List all warehouse units
- `POST /api/warehouses` - Create new warehouse
- `GET /api/warehouses/{id}` - Get warehouse details
- `PUT /api/warehouses/{id}` - Update warehouse
- `DELETE /api/warehouses/{id}` - Delete warehouse

### Tenants
- `GET /api/tenants` - List all tenants
- `POST /api/tenants` - Create new tenant
- `GET /api/tenants/{id}` - Get tenant details
- `PUT /api/tenants/{id}` - Update tenant
- `DELETE /api/tenants/{id}` - Delete tenant

### Leases
- `GET /api/leases` - List all leases
- `POST /api/leases` - Create new lease
- `GET /api/leases/{id}` - Get lease details
- `PUT /api/leases/{id}` - Update lease
- `DELETE /api/leases/{id}` - Delete lease

### Payments
- `GET /api/payments` - List all payments
- `GET /api/payments/overdue` - List overdue payments
- `POST /api/payments` - Create payment record
- `GET /api/payments/{id}` - Get payment details
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment

### Maintenance
- `GET /api/maintenance` - List maintenance requests
- `POST /api/maintenance` - Create maintenance request
- `GET /api/maintenance/{id}` - Get request details
- `PUT /api/maintenance/{id}` - Update request
- `DELETE /api/maintenance/{id}` - Delete request

## Database Migrations

### Create a new migration:
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

### Apply migrations:
```bash
alembic upgrade head
```

### Rollback migration:
```bash
alembic downgrade -1
```

## Project Structure

```
Real Estate Rental Management App/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── main.py          # FastAPI app
│   │   ├── database.py      # Database setup
│   │   └── config.py        # Configuration
│   ├── alembic/             # Database migrations
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## User Roles

- **Admin**: Full access to all features
- **Property Manager**: Can manage warehouses, tenants, leases, payments, and maintenance
- **Viewer**: Read-only access to view data

## Development Tips

### Backend Development
- API documentation is auto-generated at `/docs`
- Use `--reload` flag with uvicorn for auto-reload on code changes
- SQLAlchemy queries can be debugged by setting `echo=True` in database.py

### Frontend Development
- Vite provides fast hot module replacement (HMR)
- TypeScript provides type safety - fix any type errors before building
- TailwindCSS classes are auto-completed in most modern editors

## Testing

The application can be tested end-to-end using the following workflow:

1. Start the application
2. Register an admin user
3. Login with the admin credentials
4. Create warehouse units
5. Add tenants
6. Create lease agreements
7. Record payments
8. Submit maintenance requests
9. View dashboard analytics

## Production Deployment

Before deploying to production:

1. Change the `SECRET_KEY` in `.env` to a strong random value (minimum 32 characters)
2. Set `DEBUG=False` in backend configuration
3. Configure proper CORS origins in `backend/app/main.py`
4. Use a production-grade ASGI server (already using uvicorn)
5. Set up SSL/TLS certificates
6. Configure database backups
7. Set up monitoring and logging

## Troubleshooting

### Database connection errors
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -l`

### Port already in use
- Check if another service is using ports 5173, 8000, or 5432
- Stop conflicting services or change ports in docker-compose.yml

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check CORS configuration in backend/app/main.py
- Verify API_BASE_URL in frontend/src/services/api.ts

## License

This project is for educational and business use.

## Support

For issues and questions, please create an issue in the repository.

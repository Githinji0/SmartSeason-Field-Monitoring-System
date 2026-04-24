# SmartSeason Field Monitoring System

A full-stack field monitoring platform for managing agricultural devices, sensors, and farm data. Built with Node.js , React.js, and MySQL.

## Table of Contents

- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Demo Credentials](#demo-credentials)
- [API Documentation](#api-documentation)
- [Role-Based Access Control](#role-based-access-control)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Deployment](#deployment)

## Project Structure

```
├── backend/                    - Express.js API server
│   ├── src/
│   │   ├── config/            - Database and environment config
│   │   ├── controllers/       - Route handlers
│   │   ├── middleware/        - Auth and RBAC middleware
│   │   ├── routes/            - API route definitions
│   │   ├── services/          - Database query abstractions
│   │   ├── app.js             - Express app setup
│   │   └── server.js          - Server entry point
│   ├── .env.example           - Environment template
│   ├── .env.production.example - Production environment template
│   ├── .vercelignore          - Files to ignore in deployment
│   └── package.json
├── frontend/                  - React (Vite) dashboard
│   ├── src/
│   │   ├── api/              - API client helpers
│   │   ├── auth/             - Authentication context
│   │   ├── components/       - Reusable components
│   │   ├── pages/            - Page components
│   │   ├── App.jsx           - Main app component
│   │   └── main.jsx          - Entry point
│   ├── .env.example          - Environment template
│   ├── .env.production.example - Production environment template
│   ├── .vercelignore         - Files to ignore in deployment
│   ├── vite.config.js        - Vite build configuration
│   └── package.json
├── database/
│   ├── schema.sql            - MySQL table definitions
│   └── seed.sql              - Demo data
├── .github/
│   └── workflows/            - GitHub Actions CI/CD
│       ├── frontend.yml      - Frontend build/test automation
│       ├── backend.yml       - Backend build/test automation
│       └── pr-checks.yml     - Pull request validation
├── .gitignore                - Git ignore rules
├── vercel.json               - Root monorepo Vercel services config
├── README.md                 - This file
├── DEPLOYMENT.md             - Deployment guide
├── DEPLOYMENT_CHECKLIST.md   - Pre-deployment checklist
├── docker-compose.yml        - Optional Docker setup
└── LICENSE
```

## Setup Instructions

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **MySQL 8+** - [Download](https://www.mysql.com/downloads/mysql/)
- **npm** - Comes with Node.js

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in a new terminal)
cd frontend
npm install
```

### 2. Database Setup

#### Option A: Local MySQL

```bash
# Connect to MySQL and run the schema
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

#### Option B: Docker Compose

```bash
docker compose up -d
```

### 3. Environment Configuration

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smartseason
```

#### Frontend (.env)

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Running the Application

### Terminal 1: Backend

```bash
cd backend
npm run dev
```

Output: `API running on http://localhost:4000`

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
```

Output: `VITE v5.x ready in xxx ms → Local: http://localhost:5173/`

### Access the Application

- **Dashboard**: [http://localhost:5173](http://localhost:5173)
- **API Health**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

## Demo Credentials

Three pre-configured test accounts are available for demonstration. These are already seeded in the database.

### Admin Account

- **Email**: `admin@test.com`
- **Password**: `admin123456`
- **Role**: Admin
- **Permissions**:
  - View all users in the system
  - Assign farms to users
  - View all devices from all farms
  - Create devices on any farm

### Agronomist Account

- **Email**: `agronomist@test.com`
- **Password**: `agro123456`
- **Role**: Agronomist
- **Assigned Farm**: Farm 1 (North Farm)
- **Permissions**:
  - Create devices on assigned farm
  - View devices from assigned farm
  - Cannot manage users

### Farmer Account

- **Email**: `farmer@test.com`
- **Password**: `farmer123456`
- **Role**: Farmer
- **Assigned Farm**: Farm 1 (North Farm)
- **Permissions**:
  - View devices from assigned farm only (cannot see other farms' devices)
  - Cannot create devices
  - Cannot manage users

### How to Test Roles

1. Log in to [http://localhost:5173/login](http://localhost:5173/login) with any of the above credentials
2. The dashboard will display devices based on your role and farm assignment
3. Role-based restrictions are enforced on both backend and frontend

## API Documentation

### Authentication Endpoints

#### Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "password123456"
}
```

**Response** (201 Created):

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "John Farmer",
      "email": "john@example.com",
      "role": "farmer",
      "farmId": null,
      "createdAt": "2026-04-24T08:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note**: New registrations always create `farmer` role accounts. Admins can assign farms using the admin endpoint.

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123456"
}
```

**Response** (200 OK):

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "John Farmer",
      "email": "john@example.com",
      "role": "farmer",
      "farmId": 1,
      "createdAt": "2026-04-24T08:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User

```bash
GET /api/auth/me
Authorization: Bearer <token>
```

**Response** (200 OK):

```json
{
  "data": {
    "id": 1,
    "name": "John Farmer",
    "email": "john@example.com",
    "role": "farmer",
    "farmId": 1,
    "createdAt": "2026-04-24T08:00:00.000Z"
  }
}
```

#### List All Users (Admin Only)

```bash
GET /api/auth/users
Authorization: Bearer <admin-token>
```

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@test.com",
      "role": "admin",
      "farmId": null,
      "createdAt": "2026-04-24T08:00:00.000Z"
    }
  ]
}
```

### Device Endpoints

#### Get Devices

```bash
GET /api/devices
Authorization: Bearer <token>
```

**Behavior**:

- **Admin/Agronomist**: Returns all devices or devices from their assigned farm
- **Farmer**: Returns only devices from their assigned farm

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": 1,
      "name": "Soil Sensor A1",
      "serialNumber": "SENS-001",
      "farmId": 1,
      "createdAt": "2026-04-24T08:00:00.000Z"
    }
  ]
}
```

#### Create Device

```bash
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Temperature Sensor",
  "serialNumber": "TEMP-001",
  "farmId": 1
}
```

**Allowed Roles**: Agronomist, Admin

**Response** (201 Created):

```json
{
  "data": {
    "id": 2,
    "name": "Temperature Sensor",
    "serialNumber": "TEMP-001",
    "farmId": 1,
    "createdAt": "2026-04-24T08:00:00.000Z"
  }
}
```

### Admin Endpoints

#### Assign Farm to User

```bash
PATCH /api/admin/users/:userId/farm
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "farmId": 1
}
```

**Response** (200 OK):

```json
{
  "data": {
    "id": 3,
    "name": "Farmer User",
    "email": "farmer@example.com",
    "role": "farmer",
    "farmId": 1,
    "createdAt": "2026-04-24T08:00:00.000Z"
  }
}
```

### Health Check

```bash
GET /api/health
```

**Response** (200 OK):

```json
{
  "status": "ok",
  "service": "smartseason-api"
}
```

## Role-Based Access Control

The system implements fine-grained role-based access control (RBAC):

| Operation | Farmer | Agronomist | Admin |
|-----------|--------|------------|-------|
| View own farm's devices | ✓ | ✓ | ✓ |
| View all devices | ✗ | ✓ | ✓ |
| Create device | ✗ | ✓ | ✓ |
| Assign farm to user | ✗ | ✗ | ✓ |
| List all users | ✗ | ✗ | ✓ |
| Register as role | Farmer only | N/A | N/A |

### Enforcement Points

1. **Route-Level Middleware** (`backend/src/middleware/auth.js`):
   - `authenticateToken`: Verifies JWT and extracts user identity
   - `authorizeRoles(...roles)`: Checks if user role is in allowed list

2. **Service-Layer Filtering** (`backend/src/services/device.service.js`):
   - Farmers' device queries filtered by `farm_id` matching their `farmId`

3. **Frontend Guards** (`frontend/src/components/ProtectedRoute.jsx`):
   - Routes redirect unauthenticated users to login
   - UI components conditionally render based on user role

## Design Decisions

### 1. JWT-Based Authentication

**Decision**: Use JSON Web Tokens (JWT) for stateless authentication.

**Rationale**:
- Enables horizontal scaling without session state
- Token includes role and farm assignment for fast authorization decisions
- Reduces server-side storage requirements
- Industry standard for API authentication

**Implementation**:
- Tokens expire after 1 day (configurable via `JWT_EXPIRES_IN`)
- Signed with `HS256` algorithm
- Payload includes `sub` (user ID), `email`, `role`, and `farmId`

### 2. Farm-Based Data Scoping

**Decision**: Attach `farm_id` to users and filter queries accordingly.

**Rationale**:
- Ensures farmers only see/manage their own farm's data
- Supports multi-tenancy within the same system
- Agronomists and admins can see cross-farm data for coordination
- Data isolation is enforced at the query level, not just UI

**Implementation**:
- `users.farm_id` foreign key to `farms` table
- `listDevicesForFarm(farmId)` service function filters by farm
- Device controller checks user role and applies filtering

### 3. Public Registration Restricted to Farmer Role

**Decision**: All self-registrations default to `farmer` role.

**Rationale**:
- Prevents privilege escalation (users self-registering as admin)
- Agronomist and admin accounts created only by admins
- Maintains role integrity and system security

**Implementation**:
- `/api/auth/register` hardcodes `role: "farmer"`
- Admin must use `PATCH /api/admin/users/:userId/farm` or direct database updates to change roles

### 4. Role-Based Device Creation

**Decision**: Only agronomists and admins can create devices.

**Rationale**:
- Farmers focus on monitoring, not device configuration
- Agronomists handle technical device setup
- Prevents accidental device proliferation

**Implementation**:
- Device router guards `POST` with `authorizeRoles("agronomist", "admin")`

### 5. Automatic Schema Migration on Startup

**Decision**: Backend auto-creates missing columns and constraints at startup.

**Rationale**:
- Gracefully handles schema evolution
- Prevents startup failures from schema mismatches
- Useful for multi-environment deployments

**Implementation**:
- `ensureUserFarmAssignmentColumn()` in `backend/src/config/db.js`
- Checks for column existence before creating

## Assumptions

### 1. Single Farm per User

**Assumption**: Each farmer/agronomist is assigned to exactly one farm.

**Impact**:
- Farmers cannot see cross-farm data
- Farm assignment is mutually exclusive per user
- Agronomists work on one farm's devices

**Future Enhancement**: Support multiple farm assignments via junction table.

### 2. Device Ownership by Farm

**Assumption**: Devices belong to a farm; farmers see devices owned by their farm.

**Impact**:
- No device-level permissions beyond farm-level scoping
- Farm admins cannot delegate device access to specific farmers

**Future Enhancement**: Device-specific permission rules.

### 3. Agronomist Role is Self-Managed

**Assumption**: Agronomists cannot create other agronomists; only admins manage role escalation.

**Impact**:
- Agronomists are created exclusively by admins
- Prevents privilege escalation through self-registration

**Verified Through**: Registration endpoint hardcodes farmer role.

### 4. Admin Users Have No Farm Assignment

**Assumption**: Admins operate globally and are not scoped to a farm.

**Impact**:
- Admins see all devices across all farms
- Admin farm_id is always `NULL`
- Enables system-wide oversight

**Implementation**: Device filtering skips farm checks for admin role.

### 5. JWT Tokens are Short-Lived

**Assumption**: Tokens expire after 1 day and require re-login.

**Impact**:
- Compromised tokens have limited window of exploitation
- Users must authenticate daily
- No persistent "remember me" token strategy

**Configurable**: `JWT_EXPIRES_IN` in `.env` can be adjusted.

### 6. Database Connectivity

**Assumption**: MySQL is available and reachable via configured host/port/credentials.

**Impact**:
- Backend fails to start if database is down
- Connection pool manages up to 10 concurrent connections
- No automatic retry or fallback mechanism

**Production Recommendation**: Implement connection retry logic and health monitoring.

## Development Workflow

### Adding a New Endpoint

1. **Create controller** in `backend/src/controllers/`
2. **Define route** in `backend/src/routes/`
3. **Add auth guards** using `authorizeRoles()` if restricted
4. **Add service function** for database queries
5. **Test via curl/Postman** with appropriate token

### Running Tests

```bash
# Currently no test suite configured
# TODO: Add Jest/Vitest for unit and integration tests
```

### Common Issues

**Q: "Unknown column 'farm_id' in 'field list'"**

A: Run the schema migration on startup. Backend auto-detects and fixes this.

**Q: "Invalid or expired token"**

A: Token may have expired (1 day default). Re-login to get a fresh token.

**Q: "Insufficient permissions"**

A: Your role doesn't have permission for this operation. Check RBAC table above.

## Deployment

This application is ready for production deployment. See the dedicated guides:

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment instructions for Vercel (frontend) and Railway/Render (backend)
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment checklist

### Quick Start: Deploy to Vercel + Railway

1. **Frontend to Vercel** (Free)
   ```bash
   npm install -g vercel
   cd frontend
   vercel --prod
   ```

2. **Backend to Railway** (~$5/month, includes MySQL)
   - Go to [railway.app](https://railway.app)
   - Import GitHub repository
   - Deploy `backend` folder
   - Add MySQL database
   - Configure environment variables

3. **Update Frontend Endpoint**
   - Set `VITE_API_BASE_URL` to your Railway backend URL
   - Redeploy frontend

### Architecture

```
Frontend (Vercel)  ──HTTPS──>  Backend (Railway)  ──>  MySQL (Railway)
https://app.vercel.app          https://api.railway.app     Included
```

### CI/CD

Automated workflows via GitHub Actions:

- ✓ Frontend build check on every push
- ✓ Backend health check on every push
- ✓ PR validation before merge
- ✓ Security checks (no committed .env files)

### Production Checklist

Before deploying:

- [ ] All 3 demo users created and tested
- [ ] JWT_SECRET changed (min 32 random chars)
- [ ] Database credentials set to secure values
- [ ] HTTPS enabled on all connections
- [ ] CORS restricted to production domain
- [ ] Environment variables in deployment platform (not in repo)
- [ ] Backups configured

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for complete list.

## Next Steps / TODO

- [ ] Add test suite (Jest)
- [ ] Implement device readings and time-series data
- [ ] Add alert management (thresholds, notifications)
- [ ] Build device telemetry dashboard
- [ ] Implement user profile management
- [ ] Add password reset flow
- [ ] Deploy to cloud (AWS, Azure, GCP)
- [ ] Add API rate limiting and throttling
- [ ] Implement role hierarchies (e.g., farm manager > agronomist)
- [ ] Multi-farm support for agronomists

## License

MIT

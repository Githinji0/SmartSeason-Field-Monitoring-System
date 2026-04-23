# SmartSeason Field Monitoring System

Starter scaffold for a field monitoring platform using Node.js (Express), React.js, and MySQL.

## Project Structure

- `backend/` - Express API and MySQL integration
- `frontend/` - React (Vite) dashboard
- `database/` - SQL schema and seed scripts
- `docs/` - project documentation

## Prerequisites

- Node.js 20+
- MySQL 8+ (or Docker)

## 1. Start MySQL

### Option A: Docker

```bash
docker compose up -d
```

### Option B: Local MySQL

Create DB and run SQL files:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

## 2. Run Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend default URL: `http://localhost:4000`

## 3. Run Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend default URL: `http://localhost:5173`

## API Quick Check

- Health: `GET /api/health`
- Devices: `GET /api/devices`
- Create device: `POST /api/devices`

Example payload:

```json
{
  "name": "Rain Gauge B2",
  "serialNumber": "RGB2-102",
  "farmId": 1
}
```

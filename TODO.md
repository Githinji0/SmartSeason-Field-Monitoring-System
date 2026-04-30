# SmartSeason Field Monitoring System - Project TODO

## Chosen Stack
- [x] Backend: Node.js (Express.js)
- [x] Frontend: React.js
- [x] Database: MySQL

## 1. Project Setup
- [ ] Define project scope and success criteria
- [ ] Finalize core features for MVP
- [x] Choose tech stack (Node.js + React.js + MySQL)
- [x] Set up repository structure (`frontend/`, `backend/`, `docs/`, `infra/`)
- [x] Add `.gitignore`, license, and base `README.md`

## 2. Product Requirements
- [ ] Define user roles (farmer, agronomist, admin)
- [ ] Document functional requirements
- [ ] Document non-functional requirements (security, reliability, scalability)
- [ ] Create user stories and acceptance criteria
- [ ] Prioritize features into MVP and post-MVP

## 3. Data & Device Integration
- [ ] Identify sensor types (soil moisture, temperature, humidity, rainfall, pH)
- [ ] Define sensor payload format
- [ ] Design ingestion strategy (MQTT/HTTP)
- [ ] Implement data validation and normalization rules
- [ ] Set up device registration and authentication flow

## 4. Backend Development
- [x] Initialize Node.js backend (Express.js) and environment config
- [x] Configure MySQL connection and migration workflow
- [x] Design MySQL schema (farms, plots, devices, readings, alerts, users)
- [x] Implement authentication and authorization
- [ ] Build APIs for:
  - [ ] Farm and plot management
  - [ ] Device onboarding and status
  - [x] Sensor data ingestion
  - [x] Historical data query
  - [ ] Alert management
- [ ] Add background jobs for aggregation and alert evaluation
- [ ] Add logging, error handling, and API versioning

## 5. Frontend Development
- [x] Initialize React.js app and routing
- [x] Build auth screens (login/register/reset)
- [ ] Build dashboard with key metrics
- [ ] Build real-time sensor monitoring view
- [ ] Build historical trends charts
- [ ] Build alert configuration and notification views
- [ ] Build farm/plot/device management pages
- [ ] Add responsive design for desktop and mobile

## 6. Alerting & Notifications
- [ ] Define threshold-based alert rules
- [ ] Implement anomaly detection strategy (basic baseline)
- [ ] Integrate email/SMS/push notifications
- [ ] Add alert acknowledgement and resolution flow
- [ ] Add notification preferences per user

## 7. Security & Compliance
- [ ] Store secrets securely (no hardcoded keys)
- [ ] Enforce HTTPS and secure headers
- [ ] Implement input validation and rate limiting
- [ ] Add audit logs for critical actions
- [ ] Define data retention and privacy policy

## 8. Testing & QA
- [ ] Add unit tests for core business logic
- [ ] Add integration tests for APIs and database
- [ ] Add end-to-end tests for critical user flows
- [ ] Add device simulation tests for ingestion pipeline
- [ ] Set up CI to run linting and tests on every PR

## 9. Deployment & Operations
- [ ] Prepare Docker setup for local and production
- [ ] Set up staging and production environments
- [ ] Configure monitoring and observability (metrics, logs, tracing)
- [ ] Set up backup and disaster recovery plan
- [ ] Create rollout and rollback procedures

## 10. Documentation & Handover
- [ ] Write architecture overview
- [ ] Document API endpoints and examples
- [ ] Document device onboarding process
- [ ] Write runbooks for incidents and maintenance
- [ ] Prepare user guide and admin guide

## 11. Immediate Next Actions (Week 1)
- [ ] Finalize MVP scope
- [x] Decide final stack and architecture
- [x] Scaffold Node.js backend (Express)
- [x] Scaffold React.js frontend
- [x] Provision local MySQL database and schema
- [x] Implement first API: device registration
- [x] Implement first dashboard page with mock data

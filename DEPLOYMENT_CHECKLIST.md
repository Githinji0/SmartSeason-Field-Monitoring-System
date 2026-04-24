# Production Deployment Checklist

Complete this checklist before deploying to production.

## Security

- [ ] JWT_SECRET is NOT the default value
- [ ] JWT_SECRET is at least 32 random characters
- [ ] All `.env` files are in `.gitignore` and never committed
- [ ] Database credentials use strong passwords (min 16 chars)
- [ ] HTTPS is enabled on all connections
- [ ] CORS is restricted to specific frontend domain (not `*`)
- [ ] No debug logging in production environment
- [ ] Error messages don't leak sensitive information
- [ ] SQL injection prevention verified (using parameterized queries)
- [ ] Authentication tokens are properly signed and validated
- [ ] API keys/secrets are not hardcoded

## Configuration

- [ ] Backend `NODE_ENV=production`
- [ ] Frontend API endpoint updated to production backend URL
- [ ] Database connection string verified
- [ ] All required environment variables are set
- [ ] Rate limiting is configured (optional but recommended)
- [ ] CORS_ORIGIN matches frontend domain exactly
- [ ] Port numbers don't conflict with other services

## Database

- [ ] Database schema created (schema.sql)
- [ ] Initial seed data loaded (seed.sql)
- [ ] Demo users created (admin, agronomist, farmer)
- [ ] Database backups are configured
- [ ] Replication/High availability configured if needed
- [ ] Database user has appropriate permissions (not root)

## Frontend

- [ ] Build output verified (`npm run build`)
- [ ] Source maps disabled in production
- [ ] All environment variables are injected at build time
- [ ] API client uses production backend URL
- [ ] No console.log or debug code in production
- [ ] Error boundaries implemented
- [ ] Loading states handled properly

## Backend

- [ ] Build/bundle verified (`npm install` and `npm start`)
- [ ] All dependencies are production-safe (no dev-only in prod)
- [ ] Health check endpoint working (`/api/health`)
- [ ] All auth endpoints tested
- [ ] All API endpoints return proper status codes
- [ ] Error handling is comprehensive
- [ ] Database connections are pooled and managed

## Testing

- [ ] Health check passes in production environment
- [ ] Admin login works: `admin@test.com` / `admin123456`
- [ ] Agronomist login works: `agronomist@test.com` / `agro123456`
- [ ] Farmer login works: `farmer@test.com` / `farmer123456`
- [ ] Role-based permissions enforced
- [ ] Farm data isolation verified (farmers see only their farm)
- [ ] Device creation restricted to agronomists/admins
- [ ] All CRUD operations tested with appropriate roles

## Infrastructure

- [ ] Server/container is sized appropriately for expected load
- [ ] Database has adequate resources for expected data volume
- [ ] Network connectivity is verified between all components
- [ ] Firewalls allow appropriate ports (80, 443, 3306 for internal only)
- [ ] DNS is configured and pointing to correct IP/hostname
- [ ] Load balancer configured if using multiple instances

## Monitoring

- [ ] Error tracking is configured (e.g., Sentry)
- [ ] Uptime monitoring is active
- [ ] Logs are aggregated and searchable
- [ ] Alerts are configured for critical errors
- [ ] Performance metrics are being collected
- [ ] Database query performance is monitored

## Deployment

- [ ] Deployment process is documented
- [ ] Rollback procedure is tested and documented
- [ ] Backup/restore procedure is tested and documented
- [ ] Team has access to deployment systems
- [ ] Change log is maintained
- [ ] Deployment approval process is defined

## Post-Deployment

- [ ] Monitor logs for errors
- [ ] Verify all features are working
- [ ] Run smoke tests
- [ ] Check performance metrics
- [ ] Confirm users can access the application
- [ ] Get stakeholder approval

## Sign-Off

- [ ] Backend deployed and tested by: _________________ Date: _____
- [ ] Frontend deployed and tested by: ________________ Date: _____
- [ ] Database verified by: __________________________ Date: _____
- [ ] Security review completed by: _________________ Date: _____
- [ ] Ready for production by: ______________________ Date: _____

## Rollback Plan

In case of critical issues:

1. Identify the issue in logs
2. Contact on-call engineer
3. If needed, rollback to previous deployment:
   - **Frontend**: Revert to previous Vercel deployment
   - **Backend**: Redeploy previous commit to Railway/Render
4. Investigate root cause
5. Deploy fix with thorough testing

## Post-Incident

- [ ] Root cause analysis completed
- [ ] Fix deployed
- [ ] Monitoring alerts reviewed
- [ ] Team debriefing conducted
- [ ] Documentation updated

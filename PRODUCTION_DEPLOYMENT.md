# Casino Royal - Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.production` to `.env` and update with production values
- [ ] Ensure Supabase production database is configured
- [ ] Update CORS settings in Supabase for production domain
- [ ] Set up SSL certificate for HTTPS

### 2. Security Verification
- [ ] Run `npm run security:audit` and fix any critical issues
- [ ] Verify no hardcoded credentials in code
- [ ] Confirm all environment variables are properly set
- [ ] Test authentication and authorization flows

### 3. Build Process
```bash
# Run production build
build-production.bat

# Or manually:
npm run build:prod
cd owner && npm run build && cd ..
```

### 4. Server Configuration
- [ ] Configure reverse proxy (nginx/Apache) if needed
- [ ] Set up process manager (PM2) for Node.js
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

### 5. Database Migration
```bash
# Run Supabase migrations
supabase db push --db-url your_production_db_url
```

### 6. Performance Optimization
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up caching headers
- [ ] Monitor performance metrics

## Deployment Commands

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name "casino-royal"
pm2 startup
pm2 save
```

### Direct Node.js
```bash
NODE_ENV=production npm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t casino-royal .

# Run container
docker run -d -p 3000:3000 --env-file .env casino-royal
```

## Post-Deployment Verification

### 1. Functional Testing
- [ ] User registration and login
- [ ] Wallet operations (deposit/withdraw)
- [ ] Admin dashboard access
- [ ] All game functionality

### 2. Security Testing
- [ ] SSL certificate validation
- [ ] Security headers verification
- [ ] Authentication bypass attempts
- [ ] Input validation testing

### 3. Performance Testing
- [ ] Load testing with multiple users
- [ ] Database query performance
- [ ] Static asset loading times
- [ ] Mobile responsiveness

## Monitoring Setup

### 1. Application Monitoring
- Set up error tracking (Sentry)
- Configure performance monitoring
- Set up uptime monitoring

### 2. Security Monitoring
- Enable audit logging
- Set up intrusion detection
- Monitor failed login attempts

### 3. Database Monitoring
- Monitor query performance
- Set up backup schedules
- Configure connection pooling

## Rollback Procedure

### 1. Quick Rollback
```bash
# Stop current version
pm2 stop casino-royal

# Deploy previous version
git checkout previous-stable-tag
npm run build:prod
pm2 restart casino-royal
```

### 2. Database Rollback
```bash
# Restore from backup if needed
supabase db reset --db-url your_production_db_url
```

## Maintenance

### 1. Regular Updates
- Weekly security updates
- Monthly dependency updates
- Quarterly feature releases

### 2. Backup Strategy
- Daily database backups
- Weekly full system backups
- Monthly backup restoration tests

### 3. Security Reviews
- Monthly security audits
- Quarterly penetration testing
- Annual security certification

## Support Contacts

- **Technical Issues**: tech-support@casinoroyal.com
- **Security Issues**: security@casinoroyal.com
- **Emergency**: +1-555-EMERGENCY

---

**Last Updated**: $(date)
**Version**: 1.0.0
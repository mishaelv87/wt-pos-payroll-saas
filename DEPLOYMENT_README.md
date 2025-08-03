# 🚀 Wisetracks POS & Payroll SaaS - Complete Deployment Guide

## Overview

This repository contains a complete, production-ready deployment pipeline for the Wisetracks POS & Payroll SaaS application, designed specifically for Philippine businesses. The system includes comprehensive environment management, database setup, secrets management, and automated deployment.

## ✨ Features

### 🏢 **Business Features**
- **Point of Sale (POS)** - Complete cashier interface with receipt printing
- **Payroll Management** - Philippine compliance (SSS, PhilHealth, Pag-IBIG, BIR)
- **Inventory Management** - Stock tracking with barcode support
- **Employee Time Tracking** - Clock in/out with location tracking
- **Sales Analytics** - Real-time reporting and insights
- **Multi-branch Support** - Centralized management across locations

### 🛠️ **Technical Features**
- **Cloudflare Workers + Pages** - Serverless backend and frontend
- **D1 Database** - SQLite-based database with 15+ optimized tables
- **Complete Environment Management** - Development, staging, production
- **Philippine Compliance** - Tax calculations, government integrations
- **Security** - JWT authentication, input validation, audit trails
- **Automated Deployment** - One-command deployment pipeline

## 🏁 Quick Start

### Prerequisites
- Node.js 18+
- Cloudflare account
- Terminal/Command prompt

### 1. Clone and Setup
```bash
git clone https://github.com/mishaelv87/wt-pos-payroll-saas.git
cd wt-pos-payroll-saas
npm install
```

### 2. Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 3. Generate Secrets
```bash
npm run generate-jwt
```

### 4. Complete Setup
```bash
npm run setup:all
```

### 5. Deploy to Production
```bash
npm run deploy:production
```

## 📋 Detailed Setup Instructions

### Step 1: Environment Configuration

The application includes comprehensive environment configuration with 250+ variables:

```bash
# Copy environment template
cp .env.example .env.local

# Configure for your environment
nano .env.local
```

**Key Variables to Configure:**
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_API_TOKEN` - API token with appropriate permissions
- `BIR_TIN` - Your business Tax Identification Number
- `SSS_EMPLOYER_ID` - SSS employer registration
- `PHILHEALTH_EMPLOYER_ID` - PhilHealth employer ID
- `PAGIBIG_EMPLOYER_ID` - Pag-IBIG employer ID

### Step 2: Secrets Management

Set up all required secrets securely:

```bash
# Interactive secrets setup
npm run setup:secrets production

# Or set individual secrets
wrangler secret put JWT_SECRET --env production
wrangler secret put BIR_TIN --env production
wrangler secret put SSS_EMPLOYER_ID --env production
```

**Required Secrets:**
- `JWT_SECRET` - 256-bit authentication secret
- `REFRESH_TOKEN_SECRET` - Refresh token secret
- `SESSION_SECRET` - Session encryption key
- `BIR_TIN` - Business tax ID
- `SSS_EMPLOYER_ID` - SSS employer ID
- `PHILHEALTH_EMPLOYER_ID` - PhilHealth employer ID
- `PAGIBIG_EMPLOYER_ID` - Pag-IBIG employer ID
- `PAYMONGO_SECRET_KEY` - Payment processing
- `SEMAPHORE_API_KEY` - SMS notifications

### Step 3: Database Setup

The system includes comprehensive database setup with 15+ tables:

```bash
# Set up databases for all environments
npm run setup:database development
npm run setup:database staging
npm run setup:database production
```

**Database Structure:**
- **Core Tables**: users, branches, products, orders, customers
- **Payroll Tables**: employees, time_logs, payroll_records, payroll_periods
- **System Tables**: settings, audit_logs, inventory, payments

### Step 4: Deployment

#### Production Deployment
```bash
# Complete production deployment
npm run deploy:production

# Backend only
npm run deploy:backend

# Frontend only
npm run deploy:frontend
```

#### Staging Deployment
```bash
npm run deploy:staging
```

#### Development Deployment
```bash
npm run deploy:development
```

## 🔧 Available Scripts

### Setup Scripts
```bash
npm run generate-jwt          # Generate secure JWT secrets
npm run setup:secrets         # Interactive secrets setup
npm run setup:database        # Database setup for environment
npm run setup:all            # Complete setup (secrets + database)
```

### Deployment Scripts
```bash
npm run deploy:production     # Deploy to production
npm run deploy:staging        # Deploy to staging
npm run deploy:development    # Deploy to development
npm run deploy:backend        # Deploy only backend
npm run deploy:frontend       # Deploy only frontend
```

### Testing & Verification
```bash
npm run test:deployment       # Test deployment health
npm run verify:deployment     # Verify all systems
npm run health-check         # Run health checks
```

### Development
```bash
npm run dev                  # Start development server
npm run build               # Build for production
npm run lint                # Run linter
npm run format              # Format code
```

## 🏗️ Architecture

### Backend (Cloudflare Workers)
- **Runtime**: V8 isolates for security and performance
- **Database**: D1 (SQLite) with optimized schemas
- **Storage**: R2 for files and backups
- **Caching**: KV for sessions and rate limiting
- **Queues**: Background job processing

### Frontend (Cloudflare Pages)
- **Framework**: Vanilla JavaScript with modern ES modules
- **UI**: Tailwind CSS for responsive design
- **PWA**: Service worker for offline capability
- **State**: localStorage with encryption

### Database Design
```sql
-- Core business tables
users, branches, products, categories, inventory, customers

-- POS operations
orders, order_items, payments

-- Payroll system
employees, time_logs, payroll_periods, payroll_records

-- System management
settings, audit_logs
```

## 🇵🇭 Philippine Business Compliance

### Tax Compliance
- **VAT Calculation** - 12% VAT with inclusive/exclusive options
- **Withholding Tax** - Automatic BIR withholding calculations
- **Receipt Requirements** - BIR-compliant receipt formats

### Government Integrations
- **SSS** - Social Security System contributions
- **PhilHealth** - Health insurance premiums
- **Pag-IBIG** - Home Development Mutual Fund
- **BIR** - Bureau of Internal Revenue reporting

### Payroll Features
- **Minimum Wage** - Regional minimum wage compliance
- **Overtime** - 1.25x regular, 2.0x holiday rates
- **13th Month Pay** - Automatic calculation
- **Leaves** - Sick, vacation, maternity, paternity

## 🔐 Security Features

### Authentication & Authorization
- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - Admin, manager, cashier roles
- **Session Management** - Secure session handling
- **Password Security** - bcrypt hashing with rounds

### Data Security
- **Input Validation** - Comprehensive input sanitization
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - HTML escaping and CSP headers
- **Audit Trail** - Complete action logging

### Infrastructure Security
- **Secrets Management** - Cloudflare encrypted secrets
- **Rate Limiting** - API and user action limits
- **CORS Configuration** - Strict cross-origin policies
- **Security Headers** - Complete security header set

## 📊 Monitoring & Observability

### Health Monitoring
```bash
# Check system health
npm run health-check production

# Monitor logs
wrangler tail --env production

# View deployment status
wrangler deployments list
```

### Analytics
- **Sales Analytics** - Real-time sales tracking
- **Employee Analytics** - Time and productivity metrics
- **System Analytics** - Performance and usage metrics
- **Error Tracking** - Comprehensive error monitoring

## 🔄 Maintenance

### Regular Tasks
- **Secret Rotation** - Quarterly secret updates
- **Database Backups** - Daily automated backups
- **Dependency Updates** - Monthly security updates
- **Health Checks** - Continuous monitoring

### Backup Procedures
```bash
# Manual backup
wrangler d1 export wisetracks_pos_payroll_prod --output backup.sql

# Restore from backup
wrangler d1 execute wisetracks_pos_payroll_prod --file backup.sql
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database status
wrangler d1 list

# Test connection
wrangler d1 execute wisetracks_pos_payroll_prod --command "SELECT 1"
```

#### 2. Authentication Issues
```bash
# Verify secrets
wrangler secret list --env production

# Check JWT configuration
wrangler logs --env production
```

#### 3. Deployment Failures
```bash
# Check deployment history
wrangler deployments list

# Rollback if needed
wrangler rollback --env production
```

### Log Analysis
```bash
# Real-time logs
wrangler tail --env production

# Filter by type
wrangler tail --env production --format pretty

# Search logs
wrangler tail --env production | grep "ERROR"
```

## 📈 Performance Optimization

### Database Optimization
- **Indexes** - Comprehensive indexing strategy
- **Query Optimization** - Efficient SQL queries
- **Connection Pooling** - Optimal connection management

### Caching Strategy
- **Static Assets** - CDN caching for frontend
- **API Responses** - KV caching for frequent queries
- **Session Data** - Efficient session storage

### Monitoring
- **Response Times** - Sub-100ms API responses
- **Error Rates** - <0.1% error tolerance
- **Availability** - 99.9% uptime target

## 📞 Support & Resources

### Documentation
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Philippine Tax Guidelines](https://www.bir.gov.ph)

### Getting Help
1. Check this documentation first
2. Review the troubleshooting section
3. Check GitHub issues
4. Contact support team

## 🔄 Updates & Migrations

### Version Updates
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Deploy updates
npm run deploy:production
```

### Database Migrations
```bash
# Run migrations
npm run migrate:production

# Rollback if needed
npm run migrate:rollback
```

## 🎯 Success Criteria

After deployment, verify:
- [ ] All health checks pass
- [ ] JWT authentication works
- [ ] Database connectivity confirmed
- [ ] Philippine tax calculations accurate
- [ ] Payment processing functional
- [ ] Real-time sync operational
- [ ] Backup procedures working
- [ ] Monitoring alerts configured

## 🏆 Production Checklist

Before going live:
- [ ] All secrets configured
- [ ] Database properly set up
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Monitoring alerts set
- [ ] Backup procedures tested
- [ ] Performance optimized
- [ ] Security review completed
- [ ] User training completed
- [ ] Support processes ready

---

## 🎉 Congratulations!

Your Wisetracks POS & Payroll SaaS is now ready for production use. The system provides a complete, Philippine-compliant business management solution with enterprise-grade security and performance.

**Need help?** Check the troubleshooting section or contact our support team.

**Happy business management!** 🚀
# 🔗 Wisetracks POS & Payroll SaaS - Binding Reference

## Overview

This document provides a complete reference for all Cloudflare Workers bindings used in the Wisetracks POS & Payroll SaaS application. All bindings use unique, descriptive names to avoid conflicts.

## 📊 Updated Binding Names

### **D1 Database Bindings**
```typescript
// OLD: env.DB → NEW: env.WISETRACKS_MAIN_DB
const db = env.WISETRACKS_MAIN_DB;

// OLD: env.AUDIT_DB → NEW: env.WISETRACKS_AUDIT_DB  
const auditDb = env.WISETRACKS_AUDIT_DB;
```

### **KV Namespace Bindings**
```typescript
// OLD: env.CACHE → NEW: env.WISETRACKS_CACHE_KV
const cache = env.WISETRACKS_CACHE_KV;

// OLD: env.SESSIONS → NEW: env.WISETRACKS_SESSIONS_KV
const sessions = env.WISETRACKS_SESSIONS_KV;

// OLD: env.RATE_LIMITER → NEW: env.WISETRACKS_RATELIMIT_KV
const rateLimiter = env.WISETRACKS_RATELIMIT_KV;
```

### **R2 Storage Bindings**
```typescript
// OLD: env.STORAGE → NEW: env.WISETRACKS_MAIN_STORAGE
const storage = env.WISETRACKS_MAIN_STORAGE;

// OLD: env.BACKUPS → NEW: env.WISETRACKS_BACKUP_STORAGE
const backups = env.WISETRACKS_BACKUP_STORAGE;

// OLD: env.RECEIPTS → NEW: env.WISETRACKS_RECEIPT_STORAGE
const receipts = env.WISETRACKS_RECEIPT_STORAGE;
```

### **Durable Object Bindings**
```typescript
// OLD: env.WEBSOCKET_HANDLER → NEW: env.WISETRACKS_WEBSOCKET_DO
const websocketHandler = env.WISETRACKS_WEBSOCKET_DO;

// OLD: env.POS_SESSION → NEW: env.WISETRACKS_POS_SESSION_DO
const posSession = env.WISETRACKS_POS_SESSION_DO;
```

### **Queue Bindings**
```typescript
// OLD: env.EMAIL_QUEUE → NEW: env.WISETRACKS_EMAIL_QUEUE
const emailQueue = env.WISETRACKS_EMAIL_QUEUE;

// OLD: env.PAYROLL_QUEUE → NEW: env.WISETRACKS_PAYROLL_QUEUE
const payrollQueue = env.WISETRACKS_PAYROLL_QUEUE;

// OLD: env.BACKUP_QUEUE → NEW: env.WISETRACKS_BACKUP_QUEUE
const backupQueue = env.WISETRACKS_BACKUP_QUEUE;
```

### **Analytics Engine Bindings**
```typescript
// OLD: env.ANALYTICS → NEW: env.WISETRACKS_ANALYTICS_AE
const analytics = env.WISETRACKS_ANALYTICS_AE;
```

### **Service Bindings**
```typescript
// OLD: env.PDF_GENERATOR → NEW: env.WISETRACKS_PDF_SERVICE
const pdfService = env.WISETRACKS_PDF_SERVICE;

// OLD: env.EMAIL_SERVICE → NEW: env.WISETRACKS_EMAIL_SERVICE
const emailService = env.WISETRACKS_EMAIL_SERVICE;
```

## 🏗️ Complete Environment Configuration

### **Production Environment**
```toml
# Main Database
binding = "WISETRACKS_MAIN_DB"
database_name = "wisetracks_pos_payroll_prod"

# Audit Database
binding = "WISETRACKS_AUDIT_DB" 
database_name = "wisetracks_audit_prod"

# Cache KV
binding = "WISETRACKS_CACHE_KV"

# Sessions KV
binding = "WISETRACKS_SESSIONS_KV"

# Rate Limiting KV
binding = "WISETRACKS_RATELIMIT_KV"

# Main Storage
binding = "WISETRACKS_MAIN_STORAGE"
bucket_name = "wisetracks-pos-storage"

# Backup Storage
binding = "WISETRACKS_BACKUP_STORAGE"
bucket_name = "wisetracks-backups"

# Receipt Storage
binding = "WISETRACKS_RECEIPT_STORAGE"
bucket_name = "wisetracks-receipts"
```

### **Development Environment**
```toml
# Main Database
binding = "WISETRACKS_MAIN_DB"
database_name = "wisetracks_pos_payroll_dev"

# Audit Database
binding = "WISETRACKS_AUDIT_DB"
database_name = "wisetracks_audit_dev"

# Storage
binding = "WISETRACKS_MAIN_STORAGE"
bucket_name = "wisetracks-pos-storage-dev"
```

### **Staging Environment**
```toml
# Main Database
binding = "WISETRACKS_MAIN_DB"
database_name = "wisetracks_pos_payroll_staging"

# Audit Database
binding = "WISETRACKS_AUDIT_DB"
database_name = "wisetracks_audit_staging"

# Storage
binding = "WISETRACKS_MAIN_STORAGE"
bucket_name = "wisetracks-pos-storage-staging"
```

## 🔄 Migration Guide

If you need to update existing code to use the new bindings:

### **1. Database Operations**
```typescript
// OLD CODE
const result = await env.DB.prepare("SELECT * FROM users").all();
const auditLog = await env.AUDIT_DB.prepare("INSERT INTO audit_logs...").run();

// NEW CODE
const result = await env.WISETRACKS_MAIN_DB.prepare("SELECT * FROM users").all();
const auditLog = await env.WISETRACKS_AUDIT_DB.prepare("INSERT INTO audit_logs...").run();
```

### **2. Cache Operations**
```typescript
// OLD CODE
await env.CACHE.put("key", "value");
const session = await env.SESSIONS.get("session_id");

// NEW CODE
await env.WISETRACKS_CACHE_KV.put("key", "value");
const session = await env.WISETRACKS_SESSIONS_KV.get("session_id");
```

### **3. Storage Operations**
```typescript
// OLD CODE
await env.STORAGE.put("file.pdf", fileData);
const backup = await env.BACKUPS.get("backup.sql");

// NEW CODE
await env.WISETRACKS_MAIN_STORAGE.put("file.pdf", fileData);
const backup = await env.WISETRACKS_BACKUP_STORAGE.get("backup.sql");
```

### **4. Queue Operations**
```typescript
// OLD CODE
await env.EMAIL_QUEUE.send({ to: "user@example.com", subject: "Test" });
await env.PAYROLL_QUEUE.send({ employeeId: "123", period: "2024-01" });

// NEW CODE
await env.WISETRACKS_EMAIL_QUEUE.send({ to: "user@example.com", subject: "Test" });
await env.WISETRACKS_PAYROLL_QUEUE.send({ employeeId: "123", period: "2024-01" });
```

## 🎯 Benefits of Unique Bindings

### **1. Conflict Prevention**
- No naming conflicts with other Cloudflare applications
- Clear identification of Wisetracks-specific resources
- Easier debugging and monitoring

### **2. Better Organization**
- Consistent naming convention across all bindings
- Clear separation between different resource types
- Environment-specific resource identification

### **3. Improved Maintainability**
- Self-documenting binding names
- Easier to understand code purpose
- Reduced chance of accidentally using wrong resources

### **4. Enhanced Security**
- Clear resource boundaries
- Easier to audit resource access
- Better permission management

## 📋 Deployment Impact

The updated bindings require:

1. **Updating Worker Code** - Replace all old binding references
2. **Recreating Resources** - Create new resources with updated names
3. **Environment Variables** - Update any hardcoded binding references
4. **Documentation** - Update all references to use new binding names

## 🔍 Verification Commands

After deployment, verify bindings are working:

```bash
# Check D1 database connectivity
wrangler d1 execute wisetracks_pos_payroll_prod --command "SELECT 1"

# List KV namespaces
wrangler kv namespace list

# List R2 buckets
wrangler r2 bucket list

# Verify worker deployment
wrangler deployments list --latest
```

## 🚨 Important Notes

1. **Backup Before Migration** - Always backup existing data
2. **Test Thoroughly** - Test all functionality after binding updates
3. **Update Documentation** - Keep all docs current with new bindings
4. **Monitor Deployment** - Watch for errors during initial deployment
5. **Rollback Plan** - Have a rollback strategy ready

---

This binding reference ensures your Wisetracks POS & Payroll SaaS application uses unique, descriptive names that won't conflict with other Cloudflare applications or services.
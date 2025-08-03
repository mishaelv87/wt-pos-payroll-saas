# JWT_SECRET Environment Variable Setup Guide

## Overview
This guide provides step-by-step instructions for securely setting up the JWT_SECRET environment variable for production deployment of the WT POS & Payroll SaaS system.

## 🔑 Generating a Secure JWT Secret

### Method 1: Using Node.js (Recommended)
```bash
# Generate a cryptographically secure 256-bit (32-byte) secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 2: Using OpenSSL
```bash
# Generate a 256-bit secret using OpenSSL
openssl rand -hex 32
```

### Method 3: Using Online Tool (Less Secure)
- Visit: https://generate-random.org/api-key-generator
- Set length to 64 characters
- Use only alphanumeric characters
- **Note**: Only use this for development, not production

### Method 4: Manual Generation Script
```javascript
// generate-jwt-secret.js
const crypto = require('crypto');

function generateJWTSecret() {
    const secret = crypto.randomBytes(32).toString('hex');
    console.log('Generated JWT Secret:');
    console.log(secret);
    console.log('\nLength:', secret.length, 'characters');
    console.log('Entropy: 256 bits');
    return secret;
}

generateJWTSecret();
```

## 🚀 Deployment Configuration

### 1. Cloudflare Workers (Primary Method)

#### Using Wrangler CLI:
```bash
# Set the JWT secret as an environment variable
wrangler secret put JWT_SECRET

# When prompted, paste your generated secret
# Example: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Verify the secret is set
wrangler secret list
```

#### Using Cloudflare Dashboard:
1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker: `wt-pos-payroll-saas`
3. Go to Settings → Environment Variables
4. Click "Add variable"
5. Name: `JWT_SECRET`
6. Value: [Your generated secret]
7. Type: Secret (encrypted)
8. Click "Save"

### 2. Environment-Specific Secrets

#### Development Environment:
```bash
# Set development secret
wrangler secret put JWT_SECRET --env development
```

#### Staging Environment:
```bash
# Set staging secret (use different secret than production)
wrangler secret put JWT_SECRET --env staging
```

#### Production Environment:
```bash
# Set production secret
wrangler secret put JWT_SECRET --env production
```

## 📝 Configuration Files Updates

### 1. Update wrangler.toml
The JWT_SECRET should NOT be stored in wrangler.toml as it contains sensitive data. Instead, reference it as a secret:

```toml
# wrangler.toml - DO NOT ADD JWT_SECRET HERE
[vars]
ENVIRONMENT = "production"
COMPANY_NAME = "Your Company Name"
JWT_EXPIRES_IN = "7d"
# JWT_SECRET is set as a secret via wrangler CLI
```

### 2. Update .env.example
```env
# Security & Authentication
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-256-bits
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here-also-256-bits
REFRESH_TOKEN_EXPIRES_IN=30d
```

### 3. Local Development (.env)
Create a `.env` file for local development:
```env
# DO NOT COMMIT THIS FILE TO VERSION CONTROL
JWT_SECRET=dev_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
ENVIRONMENT=development
```

## 🔒 Security Best Practices

### 1. Secret Management
- ✅ Use different secrets for dev, staging, and production
- ✅ Store secrets using Cloudflare's encrypted secret system
- ✅ Never commit secrets to version control
- ✅ Use minimum 256-bit (32-byte) secrets
- ✅ Rotate secrets regularly (quarterly recommended)

### 2. Access Control
- ✅ Limit who has access to production secrets
- ✅ Use Cloudflare's team management for access control
- ✅ Monitor secret access logs
- ✅ Use principle of least privilege

### 3. Backup & Recovery
- ✅ Store backup of production secrets in secure password manager
- ✅ Document secret rotation procedures
- ✅ Have emergency access procedures

## ⚙️ Verification Steps

### 1. Test JWT Secret is Working
```bash
# Deploy to test environment first
wrangler deploy --env staging

# Test JWT endpoint
curl -X POST https://your-worker.your-subdomain.workers.dev/api/admin/dashboard \
  -H "Authorization: Bearer test-token"

# Should return 401 Unauthorized (good - means JWT is working)
```

### 2. Check Secret is Set
```bash
# List all secrets (names only, values are hidden)
wrangler secret list

# Should show: JWT_SECRET
```

### 3. Monitor Logs
```bash
# Monitor worker logs for JWT warnings
wrangler tail

# Look for: "WARNING: Using default JWT secret"
# This should NOT appear in production
```

## 🚨 Troubleshooting

### Common Issues:

#### 1. "JWT Secret not found" Error
```bash
# Solution: Set the secret
wrangler secret put JWT_SECRET
```

#### 2. "Using default JWT secret" Warning
```bash
# Solution: Verify secret is set for correct environment
wrangler secret list --env production
```

#### 3. Authentication Failing
```javascript
// Check if secret is accessible in worker
console.log('JWT Secret available:', !!env.JWT_SECRET);
```

#### 4. Secret Not Updating
```bash
# Force redeploy after setting secret
wrangler deploy --env production
```

## 📋 Deployment Checklist

Before production deployment:

- [ ] Generate cryptographically secure JWT secret (256-bit)
- [ ] Set JWT_SECRET via `wrangler secret put JWT_SECRET`
- [ ] Verify secret is set: `wrangler secret list`
- [ ] Test authentication endpoints work
- [ ] Confirm no "default JWT secret" warnings in logs
- [ ] Document secret in secure password manager
- [ ] Set up secret rotation schedule
- [ ] Configure monitoring for JWT-related errors

## 🔄 Secret Rotation Procedure

### Quarterly Rotation (Recommended):

1. **Generate New Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update Secret**
   ```bash
   wrangler secret put JWT_SECRET --env production
   ```

3. **Deploy Changes**
   ```bash
   wrangler deploy --env production
   ```

4. **Verify Functionality**
   - Test login functionality
   - Monitor for authentication errors
   - Check logs for warnings

5. **Update Documentation**
   - Update password manager
   - Document rotation date
   - Schedule next rotation

## 📞 Support & Resources

- [Cloudflare Workers Secrets Documentation](https://developers.cloudflare.com/workers/configuration/secrets/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

---
**Security Note**: Always treat JWT secrets as highly sensitive data. Never log, display, or transmit them in plain text.
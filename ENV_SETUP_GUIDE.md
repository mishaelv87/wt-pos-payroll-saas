# Environment Variables Setup Guide

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit the `.env` file with these essential values:**

```env
# =============================================================================
# CLOUDFLARE WORKERS CONFIGURATION
# =============================================================================
CLOUDFLARE_ACCOUNT_ID=5cb39bad2ffaf241025f0305bc46a78d
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
WORKER_NAME=wt-pos-payroll-saas

# =============================================================================
# SECURITY & AUTHENTICATION
# =============================================================================
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-32-chars-minimum
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here-make-it-long-and-random
REFRESH_TOKEN_EXPIRES_IN=30d

# =============================================================================
# PHILIPPINE BUSINESS CONFIGURATION
# =============================================================================
COMPANY_NAME=Wisetracks POS
COMPANY_ADDRESS=Your Company Address
COMPANY_PHONE=+63-XXX-XXX-XXXX
COMPANY_EMAIL=info@wisetrackspos.com
COMPANY_WEBSITE=https://wisetrackspos.com

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV=production
APP_NAME=WT POS & Payroll SaaS
APP_VERSION=1.0.0
APP_URL=https://wt-pos-payroll-saas.mishaelvallar.workers.dev
API_URL=https://wt-pos-payroll-saas.mishaelvallar.workers.dev/api

# =============================================================================
# CLOUDFLARE RESOURCES
# =============================================================================
# KV Namespace (Free tier: 100,000 reads/day, 1,000 writes/day)
KV_NAMESPACE_ID=53480cdb256b4095ac269c95c8320104

# R2 Storage (Free tier: 10GB storage, 1M Class A operations, 10M Class B operations)
R2_BUCKET_NAME=wt-pos-payroll-storage

# =============================================================================
# PHILIPPINE TAX RATES (2024)
# =============================================================================
SSS_RATE=0.045
PHILHEALTH_RATE=0.03
PAG_IBIG_RATE=0.02
WITHHOLDING_TAX_RATE=0.20

# =============================================================================
# SECURITY SETTINGS
# =============================================================================
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://your-domain.com,http://localhost:3000
CORS_CREDENTIALS=true

# =============================================================================
# TIMEZONE & LOCALE
# =============================================================================
DEFAULT_TIMEZONE=Asia/Manila
DEFAULT_LANGUAGE=en
DEFAULT_LOCALE=en-PH
DEFAULT_CURRENCY=PHP
CURRENCY_SYMBOL=₱

# =============================================================================
# FEATURE FLAGS
# =============================================================================
ENABLE_POS=true
ENABLE_PAYROLL=true
ENABLE_INVENTORY=true
ENABLE_ANALYTICS=true
ENABLE_REPORTS=true
ENABLE_OFFLINE_MODE=true
ENABLE_PWA=true
```

## Important Notes

### 🔐 **Security Variables (REQUIRED)**
- **JWT_SECRET**: Generate a strong 32+ character random string
- **REFRESH_TOKEN_SECRET**: Generate another strong random string
- **CLOUDFLARE_API_TOKEN**: Get from Cloudflare Dashboard → My Profile → API Tokens

### 🏢 **Company Information**
- Update `COMPANY_NAME`, `COMPANY_ADDRESS`, `COMPANY_PHONE`, `COMPANY_EMAIL` with your actual business details

### 🌐 **URLs**
- `APP_URL` and `API_URL` are already set to your deployed Worker
- Update `CORS_ORIGIN` with your actual domain when you deploy the frontend

### 📊 **Philippine Tax Rates**
- Current 2024 rates are pre-configured
- Update if rates change or for your specific business requirements

## Generate Secure Secrets

### Option 1: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 2: Using PowerShell
```powershell
$bytes = New-Object Byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[System.Convert]::ToHexString($bytes)
```

### Option 3: Online Generator
Use a secure online generator like: https://generate-secret.vercel.app/32

## Cloudflare API Token Setup

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Custom token" template
4. Add these permissions:
   - Account: Workers Scripts:Edit
   - Account: Workers Routes:Edit
   - Account: Workers KV Storage:Edit
   - Account: Workers R2 Storage:Edit
   - Zone: Workers Routes:Edit (if using custom domain)

## Verification

After setting up the `.env` file, test your configuration:

```bash
# Test environment variables are loaded
node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'MISSING')"

# Test Cloudflare connection
npx wrangler whoami
```

## Next Steps

1. ✅ Set up environment variables (this guide)
2. 🔄 Deploy Worker with new environment variables
3. 🌐 Deploy frontend to Cloudflare Pages
4. 🔗 Connect frontend to backend API
5. 🧪 Test all features

## Troubleshooting

### Common Issues:
- **"JWT_SECRET not set"**: Generate and set a secure secret
- **"Cloudflare authentication failed"**: Check API token permissions
- **"CORS errors"**: Update CORS_ORIGIN with your domain
- **"Database connection failed"**: D1 database not configured (using KV for now)

### Support:
- Check Cloudflare Workers logs: `npx wrangler tail`
- Test API endpoints: `curl https://wt-pos-payroll-saas.mishaelvallar.workers.dev/health` 
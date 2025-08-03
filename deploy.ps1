# Cloudflare Deployment Script for WT POS & Payroll SaaS
# This script automates the deployment process

Write-Host "🚀 Starting Cloudflare Deployment for WT POS & Payroll SaaS" -ForegroundColor Green

# Step 1: Check if wrangler is installed
Write-Host "📋 Step 1: Checking Wrangler CLI..." -ForegroundColor Yellow
try {
    $wranglerVersion = wrangler --version
    Write-Host "✅ Wrangler CLI found: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler CLI not found. Installing..." -ForegroundColor Red
    npm install -g wrangler
}

# Step 2: Login to Cloudflare
Write-Host "📋 Step 2: Logging into Cloudflare..." -ForegroundColor Yellow
Write-Host "Please complete the login process in your browser..." -ForegroundColor Cyan
wrangler login

# Step 3: Deploy the Worker
Write-Host "📋 Step 3: Deploying Worker..." -ForegroundColor Yellow
wrangler deploy

# Step 4: Deploy to Pages (if needed)
Write-Host "📋 Step 4: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
Write-Host "Note: Pages deployment requires manual setup in Cloudflare Dashboard" -ForegroundColor Cyan
Write-Host "Go to: https://dash.cloudflare.com/pages" -ForegroundColor Cyan

Write-Host "✅ Deployment script completed!" -ForegroundColor Green
Write-Host "🌐 Your Worker should be available at: https://wt-pos-payroll-saas.your-subdomain.workers.dev" -ForegroundColor Cyan 
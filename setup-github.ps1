# GitHub Repository Setup Script for WT POS & Payroll SaaS
# This script will help you set up your GitHub repository

Write-Host "=== GitHub Repository Setup ===" -ForegroundColor Green
Write-Host ""

# Step 1: Check if Git is installed
Write-Host "Step 1: Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Check if we're in the right directory
Write-Host "Step 2: Checking project directory..." -ForegroundColor Yellow
$currentDir = Get-Location
Write-Host "Current directory: $currentDir" -ForegroundColor Cyan

if ($currentDir -notlike "*wt-pos-payroll-saas*") {
    Write-Host "⚠️  Warning: You might not be in the correct project directory" -ForegroundColor Yellow
    Write-Host "Expected to be in: wt-pos-payroll-saas" -ForegroundColor Cyan
}

Write-Host ""

# Step 3: Check if Git repository is already initialized
Write-Host "Step 3: Checking Git repository status..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
    
    # Check remote
    try {
        $remote = git remote get-url origin
        Write-Host "✓ Remote origin: $remote" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  No remote origin configured" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Git repository not initialized" -ForegroundColor Red
    Write-Host "Initializing Git repository..." -ForegroundColor Yellow
    
    try {
        git init
        Write-Host "✓ Git repository initialized" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to initialize Git repository" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Step 4: Configure Git user (if not already configured)
Write-Host "Step 4: Configuring Git user..." -ForegroundColor Yellow
try {
    $userName = git config --global user.name
    $userEmail = git config --global user.email
    
    if ($userName -and $userEmail) {
        Write-Host "✓ Git user configured: $userName <$userEmail>" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Git user not configured" -ForegroundColor Yellow
        Write-Host "Please configure Git user:" -ForegroundColor Cyan
        Write-Host "git config --global user.name 'Your Name'" -ForegroundColor Cyan
        Write-Host "git config --global user.email 'mishaelvallar@gmail.com'" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ Failed to check Git configuration" -ForegroundColor Red
}

Write-Host ""

# Step 5: Create .gitignore if it doesn't exist
Write-Host "Step 5: Checking .gitignore file..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    Write-Host "✓ .gitignore file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  .gitignore file not found" -ForegroundColor Yellow
    Write-Host "Creating .gitignore file..." -ForegroundColor Cyan
    
    $gitignoreContent = @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
out/

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Cloudflare
.wrangler/
.dev.vars
"@

    try {
        $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
        Write-Host "✓ .gitignore file created" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to create .gitignore file" -ForegroundColor Red
    }
}

Write-Host ""

# Step 6: Check for large files
Write-Host "Step 6: Checking for large files..." -ForegroundColor Yellow
try {
    $largeFiles = Get-ChildItem -Recurse -File | Where-Object { $_.Length -gt 50MB } | Select-Object Name, @{Name="Size(MB)";Expression={[math]::Round($_.Length/1MB,2)}}
    
    if ($largeFiles) {
        Write-Host "⚠️  Large files found (may cause issues with GitHub):" -ForegroundColor Yellow
        $largeFiles | Format-Table -AutoSize
        Write-Host "Consider adding these to .gitignore" -ForegroundColor Cyan
    } else {
        Write-Host "✓ No large files found" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Could not check for large files" -ForegroundColor Yellow
}

Write-Host ""

# Step 7: Show next steps
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Create GitHub repository:" -ForegroundColor Yellow
Write-Host "   - Go to: https://github.com/new" -ForegroundColor Cyan
Write-Host "   - Repository name: wt-pos-payroll-saas" -ForegroundColor Cyan
Write-Host "   - Description: WT POS & Payroll SaaS with Cloudflare Access Authentication" -ForegroundColor Cyan
Write-Host "   - Choose Private or Public" -ForegroundColor Cyan
Write-Host "   - Check 'Add a README file'" -ForegroundColor Cyan
Write-Host "   - Check 'Add .gitignore' (Node.js)" -ForegroundColor Cyan
Write-Host "   - Check 'Choose a license' (MIT)" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. After creating repository, run these commands:" -ForegroundColor Yellow
Write-Host "   git add ." -ForegroundColor Cyan
Write-Host "   git commit -m 'Initial commit: WT POS & Payroll SaaS'" -ForegroundColor Cyan
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/wt-pos-payroll-saas.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Set up GitHub Actions (optional):" -ForegroundColor Yellow
Write-Host "   - Create .github/workflows/deploy.yml" -ForegroundColor Cyan
Write-Host "   - Add repository secrets" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Configure environment variables:" -ForegroundColor Yellow
Write-Host "   - Add Cloudflare secrets to GitHub" -ForegroundColor Cyan
Write-Host "   - Set up Cloudflare Access" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 
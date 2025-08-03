# Cloudflare Pages Deployment Helper
# This script helps you deploy the frontend to Cloudflare Pages

Write-Host "🚀 Cloudflare Pages Deployment Helper" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host "📋 Manual Steps Required:" -ForegroundColor Yellow
Write-Host "1. Go to: https://dash.cloudflare.com/pages" -ForegroundColor Cyan
Write-Host "2. Click: 'Create a project'" -ForegroundColor Cyan
Write-Host "3. Choose: 'Connect to Git'" -ForegroundColor Cyan
Write-Host "4. Repository: mishaelv87/wt-pos-payroll-saas" -ForegroundColor Cyan
Write-Host "5. Build settings:" -ForegroundColor Cyan
Write-Host "   - Framework: None" -ForegroundColor White
Write-Host "   - Build command: (leave empty)" -ForegroundColor White
Write-Host "   - Build output directory: frontend" -ForegroundColor White
Write-Host "   - Root directory: (leave empty)" -ForegroundColor White
Write-Host "6. Environment variables:" -ForegroundColor Cyan
Write-Host "   - API_URL: https://wt-pos-payroll-saas.mishaelvallar.workers.dev" -ForegroundColor White
Write-Host "   - ENVIRONMENT: production" -ForegroundColor White
Write-Host "7. Click: 'Save and Deploy'" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Your Worker is already deployed at:" -ForegroundColor Green
Write-Host "   https://wt-pos-payroll-saas.mishaelvallar.workers.dev" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔗 After Pages deployment, your frontend will be available at:" -ForegroundColor Yellow
Write-Host "   https://your-project-name.pages.dev" -ForegroundColor Cyan

Write-Host ""
Write-Host "🧪 Test your deployment:" -ForegroundColor Yellow
Write-Host "1. Open your Pages URL" -ForegroundColor White
Write-Host "2. Check browser console for API connection status" -ForegroundColor White
Write-Host "3. Test POS functionality" -ForegroundColor White
Write-Host "4. Verify orders are being sent to the Worker" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green 
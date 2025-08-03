#!/bin/bash

# =============================================================================
# Production Deployment Script for WT POS & Payroll SaaS
# =============================================================================
# This script handles the complete production deployment process including
# JWT secret verification, environment setup, and deployment validation.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT=${1:-production}

echo -e "${BLUE}🚀 WT POS & Payroll SaaS - Production Deployment${NC}"
echo -e "${BLUE}=================================================${NC}"
echo ""

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if wrangler is installed
check_wrangler() {
    print_step "Checking Wrangler CLI installation..."
    
    if ! command_exists wrangler; then
        print_error "Wrangler CLI is not installed"
        echo "Please install it with: npm install -g wrangler"
        exit 1
    fi
    
    local wrangler_version=$(wrangler --version)
    print_success "Wrangler CLI found: $wrangler_version"
}

# Function to check if user is authenticated
check_auth() {
    print_step "Checking Cloudflare authentication..."
    
    if ! wrangler whoami >/dev/null 2>&1; then
        print_error "Not authenticated with Cloudflare"
        echo "Please run: wrangler login"
        exit 1
    fi
    
    local user_info=$(wrangler whoami)
    print_success "Authenticated: $user_info"
}

# Function to check JWT secret
check_jwt_secret() {
    print_step "Checking JWT_SECRET environment variable..."
    
    # List secrets (this shows names only, not values)
    local secrets_output=$(wrangler secret list --env $ENVIRONMENT 2>/dev/null || echo "")
    
    if echo "$secrets_output" | grep -q "JWT_SECRET"; then
        print_success "JWT_SECRET is configured for $ENVIRONMENT environment"
    else
        print_warning "JWT_SECRET is not set for $ENVIRONMENT environment"
        echo ""
        echo -e "${YELLOW}To set JWT_SECRET:${NC}"
        echo "1. Generate a secure secret:"
        echo "   node scripts/generate-jwt-secret.js"
        echo ""
        echo "2. Set the secret:"
        echo "   wrangler secret put JWT_SECRET --env $ENVIRONMENT"
        echo ""
        read -p "Do you want to continue without JWT_SECRET? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled. Please set JWT_SECRET first."
            exit 1
        fi
        print_warning "Continuing deployment without JWT_SECRET (NOT RECOMMENDED FOR PRODUCTION)"
    fi
}

# Function to run tests
run_tests() {
    print_step "Running syntax validation..."
    
    # Check JavaScript syntax
    if command_exists node; then
        node -c src/worker.js
        node -c CLOUDFLARE_WORKER_CODE.js
        print_success "JavaScript syntax validation passed"
    else
        print_warning "Node.js not found, skipping syntax validation"
    fi
}

# Function to build the project
build_project() {
    print_step "Building project..."
    
    if [ -f "package.json" ] && command_exists npm; then
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            print_step "Installing dependencies..."
            npm install
        fi
        
        # Run build script if it exists
        if npm run build --if-present; then
            print_success "Build completed successfully"
        else
            print_warning "Build script not found or failed"
        fi
    else
        print_warning "No package.json found or npm not available, skipping build"
    fi
}

# Function to deploy to Cloudflare Workers
deploy_worker() {
    print_step "Deploying to Cloudflare Workers ($ENVIRONMENT)..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        wrangler deploy
    else
        wrangler deploy --env $ENVIRONMENT
    fi
    
    print_success "Deployment completed successfully"
}

# Function to verify deployment
verify_deployment() {
    print_step "Verifying deployment..."
    
    # Get the deployed URL
    local worker_url
    if [ "$ENVIRONMENT" = "production" ]; then
        worker_url=$(wrangler dev --inspect 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
    fi
    
    # Test health endpoint
    print_step "Testing health endpoint..."
    if command_exists curl; then
        local health_response=$(curl -s -w "%{http_code}" -o /dev/null https://wt-pos-payroll-saas.mishaelvallar.workers.dev/health || echo "000")
        
        if [ "$health_response" = "200" ]; then
            print_success "Health check passed"
        else
            print_warning "Health check returned status: $health_response"
        fi
    else
        print_warning "curl not found, skipping health check"
    fi
}

# Function to display post-deployment information
post_deployment_info() {
    echo ""
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo -e "${GREEN}======================${NC}"
    echo ""
    echo "Your WT POS & Payroll SaaS has been deployed to:"
    echo "🌐 Production URL: https://wt-pos-payroll-saas.mishaelvallar.workers.dev"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Test the application thoroughly"
    echo "2. Monitor the logs: wrangler tail"
    echo "3. Set up monitoring and alerts"
    echo "4. Configure custom domain (if needed)"
    echo ""
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "• View logs: wrangler tail"
    echo "• View secrets: wrangler secret list"
    echo "• Update secrets: wrangler secret put [SECRET_NAME]"
    echo "• Rollback: wrangler rollback"
    echo ""
}

# Main deployment process
main() {
    cd "$PROJECT_ROOT"
    
    print_step "Starting deployment to $ENVIRONMENT environment..."
    echo ""
    
    # Pre-deployment checks
    check_wrangler
    check_auth
    check_jwt_secret
    
    # Build and test
    run_tests
    build_project
    
    # Deploy
    deploy_worker
    
    # Post-deployment verification
    verify_deployment
    
    # Display completion information
    post_deployment_info
    
    print_success "Deployment process completed successfully!"
}

# Handle script arguments
case "$1" in
    "development"|"dev")
        ENVIRONMENT="development"
        ;;
    "staging"|"stage")
        ENVIRONMENT="staging"
        ;;
    "production"|"prod"|"")
        ENVIRONMENT="production"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [environment]"
        echo ""
        echo "Environments:"
        echo "  development, dev    Deploy to development environment"
        echo "  staging, stage      Deploy to staging environment"
        echo "  production, prod    Deploy to production environment (default)"
        echo ""
        echo "Examples:"
        echo "  $0                  # Deploy to production"
        echo "  $0 staging          # Deploy to staging"
        echo "  $0 development      # Deploy to development"
        exit 0
        ;;
    *)
        print_error "Unknown environment: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac

# Run main function
main
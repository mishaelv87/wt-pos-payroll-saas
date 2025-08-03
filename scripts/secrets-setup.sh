#!/bin/bash

# =============================================================================
# WISETRACKS POS & PAYROLL SAAS - SECRETS SETUP SCRIPT
# =============================================================================
# Script to set up all Cloudflare secrets for production deployment
# This script will prompt for all sensitive values and set them securely
# Last Updated: 2024-01-15

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}🔐 Wisetracks POS & Payroll SaaS - Secrets Setup${NC}"
echo -e "${BLUE}=================================================${NC}"
echo -e "${CYAN}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Function to print colored output
print_section() {
    echo -e "${PURPLE}📋 $1${NC}"
}

print_step() {
    echo -e "${BLUE}  → $1${NC}"
}

print_success() {
    echo -e "${GREEN}  ✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}  ⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}  ❌ $1${NC}"
}

# Function to check if wrangler is installed and authenticated
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check if wrangler is installed
    if ! command -v wrangler &> /dev/null; then
        print_error "Wrangler CLI is not installed"
        echo "Please install it with: npm install -g wrangler"
        exit 1
    fi
    
    print_success "Wrangler CLI found"
    
    # Check if user is authenticated
    if ! wrangler whoami &> /dev/null; then
        print_error "Not authenticated with Cloudflare"
        echo "Please run: wrangler login"
        exit 1
    fi
    
    print_success "Authenticated with Cloudflare"
    echo ""
}

# Function to generate secure random secret
generate_secret() {
    local length=${1:-32}
    if command -v openssl &> /dev/null; then
        openssl rand -hex $length
    elif command -v node &> /dev/null; then
        node -e "console.log(require('crypto').randomBytes($length).toString('hex'))"
    else
        # Fallback to /dev/urandom
        head -c $length /dev/urandom | xxd -p | tr -d '\n'
    fi
}

# Function to prompt for secret value
prompt_secret() {
    local secret_name=$1
    local description=$2
    local is_optional=${3:-false}
    local generate_option=${4:-false}
    
    print_step "$description"
    
    if [ "$generate_option" = true ]; then
        echo "    Options:"
        echo "    1. Enter your own value"
        echo "    2. Generate secure random value"
        echo "    3. Skip (leave empty)"
        read -p "    Choose option (1-3): " option
        
        case $option in
            1)
                read -s -p "    Enter value for $secret_name: " secret_value
                echo ""
                ;;
            2)
                secret_value=$(generate_secret)
                echo "    Generated secure random value"
                ;;
            3)
                if [ "$is_optional" = true ]; then
                    print_warning "Skipping $secret_name"
                    return 0
                else
                    print_error "$secret_name is required"
                    return 1
                fi
                ;;
            *)
                print_error "Invalid option"
                return 1
                ;;
        esac
    else
        if [ "$is_optional" = true ]; then
            read -s -p "    Enter value for $secret_name (optional): " secret_value
        else
            read -s -p "    Enter value for $secret_name (required): " secret_value
        fi
        echo ""
        
        if [ -z "$secret_value" ] && [ "$is_optional" = false ]; then
            print_error "$secret_name is required"
            return 1
        fi
    fi
    
    if [ -n "$secret_value" ]; then
        if wrangler secret put "$secret_name" --env "$ENVIRONMENT" <<< "$secret_value" &> /dev/null; then
            print_success "$secret_name set successfully"
        else
            print_error "Failed to set $secret_name"
            return 1
        fi
    else
        print_warning "$secret_name skipped"
    fi
    
    return 0
}

# Function to set up core security secrets
setup_core_security() {
    print_section "Core Security Secrets"
    
    prompt_secret "JWT_SECRET" "JWT signing secret (256-bit recommended)" false true
    prompt_secret "REFRESH_TOKEN_SECRET" "Refresh token signing secret (256-bit recommended)" false true
    prompt_secret "SESSION_SECRET" "Session encryption secret" false true
    
    echo ""
}

# Function to set up Philippine government API secrets
setup_philippine_apis() {
    print_section "Philippine Government API Credentials"
    
    echo -e "${YELLOW}  Note: Use actual production credentials for production environment${NC}"
    echo -e "${YELLOW}        Use sandbox/test credentials for development/staging${NC}"
    echo ""
    
    # BIR (Bureau of Internal Revenue)
    print_step "BIR (Bureau of Internal Revenue) Credentials"
    prompt_secret "BIR_TIN" "Business Tax Identification Number" false false
    prompt_secret "BIR_CAS_USERNAME" "BIR CAS system username" false false
    prompt_secret "BIR_CAS_PASSWORD" "BIR CAS system password" false false
    
    # SSS (Social Security System)
    print_step "SSS (Social Security System) Credentials"
    prompt_secret "SSS_EMPLOYER_ID" "SSS Employer ID" false false
    prompt_secret "SSS_API_KEY" "SSS API access key" false false
    prompt_secret "SSS_API_SECRET" "SSS API secret" false false
    
    # PhilHealth
    print_step "PhilHealth Credentials"
    prompt_secret "PHILHEALTH_EMPLOYER_ID" "PhilHealth Employer ID" false false
    prompt_secret "PHILHEALTH_API_KEY" "PhilHealth API key" false false
    
    # Pag-IBIG Fund
    print_step "Pag-IBIG Fund Credentials"
    prompt_secret "PAGIBIG_EMPLOYER_ID" "Pag-IBIG Employer ID" false false
    prompt_secret "PAGIBIG_API_KEY" "Pag-IBIG API key" false false
    
    echo ""
}

# Function to set up payment processing secrets
setup_payment_processing() {
    print_section "Payment Processing Credentials"
    
    echo -e "${YELLOW}  Note: Use test keys for development, live keys for production${NC}"
    echo ""
    
    # PayMongo
    print_step "PayMongo Credentials"
    prompt_secret "PAYMONGO_SECRET_KEY" "PayMongo secret key" false false
    prompt_secret "PAYMONGO_WEBHOOK_SECRET" "PayMongo webhook secret" false false
    
    # GCash
    print_step "GCash Credentials"
    prompt_secret "GCASH_MERCHANT_SECRET" "GCash merchant secret" true false
    
    # Maya (PayMaya)
    print_step "Maya (PayMaya) Credentials"
    prompt_secret "MAYA_SECRET_KEY" "Maya payment secret key" true false
    
    echo ""
}

# Function to set up communication secrets
setup_communication() {
    print_section "Communication Services"
    
    # Email
    print_step "Email Service Credentials"
    prompt_secret "SMTP_PASSWORD" "Email SMTP password" true false
    
    # SMS
    print_step "SMS Service Credentials"
    prompt_secret "SEMAPHORE_API_KEY" "Semaphore SMS API key" true false
    
    echo ""
}

# Function to set up monitoring and analytics
setup_monitoring() {
    print_section "Monitoring & Analytics"
    
    prompt_secret "SENTRY_DSN" "Sentry error tracking DSN" true false
    prompt_secret "GOOGLE_ANALYTICS_KEY" "Google Analytics API key" true false
    prompt_secret "MIXPANEL_TOKEN" "Mixpanel analytics token" true false
    prompt_secret "DATADOG_API_KEY" "Datadog monitoring API key" true false
    prompt_secret "NEW_RELIC_LICENSE_KEY" "New Relic license key" true false
    
    echo ""
}

# Function to set up compliance and encryption
setup_compliance() {
    print_section "Compliance & Encryption"
    
    prompt_secret "DPA_ENCRYPTION_KEY" "Data Privacy Act encryption key" false true
    prompt_secret "BACKUP_ENCRYPTION_KEY" "Backup encryption key" false true
    prompt_secret "AUDIT_WEBHOOK_SECRET" "Audit webhook secret" true true
    
    echo ""
}

# Function to set up third-party integrations
setup_integrations() {
    print_section "Third-party Integrations"
    
    # Google Services
    print_step "Google Services"
    prompt_secret "GOOGLE_CLIENT_SECRET" "Google OAuth client secret" true false
    
    # Microsoft Services
    print_step "Microsoft Services"
    prompt_secret "MICROSOFT_CLIENT_SECRET" "Microsoft OAuth client secret" true false
    
    # Accounting Software
    print_step "Accounting Software Integration"
    prompt_secret "QUICKBOOKS_CLIENT_SECRET" "QuickBooks client secret" true false
    prompt_secret "XERO_CLIENT_SECRET" "Xero client secret" true false
    
    echo ""
}

# Function to verify secrets were set
verify_secrets() {
    print_section "Verifying Secrets"
    
    local secrets_list
    secrets_list=$(wrangler secret list --env "$ENVIRONMENT" 2>/dev/null || echo "")
    
    if [ -z "$secrets_list" ]; then
        print_warning "Could not retrieve secrets list"
        return 0
    fi
    
    local total_secrets=0
    local core_secrets=("JWT_SECRET" "REFRESH_TOKEN_SECRET" "SESSION_SECRET")
    local philippine_secrets=("BIR_TIN" "SSS_EMPLOYER_ID" "PHILHEALTH_EMPLOYER_ID" "PAGIBIG_EMPLOYER_ID")
    local payment_secrets=("PAYMONGO_SECRET_KEY")
    
    echo "  Core Security Secrets:"
    for secret in "${core_secrets[@]}"; do
        if echo "$secrets_list" | grep -q "$secret"; then
            print_success "$secret is set"
            ((total_secrets++))
        else
            print_warning "$secret is not set"
        fi
    done
    
    echo ""
    echo "  Philippine Government Secrets:"
    for secret in "${philippine_secrets[@]}"; do
        if echo "$secrets_list" | grep -q "$secret"; then
            print_success "$secret is set"
            ((total_secrets++))
        else
            print_warning "$secret is not set"
        fi
    done
    
    echo ""
    echo "  Payment Processing Secrets:"
    for secret in "${payment_secrets[@]}"; do
        if echo "$secrets_list" | grep -q "$secret"; then
            print_success "$secret is set"
            ((total_secrets++))
        else
            print_warning "$secret is not set"
        fi
    done
    
    echo ""
    echo -e "${CYAN}Total secrets configured: $total_secrets${NC}"
    echo ""
}

# Function to display next steps
show_next_steps() {
    print_section "Next Steps"
    
    echo "  1. Review the configured secrets:"
    echo "     ${CYAN}wrangler secret list --env $ENVIRONMENT${NC}"
    echo ""
    echo "  2. Test the deployment:"
    echo "     ${CYAN}npm run deploy:$ENVIRONMENT${NC}"
    echo ""
    echo "  3. Verify API functionality:"
    echo "     ${CYAN}npm run test:deployment${NC}"
    echo ""
    echo "  4. Monitor the application:"
    echo "     ${CYAN}wrangler tail --env $ENVIRONMENT${NC}"
    echo ""
    echo "  5. Set up monitoring alerts and backups"
    echo ""
    echo -e "${GREEN}🎉 Secrets setup complete for $ENVIRONMENT environment!${NC}"
    echo ""
}

# Function to show help
show_help() {
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  production    Set up production secrets (default)"
    echo "  staging       Set up staging secrets"
    echo "  development   Set up development secrets"
    echo ""
    echo "Examples:"
    echo "  $0                    # Set up production secrets"
    echo "  $0 staging            # Set up staging secrets"
    echo "  $0 development        # Set up development secrets"
    echo ""
    echo "Security Notes:"
    echo "  • All secrets are encrypted and stored securely by Cloudflare"
    echo "  • Never share or commit secrets to version control"
    echo "  • Use different secrets for each environment"
    echo "  • Rotate secrets regularly (quarterly recommended)"
    echo ""
}

# Function to confirm environment
confirm_environment() {
    echo -e "${YELLOW}⚠️  You are about to set up secrets for the ${ENVIRONMENT} environment.${NC}"
    echo ""
    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${RED}WARNING: This is the PRODUCTION environment!${NC}"
        echo -e "${RED}Make sure you are using real, secure credentials.${NC}"
        echo ""
    fi
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
    
    echo ""
}

# Main function
main() {
    cd "$PROJECT_ROOT"
    
    # Handle help option
    if [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_help
        exit 0
    fi
    
    # Validate environment
    case "$ENVIRONMENT" in
        "production"|"staging"|"development")
            ;;
        *)
            print_error "Invalid environment: $ENVIRONMENT"
            echo "Valid environments: production, staging, development"
            exit 1
            ;;
    esac
    
    # Run setup process
    check_prerequisites
    confirm_environment
    
    echo -e "${CYAN}Setting up secrets for $ENVIRONMENT environment...${NC}"
    echo ""
    
    # Set up all secret categories
    setup_core_security
    setup_philippine_apis
    setup_payment_processing
    setup_communication
    setup_monitoring
    setup_compliance
    setup_integrations
    
    # Verify and show results
    verify_secrets
    show_next_steps
}

# Handle script interruption
trap 'echo -e "\n${RED}Setup interrupted by user${NC}"; exit 1' INT

# Run main function
main "$@"
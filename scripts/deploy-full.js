#!/usr/bin/env node

/**
 * =============================================================================
 * WISETRACKS POS & PAYROLL SAAS - COMPLETE DEPLOYMENT SCRIPT
 * =============================================================================
 * One-command deployment for backend, frontend, and database setup
 * This script handles the entire deployment pipeline
 * Last Updated: 2024-01-15
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = dirname(__dirname);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

// Utility functions
const log = {
    info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.cyan}🚀 ${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.magenta}  → ${msg}${colors.reset}`)
};

class WisetracksDeployment {
    constructor(environment = 'production') {
        this.environment = environment;
        this.startTime = Date.now();
        
        log.section(`Wisetracks POS & Payroll SaaS - Full Deployment`);
        log.info(`Environment: ${environment.toUpperCase()}`);
        log.info(`Timestamp: ${new Date().toISOString()}`);
    }
    
    async deploy() {
        try {
            log.section('Starting Complete Deployment Process');
            
            await this.checkPrerequisites();
            await this.validateConfiguration();
            await this.setupDatabases();
            await this.runTests();
            await this.deployBackend();
            await this.deployFrontend();
            await this.verifyDeployment();
            await this.runHealthChecks();
            
            this.showCompletionSummary();
            
        } catch (error) {
            log.error(`Deployment failed: ${error.message}`);
            this.showRollbackInstructions();
            process.exit(1);
        }
    }
    
    async checkPrerequisites() {
        log.step('Checking prerequisites...');
        
        // Check Node.js version
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
        if (majorVersion < 18) {
            throw new Error(`Node.js 18+ required. Current version: ${nodeVersion}`);
        }
        log.success(`Node.js version: ${nodeVersion}`);
        
        // Check Wrangler CLI
        try {
            const wranglerVersion = execSync('wrangler --version', { encoding: 'utf8' }).trim();
            log.success(`Wrangler CLI: ${wranglerVersion}`);
        } catch (error) {
            throw new Error('Wrangler CLI not found. Install with: npm install -g wrangler');
        }
        
        // Check authentication
        try {
            const whoami = execSync('wrangler whoami', { encoding: 'utf8' }).trim();
            log.success(`Authenticated: ${whoami}`);
        } catch (error) {
            throw new Error('Not authenticated with Cloudflare. Run: wrangler login');
        }
        
        // Check required files
        const requiredFiles = [
            'wrangler.toml',
            'package.json',
            'src/worker.js',
            'frontend/index.html'
        ];
        
        for (const file of requiredFiles) {
            const filePath = join(PROJECT_ROOT, file);
            if (!existsSync(filePath)) {
                throw new Error(`Required file missing: ${file}`);
            }
        }
        log.success('All required files present');
    }
    
    async validateConfiguration() {
        log.step('Validating configuration...');
        
        // Check wrangler.toml
        const wranglerPath = join(PROJECT_ROOT, 'wrangler.toml');
        const wranglerContent = readFileSync(wranglerPath, 'utf8');
        
        if (!wranglerContent.includes(`[env.${this.environment}]`)) {
            log.warning(`Environment ${this.environment} not configured in wrangler.toml`);
        } else {
            log.success(`Environment ${this.environment} configured`);
        }
        
        // Check package.json
        const packagePath = join(PROJECT_ROOT, 'package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
        
        const requiredDeps = ['@cloudflare/workers-types', 'hono'];
        const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
        
        if (missingDeps.length > 0) {
            log.warning(`Missing dependencies: ${missingDeps.join(', ')}`);
        } else {
            log.success('All required dependencies present');
        }
        
        // Check for secrets
        try {
            const secrets = execSync(`wrangler secret list --env ${this.environment}`, { 
                encoding: 'utf8', 
                stdio: 'pipe' 
            });
            
            const requiredSecrets = ['JWT_SECRET', 'BIR_TIN', 'SSS_EMPLOYER_ID'];
            const hasSecrets = requiredSecrets.some(secret => secrets.includes(secret));
            
            if (hasSecrets) {
                log.success('Some secrets configured');
            } else {
                log.warning('No critical secrets found. Run: npm run setup:secrets');
            }
        } catch (error) {
            log.warning('Could not check secrets');
        }
    }
    
    async setupDatabases() {
        log.step('Setting up databases...');
        
        try {
            execSync(`node scripts/setup-database.js ${this.environment}`, { 
                stdio: 'inherit',
                cwd: PROJECT_ROOT 
            });
            log.success('Database setup completed');
        } catch (error) {
            throw new Error(`Database setup failed: ${error.message}`);
        }
    }
    
    async runTests() {
        log.step('Running tests...');
        
        try {
            // Syntax validation
            execSync('node -c src/worker.js', { cwd: PROJECT_ROOT });
            log.success('Worker syntax validation passed');
            
            // Run npm tests if available
            const packageJson = JSON.parse(readFileSync(join(PROJECT_ROOT, 'package.json'), 'utf8'));
            if (packageJson.scripts && packageJson.scripts.test) {
                execSync('npm test', { stdio: 'inherit', cwd: PROJECT_ROOT });
                log.success('Test suite passed');
            } else {
                log.warning('No test suite found');
            }
        } catch (error) {
            if (this.environment === 'production') {
                throw new Error(`Tests failed: ${error.message}`);
            } else {
                log.warning(`Tests failed (continuing in ${this.environment}): ${error.message}`);
            }
        }
    }
    
    async deployBackend() {
        log.step('Deploying backend (Cloudflare Workers)...');
        
        try {
            const deployCmd = this.environment === 'production' 
                ? 'wrangler deploy' 
                : `wrangler deploy --env ${this.environment}`;
                
            execSync(deployCmd, { stdio: 'inherit', cwd: PROJECT_ROOT });
            log.success('Backend deployment completed');
        } catch (error) {
            throw new Error(`Backend deployment failed: ${error.message}`);
        }
    }
    
    async deployFrontend() {
        log.step('Deploying frontend (Cloudflare Pages)...');
        
        try {
            // Check if we have Pages configuration
            const hasPages = existsSync(join(PROJECT_ROOT, 'functions'));
            
            if (hasPages) {
                // Deploy using Wrangler Pages
                const pagesCmd = this.environment === 'production'
                    ? 'wrangler pages deploy frontend'
                    : `wrangler pages deploy frontend --env ${this.environment}`;
                    
                execSync(pagesCmd, { stdio: 'inherit', cwd: PROJECT_ROOT });
                log.success('Frontend deployment completed');
            } else {
                // Manual Pages deployment
                log.info('Frontend deployment requires manual setup via Cloudflare dashboard');
                log.info('Upload the frontend/ directory to Cloudflare Pages');
                log.warning('Frontend deployment skipped - manual setup required');
            }
        } catch (error) {
            log.warning(`Frontend deployment failed: ${error.message}`);
            log.info('You can deploy frontend manually via Cloudflare Pages dashboard');
        }
    }
    
    async verifyDeployment() {
        log.step('Verifying deployment...');
        
        try {
            // Get worker URL
            const workerName = this.environment === 'production' 
                ? 'wisetracks-pos-payroll'
                : `wisetracks-pos-payroll-${this.environment}`;
                
            const workerUrl = `https://${workerName}.your-subdomain.workers.dev`;
            
            // Test health endpoint
            log.info(`Testing health endpoint: ${workerUrl}/health`);
            
            // Use curl if available, otherwise skip
            try {
                const healthResponse = execSync(`curl -s "${workerUrl}/health"`, { 
                    encoding: 'utf8',
                    timeout: 10000 
                });
                
                if (healthResponse.includes('healthy') || healthResponse.includes('online')) {
                    log.success('Health check passed');
                } else {
                    log.warning('Health check response unclear');
                }
            } catch (error) {
                log.warning('Could not test health endpoint (curl not available or endpoint not ready)');
            }
            
        } catch (error) {
            log.warning(`Verification warning: ${error.message}`);
        }
    }
    
    async runHealthChecks() {
        log.step('Running comprehensive health checks...');
        
        const checks = [
            {
                name: 'Database connectivity',
                test: async () => {
                    try {
                        execSync(`wrangler d1 execute wisetracks_pos_payroll_${this.environment === 'production' ? 'prod' : this.environment} --command "SELECT 1"`, { stdio: 'pipe' });
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            },
            {
                name: 'Worker deployment',
                test: async () => {
                    try {
                        execSync('wrangler deployments list --latest', { stdio: 'pipe' });
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            },
            {
                name: 'Configuration validation',
                test: async () => {
                    return existsSync(join(PROJECT_ROOT, 'wrangler.toml'));
                }
            }
        ];
        
        let passedChecks = 0;
        
        for (const check of checks) {
            try {
                const result = await check.test();
                if (result) {
                    log.success(check.name);
                    passedChecks++;
                } else {
                    log.warning(`${check.name} - Failed`);
                }
            } catch (error) {
                log.warning(`${check.name} - Error: ${error.message}`);
            }
        }
        
        log.info(`Health checks: ${passedChecks}/${checks.length} passed`);
    }
    
    showCompletionSummary() {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        
        log.section('🎉 Deployment Completed Successfully!');
        console.log('');
        
        console.log(`${colors.cyan}📊 Deployment Summary:${colors.reset}`);
        console.log(`   Environment: ${this.environment.toUpperCase()}`);
        console.log(`   Duration: ${duration} seconds`);
        console.log(`   Timestamp: ${new Date().toISOString()}`);
        console.log('');
        
        console.log(`${colors.cyan}🔗 Access URLs:${colors.reset}`);
        const workerName = this.environment === 'production' ? 'wisetracks-pos-payroll' : `wisetracks-pos-payroll-${this.environment}`;
        console.log(`   API: https://${workerName}.your-subdomain.workers.dev`);
        console.log(`   Health: https://${workerName}.your-subdomain.workers.dev/health`);
        console.log(`   Frontend: https://your-app${this.environment !== 'production' ? `-${this.environment}` : ''}.pages.dev`);
        console.log('');
        
        console.log(`${colors.cyan}📋 Next Steps:${colors.reset}`);
        console.log('   1. Update DNS records if using custom domain');
        console.log('   2. Configure monitoring and alerts');
        console.log('   3. Set up backup procedures');
        console.log('   4. Test all functionality thoroughly');
        console.log('   5. Train users on the new system');
        console.log('');
        
        console.log(`${colors.cyan}🛠️ Useful Commands:${colors.reset}`);
        console.log(`   Monitor logs: wrangler tail --env ${this.environment}`);
        console.log(`   List secrets: wrangler secret list --env ${this.environment}`);
        console.log(`   Database query: wrangler d1 execute wisetracks_pos_payroll_${this.environment === 'production' ? 'prod' : this.environment} --command "SELECT * FROM users LIMIT 5"`);
        console.log(`   Rollback: wrangler rollback --env ${this.environment}`);
        console.log('');
        
        console.log(`${colors.green}✨ Your Wisetracks POS & Payroll SaaS is now live!${colors.reset}`);
    }
    
    showRollbackInstructions() {
        log.section('🔄 Rollback Instructions');
        console.log('');
        console.log('If you need to rollback this deployment:');
        console.log('');
        console.log('1. Rollback worker deployment:');
        console.log(`   ${colors.cyan}wrangler rollback --env ${this.environment}${colors.reset}`);
        console.log('');
        console.log('2. Restore database (if backup exists):');
        console.log(`   ${colors.cyan}wrangler d1 execute wisetracks_pos_payroll_${this.environment === 'production' ? 'prod' : this.environment} --file backup.sql${colors.reset}`);
        console.log('');
        console.log('3. Check deployment history:');
        console.log(`   ${colors.cyan}wrangler deployments list${colors.reset}`);
        console.log('');
        console.log('4. Monitor for issues:');
        console.log(`   ${colors.cyan}wrangler tail --env ${this.environment}${colors.reset}`);
        console.log('');
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
${colors.cyan}Wisetracks POS & Payroll SaaS - Complete Deployment${colors.reset}

Usage: node deploy-full.js [environment] [options]

Environments:
  production   Deploy to production (default)
  staging      Deploy to staging
  development  Deploy to development

Options:
  --skip-tests     Skip running tests
  --skip-db        Skip database setup
  --backend-only   Deploy only backend
  --frontend-only  Deploy only frontend

Examples:
  node deploy-full.js                    # Deploy to production
  node deploy-full.js staging            # Deploy to staging
  node deploy-full.js --backend-only     # Deploy only backend to production

This script will:
  ✓ Check all prerequisites
  ✓ Validate configuration
  ✓ Set up databases
  ✓ Run tests
  ✓ Deploy backend (Cloudflare Workers)
  ✓ Deploy frontend (Cloudflare Pages)
  ✓ Verify deployment
  ✓ Run health checks
        `);
        process.exit(0);
    }
    
    const environment = args.find(arg => !arg.startsWith('--')) || 'production';
    
    if (!['development', 'staging', 'production'].includes(environment)) {
        log.error(`Invalid environment: ${environment}`);
        log.info('Valid environments: development, staging, production');
        process.exit(1);
    }
    
    // Parse options
    const options = {
        skipTests: args.includes('--skip-tests'),
        skipDb: args.includes('--skip-db'),
        backendOnly: args.includes('--backend-only'),
        frontendOnly: args.includes('--frontend-only')
    };
    
    if (environment === 'production') {
        log.warning('🚨 PRODUCTION DEPLOYMENT');
        log.warning('This will deploy to the live production environment');
        
        // Add confirmation for production
        console.log('');
        console.log('Continue with production deployment? (y/N)');
        process.stdin.setRawMode(true);
        process.stdin.resume();
        
        const confirmation = await new Promise((resolve) => {
            process.stdin.once('data', (data) => {
                const input = data.toString().toLowerCase().trim();
                resolve(input === 'y' || input === 'yes');
            });
        });
        
        process.stdin.setRawMode(false);
        
        if (!confirmation) {
            log.info('Deployment cancelled');
            process.exit(0);
        }
    }
    
    const deployment = new WisetracksDeployment(environment);
    
    // Override methods based on options
    if (options.skipTests) {
        deployment.runTests = async () => {
            log.warning('Skipping tests as requested');
        };
    }
    
    if (options.skipDb) {
        deployment.setupDatabases = async () => {
            log.warning('Skipping database setup as requested');
        };
    }
    
    if (options.backendOnly) {
        deployment.deployFrontend = async () => {
            log.warning('Skipping frontend deployment as requested');
        };
    }
    
    if (options.frontendOnly) {
        deployment.deployBackend = async () => {
            log.warning('Skipping backend deployment as requested');
        };
        deployment.setupDatabases = async () => {
            log.warning('Skipping database setup for frontend-only deployment');
        };
    }
    
    await deployment.deploy();
}

// Handle process termination
process.on('SIGINT', () => {
    log.warning('Deployment interrupted by user');
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    log.error(`Uncaught exception: ${error.message}`);
    process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        log.error(`Deployment failed: ${error.message}`);
        process.exit(1);
    });
}

export default WisetracksDeployment;
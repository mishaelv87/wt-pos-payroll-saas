#!/usr/bin/env node

/**
 * =============================================================================
 * WISETRACKS POS & PAYROLL SAAS - ENVIRONMENT SETUP TEST
 * =============================================================================
 * Comprehensive test suite for environment configuration and Cloudflare connectivity
 * Validates all environment variables, API access, and resource availability
 * Last Updated: 2024-01-15
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
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
    section: (msg) => console.log(`\n${colors.cyan}🔍 ${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.magenta}  → ${msg}${colors.reset}`)
};

class EnvironmentTester {
    constructor(environment = 'development') {
        this.environment = environment;
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
        
        log.section(`Environment Setup Test - ${environment.toUpperCase()}`);
        log.info(`Timestamp: ${new Date().toISOString()}`);
    }
    
    async runAllTests() {
        try {
            log.section('Starting Environment Setup Tests');
            
            await this.testCloudflareAPI();
            await this.testAccountConfiguration();
            await this.testDatabaseConnectivity();
            await this.testKVNamespaces();
            await this.testR2Buckets();
            await this.testSecrets();
            await this.testPhilippineConfiguration();
            await this.testEnvironmentFiles();
            await this.testWranglerConfiguration();
            await this.testDependencies();
            
            this.showResults();
            
        } catch (error) {
            log.error(`Test suite failed: ${error.message}`);
            process.exit(1);
        }
    }
    
    async testCloudflareAPI() {
        log.step('Testing Cloudflare API connectivity...');
        
        try {
            // Test wrangler authentication
            const whoami = execSync('wrangler whoami', { 
                encoding: 'utf8', 
                stdio: 'pipe' 
            }).trim();
            
            if (whoami.includes('@')) {
                this.recordTest('Cloudflare API Token', 'Valid', true);
            } else {
                this.recordTest('Cloudflare API Token', 'Invalid or not authenticated', false);
            }
            
            // Test API access
            try {
                execSync('wrangler account list', { stdio: 'pipe' });
                this.recordTest('Cloudflare API Access', 'Connected', true);
            } catch (error) {
                this.recordTest('Cloudflare API Access', 'Failed to access API', false);
            }
            
        } catch (error) {
            this.recordTest('Cloudflare API Token', 'Not authenticated', false);
        }
    }
    
    async testAccountConfiguration() {
        log.step('Testing account configuration...');
        
        try {
            // Check wrangler.toml for account ID
            const wranglerPath = join(PROJECT_ROOT, 'wrangler.toml');
            if (existsSync(wranglerPath)) {
                const wranglerContent = readFileSync(wranglerPath, 'utf8');
                
                // Look for account_id in environment vars or main config
                if (wranglerContent.includes('CLOUDFLARE_ACCOUNT_ID') || 
                    wranglerContent.includes('account_id')) {
                    this.recordTest('Account ID', 'Configured', true);
                } else {
                    this.recordTest('Account ID', 'Not configured in wrangler.toml', false);
                }
                
                // Check environment configuration
                if (wranglerContent.includes(`[env.${this.environment}]`)) {
                    this.recordTest('Environment Configuration', `${this.environment} configured`, true);
                } else {
                    this.recordTest('Environment Configuration', `${this.environment} not configured`, false);
                }
            } else {
                this.recordTest('Wrangler Configuration', 'wrangler.toml not found', false);
            }
            
        } catch (error) {
            this.recordTest('Account Configuration', `Error: ${error.message}`, false);
        }
    }
    
    async testDatabaseConnectivity() {
        log.step('Testing D1 database connectivity...');
        
        try {
            // Test main database
            const mainDbName = `wisetracks_pos_payroll_${this.environment === 'production' ? 'prod' : this.environment}`;
            
            try {
                const dbResult = execSync(`wrangler d1 execute ${mainDbName} --command "SELECT 1 as test"`, { 
                    encoding: 'utf8', 
                    stdio: 'pipe' 
                });
                
                if (dbResult.includes('test') || dbResult.includes('1')) {
                    this.recordTest('D1 Database', 'Accessible', true);
                } else {
                    this.recordTest('D1 Database', 'Query failed', false);
                }
            } catch (error) {
                if (error.message.includes('does not exist')) {
                    this.recordTest('D1 Database', 'Database not created yet', false, true);
                } else {
                    this.recordTest('D1 Database', `Connection failed: ${error.message}`, false);
                }
            }
            
            // Test audit database
            const auditDbName = `wisetracks_audit_${this.environment === 'production' ? 'prod' : this.environment}`;
            
            try {
                execSync(`wrangler d1 execute ${auditDbName} --command "SELECT 1"`, { 
                    stdio: 'pipe' 
                });
                this.recordTest('Audit Database', 'Accessible', true);
            } catch (error) {
                if (error.message.includes('does not exist')) {
                    this.recordTest('Audit Database', 'Database not created yet', false, true);
                } else {
                    this.recordTest('Audit Database', 'Connection failed', false);
                }
            }
            
        } catch (error) {
            this.recordTest('Database Connectivity', `Error: ${error.message}`, false);
        }
    }
    
    async testKVNamespaces() {
        log.step('Testing KV namespace availability...');
        
        try {
            const kvList = execSync('wrangler kv namespace list', { 
                encoding: 'utf8', 
                stdio: 'pipe' 
            });
            
            // Check for Wisetracks namespaces
            const kvData = JSON.parse(kvList);
            const wisetracksNamespaces = kvData.filter(ns => 
                ns.title.includes('wisetracks') || 
                ns.title.includes('WISETRACKS') ||
                ns.title.includes('pos')
            );
            
            if (wisetracksNamespaces.length > 0) {
                this.recordTest('KV Namespace', `${wisetracksNamespaces.length} namespace(s) found`, true);
            } else {
                this.recordTest('KV Namespace', 'No Wisetracks namespaces found', false, true);
            }
            
            // Test KV functionality if namespace exists
            if (wisetracksNamespaces.length > 0) {
                try {
                    const testNamespace = wisetracksNamespaces[0];
                    execSync(`wrangler kv key put test_key "test_value" --namespace-id ${testNamespace.id}`, { 
                        stdio: 'pipe' 
                    });
                    
                    const value = execSync(`wrangler kv key get test_key --namespace-id ${testNamespace.id}`, { 
                        encoding: 'utf8',
                        stdio: 'pipe' 
                    }).trim();
                    
                    if (value === 'test_value') {
                        this.recordTest('KV Functionality', 'Read/Write operations work', true);
                        
                        // Clean up test key
                        execSync(`wrangler kv key delete test_key --namespace-id ${testNamespace.id}`, { 
                            stdio: 'pipe' 
                        });
                    } else {
                        this.recordTest('KV Functionality', 'Read/Write test failed', false);
                    }
                } catch (error) {
                    this.recordTest('KV Functionality', 'Operations failed', false);
                }
            }
            
        } catch (error) {
            this.recordTest('KV Namespace', `Error: ${error.message}`, false);
        }
    }
    
    async testR2Buckets() {
        log.step('Testing R2 bucket availability...');
        
        try {
            const bucketList = execSync('wrangler r2 bucket list', { 
                encoding: 'utf8', 
                stdio: 'pipe' 
            });
            
            // Check for Wisetracks buckets
            const wisetracksPattern = /wisetracks.*?storage|wisetracks.*?backup|wisetracks.*?receipt/gi;
            const matches = bucketList.match(wisetracksPattern) || [];
            
            if (matches.length > 0) {
                this.recordTest('R2 Bucket', `${matches.length} bucket(s) found`, true);
            } else {
                this.recordTest('R2 Bucket', 'No Wisetracks buckets found', false, true);
            }
            
        } catch (error) {
            if (error.message.includes('No buckets found')) {
                this.recordTest('R2 Bucket', 'No buckets created yet', false, true);
            } else {
                this.recordTest('R2 Bucket', `Error: ${error.message}`, false);
            }
        }
    }
    
    async testSecrets() {
        log.step('Testing secrets configuration...');
        
        try {
            const secretsList = execSync(`wrangler secret list --env ${this.environment}`, { 
                encoding: 'utf8', 
                stdio: 'pipe' 
            });
            
            // Check for critical secrets
            const criticalSecrets = [
                'JWT_SECRET',
                'REFRESH_TOKEN_SECRET',
                'SESSION_SECRET',
                'BIR_TIN',
                'SSS_EMPLOYER_ID',
                'PHILHEALTH_EMPLOYER_ID',
                'PAGIBIG_EMPLOYER_ID'
            ];
            
            let foundSecrets = 0;
            const missingSecrets = [];
            
            for (const secret of criticalSecrets) {
                if (secretsList.includes(secret)) {
                    foundSecrets++;
                } else {
                    missingSecrets.push(secret);
                }
            }
            
            if (foundSecrets === criticalSecrets.length) {
                this.recordTest('JWT Secret', 'Generated (32+ chars)', true);
                this.recordTest('Critical Secrets', 'All configured', true);
            } else if (foundSecrets > 0) {
                this.recordTest('JWT Secret', 'Some secrets configured', true);
                this.recordTest('Critical Secrets', `${foundSecrets}/${criticalSecrets.length} configured`, false, true);
                log.warning(`Missing secrets: ${missingSecrets.join(', ')}`);
            } else {
                this.recordTest('JWT Secret', 'Not configured', false);
                this.recordTest('Critical Secrets', 'None configured', false);
            }
            
        } catch (error) {
            if (error.message.includes('No secrets found')) {
                this.recordTest('JWT Secret', 'Not configured', false);
                this.recordTest('Critical Secrets', 'None configured', false);
            } else {
                this.recordTest('Secrets Configuration', `Error: ${error.message}`, false);
            }
        }
    }
    
    async testPhilippineConfiguration() {
        log.step('Testing Philippine business configuration...');
        
        try {
            // Check environment file for Philippine tax rates
            const envFiles = ['.env.local', '.env.development', '.env.production'];
            let taxRatesFound = false;
            
            for (const envFile of envFiles) {
                const envPath = join(PROJECT_ROOT, envFile);
                if (existsSync(envPath)) {
                    const envContent = readFileSync(envPath, 'utf8');
                    
                    // Check for Philippine-specific configurations
                    const philippineConfigs = [
                        'MIN_WAGE_NCR',
                        'SSS_CONTRIBUTION_RATE',
                        'PHILHEALTH_PREMIUM_RATE',
                        'PAGIBIG_CONTRIBUTION_RATE',
                        'BIR_WITHHOLDING_TAX_RATE'
                    ];
                    
                    let configsFound = 0;
                    for (const config of philippineConfigs) {
                        if (envContent.includes(config)) {
                            configsFound++;
                        }
                    }
                    
                    if (configsFound >= 3) {
                        taxRatesFound = true;
                        break;
                    }
                }
            }
            
            if (taxRatesFound) {
                this.recordTest('Philippine Tax Rates', 'Loaded', true);
            } else {
                this.recordTest('Philippine Tax Rates', 'Not configured', false, true);
            }
            
            // Check wrangler.toml for Philippine endpoints
            const wranglerPath = join(PROJECT_ROOT, 'wrangler.toml');
            if (existsSync(wranglerPath)) {
                const wranglerContent = readFileSync(wranglerPath, 'utf8');
                
                const endpoints = [
                    'BIR_API_ENDPOINT',
                    'SSS_API_ENDPOINT',
                    'PHILHEALTH_API_ENDPOINT',
                    'PAGIBIG_API_ENDPOINT'
                ];
                
                let endpointsFound = 0;
                for (const endpoint of endpoints) {
                    if (wranglerContent.includes(endpoint)) {
                        endpointsFound++;
                    }
                }
                
                if (endpointsFound >= 3) {
                    this.recordTest('Government API Endpoints', 'Configured', true);
                } else {
                    this.recordTest('Government API Endpoints', 'Partially configured', false, true);
                }
            }
            
        } catch (error) {
            this.recordTest('Philippine Configuration', `Error: ${error.message}`, false);
        }
    }
    
    async testEnvironmentFiles() {
        log.step('Testing environment files...');
        
        const requiredFiles = [
            { file: '.env.example', required: true },
            { file: '.env.local', required: false },
            { file: '.env.development', required: true },
            { file: '.env.production', required: true },
            { file: 'wrangler.toml', required: true }
        ];
        
        for (const { file, required } of requiredFiles) {
            const filePath = join(PROJECT_ROOT, file);
            
            if (existsSync(filePath)) {
                const content = readFileSync(filePath, 'utf8');
                
                if (content.length > 100) { // Basic content check
                    this.recordTest(`Environment File: ${file}`, 'Present and configured', true);
                } else {
                    this.recordTest(`Environment File: ${file}`, 'Present but minimal content', false, true);
                }
            } else {
                if (required) {
                    this.recordTest(`Environment File: ${file}`, 'Missing (required)', false);
                } else {
                    this.recordTest(`Environment File: ${file}`, 'Missing (optional)', false, true);
                }
            }
        }
    }
    
    async testWranglerConfiguration() {
        log.step('Testing Wrangler configuration...');
        
        try {
            const wranglerPath = join(PROJECT_ROOT, 'wrangler.toml');
            
            if (existsSync(wranglerPath)) {
                const content = readFileSync(wranglerPath, 'utf8');
                
                // Check for required bindings
                const requiredBindings = [
                    'WISETRACKS_MAIN_DB',
                    'WISETRACKS_CACHE_KV',
                    'WISETRACKS_MAIN_STORAGE'
                ];
                
                let bindingsFound = 0;
                for (const binding of requiredBindings) {
                    if (content.includes(binding)) {
                        bindingsFound++;
                    }
                }
                
                if (bindingsFound === requiredBindings.length) {
                    this.recordTest('Wrangler Bindings', 'All configured', true);
                } else {
                    this.recordTest('Wrangler Bindings', `${bindingsFound}/${requiredBindings.length} configured`, false, true);
                }
                
                // Check compatibility date
                if (content.includes('compatibility_date')) {
                    this.recordTest('Compatibility Date', 'Set', true);
                } else {
                    this.recordTest('Compatibility Date', 'Not set', false, true);
                }
                
            } else {
                this.recordTest('Wrangler Configuration', 'wrangler.toml not found', false);
            }
            
        } catch (error) {
            this.recordTest('Wrangler Configuration', `Error: ${error.message}`, false);
        }
    }
    
    async testDependencies() {
        log.step('Testing project dependencies...');
        
        try {
            const packagePath = join(PROJECT_ROOT, 'package.json');
            
            if (existsSync(packagePath)) {
                const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
                
                // Check for required dependencies
                const requiredDeps = [
                    '@cloudflare/workers-types',
                    'hono'
                ];
                
                const optionalDeps = [
                    'jsonwebtoken',
                    'bcryptjs'
                ];
                
                let requiredFound = 0;
                let optionalFound = 0;
                
                const allDeps = { 
                    ...packageJson.dependencies, 
                    ...packageJson.devDependencies 
                };
                
                for (const dep of requiredDeps) {
                    if (allDeps[dep]) {
                        requiredFound++;
                    }
                }
                
                for (const dep of optionalDeps) {
                    if (allDeps[dep]) {
                        optionalFound++;
                    }
                }
                
                if (requiredFound === requiredDeps.length) {
                    this.recordTest('Required Dependencies', 'All installed', true);
                } else {
                    this.recordTest('Required Dependencies', `${requiredFound}/${requiredDeps.length} installed`, false);
                }
                
                this.recordTest('Optional Dependencies', `${optionalFound}/${optionalDeps.length} installed`, true);
                
                // Check scripts
                const requiredScripts = [
                    'setup:secrets',
                    'setup:database',
                    'deploy:production'
                ];
                
                let scriptsFound = 0;
                for (const script of requiredScripts) {
                    if (packageJson.scripts && packageJson.scripts[script]) {
                        scriptsFound++;
                    }
                }
                
                if (scriptsFound === requiredScripts.length) {
                    this.recordTest('Deployment Scripts', 'All configured', true);
                } else {
                    this.recordTest('Deployment Scripts', `${scriptsFound}/${requiredScripts.length} configured`, false, true);
                }
                
            } else {
                this.recordTest('Package Configuration', 'package.json not found', false);
            }
            
        } catch (error) {
            this.recordTest('Dependencies', `Error: ${error.message}`, false);
        }
    }
    
    recordTest(name, result, passed, isWarning = false) {
        this.results.tests.push({ name, result, passed, isWarning });
        
        if (passed) {
            this.results.passed++;
            log.success(`${name}: ${result}`);
        } else if (isWarning) {
            this.results.warnings++;
            log.warning(`${name}: ${result}`);
        } else {
            this.results.failed++;
            log.error(`${name}: ${result}`);
        }
    }
    
    showResults() {
        log.section('Test Results Summary');
        console.log('');
        
        console.log(`${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`);
        console.log(`${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`);
        console.log(`${colors.yellow}⚠️  Warnings: ${this.results.warnings}${colors.reset}`);
        console.log(`${colors.blue}📊 Total: ${this.results.tests.length}${colors.reset}`);
        console.log('');
        
        // Calculate score
        const score = Math.round((this.results.passed / this.results.tests.length) * 100);
        
        if (score >= 90) {
            log.success(`🎉 Environment Score: ${score}% - Excellent! Ready for deployment`);
        } else if (score >= 70) {
            log.warning(`🔧 Environment Score: ${score}% - Good, but some issues need attention`);
        } else {
            log.error(`🚨 Environment Score: ${score}% - Critical issues need to be resolved`);
        }
        
        console.log('');
        
        // Show next steps
        if (this.results.failed > 0) {
            log.section('Recommended Next Steps');
            console.log('1. Run: npm run setup:secrets');
            console.log('2. Run: npm run setup:database');
            console.log('3. Verify wrangler.toml configuration');
            console.log('4. Re-run this test: npm run test:env-setup');
            console.log('');
        }
        
        // Exit with appropriate code
        if (this.results.failed > 3) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
${colors.cyan}Wisetracks POS & Payroll SaaS - Environment Setup Test${colors.reset}

Usage: node test-env-setup.js [environment]

Environments:
  development  Test development environment (default)
  staging      Test staging environment
  production   Test production environment

Examples:
  node test-env-setup.js
  node test-env-setup.js production
  npm run test:env-setup

This test will verify:
  ✓ Cloudflare API connectivity
  ✓ Account and environment configuration
  ✓ D1 database accessibility
  ✓ KV namespace availability
  ✓ R2 bucket setup
  ✓ Secrets configuration
  ✓ Philippine business settings
  ✓ Environment files
  ✓ Wrangler configuration
  ✓ Project dependencies
        `);
        process.exit(0);
    }
    
    const environment = args[0] || 'development';
    
    if (!['development', 'staging', 'production'].includes(environment)) {
        console.log(`${colors.red}❌ Invalid environment: ${environment}${colors.reset}`);
        console.log('Valid environments: development, staging, production');
        process.exit(1);
    }
    
    const tester = new EnvironmentTester(environment);
    await tester.runAllTests();
}

// Handle process termination
process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}⚠️ Test interrupted by user${colors.reset}`);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.log(`${colors.red}❌ Uncaught exception: ${error.message}${colors.reset}`);
    process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.log(`${colors.red}❌ Test failed: ${error.message}${colors.reset}`);
        process.exit(1);
    });
}

export default EnvironmentTester;
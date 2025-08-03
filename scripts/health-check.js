#!/usr/bin/env node

/**
 * =============================================================================
 * WISETRACKS POS & PAYROLL SAAS - HEALTH CHECK SCRIPT
 * =============================================================================
 * Comprehensive health check for deployed application
 * Last Updated: 2024-01-15
 */

import { execSync } from 'child_process';

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.cyan}🔍 ${msg}${colors.reset}`)
};

async function runHealthChecks() {
    const environment = process.argv[2] || 'production';
    
    log.section(`Health Check - ${environment.toUpperCase()}`);
    
    const checks = [
        {
            name: 'Worker Deployment Status',
            test: async () => {
                try {
                    const result = execSync('wrangler deployments list --latest', { encoding: 'utf8' });
                    return result.includes('Success');
                } catch (error) {
                    return false;
                }
            }
        },
        {
            name: 'Database Connectivity',
            test: async () => {
                try {
                    const dbName = `wisetracks_pos_payroll_${environment === 'production' ? 'prod' : environment}`;
                    execSync(`wrangler d1 execute ${dbName} --command "SELECT 1"`, { stdio: 'pipe' });
                    return true;
                } catch (error) {
                    return false;
                }
            }
        },
        {
            name: 'Secrets Configuration',
            test: async () => {
                try {
                    const secrets = execSync(`wrangler secret list --env ${environment}`, { encoding: 'utf8' });
                    return secrets.includes('JWT_SECRET');
                } catch (error) {
                    return false;
                }
            }
        }
    ];
    
    let passed = 0;
    
    for (const check of checks) {
        try {
            const result = await check.test();
            if (result) {
                log.success(check.name);
                passed++;
            } else {
                log.error(check.name);
            }
        } catch (error) {
            log.error(`${check.name} - ${error.message}`);
        }
    }
    
    log.section(`Health Check Results: ${passed}/${checks.length} passed`);
    
    if (passed === checks.length) {
        log.success('All health checks passed! 🎉');
        process.exit(0);
    } else {
        log.error('Some health checks failed');
        process.exit(1);
    }
}

runHealthChecks().catch(error => {
    log.error(`Health check failed: ${error.message}`);
    process.exit(1);
});
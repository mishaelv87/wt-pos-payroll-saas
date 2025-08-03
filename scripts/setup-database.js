#!/usr/bin/env node

/**
 * =============================================================================
 * WISETRACKS POS & PAYROLL SAAS - DATABASE SETUP SCRIPT
 * =============================================================================
 * Complete D1 database creation and configuration for all environments
 * This script creates databases, tables, indexes, and initial configuration
 * Last Updated: 2024-01-15
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
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
    section: (msg) => console.log(`\n${colors.cyan}📋 ${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.magenta}  → ${msg}${colors.reset}`)
};

// Configuration
const config = {
    environments: {
        development: {
            name: 'wisetracks_pos_payroll_dev',
            auditName: 'wisetracks_audit_dev'
        },
        staging: {
            name: 'wisetracks_pos_payroll_staging',
            auditName: 'wisetracks_audit_staging'
        },
        production: {
            name: 'wisetracks_pos_payroll_prod',
            auditName: 'wisetracks_audit_prod'
        }
    },
    tables: {
        // Core POS Tables
        users: `
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'cashier',
                branch_id TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                phone TEXT,
                address TEXT,
                emergency_contact TEXT,
                hire_date DATE,
                avatar_url TEXT,
                permissions TEXT, -- JSON array of permissions
                last_login_at DATETIME,
                password_changed_at DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                deleted_at DATETIME
            );
        `,
        
        branches: `
            CREATE TABLE IF NOT EXISTS branches (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                code TEXT UNIQUE NOT NULL,
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                province TEXT NOT NULL,
                postal_code TEXT,
                phone TEXT,
                email TEXT,
                manager_id TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                business_hours TEXT, -- JSON object with hours
                timezone TEXT NOT NULL DEFAULT 'Asia/Manila',
                tax_settings TEXT, -- JSON object with tax configuration
                pos_settings TEXT, -- JSON object with POS-specific settings
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (manager_id) REFERENCES users(id)
            );
        `,
        
        categories: `
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                parent_id TEXT,
                sort_order INTEGER DEFAULT 0,
                color TEXT,
                icon TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES categories(id)
            );
        `,
        
        products: `
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                sku TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                category_id TEXT,
                brand TEXT,
                unit_type TEXT NOT NULL DEFAULT 'piece',
                cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                selling_price DECIMAL(10,2) NOT NULL,
                vat_rate DECIMAL(5,4) NOT NULL DEFAULT 0.12,
                is_vat_inclusive BOOLEAN NOT NULL DEFAULT true,
                barcode TEXT,
                image_url TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                is_service BOOLEAN NOT NULL DEFAULT false,
                track_inventory BOOLEAN NOT NULL DEFAULT true,
                min_stock_level INTEGER DEFAULT 0,
                max_stock_level INTEGER,
                reorder_point INTEGER,
                supplier_info TEXT, -- JSON object
                nutrition_info TEXT, -- JSON object for food items
                allergen_info TEXT, -- JSON array
                tags TEXT, -- JSON array
                custom_fields TEXT, -- JSON object
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                deleted_at DATETIME,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            );
        `,
        
        inventory: `
            CREATE TABLE IF NOT EXISTS inventory (
                id TEXT PRIMARY KEY,
                product_id TEXT NOT NULL,
                branch_id TEXT NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0,
                reserved_quantity INTEGER NOT NULL DEFAULT 0,
                available_quantity INTEGER GENERATED ALWAYS AS (quantity - reserved_quantity) VIRTUAL,
                last_restocked_at DATETIME,
                last_counted_at DATETIME,
                cost_per_unit DECIMAL(10,2),
                batch_number TEXT,
                expiry_date DATE,
                location TEXT,
                notes TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (branch_id) REFERENCES branches(id),
                UNIQUE(product_id, branch_id, batch_number)
            );
        `,
        
        customers: `
            CREATE TABLE IF NOT EXISTS customers (
                id TEXT PRIMARY KEY,
                customer_number TEXT UNIQUE,
                first_name TEXT,
                last_name TEXT,
                company_name TEXT,
                email TEXT,
                phone TEXT,
                address TEXT,
                city TEXT,
                province TEXT,
                postal_code TEXT,
                birth_date DATE,
                gender TEXT,
                customer_type TEXT NOT NULL DEFAULT 'regular', -- regular, vip, corporate
                loyalty_points INTEGER NOT NULL DEFAULT 0,
                discount_rate DECIMAL(5,2) DEFAULT 0.00,
                credit_limit DECIMAL(10,2) DEFAULT 0.00,
                payment_terms INTEGER DEFAULT 0, -- days
                tax_exempt BOOLEAN NOT NULL DEFAULT false,
                tin TEXT,
                notes TEXT,
                preferences TEXT, -- JSON object
                status TEXT NOT NULL DEFAULT 'active',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                deleted_at DATETIME
            );
        `,
        
        orders: `
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                order_number TEXT UNIQUE NOT NULL,
                branch_id TEXT NOT NULL,
                cashier_id TEXT NOT NULL,
                customer_id TEXT,
                order_type TEXT NOT NULL DEFAULT 'pos', -- pos, online, phone
                status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, cancelled, refunded
                subtotal DECIMAL(10,2) NOT NULL,
                discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                discount_type TEXT, -- percentage, fixed, loyalty
                tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                service_charge DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                total_amount DECIMAL(10,2) NOT NULL,
                paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                change_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, partial, refunded
                payment_method TEXT, -- cash, card, gcash, maya, etc.
                reference_number TEXT,
                notes TEXT,
                customer_count INTEGER DEFAULT 1,
                table_number TEXT,
                order_source TEXT, -- pos, mobile, web
                delivery_info TEXT, -- JSON object
                special_instructions TEXT,
                loyalty_points_earned INTEGER DEFAULT 0,
                loyalty_points_redeemed INTEGER DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                cancelled_at DATETIME,
                FOREIGN KEY (branch_id) REFERENCES branches(id),
                FOREIGN KEY (cashier_id) REFERENCES users(id),
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            );
        `,
        
        order_items: `
            CREATE TABLE IF NOT EXISTS order_items (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL,
                product_id TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                cost_price DECIMAL(10,2),
                discount_amount DECIMAL(10,2) DEFAULT 0.00,
                tax_amount DECIMAL(10,2) DEFAULT 0.00,
                modifiers TEXT, -- JSON array of modifiers
                special_instructions TEXT,
                status TEXT NOT NULL DEFAULT 'pending', -- pending, preparing, ready, served
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id)
            );
        `,
        
        payments: `
            CREATE TABLE IF NOT EXISTS payments (
                id TEXT PRIMARY KEY,
                order_id TEXT NOT NULL,
                payment_method TEXT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency TEXT NOT NULL DEFAULT 'PHP',
                status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
                reference_number TEXT,
                transaction_id TEXT,
                gateway_response TEXT, -- JSON object
                processed_at DATETIME,
                reconciled_at DATETIME,
                notes TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            );
        `,
        
        // Payroll Tables
        employees: `
            CREATE TABLE IF NOT EXISTS employees (
                id TEXT PRIMARY KEY,
                employee_number TEXT UNIQUE NOT NULL,
                user_id TEXT UNIQUE,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                middle_name TEXT,
                suffix TEXT,
                birth_date DATE NOT NULL,
                gender TEXT NOT NULL,
                civil_status TEXT NOT NULL,
                nationality TEXT NOT NULL DEFAULT 'Filipino',
                email TEXT,
                phone TEXT,
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                province TEXT NOT NULL,
                postal_code TEXT,
                emergency_contact_name TEXT NOT NULL,
                emergency_contact_phone TEXT NOT NULL,
                emergency_contact_relationship TEXT NOT NULL,
                
                -- Employment Information
                branch_id TEXT NOT NULL,
                department TEXT,
                position TEXT NOT NULL,
                employment_type TEXT NOT NULL, -- regular, contractual, probationary, part-time
                employment_status TEXT NOT NULL DEFAULT 'active', -- active, inactive, terminated, resigned
                hire_date DATE NOT NULL,
                regularization_date DATE,
                end_date DATE,
                
                -- Compensation
                basic_salary DECIMAL(10,2) NOT NULL,
                hourly_rate DECIMAL(8,2),
                daily_rate DECIMAL(8,2),
                pay_frequency TEXT NOT NULL DEFAULT 'semi-monthly', -- daily, weekly, bi-weekly, semi-monthly, monthly
                overtime_rate_multiplier DECIMAL(4,2) DEFAULT 1.25,
                
                -- Government Numbers
                sss_number TEXT,
                philhealth_number TEXT,
                pagibig_number TEXT,
                tin TEXT,
                
                -- Bank Information
                bank_name TEXT,
                bank_account_number TEXT,
                bank_account_name TEXT,
                
                -- Additional Information
                profile_picture_url TEXT,
                notes TEXT,
                custom_fields TEXT, -- JSON object
                
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                deleted_at DATETIME,
                
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (branch_id) REFERENCES branches(id)
            );
        `,
        
        time_logs: `
            CREATE TABLE IF NOT EXISTS time_logs (
                id TEXT PRIMARY KEY,
                employee_id TEXT NOT NULL,
                branch_id TEXT NOT NULL,
                log_date DATE NOT NULL,
                log_type TEXT NOT NULL, -- time_in, time_out, break_start, break_end
                timestamp DATETIME NOT NULL,
                location TEXT, -- GPS coordinates or location name
                device_info TEXT, -- JSON object with device information
                ip_address TEXT,
                notes TEXT,
                status TEXT NOT NULL DEFAULT 'valid', -- valid, invalid, disputed, corrected
                approved_by TEXT,
                approved_at DATETIME,
                correction_reason TEXT,
                original_timestamp DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(id),
                FOREIGN KEY (branch_id) REFERENCES branches(id),
                FOREIGN KEY (approved_by) REFERENCES users(id)
            );
        `,
        
        payroll_periods: `
            CREATE TABLE IF NOT EXISTS payroll_periods (
                id TEXT PRIMARY KEY,
                period_name TEXT NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                pay_date DATE NOT NULL,
                cutoff_type TEXT NOT NULL, -- semi-monthly, monthly, weekly
                status TEXT NOT NULL DEFAULT 'draft', -- draft, processing, completed, paid
                branch_id TEXT,
                created_by TEXT NOT NULL,
                approved_by TEXT,
                processed_at DATETIME,
                notes TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (branch_id) REFERENCES branches(id),
                FOREIGN KEY (created_by) REFERENCES users(id),
                FOREIGN KEY (approved_by) REFERENCES users(id)
            );
        `,
        
        payroll_records: `
            CREATE TABLE IF NOT EXISTS payroll_records (
                id TEXT PRIMARY KEY,
                employee_id TEXT NOT NULL,
                payroll_period_id TEXT NOT NULL,
                
                -- Basic Pay
                basic_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                days_worked INTEGER NOT NULL DEFAULT 0,
                hours_worked DECIMAL(8,2) NOT NULL DEFAULT 0.00,
                
                -- Overtime
                regular_overtime_hours DECIMAL(8,2) NOT NULL DEFAULT 0.00,
                regular_overtime_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                holiday_overtime_hours DECIMAL(8,2) NOT NULL DEFAULT 0.00,
                holiday_overtime_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                
                -- Holiday Pay
                regular_holiday_hours DECIMAL(8,2) NOT NULL DEFAULT 0.00,
                regular_holiday_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                special_holiday_hours DECIMAL(8,2) NOT NULL DEFAULT 0.00,
                special_holiday_pay DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                
                -- Allowances
                meal_allowance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                transportation_allowance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                communication_allowance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                other_allowances DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                
                -- Bonuses
                performance_bonus DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                commission DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                other_bonuses DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                
                -- Deductions - Government
                sss_employee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                sss_employer DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                philhealth_employee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                philhealth_employer DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                pagibig_employee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                pagibig_employer DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                withholding_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                
                -- Deductions - Company
                tardiness_deduction DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                absence_deduction DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                loan_deduction DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                cash_advance_deduction DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                other_deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                
                -- Totals
                gross_pay DECIMAL(10,2) GENERATED ALWAYS AS (
                    basic_pay + regular_overtime_pay + holiday_overtime_pay + 
                    regular_holiday_pay + special_holiday_pay + 
                    meal_allowance + transportation_allowance + communication_allowance + other_allowances +
                    performance_bonus + commission + other_bonuses
                ) VIRTUAL,
                total_deductions DECIMAL(10,2) GENERATED ALWAYS AS (
                    sss_employee + philhealth_employee + pagibig_employee + withholding_tax +
                    tardiness_deduction + absence_deduction + loan_deduction + cash_advance_deduction + other_deductions
                ) VIRTUAL,
                net_pay DECIMAL(10,2) GENERATED ALWAYS AS (
                    (basic_pay + regular_overtime_pay + holiday_overtime_pay + 
                     regular_holiday_pay + special_holiday_pay + 
                     meal_allowance + transportation_allowance + communication_allowance + other_allowances +
                     performance_bonus + commission + other_bonuses) -
                    (sss_employee + philhealth_employee + pagibig_employee + withholding_tax +
                     tardiness_deduction + absence_deduction + loan_deduction + cash_advance_deduction + other_deductions)
                ) VIRTUAL,
                
                status TEXT NOT NULL DEFAULT 'draft', -- draft, calculated, approved, paid
                calculated_at DATETIME,
                approved_by TEXT,
                approved_at DATETIME,
                paid_at DATETIME,
                notes TEXT,
                
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (employee_id) REFERENCES employees(id),
                FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id),
                FOREIGN KEY (approved_by) REFERENCES users(id),
                UNIQUE(employee_id, payroll_period_id)
            );
        `,
        
        // Settings and Configuration
        settings: `
            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                category TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT,
                value_type TEXT NOT NULL DEFAULT 'string', -- string, number, boolean, json
                description TEXT,
                is_public BOOLEAN NOT NULL DEFAULT false,
                is_encrypted BOOLEAN NOT NULL DEFAULT false,
                branch_id TEXT, -- NULL for global settings
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(category, key, branch_id),
                FOREIGN KEY (branch_id) REFERENCES branches(id)
            );
        `,
        
        // Audit Trail
        audit_logs: `
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                table_name TEXT NOT NULL,
                record_id TEXT NOT NULL,
                action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
                old_values TEXT, -- JSON
                new_values TEXT, -- JSON
                changed_fields TEXT, -- JSON array
                user_id TEXT,
                user_ip TEXT,
                user_agent TEXT,
                branch_id TEXT,
                timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (branch_id) REFERENCES branches(id)
            );
        `
    },
    
    indexes: [
        // Users indexes
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
        'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);',
        'CREATE INDEX IF NOT EXISTS idx_users_branch_id ON users(branch_id);',
        'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);',
        
        // Products indexes
        'CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);',
        'CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);',
        'CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);',
        'CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);',
        
        // Inventory indexes
        'CREATE INDEX IF NOT EXISTS idx_inventory_product_branch ON inventory(product_id, branch_id);',
        'CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);',
        'CREATE INDEX IF NOT EXISTS idx_inventory_expiry_date ON inventory(expiry_date);',
        
        // Orders indexes
        'CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);',
        'CREATE INDEX IF NOT EXISTS idx_orders_branch_id ON orders(branch_id);',
        'CREATE INDEX IF NOT EXISTS idx_orders_cashier_id ON orders(cashier_id);',
        'CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);',
        'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);',
        'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);',
        'CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);',
        
        // Order items indexes
        'CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);',
        'CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);',
        
        // Employees indexes
        'CREATE INDEX IF NOT EXISTS idx_employees_employee_number ON employees(employee_number);',
        'CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON employees(branch_id);',
        'CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);',
        'CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);',
        
        // Time logs indexes
        'CREATE INDEX IF NOT EXISTS idx_time_logs_employee_date ON time_logs(employee_id, log_date);',
        'CREATE INDEX IF NOT EXISTS idx_time_logs_branch_date ON time_logs(branch_id, log_date);',
        'CREATE INDEX IF NOT EXISTS idx_time_logs_timestamp ON time_logs(timestamp);',
        
        // Payroll indexes
        'CREATE INDEX IF NOT EXISTS idx_payroll_records_employee_period ON payroll_records(employee_id, payroll_period_id);',
        'CREATE INDEX IF NOT EXISTS idx_payroll_periods_dates ON payroll_periods(start_date, end_date);',
        
        // Audit logs indexes
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);'
    ],
    
    initialData: {
        // Default settings
        settings: [
            {
                category: 'system',
                key: 'app_name',
                value: 'Wisetracks POS & Payroll SaaS',
                description: 'Application name'
            },
            {
                category: 'system',
                key: 'timezone',
                value: 'Asia/Manila',
                description: 'Default timezone'
            },
            {
                category: 'system',
                key: 'currency',
                value: 'PHP',
                description: 'Default currency'
            },
            {
                category: 'pos',
                key: 'receipt_footer',
                value: 'Thank you for your business!',
                description: 'Receipt footer message'
            },
            {
                category: 'pos',
                key: 'auto_print_receipt',
                value: 'true',
                value_type: 'boolean',
                description: 'Automatically print receipt after order'
            },
            {
                category: 'payroll',
                key: 'pay_frequency',
                value: 'semi-monthly',
                description: 'Default pay frequency'
            },
            {
                category: 'tax',
                key: 'vat_rate',
                value: '0.12',
                value_type: 'number',
                description: 'VAT rate (12%)'
            },
            {
                category: 'tax',
                key: 'vat_inclusive',
                value: 'true',
                value_type: 'boolean',
                description: 'VAT inclusive pricing by default'
            }
        ],
        
        // Default categories
        categories: [
            {
                id: 'cat_food',
                name: 'Food',
                description: 'Food items',
                color: '#FF6B6B',
                icon: 'utensils'
            },
            {
                id: 'cat_beverages',
                name: 'Beverages',
                description: 'Drinks and beverages',
                color: '#4ECDC4',
                icon: 'coffee'
            },
            {
                id: 'cat_pastries',
                name: 'Pastries',
                description: 'Baked goods and pastries',
                color: '#45B7D1',
                icon: 'bread-slice'
            },
            {
                id: 'cat_services',
                name: 'Services',
                description: 'Service items',
                color: '#96CEB4',
                icon: 'tools'
            }
        ]
    }
};

class DatabaseSetup {
    constructor(environment = 'development') {
        this.environment = environment;
        this.dbConfig = config.environments[environment];
        
        if (!this.dbConfig) {
            throw new Error(`Invalid environment: ${environment}`);
        }
        
        log.section(`Database Setup for ${environment.toUpperCase()} Environment`);
        log.info(`Main Database: ${this.dbConfig.name}`);
        log.info(`Audit Database: ${this.dbConfig.auditName}`);
    }
    
    async run() {
        try {
            log.section('Starting Database Setup Process');
            
            await this.checkPrerequisites();
            await this.createDatabases();
            await this.createTables();
            await this.createIndexes();
            await this.insertInitialData();
            await this.updateWranglerConfig();
            await this.verifySetup();
            
            log.section('Database Setup Completed Successfully');
            this.showNextSteps();
            
        } catch (error) {
            log.error(`Database setup failed: ${error.message}`);
            process.exit(1);
        }
    }
    
    async checkPrerequisites() {
        log.step('Checking prerequisites...');
        
        try {
            execSync('wrangler --version', { stdio: 'pipe' });
            log.success('Wrangler CLI found');
        } catch (error) {
            throw new Error('Wrangler CLI not found. Please install with: npm install -g wrangler');
        }
        
        try {
            execSync('wrangler whoami', { stdio: 'pipe' });
            log.success('Authenticated with Cloudflare');
        } catch (error) {
            throw new Error('Not authenticated with Cloudflare. Please run: wrangler login');
        }
    }
    
    async createDatabases() {
        log.step('Creating D1 databases...');
        
        // Create main database
        try {
            const result = execSync(`wrangler d1 create ${this.dbConfig.name}`, { encoding: 'utf8' });
            log.success(`Main database created: ${this.dbConfig.name}`);
            
            // Extract database ID from output
            const idMatch = result.match(/database_id = "([^"]+)"/);
            if (idMatch) {
                this.mainDbId = idMatch[1];
                log.info(`Database ID: ${this.mainDbId}`);
            }
        } catch (error) {
            if (error.message.includes('already exists')) {
                log.warning(`Database ${this.dbConfig.name} already exists`);
            } else {
                throw error;
            }
        }
        
        // Create audit database
        try {
            const result = execSync(`wrangler d1 create ${this.dbConfig.auditName}`, { encoding: 'utf8' });
            log.success(`Audit database created: ${this.dbConfig.auditName}`);
            
            // Extract database ID from output
            const idMatch = result.match(/database_id = "([^"]+)"/);
            if (idMatch) {
                this.auditDbId = idMatch[1];
                log.info(`Audit Database ID: ${this.auditDbId}`);
            }
        } catch (error) {
            if (error.message.includes('already exists')) {
                log.warning(`Database ${this.dbConfig.auditName} already exists`);
            } else {
                throw error;
            }
        }
    }
    
    async createTables() {
        log.step('Creating database tables...');
        
        for (const [tableName, sql] of Object.entries(config.tables)) {
            try {
                if (tableName === 'audit_logs') {
                    // Create audit table in audit database
                    execSync(`wrangler d1 execute ${this.dbConfig.auditName} --command "${sql.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
                } else {
                    // Create regular tables in main database
                    execSync(`wrangler d1 execute ${this.dbConfig.name} --command "${sql.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
                }
                log.success(`Table created: ${tableName}`);
            } catch (error) {
                log.error(`Failed to create table ${tableName}: ${error.message}`);
                throw error;
            }
        }
    }
    
    async createIndexes() {
        log.step('Creating database indexes...');
        
        for (const indexSql of config.indexes) {
            try {
                execSync(`wrangler d1 execute ${this.dbConfig.name} --command "${indexSql.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
            } catch (error) {
                log.warning(`Index creation warning: ${error.message}`);
            }
        }
        
        log.success('Database indexes created');
    }
    
    async insertInitialData() {
        log.step('Inserting initial data...');
        
        // Insert settings
        for (const setting of config.initialData.settings) {
            const sql = `INSERT OR IGNORE INTO settings (id, category, key, value, value_type, description, is_public) 
                        VALUES ('${setting.category}_${setting.key}', '${setting.category}', '${setting.key}', 
                               '${setting.value}', '${setting.value_type || 'string'}', '${setting.description}', 
                               ${setting.is_public ? 'true' : 'false'})`;
            
            try {
                execSync(`wrangler d1 execute ${this.dbConfig.name} --command "${sql.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
            } catch (error) {
                log.warning(`Setting insertion warning: ${error.message}`);
            }
        }
        
        // Insert categories
        for (const category of config.initialData.categories) {
            const sql = `INSERT OR IGNORE INTO categories (id, name, description, color, icon) 
                        VALUES ('${category.id}', '${category.name}', '${category.description}', 
                               '${category.color}', '${category.icon}')`;
            
            try {
                execSync(`wrangler d1 execute ${this.dbConfig.name} --command "${sql.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
            } catch (error) {
                log.warning(`Category insertion warning: ${error.message}`);
            }
        }
        
        log.success('Initial data inserted');
    }
    
    async updateWranglerConfig() {
        log.step('Updating wrangler.toml configuration...');
        
        const wranglerPath = join(PROJECT_ROOT, 'wrangler.toml');
        
        if (!existsSync(wranglerPath)) {
            log.warning('wrangler.toml not found, skipping configuration update');
            return;
        }
        
        try {
            let content = readFileSync(wranglerPath, 'utf8');
            
            // Update database IDs if we have them
            if (this.mainDbId) {
                const envSection = `[env.${this.environment}]`;
                const dbSection = `[[env.${this.environment}.d1_databases]]`;
                
                if (content.includes(envSection)) {
                    // Update existing environment section
                    const dbBinding = `${dbSection}\nbinding = "DB"\ndatabase_name = "${this.dbConfig.name}"\ndatabase_id = "${this.mainDbId}"`;
                    
                    if (!content.includes(dbSection)) {
                        content = content.replace(envSection, `${envSection}\n\n${dbBinding}`);
                    }
                }
            }
            
            writeFileSync(wranglerPath, content);
            log.success('wrangler.toml updated with database configuration');
        } catch (error) {
            log.warning(`Failed to update wrangler.toml: ${error.message}`);
        }
    }
    
    async verifySetup() {
        log.step('Verifying database setup...');
        
        try {
            // Test main database
            const tablesResult = execSync(`wrangler d1 execute ${this.dbConfig.name} --command "SELECT name FROM sqlite_master WHERE type='table'"`, { encoding: 'utf8' });
            
            if (tablesResult.includes('users') && tablesResult.includes('products') && tablesResult.includes('orders')) {
                log.success('Main database verification passed');
            } else {
                throw new Error('Main database verification failed - missing tables');
            }
            
            // Test audit database
            const auditResult = execSync(`wrangler d1 execute ${this.dbConfig.auditName} --command "SELECT name FROM sqlite_master WHERE type='table'"`, { encoding: 'utf8' });
            
            if (auditResult.includes('audit_logs')) {
                log.success('Audit database verification passed');
            } else {
                throw new Error('Audit database verification failed - missing audit_logs table');
            }
            
        } catch (error) {
            throw new Error(`Database verification failed: ${error.message}`);
        }
    }
    
    showNextSteps() {
        log.section('Next Steps');
        console.log('');
        console.log('1. Update your environment variables:');
        console.log(`   ${colors.cyan}D1_DATABASE_NAME=${this.dbConfig.name}${colors.reset}`);
        if (this.mainDbId) {
            console.log(`   ${colors.cyan}D1_DATABASE_ID=${this.mainDbId}${colors.reset}`);
        }
        console.log('');
        console.log('2. Run database migrations:');
        console.log(`   ${colors.cyan}npm run migrate:${this.environment}${colors.reset}`);
        console.log('');
        console.log('3. Seed the database with sample data:');
        console.log(`   ${colors.cyan}npm run seed:${this.environment}${colors.reset}`);
        console.log('');
        console.log('4. Test database connectivity:');
        console.log(`   ${colors.cyan}npm run test:database${colors.reset}`);
        console.log('');
        console.log('5. Deploy your application:');
        console.log(`   ${colors.cyan}npm run deploy:${this.environment}${colors.reset}`);
        console.log('');
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
${colors.cyan}Wisetracks POS & Payroll SaaS - Database Setup${colors.reset}

Usage: node setup-database.js [environment]

Environments:
  development  Set up development database (default)
  staging      Set up staging database  
  production   Set up production database

Examples:
  node setup-database.js
  node setup-database.js staging
  node setup-database.js production

This script will:
  ✓ Create D1 databases for main and audit data
  ✓ Create all required tables with proper relationships
  ✓ Create indexes for optimal performance
  ✓ Insert initial configuration data
  ✓ Update wrangler.toml configuration
  ✓ Verify the setup was successful
        `);
        process.exit(0);
    }
    
    const environment = args[0] || 'development';
    
    if (!['development', 'staging', 'production'].includes(environment)) {
        log.error(`Invalid environment: ${environment}`);
        log.info('Valid environments: development, staging, production');
        process.exit(1);
    }
    
    const setup = new DatabaseSetup(environment);
    await setup.run();
}

// Handle process termination
process.on('SIGINT', () => {
    log.warning('Process interrupted by user');
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    log.error(`Uncaught exception: ${error.message}`);
    process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        log.error(`Setup failed: ${error.message}`);
        process.exit(1);
    });
}

export default DatabaseSetup;
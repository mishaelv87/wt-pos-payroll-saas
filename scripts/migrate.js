// Database Migration Script for CBTB POS System
import { D1Database } from '@cloudflare/workers-types';

const MIGRATIONS = [
  {
    name: '001_create_orders_table',
    up: `
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT NOT NULL UNIQUE,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        vat REAL NOT NULL,
        total REAL NOT NULL,
        staff_id TEXT NOT NULL,
        branch TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'completed',
        payment_method TEXT,
        customer_info TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch);
      CREATE INDEX IF NOT EXISTS idx_orders_staff_id ON orders(staff_id);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `
  },
  {
    name: '002_create_staff_table',
    up: `
      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        staff_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        branch TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_staff_branch ON staff(branch);
      CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
      CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
    `
  },
  {
    name: '003_create_time_logs_table',
    up: `
      CREATE TABLE IF NOT EXISTS time_logs (
        id TEXT PRIMARY KEY,
        staff_id TEXT NOT NULL,
        type TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        branch TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_time_logs_staff_id ON time_logs(staff_id);
      CREATE INDEX IF NOT EXISTS idx_time_logs_timestamp ON time_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_time_logs_branch ON time_logs(branch);
      CREATE INDEX IF NOT EXISTS idx_time_logs_type ON time_logs(type);
    `
  },
  {
    name: '004_create_inventory_table',
    up: `
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        min_quantity INTEGER NOT NULL DEFAULT 0,
        unit TEXT NOT NULL,
        price REAL NOT NULL,
        cost REAL NOT NULL,
        branch TEXT NOT NULL,
        expiry_date TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_inventory_branch ON inventory(branch);
      CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
      CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
      CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory(expiry_date);
    `
  },
  {
    name: '005_create_products_table',
    up: `
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        cost REAL NOT NULL,
        description TEXT,
        image_url TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    `
  },
  {
    name: '006_create_branches_table',
    up: `
      CREATE TABLE IF NOT EXISTS branches (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        address TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        manager_id TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(code);
      CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);
    `
  },
  {
    name: '007_create_settings_table',
    up: `
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'string',
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
    `
  },
  {
    name: '008_create_audit_logs_table',
    up: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id TEXT,
        old_values TEXT,
        new_values TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    `
  }
];

// Seed data
const SEED_DATA = [
  {
    name: 'seed_branches',
    up: `
      INSERT OR IGNORE INTO branches (id, name, code, address, phone, email, status, created_at, updated_at) VALUES
      ('branch-001', 'Vito Cruz Taft', 'vito-cruz', 'Vito Cruz, Taft Avenue, Manila', '+63 2 1234 5678', 'vito.cruz@cbtb.com', 'active', datetime('now'), datetime('now')),
      ('branch-002', 'Sterling Makati', 'sterling-makati', 'Sterling Building, Makati City', '+63 2 8765 4321', 'sterling.makati@cbtb.com', 'active', datetime('now'), datetime('now'));
    `
  },
  {
    name: 'seed_staff',
    up: `
      INSERT OR IGNORE INTO staff (id, staff_id, name, position, branch, email, phone, status, created_at, updated_at) VALUES
      ('staff-001', 'maria.santos', 'Maria Santos', 'Cashier', 'vito-cruz', 'maria.santos@cbtb.com', '+63 912 345 6789', 'active', datetime('now'), datetime('now')),
      ('staff-002', 'juan.dela.cruz', 'Juan Dela Cruz', 'Baker', 'vito-cruz', 'juan.delacruz@cbtb.com', '+63 923 456 7890', 'active', datetime('now'), datetime('now')),
      ('staff-003', 'ana.garcia', 'Ana Garcia', 'Manager', 'sterling-makati', 'ana.garcia@cbtb.com', '+63 934 567 8901', 'active', datetime('now'), datetime('now'));
    `
  },
  {
    name: 'seed_products',
    up: `
      INSERT OR IGNORE INTO products (id, name, category, price, cost, description, status, created_at, updated_at) VALUES
      ('prod-001', 'BB Bucket', 'buckets', 128.00, 80.00, '6 pcs • Choco Chip only', 'active', datetime('now'), datetime('now')),
      ('prod-002', 'Regular', 'buckets', 198.00, 120.00, '10 pcs • Single flavor', 'active', datetime('now'), datetime('now')),
      ('prod-003', 'Large', 'buckets', 308.00, 180.00, '16 pcs • Single flavor', 'active', datetime('now'), datetime('now')),
      ('prod-004', 'Giant', 'buckets', 418.00, 250.00, '22 pcs • Assorted', 'active', datetime('now'), datetime('now')),
      ('prod-005', 'Reusable Giant', 'buckets', 528.00, 320.00, '24 pcs • Assorted', 'active', datetime('now'), datetime('now')),
      ('prod-006', 'Reusable Monster', 'buckets', 1078.00, 650.00, '50 pcs • Assorted', 'active', datetime('now'), datetime('now')),
      ('prod-007', 'Bottled Water', 'addons', 35.00, 15.00, '500ml bottled water', 'active', datetime('now'), datetime('now')),
      ('prod-008', 'Cookie Bouquet', 'addons', 580.00, 350.00, 'Beautiful cookie arrangement', 'active', datetime('now'), datetime('now'));
    `
  },
  {
    name: 'seed_inventory',
    up: `
      INSERT OR IGNORE INTO inventory (id, name, category, quantity, min_quantity, unit, price, cost, branch, status, created_at, updated_at) VALUES
      ('inv-001', 'Chocolate Chip Batter', 'batter', 2500, 500, 'g', 0.00, 0.00, 'vito-cruz', 'active', datetime('now'), datetime('now')),
      ('inv-002', 'BB Buckets', 'packaging', 87, 20, 'pcs', 0.00, 0.00, 'vito-cruz', 'active', datetime('now'), datetime('now')),
      ('inv-003', 'Regular Buckets', 'packaging', 94, 20, 'pcs', 0.00, 0.00, 'vito-cruz', 'active', datetime('now'), datetime('now')),
      ('inv-004', 'Large Buckets', 'packaging', 78, 15, 'pcs', 0.00, 0.00, 'vito-cruz', 'active', datetime('now'), datetime('now')),
      ('inv-005', 'Giant Buckets', 'packaging', 65, 10, 'pcs', 0.00, 0.00, 'vito-cruz', 'active', datetime('now'), datetime('now')),
      ('inv-006', 'Reusable Buckets', 'packaging', 23, 5, 'pcs', 0.00, 0.00, 'vito-cruz', 'active', datetime('now'), datetime('now')),
      ('inv-007', 'Paper Bags', 'packaging', 12, 10, 'pcs', 0.00, 0.00, 'vito-cruz', 'active', datetime('now'), datetime('now')),
      ('inv-008', 'Bottled Water', 'beverages', 50, 10, 'pcs', 35.00, 15.00, 'vito-cruz', 'active', datetime('now'), datetime('now'));
    `
  },
  {
    name: 'seed_settings',
    up: `
      INSERT OR IGNORE INTO settings (id, key, value, type, description, created_at, updated_at) VALUES
      ('setting-001', 'company_name', 'CBTB POS', 'string', 'Company name', datetime('now'), datetime('now')),
      ('setting-002', 'currency', 'PHP', 'string', 'Default currency', datetime('now'), datetime('now')),
      ('setting-003', 'vat_rate', '0.12', 'number', 'VAT rate (12%)', datetime('now'), datetime('now')),
      ('setting-004', 'senior_discount', '0.20', 'number', 'Senior/PWD discount rate', datetime('now'), datetime('now')),
      ('setting-005', 'timezone', 'Asia/Manila', 'string', 'Default timezone', datetime('now'), datetime('now')),
      ('setting-006', 'receipt_footer', 'Thank you for your purchase!', 'string', 'Receipt footer message', datetime('now'), datetime('now'));
    `
  }
];

export async function runMigrations(db) {
  console.log('Starting database migrations...');
  
  try {
    // Create migrations table if it doesn't exist
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at TEXT NOT NULL
      )
    `).run();
    
    // Get executed migrations
    const executedMigrations = await db.prepare('SELECT name FROM migrations').all();
    const executedNames = executedMigrations.results.map(m => m.name);
    
    // Run pending migrations
    for (const migration of MIGRATIONS) {
      if (!executedNames.includes(migration.name)) {
        console.log(`Running migration: ${migration.name}`);
        
        await db.prepare(migration.up).run();
        await db.prepare('INSERT INTO migrations (name, executed_at) VALUES (?, ?)')
          .bind(migration.name, new Date().toISOString())
          .run();
        
        console.log(`✓ Migration ${migration.name} completed`);
      }
    }
    
    // Run seed data
    console.log('Running seed data...');
    for (const seed of SEED_DATA) {
      console.log(`Seeding: ${seed.name}`);
      await db.prepare(seed.up).run();
      console.log(`✓ Seed ${seed.name} completed`);
    }
    
    console.log('✓ All migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

export async function resetDatabase(db) {
  console.log('Resetting database...');
  
  try {
    // Drop all tables
    const tables = [
      'orders', 'staff', 'time_logs', 'inventory', 
      'products', 'branches', 'settings', 'audit_logs', 'migrations'
    ];
    
    for (const table of tables) {
      await db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
    }
    
    console.log('✓ Database reset completed');
    return true;
  } catch (error) {
    console.error('Database reset failed:', error);
    return false;
  }
}

export async function getMigrationStatus(db) {
  try {
    const migrations = await db.prepare('SELECT * FROM migrations ORDER BY executed_at').all();
    return migrations.results;
  } catch (error) {
    console.error('Failed to get migration status:', error);
    return [];
  }
}

// CLI support
if (typeof process !== 'undefined' && process.argv) {
  const command = process.argv[2];
  
  if (command === 'migrate') {
    // This would be called from the CLI
    console.log('Migration script called');
  } else if (command === 'reset') {
    console.log('Reset script called');
  } else if (command === 'status') {
    console.log('Status script called');
  }
} 
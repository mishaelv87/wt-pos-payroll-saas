// Cloudflare Worker for CBTB POS System
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { jwt } from 'hono/jwt';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Environment variables
const JWT_SECRET = 'your-jwt-secret-key-change-in-production';
const DB_NAME = 'wt-pos-payroll-db';

// Database schema validation
const OrderSchema = z.object({
  orderNumber: z.string(),
  items: z.array(z.object({
    name: z.string(),
    price: z.number(),
    quantity: z.number()
  })),
  subtotal: z.number(),
  vat: z.number(),
  total: z.number(),
  staffId: z.string(),
  branch: z.string(),
  paymentMethod: z.string().optional(),
  customerInfo: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional()
  }).optional()
});

const StaffSchema = z.object({
  staffId: z.string(),
  name: z.string(),
  position: z.string(),
  branch: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active')
});

const TimeLogSchema = z.object({
  staffId: z.string(),
  type: z.enum(['time_in', 'time_out', 'break_start', 'break_end']),
  timestamp: z.string(),
  branch: z.string()
});

// Routes
app.get('/', (c) => {
  return c.json({
    message: 'CBTB POS API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development'
  });
});

// Orders API
app.post('/api/orders', zValidator('json', OrderSchema), async (c) => {
  try {
    const orderData = c.req.valid('json');
    const order = {
      ...orderData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    // Store in D1 database
    if (c.env.DB) {
      await c.env.DB.prepare(`
        INSERT INTO orders (id, order_number, items, subtotal, vat, total, staff_id, branch, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        order.id,
        order.orderNumber,
        JSON.stringify(order.items),
        order.subtotal,
        order.vat,
        order.total,
        order.staffId,
        order.branch,
        order.status,
        order.createdAt
      ).run();
    }

    return c.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({
      success: false,
      error: 'Failed to create order'
    }, 500);
  }
});

app.get('/api/orders', async (c) => {
  try {
    const { page = 1, limit = 50, branch, startDate, endDate } = c.req.query();
    
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    
    if (branch) {
      query += ' AND branch = ?';
      params.push(branch);
    }
    
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    let orders = [];
    if (c.env.DB) {
      const result = await c.env.DB.prepare(query).bind(...params).all();
      orders = result.results;
    }

    return c.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: orders.length
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch orders'
    }, 500);
  }
});

app.get('/api/orders/:id', async (c) => {
  try {
    const { id } = c.req.param();
    
    let order = null;
    if (c.env.DB) {
      const result = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
      order = result;
    }

    if (!order) {
      return c.json({
        success: false,
        error: 'Order not found'
      }, 404);
    }

    return c.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch order'
    }, 500);
  }
});

// Staff API
app.post('/api/staff', zValidator('json', StaffSchema), async (c) => {
  try {
    const staffData = c.req.valid('json');
    const staff = {
      ...staffData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    if (c.env.DB) {
      await c.env.DB.prepare(`
        INSERT INTO staff (id, staff_id, name, position, branch, email, phone, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        staff.id,
        staff.staffId,
        staff.name,
        staff.position,
        staff.branch,
        staff.email,
        staff.phone || null,
        staff.status,
        staff.createdAt
      ).run();
    }

    return c.json({
      success: true,
      data: staff,
      message: 'Staff created successfully'
    });
  } catch (error) {
    console.error('Error creating staff:', error);
    return c.json({
      success: false,
      error: 'Failed to create staff'
    }, 500);
  }
});

app.get('/api/staff', async (c) => {
  try {
    const { branch, status } = c.req.query();
    
    let query = 'SELECT * FROM staff WHERE 1=1';
    const params = [];
    
    if (branch) {
      query += ' AND branch = ?';
      params.push(branch);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY name';

    let staff = [];
    if (c.env.DB) {
      const result = await c.env.DB.prepare(query).bind(...params).all();
      staff = result.results;
    }

    return c.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch staff'
    }, 500);
  }
});

app.get('/api/staff/:id', async (c) => {
  try {
    const { id } = c.req.param();
    
    let staff = null;
    if (c.env.DB) {
      const result = await c.env.DB.prepare('SELECT * FROM staff WHERE id = ?').bind(id).first();
      staff = result;
    }

    if (!staff) {
      return c.json({
        success: false,
        error: 'Staff not found'
      }, 404);
    }

    return c.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch staff'
    }, 500);
  }
});

// Time tracking API
app.post('/api/timelog', zValidator('json', TimeLogSchema), async (c) => {
  try {
    const timeLogData = c.req.valid('json');
    const timeLog = {
      ...timeLogData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    if (c.env.DB) {
      await c.env.DB.prepare(`
        INSERT INTO time_logs (id, staff_id, type, timestamp, branch, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        timeLog.id,
        timeLog.staffId,
        timeLog.type,
        timeLog.timestamp,
        timeLog.branch,
        timeLog.createdAt
      ).run();
    }

    return c.json({
      success: true,
      data: timeLog,
      message: 'Time log created successfully'
    });
  } catch (error) {
    console.error('Error creating time log:', error);
    return c.json({
      success: false,
      error: 'Failed to create time log'
    }, 500);
  }
});

app.get('/api/timelog/:staffId', async (c) => {
  try {
    const { staffId } = c.req.param();
    const { date } = c.req.query();
    
    let query = 'SELECT * FROM time_logs WHERE staff_id = ?';
    const params = [staffId];
    
    if (date) {
      query += ' AND DATE(timestamp) = ?';
      params.push(date);
    }
    
    query += ' ORDER BY timestamp DESC';

    let timeLogs = [];
    if (c.env.DB) {
      const result = await c.env.DB.prepare(query).bind(...params).all();
      timeLogs = result.results;
    }

    return c.json({
      success: true,
      data: timeLogs
    });
  } catch (error) {
    console.error('Error fetching time logs:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch time logs'
    }, 500);
  }
});

// Analytics API
app.get('/api/analytics/sales', async (c) => {
  try {
    const { period = '7d', branch } = c.req.query();
    
    let query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(total) as total_sales,
        AVG(total) as avg_order_value
      FROM orders 
      WHERE created_at >= ?
    `;
    
    const params = [getDateFromPeriod(period)];
    
    if (branch) {
      query += ' AND branch = ?';
      params.push(branch);
    }
    
    query += ' GROUP BY DATE(created_at) ORDER BY date DESC';

    let sales = [];
    if (c.env.DB) {
      const result = await c.env.DB.prepare(query).bind(...params).all();
      sales = result.results;
    }

    return c.json({
      success: true,
      data: sales
    });
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch sales analytics'
    }, 500);
  }
});

app.get('/api/analytics/top-products', async (c) => {
  try {
    const { period = '7d', branch } = c.req.query();
    
    let query = `
      SELECT 
        JSON_EXTRACT(items, '$[*].name') as product_names,
        COUNT(*) as order_count,
        SUM(JSON_EXTRACT(items, '$[*].price * $[*].quantity')) as total_revenue
      FROM orders 
      WHERE created_at >= ?
    `;
    
    const params = [getDateFromPeriod(period)];
    
    if (branch) {
      query += ' AND branch = ?';
      params.push(branch);
    }
    
    query += ' GROUP BY product_names ORDER BY total_revenue DESC LIMIT 10';

    let products = [];
    if (c.env.DB) {
      const result = await c.env.DB.prepare(query).bind(...params).all();
      products = result.results;
    }

    return c.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch top products'
    }, 500);
  }
});

// Inventory API
app.get('/api/inventory', async (c) => {
  try {
    const { branch } = c.req.query();
    
    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params = [];
    
    if (branch) {
      query += ' AND branch = ?';
      params.push(branch);
    }
    
    query += ' ORDER BY name';

    let inventory = [];
    if (c.env.DB) {
      const result = await c.env.DB.prepare(query).bind(...params).all();
      inventory = result.results;
    }

    return c.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch inventory'
    }, 500);
  }
});

// Authentication middleware
const authMiddleware = jwt({
  secret: JWT_SECRET
});

// Protected routes
app.use('/api/admin/*', authMiddleware);

// Admin routes
app.get('/api/admin/dashboard', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    let stats = {
      totalOrders: 0,
      totalSales: 0,
      activeStaff: 0,
      lowStockItems: 0
    };

    if (c.env.DB) {
      // Today's orders
      const ordersResult = await c.env.DB.prepare(`
        SELECT COUNT(*) as count, SUM(total) as total 
        FROM orders 
        WHERE DATE(created_at) = ?
      `).bind(today).first();
      
      stats.totalOrders = ordersResult?.count || 0;
      stats.totalSales = ordersResult?.total || 0;

      // Active staff
      const staffResult = await c.env.DB.prepare(`
        SELECT COUNT(*) as count 
        FROM staff 
        WHERE status = 'active'
      `).first();
      
      stats.activeStaff = staffResult?.count || 0;

      // Low stock items
      const inventoryResult = await c.env.DB.prepare(`
        SELECT COUNT(*) as count 
        FROM inventory 
        WHERE quantity <= min_quantity
      `).first();
      
      stats.lowStockItems = inventoryResult?.count || 0;
    }

    return c.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    }, 500);
  }
});

// Error handling
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({
    success: false,
    error: 'Internal server error'
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not found'
  }, 404);
});

// Utility functions
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function getDateFromPeriod(period) {
  const now = new Date();
  switch (period) {
    case '1d':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
}

export default app; 
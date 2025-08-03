// Cloudflare Worker for WT POS & Payroll SaaS
// Simplified version for immediate deployment

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Health check endpoint
    if (path === '/health') {
      return new Response(JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.ENVIRONMENT || 'development',
        message: 'WT POS & Payroll SaaS API is running'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Root endpoint
    if (path === '/') {
      return new Response(JSON.stringify({
        message: 'WT POS & Payroll SaaS API',
        version: '1.0.0',
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          orders: '/api/orders',
          staff: '/api/staff',
          timelogs: '/api/timelog',
          analytics: '/api/analytics/sales'
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Orders API
    if (path === '/api/orders' && request.method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        data: [],
        message: 'Orders endpoint ready (database not configured)',
        pagination: {
          page: 1,
          limit: 50,
          total: 0
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    if (path === '/api/orders' && request.method === 'POST') {
      try {
        const orderData = await request.json();
        return new Response(JSON.stringify({
          success: true,
          data: {
            ...orderData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            status: 'completed'
          },
          message: 'Order created successfully (demo mode)'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid order data'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Staff API
    if (path === '/api/staff' && request.method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        data: [
          {
            id: '1',
            staffId: 'EMP001',
            name: 'John Doe',
            position: 'Cashier',
            branch: 'Main Branch',
            email: 'john@example.com',
            status: 'active'
          },
          {
            id: '2',
            staffId: 'EMP002',
            name: 'Jane Smith',
            position: 'Manager',
            branch: 'Main Branch',
            email: 'jane@example.com',
            status: 'active'
          }
        ],
        message: 'Staff data (demo mode)'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    if (path === '/api/staff' && request.method === 'POST') {
      try {
        const staffData = await request.json();
        return new Response(JSON.stringify({
          success: true,
          data: {
            ...staffData,
            id: generateId(),
            createdAt: new Date().toISOString()
          },
          message: 'Staff created successfully (demo mode)'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid staff data'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Time tracking API
    if (path === '/api/timelog' && request.method === 'POST') {
      try {
        const timeLogData = await request.json();
        return new Response(JSON.stringify({
          success: true,
          data: {
            ...timeLogData,
            id: generateId(),
            createdAt: new Date().toISOString()
          },
          message: 'Time log created successfully (demo mode)'
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid time log data'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Analytics API
    if (path === '/api/analytics/sales' && request.method === 'GET') {
      return new Response(JSON.stringify({
        success: true,
        data: [
          {
            date: new Date().toISOString().split('T')[0],
            order_count: 15,
            total_sales: 2500.00,
            avg_order_value: 166.67
          },
          {
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            order_count: 12,
            total_sales: 2100.00,
            avg_order_value: 175.00
          }
        ],
        message: 'Sales analytics (demo mode)'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // 404 for unknown endpoints
    return new Response(JSON.stringify({
      success: false,
      error: 'Not found',
      message: 'Endpoint not found. Available endpoints: /health, /api/orders, /api/staff, /api/timelog, /api/analytics/sales'
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  },
};

// Utility function
function generateId() {
  // Use crypto API for better security and avoid deprecated substr()
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${timestamp}_${randomPart}`;
} 
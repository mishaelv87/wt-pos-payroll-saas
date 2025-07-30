// CBTB POS System - Main JavaScript File

class POSSystem {
    constructor() {
        this.cart = [];
        this.currentStaff = null;
        this.currentBranch = 'vito-cruz';
        this.isLoggedIn = false;
        this.orderNumber = 1000;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDateTime();
        this.checkLoginStatus();
        this.setupKeyboardShortcuts();
        
        // Update datetime every second
        setInterval(() => this.updateDateTime(), 1000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.navigateToPage(e.target.closest('.nav-btn').dataset.page);
            });
        });

        // Menu categories
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterMenuItems(e.target.dataset.category);
            });
        });

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const menuItem = e.target.closest('.menu-item');
                this.addToCart(menuItem);
            });
        });

        // Cart controls
        document.getElementById('processOrderBtn').addEventListener('click', () => {
            this.processOrder();
        });

        document.getElementById('clearOrderBtn').addEventListener('click', () => {
            this.clearCart();
        });

        // Staff time tracking
        document.getElementById('timeInBtn').addEventListener('click', () => {
            this.timeIn();
        });

        document.getElementById('timeOutBtn').addEventListener('click', () => {
            this.timeOut();
        });

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Branch selector
        document.getElementById('branchSelector').addEventListener('change', (e) => {
            this.changeBranch(e.target.value);
        });

        // Modal close buttons
        document.getElementById('closeOrderModal').addEventListener('click', () => {
            this.closeOrderModal();
        });

        // Staff select
        document.getElementById('staffSelect').addEventListener('change', (e) => {
            this.updateStaffStatus(e.target.value);
        });

        // Senior discount
        document.getElementById('seniorDiscount').addEventListener('change', () => {
            this.updateCartTotals();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to process order
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.processOrder();
            }

            // Escape to clear cart
            if (e.key === 'Escape') {
                this.clearCart();
            }

            // F1-F5 for quick navigation
            switch(e.key) {
                case 'F1':
                    e.preventDefault();
                    this.navigateToPage('pos');
                    break;
                case 'F2':
                    e.preventDefault();
                    this.navigateToPage('inventory');
                    break;
                case 'F3':
                    e.preventDefault();
                    this.navigateToPage('analytics');
                    break;
                case 'F4':
                    e.preventDefault();
                    this.navigateToPage('dashboard');
                    break;
                case 'F5':
                    e.preventDefault();
                    this.navigateToPage('staff');
                    break;
            }
        });
    }

    navigateToPage(page) {
        // Hide all pages
        document.querySelectorAll('.page-content').forEach(pageEl => {
            pageEl.classList.add('hidden');
        });

        // Show selected page
        document.getElementById(`${page}-page`).classList.remove('hidden');

        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update page title
        const titles = {
            'pos': 'Point of Sale',
            'inventory': 'Inventory Management',
            'analytics': 'Sales Analytics',
            'dashboard': 'Business Dashboard',
            'staff': 'Staff Management'
        };
        
        document.title = `CBTB POS - ${titles[page]}`;
    }

    filterMenuItems(category) {
        // Update category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Show/hide menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    addToCart(menuItem) {
        const name = menuItem.dataset.name;
        const price = parseFloat(menuItem.dataset.price);
        
        // Check if item already exists in cart
        const existingItem = this.cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        this.updateCartDisplay();
        this.updateCartTotals();
        
        // Show success feedback
        this.showNotification(`${name} added to cart`, 'success');
    }

    updateCartDisplay() {
        const cartContainer = document.getElementById('cart-items');
        
        if (this.cart.length === 0) {
            cartContainer.innerHTML = '<div class="text-gray-500 text-center py-8">No items in cart</div>';
            return;
        }

        cartContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-name="${item.name}">
                <div class="flex-1">
                    <div class="font-semibold">${item.name}</div>
                    <div class="text-sm text-gray-600">₱${item.price.toFixed(2)} × ${item.quantity}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn bg-red-500 text-white hover:bg-red-600" onclick="posSystem.updateQuantity('${item.name}', -1)">-</button>
                    <span class="font-semibold min-w-[2rem] text-center">${item.quantity}</span>
                    <button class="quantity-btn bg-green-500 text-white hover:bg-green-600" onclick="posSystem.updateQuantity('${item.name}', 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    updateQuantity(itemName, change) {
        const item = this.cart.find(item => item.name === itemName);
        
        if (item) {
            item.quantity += change;
            
            if (item.quantity <= 0) {
                this.cart = this.cart.filter(item => item.name !== itemName);
            }
            
            this.updateCartDisplay();
            this.updateCartTotals();
        }
    }

    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const seniorDiscount = document.getElementById('seniorDiscount').checked ? subtotal * 0.20 : 0;
        const subtotalAfterDiscount = subtotal - seniorDiscount;
        const vat = subtotalAfterDiscount * 0.12;
        const total = subtotalAfterDiscount + vat;

        document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
        document.getElementById('vat').textContent = `₱${vat.toFixed(2)}`;
        document.getElementById('total').textContent = `₱${total.toFixed(2)}`;
    }

    processOrder() {
        if (this.cart.length === 0) {
            this.showNotification('Cart is empty', 'error');
            return;
        }

        if (!this.isLoggedIn) {
            this.showNotification('Please login first', 'error');
            return;
        }

        // Generate order number
        this.orderNumber++;
        const orderNumber = `ORD-${this.orderNumber.toString().padStart(5, '0')}`;

        // Calculate totals
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const seniorDiscount = document.getElementById('seniorDiscount').checked ? subtotal * 0.20 : 0;
        const subtotalAfterDiscount = subtotal - seniorDiscount;
        const vat = subtotalAfterDiscount * 0.12;
        const total = subtotalAfterDiscount + vat;

        // Update order modal
        document.getElementById('orderNumber').textContent = orderNumber;
        document.getElementById('orderSummary').innerHTML = this.cart.map(item => 
            `<div class="flex justify-between">
                <span>${item.name} × ${item.quantity}</span>
                <span>₱${(item.price * item.quantity).toFixed(2)}</span>
            </div>`
        ).join('');
        document.getElementById('orderTotal').textContent = `₱${total.toFixed(2)}`;

        // Show order modal
        document.getElementById('orderModal').classList.remove('hidden');

        // Clear cart
        this.clearCart();

        // Log order
        this.logOrder(orderNumber, total);
    }

    clearCart() {
        this.cart = [];
        this.updateCartDisplay();
        this.updateCartTotals();
        document.getElementById('seniorDiscount').checked = false;
    }

    closeOrderModal() {
        document.getElementById('orderModal').classList.add('hidden');
    }

    login() {
        const staffId = document.getElementById('staffId').value;
        const password = document.getElementById('password').value;

        // Demo login - in real app, this would validate against database
        if (staffId === 'maria.santos' && password === '123456') {
            this.currentStaff = {
                id: staffId,
                name: 'Maria Santos',
                position: 'Cashier',
                branch: this.currentBranch
            };
            
            this.isLoggedIn = true;
            this.updateCashierDisplay();
            document.getElementById('loginModal').classList.add('hidden');
            this.showNotification('Login successful', 'success');
            
            // Auto time in
            this.timeIn();
        } else {
            this.showNotification('Invalid credentials', 'error');
        }
    }

    logout() {
        if (this.currentStaff) {
            this.timeOut();
        }
        
        this.currentStaff = null;
        this.isLoggedIn = false;
        this.updateCashierDisplay();
        document.getElementById('loginModal').classList.remove('hidden');
        this.showNotification('Logged out successfully', 'success');
    }

    updateCashierDisplay() {
        const cashierName = document.getElementById('cashierName');
        if (this.currentStaff) {
            cashierName.textContent = this.currentStaff.name;
        } else {
            cashierName.textContent = 'Not Logged In';
        }
    }

    timeIn() {
        if (!this.currentStaff) {
            this.showNotification('Please login first', 'error');
            return;
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString('en-PH', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        this.showNotification(`${this.currentStaff.name} time in at ${timeString}`, 'success');
        this.updateStaffStatus(this.currentStaff.id);
    }

    timeOut() {
        if (!this.currentStaff) {
            this.showNotification('Please login first', 'error');
            return;
        }

        const now = new Date();
        const timeString = now.toLocaleTimeString('en-PH', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        this.showNotification(`${this.currentStaff.name} time out at ${timeString}`, 'success');
        this.updateStaffStatus('');
    }

    updateStaffStatus(staffId) {
        const statusDiv = document.getElementById('currentStatus');
        
        if (!staffId) {
            statusDiv.innerHTML = '<div class="text-gray-500">No staff selected</div>';
            return;
        }

        const staff = this.getStaffById(staffId);
        if (staff) {
            statusDiv.innerHTML = `
                <div class="text-center">
                    <div class="font-semibold">${staff.name}</div>
                    <div class="text-sm text-gray-600">${staff.position}</div>
                    <div class="text-sm text-green-600 mt-2">Active</div>
                </div>
            `;
        }
    }

    getStaffById(staffId) {
        const staffList = [
            { id: 'maria-santos', name: 'Maria Santos', position: 'Cashier' },
            { id: 'juan-dela-cruz', name: 'Juan Dela Cruz', position: 'Baker' },
            { id: 'ana-garcia', name: 'Ana Garcia', position: 'Manager' }
        ];
        
        return staffList.find(staff => staff.id === staffId);
    }

    changeBranch(branch) {
        this.currentBranch = branch;
        this.showNotification(`Switched to ${branch === 'vito-cruz' ? 'Vito Cruz Taft' : 'Sterling Makati'}`, 'success');
    }

    updateDateTime() {
        const now = new Date();
        const dateTimeString = now.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        document.getElementById('currentDateTime').textContent = dateTimeString;
    }

    checkLoginStatus() {
        // Check if user is already logged in (from localStorage)
        const savedStaff = localStorage.getItem('currentStaff');
        if (savedStaff) {
            this.currentStaff = JSON.parse(savedStaff);
            this.isLoggedIn = true;
            this.updateCashierDisplay();
            document.getElementById('loginModal').classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${this.getNotificationIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    }

    logOrder(orderNumber, total) {
        const order = {
            orderNumber,
            total,
            items: this.cart,
            staff: this.currentStaff,
            branch: this.currentBranch,
            timestamp: new Date().toISOString()
        };

        // Save to localStorage for demo
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        console.log('Order logged:', order);
    }

    // Utility functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    }

    generateReceipt(order) {
        const receipt = `
            CBTB POS
            ====================
            Order: ${order.orderNumber}
            Date: ${new Date().toLocaleDateString('en-PH')}
            Time: ${new Date().toLocaleTimeString('en-PH')}
            Cashier: ${order.staff.name}
            Branch: ${order.branch === 'vito-cruz' ? 'Vito Cruz Taft' : 'Sterling Makati'}
            ====================
            ${order.items.map(item => 
                `${item.name}\n  ${item.quantity} × ₱${item.price.toFixed(2)} = ₱${(item.quantity * item.price).toFixed(2)}`
            ).join('\n')}
            ====================
            Subtotal: ₱${order.subtotal.toFixed(2)}
            VAT (12%): ₱${order.vat.toFixed(2)}
            Total: ₱${order.total.toFixed(2)}
            ====================
            Thank you for your purchase!
        `;
        
        return receipt;
    }
}

// Initialize POS System
const posSystem = new POSSystem();

// Export for global access
window.posSystem = posSystem;

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Offline functionality
window.addEventListener('online', () => {
    posSystem.showNotification('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    posSystem.showNotification('You are offline. Some features may be limited.', 'warning');
});

// Print functionality
function printReceipt(order) {
    const receipt = posSystem.generateReceipt(order);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt - ${order.orderNumber}</title>
                <style>
                    body { font-family: 'Courier New', monospace; font-size: 12px; }
                    .receipt { width: 300px; margin: 0 auto; }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <pre>${receipt}</pre>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Data export functionality
function exportData() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pos-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Import data functionality
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('orders', JSON.stringify(data));
            posSystem.showNotification('Data imported successfully', 'success');
        } catch (error) {
            posSystem.showNotification('Invalid data format', 'error');
        }
    };
    reader.readAsText(file);
}

// Export functions to global scope
window.printReceipt = printReceipt;
window.exportData = exportData;
window.importData = importData; 
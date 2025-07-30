# WT POS & Payroll SaaS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange.svg)](https://workers.cloudflare.com/)
[![D1 Database](https://img.shields.io/badge/D1-Database-blue.svg)](https://developers.cloudflare.com/d1/)
[![React](https://img.shields.io/badge/React-18.0.0-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

> **Free POS & Payroll SaaS for Philippine businesses** - Built with Cloudflare Workers, D1 Database, React, and Tailwind CSS. 100% free to use with no subscription dependencies.

## 🌟 Features

### 🛍️ Point of Sale (POS)
- **Real-time sales tracking** with offline support
- **Barcode/QR code scanning** for quick product lookup
- **Multiple payment methods** (Cash, Card, GCash, PayMaya)
- **Receipt generation** with customizable templates
- **Inventory integration** with automatic stock updates
- **Customer management** with loyalty programs
- **Multi-branch support** for growing businesses

### 💰 Payroll Management
- **Philippine compliance** (SSS, PhilHealth, Pag-IBIG, BIR)
- **Automatic tax calculations** with current 2024 rates
- **Multiple pay schedules** (Weekly, Bi-weekly, Monthly)
- **Overtime and holiday pay** calculations
- **Leave management** with accrual tracking
- **Payslip generation** with detailed breakdowns
- **Year-end tax reports** (BIR Form 2316)

### 📊 Analytics & Reporting
- **Real-time dashboard** with key performance indicators
- **Sales analytics** with trend analysis
- **Inventory reports** with low stock alerts
- **Payroll reports** with compliance documentation
- **Custom report builder** with export options
- **Multi-language support** (English, Filipino)

### 📱 Progressive Web App (PWA)
- **Offline-first architecture** for reliable operation
- **Mobile-responsive design** for all devices
- **Push notifications** for important alerts
- **App-like experience** with native features
- **Automatic updates** with service worker
- **Dark/light theme** support

### 🔒 Security & Compliance
- **End-to-end encryption** for sensitive data
- **Philippine Data Privacy Act** compliance
- **Role-based access control** (Admin, Manager, Cashier, Employee)
- **Audit trail** for all transactions
- **Regular backups** with automated scheduling
- **GDPR compliance** for international standards

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Cloudflare account** (free tier)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/wt-pos-payroll-saas.git
   cd wt-pos-payroll-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Setup Cloudflare resources**
   ```bash
   # Login to Cloudflare
   npx wrangler login
   
   # Create D1 database
   npx wrangler d1 create wt-pos-payroll-db
   
   # Create KV namespace
   npx wrangler kv:namespace create CACHE
   
   # Create R2 bucket
   npx wrangler r2 bucket create wt-pos-payroll-storage
   ```

5. **Run database migrations**
   ```bash
   npm run migrate
   ```

6. **Seed initial data**
   ```bash
   npm run seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   ```
   http://localhost:8787
   ```

## 📋 Setup Guide

### 1. Cloudflare Setup

#### Create Cloudflare Account
1. Go to [Cloudflare.com](https://cloudflare.com)
2. Sign up for a free account
3. Add your domain (optional, you can use Cloudflare's subdomain)

#### Configure Workers
1. Go to Workers & Pages in your Cloudflare dashboard
2. Create a new Worker
3. Copy the Worker ID to your `.env` file

#### Setup D1 Database
1. Go to D1 in your Cloudflare dashboard
2. Create a new database named `wt-pos-payroll-db`
3. Copy the database ID to your `.env` file

#### Setup KV Namespace
1. Go to KV in your Cloudflare dashboard
2. Create a new namespace named `CACHE`
3. Copy the namespace ID to your `.env` file

#### Setup R2 Storage
1. Go to R2 in your Cloudflare dashboard
2. Create a new bucket named `wt-pos-payroll-storage`
3. Configure CORS for web access

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
# Required: Cloudflare configuration
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
D1_DATABASE_ID=your-database-id
KV_NAMESPACE_ID=your-kv-namespace-id

# Required: Security
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Required: Philippine business info
COMPANY_NAME=Your Company Name
COMPANY_ADDRESS=Your Company Address
TIN_NUMBER=your-tin-number
SSS_NUMBER=your-sss-number
PHILHEALTH_NUMBER=your-philhealth-number
PAG_IBIG_NUMBER=your-pag-ibig-number
```

### 3. Database Setup

Run the database setup:

```bash
# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

### 4. Frontend Setup

```bash
# Install frontend dependencies
cd frontend
npm install

# Build for production
npm run build
```

## 🏗️ Project Structure

```
wt-pos-payroll-saas/
├── src/                    # Backend source code
│   ├── worker.js          # Main Cloudflare Worker
│   ├── api/               # API endpoints
│   ├── middleware/        # Middleware functions
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── database/          # Database schemas & migrations
├── frontend/              # Frontend application
│   ├── index.html         # Main dashboard
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   ├── assets/            # Static assets
│   └── pages/             # Additional pages
├── docs/                  # Documentation
├── tests/                 # Test files
├── scripts/               # Utility scripts
└── deployment/            # Deployment configurations
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run deploy           # Deploy to Cloudflare

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier

# Database
npm run migrate          # Run database migrations
npm run seed             # Seed database with sample data
npm run backup           # Create database backup

# Documentation
npm run docs             # Generate documentation
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Write tests for new features
   - Update documentation

3. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Load testing
npm run test:load
```

### Test Coverage

```bash
npm run test:coverage
```

## 🚀 Deployment

### Automatic Deployment

The project includes GitHub Actions for automatic deployment:

1. **Push to main branch** - Automatic deployment to staging
2. **Create a release** - Automatic deployment to production
3. **Manual deployment** - Use `npm run deploy`

### Manual Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# Deploy frontend assets
npm run deploy:frontend
```

### Environment-Specific Deployment

```bash
# Development
npm run deploy:dev

# Staging
npm run deploy:staging

# Production
npm run deploy:prod
```

## 📊 Free Tier Limits

### Cloudflare Workers
- **100,000 requests/day** - Sufficient for small to medium businesses
- **CPU time**: 10ms per request
- **Memory**: 128MB per request

### D1 Database
- **1 database** - Perfect for single-tenant SaaS
- **100MB storage** - Adequate for most businesses
- **1,000,000 reads/day** - High performance
- **100,000 writes/day** - Good for daily operations

### R2 Storage
- **10GB storage** - Plenty for receipts and documents
- **1M Class A operations/day** - High-performance reads
- **10M Class B operations/day** - Efficient writes

### KV Storage
- **100,000 reads/day** - Good for caching
- **1,000 writes/day** - Sufficient for session data

## 🔧 Configuration

### Philippine Tax Configuration

The system includes automatic Philippine tax calculations:

```javascript
// Tax rates (2024)
const TAX_RATES = {
  SSS: 0.045,           // 4.5% for employees
  PHILHEALTH: 0.03,     // 3% for employees
  PAG_IBIG: 0.02,       // 2% for employees
  WITHHOLDING_TAX: 0.20 // 20% withholding tax
};
```

### Minimum Wage by Region

```javascript
const MINIMUM_WAGE = {
  NCR: 610,        // Metro Manila
  REGION_1: 420,   // Ilocos Region
  REGION_2: 420,   // Cagayan Valley
  // ... more regions
};
```

## 📱 Mobile App

### Progressive Web App Features

- **Offline functionality** - Works without internet
- **Push notifications** - Real-time alerts
- **App-like experience** - Native feel
- **Automatic updates** - No manual updates needed

### Installation

1. **Open the app in Chrome/Safari**
2. **Tap "Add to Home Screen"**
3. **Use like a native app**

## 🔒 Security

### Data Protection

- **End-to-end encryption** for sensitive data
- **Philippine Data Privacy Act** compliance
- **Regular security audits** and updates
- **Role-based access control**

### Compliance Features

- **Audit trails** for all transactions
- **Data retention policies** as per Philippine law
- **Secure data disposal** procedures
- **Privacy impact assessments**

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests**
5. **Submit a pull request**

### Code Standards

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Jest** for testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation

- [Setup Guide](docs/setup/)
- [API Documentation](docs/api/)
- [User Manual](docs/user-manual/)
- [Developer Guide](docs/developer/)

### Community

- **GitHub Issues** - Bug reports and feature requests
- **Discussions** - Questions and community support
- **Wiki** - Additional documentation

### Contact

- **Email**: support@wisetrackpos.com
- **Website**: https://wisetrackpos.com
- **GitHub**: https://github.com/your-org/wt-pos-payroll-saas

## 🙏 Acknowledgments

- **Cloudflare** for the free tier services
- **React** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Philippine government** for the tax compliance guidelines
- **Open source community** for the amazing tools

## 📈 Roadmap

### Version 1.1 (Q2 2024)
- [ ] Multi-language support (Filipino)
- [ ] Advanced reporting features
- [ ] Mobile app improvements
- [ ] Integration with Philippine banks

### Version 1.2 (Q3 2024)
- [ ] Multi-branch management
- [ ] Advanced analytics
- [ ] Customer loyalty program
- [ ] E-commerce integration

### Version 2.0 (Q4 2024)
- [ ] AI-powered insights
- [ ] Advanced inventory management
- [ ] Supplier management
- [ ] Advanced payroll features

---

**Made with ❤️ for Philippine businesses**

*This project is 100% free to use with no hidden costs or subscription dependencies.*

# 🚀 Cloudflare Deployment Guide for WT POS & Payroll SaaS

## 📋 **Prerequisites**
- ✅ Cloudflare account (free tier works)
- ✅ GitHub repository connected
- ✅ Node.js and npm installed
- ✅ Wrangler CLI installed

## 🔧 **Step 1: Manual Cloudflare Login**

### **Option A: Browser Login**
1. **Open your browser** and go to: https://dash.cloudflare.com
2. **Login** with your Cloudflare account
3. **Note your Account ID** (found in the right sidebar)

### **Option B: Wrangler CLI Login**
```powershell
# Run this command and follow the browser prompts
wrangler login
```

## 🚀 **Step 2: Deploy Worker (Backend API)**

### **2.1 Deploy the Worker**
```powershell
# Navigate to your project directory
cd wt-pos-payroll-saas

# Deploy the worker
wrangler deploy
```

### **2.2 Verify Worker Deployment**
- **Check your Worker URL**: `https://wt-pos-payroll-saas.your-subdomain.workers.dev`
- **Test the health endpoint**: `https://wt-pos-payroll-saas.your-subdomain.workers.dev/health`

## 🌐 **Step 3: Deploy Frontend to Cloudflare Pages**

### **3.1 Create Pages Project**
1. **Go to**: https://dash.cloudflare.com/pages
2. **Click**: "Create a project"
3. **Choose**: "Connect to Git"
4. **Select your repository**: `mishaelv87/wt-pos-payroll-saas`

### **3.2 Configure Build Settings**
```
Framework preset: None
Build command: (leave empty)
Build output directory: frontend
Root directory: (leave empty)
```

### **3.3 Environment Variables**
Add these environment variables in Pages settings:
```
API_URL=https://wt-pos-payroll-saas.your-subdomain.workers.dev
ENVIRONMENT=production
```

## 🔗 **Step 4: Connect Frontend to Backend**

### **4.1 Update API Configuration**
Edit `frontend/script.js` and update the API base URL:
```javascript
const API_BASE_URL = 'https://wt-pos-payroll-saas.your-subdomain.workers.dev';
```

### **4.2 Test API Connection**
1. **Open your Pages URL**
2. **Open browser console** (F12)
3. **Check for API connection errors**

## 🎯 **Step 5: Custom Domain (Optional)**

### **5.1 Add Custom Domain**
1. **Go to**: Cloudflare Pages dashboard
2. **Click**: "Custom domains"
3. **Add domain**: `pos.yourdomain.com`

### **5.2 Configure DNS**
1. **Go to**: Cloudflare DNS settings
2. **Add CNAME record**:
   - **Name**: `pos`
   - **Target**: `your-pages-project.pages.dev`

## 🔧 **Step 6: Database Setup (Optional)**

### **6.1 Create D1 Database**
```powershell
# Create database
wrangler d1 create wt-pos-payroll-db

# Get database ID and update wrangler.toml
```

### **6.2 Run Migrations**
```powershell
# Apply database schema
wrangler d1 execute wt-pos-payroll-db --file=./scripts/schema.sql
```

## 🧪 **Step 7: Testing**

### **7.1 Test Frontend**
- ✅ **POS System**: Add items to cart
- ✅ **Navigation**: Switch between pages
- ✅ **Responsive Design**: Test on mobile
- ✅ **API Calls**: Check browser console

### **7.2 Test Backend**
- ✅ **Health Check**: `/health` endpoint
- ✅ **API Endpoints**: `/api/orders`, `/api/staff`
- ✅ **CORS**: Frontend can call API

## 🚨 **Troubleshooting**

### **Common Issues**

#### **❌ Worker Deployment Fails**
```powershell
# Check wrangler.toml syntax
wrangler deploy --dry-run

# Check for syntax errors in worker.js
node -c src/worker.js
```

#### **❌ Pages Build Fails**
- **Check build logs** in Pages dashboard
- **Verify file paths** in build settings
- **Check for missing files**

#### **❌ API Connection Fails**
- **Check CORS settings** in worker.js
- **Verify API URL** in frontend
- **Check browser console** for errors

#### **❌ Custom Domain Not Working**
- **Check DNS settings** in Cloudflare
- **Verify SSL certificate** is active
- **Wait for DNS propagation** (up to 24 hours)

## 📞 **Support**

### **Useful URLs**
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Workers Documentation**: https://developers.cloudflare.com/workers
- **Pages Documentation**: https://developers.cloudflare.com/pages

### **Contact**
- **Email**: support@wisetrackpos.com
- **GitHub Issues**: https://github.com/mishaelv87/wt-pos-payroll-saas/issues

## ✅ **Deployment Checklist**

- [ ] **Wrangler CLI installed and logged in**
- [ ] **Worker deployed successfully**
- [ ] **Pages project created and connected**
- [ ] **Frontend deployed to Pages**
- [ ] **API connection working**
- [ ] **Custom domain configured (optional)**
- [ ] **Database set up (optional)**
- [ ] **All features tested**
- [ ] **SSL certificate active**

---

**🎉 Congratulations! Your WT POS & Payroll SaaS is now deployed on Cloudflare!** 
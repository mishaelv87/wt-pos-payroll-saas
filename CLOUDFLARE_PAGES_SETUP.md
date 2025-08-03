# Cloudflare Pages Deployment Guide

## 🚀 **Frontend Build Configuration**

Your frontend is now ready for Cloudflare Pages deployment with the following settings:

### **Build Settings for Cloudflare Pages:**

```
Framework preset: None (or Custom)
Build command: cd frontend && npm install && npm run build
Build output directory: frontend/dist
Root directory: (leave empty)
```

### **Environment Variables for Pages:**

```
API_URL=https://wt-pos-payroll-saas.mishaelvallar.workers.dev
ENVIRONMENT=production
NODE_ENV=production
```

## 📋 **Step-by-Step Deployment**

### 1. **Go to Cloudflare Pages**
- Visit: https://dash.cloudflare.com/pages
- Click "Create a project"
- Select "Connect to Git"

### 2. **Connect Repository**
- **Repository**: `mishaelv87/wt-pos-payroll-saas`
- **Production branch**: `main`
- **Root directory**: (leave empty)

### 3. **Configure Build Settings**
- **Framework preset**: `None`
- **Build command**: `cd frontend && npm install && npm run build`
- **Build output directory**: `frontend/dist`
- **Root directory**: (leave empty)

### 4. **Environment Variables**
Add these environment variables in the Pages settings:

```
API_URL=https://wt-pos-payroll-saas.mishaelvallar.workers.dev
ENVIRONMENT=production
NODE_ENV=production
```

### 5. **Deploy**
- Click "Save and Deploy"
- Wait for build to complete (2-3 minutes)

## ✅ **What's Included in the Build**

### **Files Built:**
- ✅ `index.html` - Main application
- ✅ `styles.css` - Custom styles
- ✅ `script.js` - Application logic
- ✅ `manifest.json` - PWA manifest
- ✅ `sw.js` - Service worker
- ✅ `_redirects` - SPA routing
- ✅ `_headers` - Security headers

### **Security Headers:**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Content-Security-Policy: Configured for Tailwind CSS and API

### **SPA Routing:**
- All routes redirect to `index.html` for client-side routing

## 🔧 **Local Testing**

### **Test the build locally:**
```bash
cd frontend
npm run build
cd dist
python -m http.server 8000
```

### **Test the build process:**
```bash
cd frontend
npm install
npm run build
```

## 🌐 **Custom Domain Setup (Optional)**

1. **Add Custom Domain:**
   - Go to Pages project settings
   - Click "Custom domains"
   - Add your domain

2. **Update CORS in Worker:**
   - Update `CORS_ORIGIN` in your `.env` file
   - Redeploy the Worker

3. **Update API URL:**
   - Update `API_URL` in Pages environment variables
   - Redeploy Pages

## 📊 **Monitoring & Analytics**

### **Cloudflare Analytics:**
- Built-in analytics in Pages dashboard
- Real-time performance metrics
- Error tracking

### **Health Checks:**
- Test API: `https://wt-pos-payroll-saas.mishaelvallar.workers.dev/health`
- Test Frontend: Your Pages URL

## 🔄 **Continuous Deployment**

### **Automatic Deployments:**
- ✅ Commits to `main` branch trigger automatic deployment
- ✅ Preview deployments for pull requests
- ✅ Rollback capability

### **Manual Deployment:**
- Go to Pages dashboard
- Click "Deployments"
- Click "Create deployment"

## 🐛 **Troubleshooting**

### **Build Failures:**
```bash
# Check build logs in Pages dashboard
# Common issues:
# - Node.js version (requires 18+)
# - Missing dependencies
# - Build script errors
```

### **Runtime Errors:**
```bash
# Check browser console
# Check Network tab for API calls
# Verify API_URL environment variable
```

### **CORS Issues:**
```bash
# Update CORS_ORIGIN in Worker
# Check _headers file configuration
# Verify API endpoint accessibility
```

## 📱 **PWA Features**

### **Service Worker:**
- ✅ Offline functionality
- ✅ Cache management
- ✅ Background sync

### **Manifest:**
- ✅ App icon
- ✅ App name
- ✅ Theme colors
- ✅ Display mode

## 🔒 **Security Features**

### **Content Security Policy:**
- ✅ Script sources: self, Tailwind CDN
- ✅ Style sources: self, Tailwind CDN
- ✅ Connect sources: self, API endpoint
- ✅ Image sources: self, data, https

### **Security Headers:**
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: restricted

## 🎯 **Performance Optimization**

### **Built-in Optimizations:**
- ✅ Static file serving
- ✅ CDN distribution
- ✅ Compression
- ✅ Caching headers

### **PWA Optimizations:**
- ✅ Service worker caching
- ✅ Offline support
- ✅ App-like experience

## 📈 **Next Steps After Deployment**

1. ✅ **Test the deployed application**
2. 🔗 **Connect frontend to backend API**
3. 🧪 **Test all POS features**
4. 📱 **Test PWA functionality**
5. 🔒 **Verify security headers**
6. 📊 **Monitor performance**

## 🆘 **Support**

### **Useful Commands:**
```bash
# Test API connection
curl https://wt-pos-payroll-saas.mishaelvallar.workers.dev/health

# Test frontend build
cd frontend && npm run build

# Preview build locally
cd frontend/dist && python -m http.server 8000
```

### **Resources:**
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- Worker API Docs: https://developers.cloudflare.com/workers
- PWA Guide: https://web.dev/progressive-web-apps 
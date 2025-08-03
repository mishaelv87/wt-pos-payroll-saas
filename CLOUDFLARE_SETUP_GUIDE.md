# Cloudflare Setup Guide for WT POS & Payroll SaaS

## 🚀 **Step 1: Cloudflare Account Setup**

### **1.1 Create Cloudflare Account (if needed)**
1. **Go to:** https://dash.cloudflare.com/sign-up
2. **Sign up** with your email: `mishaelvallar@gmail.com`
3. **Verify your email address**

### **1.2 Access Cloudflare Dashboard**
1. **Login to:** https://dash.cloudflare.com
2. **Note your Account ID** (found in the right sidebar)

## 🚀 **Step 2: Set Up Cloudflare Workers**

### **2.1 Create Worker**
1. **Go to:** https://dash.cloudflare.com/workers
2. **Click:** "Create application"
3. **Choose:** "Create Worker"
4. **Fill in details:**
   - **Name:** `wt-pos-payroll-api`
   - **Description:** `WT POS & Payroll SaaS Backend API`
5. **Click:** "Deploy"

### **2.2 Configure Worker Settings**
1. **Go to your Worker dashboard**
2. **Click:** "Settings" tab
3. **Add environment variables:**
   ```
   CLOUDFLARE_ACCESS_AUD=your-aud-value
   CLOUDFLARE_ACCESS_ISSUER=https://your-team.cloudflareaccess.com
   CLOUDFLARE_ACCESS_JWKS_URL=https://your-team.cloudflareaccess.com/cdn-cgi/access/certs
   CORS_ORIGIN=https://yourdomain.com
   ```

### **2.3 Deploy Worker Code**
1. **Go to:** "Deployments" tab
2. **Click:** "Edit code"
3. **Replace the code** with your `src/worker.js` content
4. **Click:** "Save and deploy"

## 🚀 **Step 3: Set Up Cloudflare Pages**

### **3.1 Create Pages Project**
1. **Go to:** https://dash.cloudflare.com/pages
2. **Click:** "Create a project"
3. **Choose:** "Connect to Git"
4. **Select your repository:** `mishaelv87/wt-pos-payroll-saas`
5. **Configure build settings:**
   - **Framework preset:** None
   - **Build command:** (leave empty)
   - **Build output directory:** `frontend`
   - **Root directory:** (leave empty)

### **3.2 Configure Pages Settings**
1. **Go to:** "Settings" → "Environment variables"
2. **Add these variables:**
   ```
   CLOUDFLARE_ACCESS_AUD=your-aud-value
   CLOUDFLARE_ACCESS_ISSUER=https://your-team.cloudflareaccess.com
   CLOUDFLARE_ACCESS_JWKS_URL=https://your-team.cloudflareaccess.com/cdn-cgi/access/certs
   CORS_ORIGIN=https://yourdomain.com
   ```

## 🚀 **Step 4: Set Up Cloudflare Access**

### **4.1 Enable Zero Trust**
1. **Go to:** https://dash.cloudflare.com/zero-trust
2. **Click:** "Get started"
3. **Choose:** "Free plan" (or your preferred plan)

### **4.2 Create Applications**
1. **Go to:** "Access" → "Applications"
2. **Click:** "Add an application"
3. **Create these applications:**

#### **POS Application:**
- **Name:** `WT POS System`
- **Subdomain:** `pos.yourdomain.com`
- **Session Duration:** 24 hours
- **Application Type:** Self-hosted

#### **Payroll Application:**
- **Name:** `WT Payroll System`
- **Subdomain:** `payroll.yourdomain.com`
- **Session Duration:** 24 hours
- **Application Type:** Self-hosted

#### **Admin Application:**
- **Name:** `WT Admin Panel`
- **Subdomain:** `admin.yourdomain.com`
- **Session Duration:** 24 hours
- **Application Type:** Self-hosted

#### **Reports Application:**
- **Name:** `WT Reports System`
- **Subdomain:** `reports.yourdomain.com`
- **Session Duration:** 24 hours
- **Application Type:** Self-hosted

### **4.3 Create User Groups**
1. **Go to:** "Access" → "Groups"
2. **Create these groups:**

#### **Branch Managers Group:**
- **Name:** `Branch Managers`
- **Description:** `Full system access for managers`
- **Add users:** `manager1@yourdomain.com`, `manager2@yourdomain.com`

#### **Staff Members Group:**
- **Name:** `Staff Members`
- **Description:** `Limited access for staff`
- **Add users:** `staff1@yourdomain.com`, `staff2@yourdomain.com`, etc.

#### **Analytics Guests Group:**
- **Name:** `Analytics Guests`
- **Description:** `Read-only analytics access`
- **Add users:** `guest1@yourdomain.com`, `guest2@yourdomain.com`

### **4.4 Configure Policies**
1. **Go to:** "Access" → "Policies"
2. **Create policies for each application:**

#### **POS Policy:**
- **Name:** `POS Access`
- **Application:** WT POS System
- **Users and groups:** Branch Managers, Staff Members
- **Action:** Allow

#### **Payroll Policy:**
- **Name:** `Payroll Access`
- **Application:** WT Payroll System
- **Users and groups:** Branch Managers only
- **Action:** Allow

#### **Admin Policy:**
- **Name:** `Admin Access`
- **Application:** WT Admin Panel
- **Users and groups:** Branch Managers only
- **Action:** Allow

#### **Reports Policy:**
- **Name:** `Reports Access`
- **Application:** WT Reports System
- **Users and groups:** Branch Managers, Staff Members (basic), Analytics Guests (analytics only)
- **Action:** Allow

## 🚀 **Step 5: Configure DNS**

### **5.1 Add Domain to Cloudflare**
1. **Go to:** https://dash.cloudflare.com
2. **Click:** "Add a site"
3. **Enter your domain:** `yourdomain.com`
4. **Choose plan:** Free or Pro
5. **Update nameservers** at your domain registrar

### **5.2 Create DNS Records**
1. **Go to:** "DNS" → "Records"
2. **Add these records:**

#### **API Records:**
- **Type:** CNAME
- **Name:** `api`
- **Target:** `wt-pos-payroll-api.your-subdomain.workers.dev`

#### **Subdomain Records:**
- **Type:** CNAME
- **Name:** `pos`
- **Target:** `your-pages-project.pages.dev`

- **Type:** CNAME
- **Name:** `payroll`
- **Target:** `your-pages-project.pages.dev`

- **Type:** CNAME
- **Name:** `admin`
- **Target:** `your-pages-project.pages.dev`

- **Type:** CNAME
- **Name:** `reports`
- **Target:** `your-pages-project.pages.dev`

## 🚀 **Step 6: Test Deployment**

### **6.1 Test API Endpoints**
1. **Test Worker:** `https://api.yourdomain.com/health`
2. **Expected response:** JSON with status information

### **6.2 Test Frontend**
1. **Test POS:** `https://pos.yourdomain.com`
2. **Test Payroll:** `https://payroll.yourdomain.com`
3. **Test Admin:** `https://admin.yourdomain.com`
4. **Test Reports:** `https://reports.yourdomain.com`

## 🚀 **Step 7: Environment Variables**

### **7.1 Get Access Values**
1. **Go to:** Zero Trust → Settings → Authentication
2. **Note your Team Domain:** `your-team.cloudflareaccess.com`
3. **Get your AUD value** from the authentication settings

### **7.2 Update Variables**
Replace these placeholders with your actual values:
- `your-aud-value` → Your actual AUD value
- `your-team.cloudflareaccess.com` → Your actual team domain
- `yourdomain.com` → Your actual domain
- `your-subdomain.workers.dev` → Your actual Workers subdomain
- `your-pages-project.pages.dev` → Your actual Pages domain

## 🎯 **Next Steps After Setup**

1. **Test all endpoints** and ensure they work
2. **Configure GitHub Actions** for automatic deployment
3. **Set up monitoring** and logging
4. **Add more users** to the system
5. **Configure backup** and recovery procedures

## 📞 **Support**

If you encounter issues:
1. **Check Cloudflare documentation**
2. **Review error logs** in the Workers dashboard
3. **Verify DNS settings** are correct
4. **Test authentication** with different user roles

**Your WT POS & Payroll SaaS will be fully deployed on Cloudflare!** 🚀 
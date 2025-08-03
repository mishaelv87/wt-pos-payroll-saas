# WT POS Preview Testing Guide

## 🚀 Quick Start

### 1. Start Local Preview Server
```bash
cd frontend
python -m http.server 8000
```

### 2. Access Preview URLs
- **Main POS System:** http://localhost:8000/index.html
- **Test Page:** http://localhost:8000/test-preview.html
- **Root Directory:** http://localhost:8000/

## ✅ What to Test

### Visual Elements
- [ ] **Header:** Blue header with "CBTB POS" title
- [ ] **Navigation:** 5 navigation buttons (POS, Inventory, Analytics, Dashboard, Staff)
- [ ] **Menu Items:** Product grid with images and prices
- [ ] **Cart:** Shopping cart on the right side
- [ ] **Responsive Design:** Works on mobile and desktop

### Functionality
- [ ] **Navigation:** Click between different sections
- [ ] **Menu Categories:** Switch between "BB Buckets" and "Add-ons"
- [ ] **Add to Cart:** Click items to add to cart
- [ ] **Cart Operations:** Remove items, adjust quantities
- [ ] **Checkout:** Process payment simulation
- [ ] **Branch Selector:** Switch between Vito Cruz and Sterling Makati

### JavaScript Features
- [ ] **Real-time Clock:** Current date/time display
- [ ] **Cart Calculations:** Total updates automatically
- [ ] **Search Function:** Filter menu items
- [ ] **Responsive Menu:** Mobile-friendly navigation

## 🔧 Troubleshooting

### If Preview Doesn't Load
1. **Check Server Status:**
   ```bash
   # Should show "Serving HTTP on 0.0.0.0 port 8000"
   python -m http.server 8000
   ```

2. **Check File Structure:**
   ```
   frontend/
   ├── index.html ✅
   ├── styles.css ✅
   ├── script.js ✅
   └── manifest.json ✅
   ```

3. **Browser Console Errors:**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

### Common Issues

#### ❌ "Page Not Found"
- **Solution:** Make sure you're in the `frontend` directory when starting the server

#### ❌ "Styles Not Loading"
- **Solution:** Check if `styles.css` exists in the same directory as `index.html`

#### ❌ "JavaScript Errors"
- **Solution:** Check browser console for specific error messages

#### ❌ "Images Not Loading"
- **Solution:** Check if image paths are correct in the HTML

## 📱 Mobile Testing

### Test on Mobile Device
1. **Find Your Computer's IP:**
   ```bash
   ipconfig
   # Look for "IPv4 Address" (usually 192.168.x.x)
   ```

2. **Access from Mobile:**
   - Connect phone to same WiFi network
   - Open browser and go to: `http://[YOUR_IP]:8000/index.html`
   - Example: `http://192.168.1.100:8000/index.html`

### Mobile Features to Test
- [ ] **Touch Navigation:** Tap menu items
- [ ] **Responsive Layout:** Content fits screen
- [ ] **Touch Targets:** Buttons are large enough
- [ ] **Scrolling:** Smooth scrolling on mobile

## 🌐 Cloudflare Pages Preview

### After Deployment
1. **Access Cloudflare Pages URL:**
   - Go to your Cloudflare Pages dashboard
   - Copy the preview URL (e.g., `https://wt-pos-payroll-saas.pages.dev`)

2. **Test All Features:**
   - Same tests as local preview
   - Check if external CDN resources load
   - Verify HTTPS works correctly

## 📊 Performance Testing

### Load Time
- **Target:** < 3 seconds for initial load
- **Tools:** Browser Developer Tools > Network tab

### Responsiveness
- **Target:** Smooth interactions, no lag
- **Test:** Rapid clicking, scrolling, typing

## 🐛 Debug Mode

### Enable Debug Logging
Add this to browser console:
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

### Check for Errors
```javascript
// In browser console
console.log('App loaded successfully');
console.log('Current page:', document.querySelector('.page-content.active')?.id);
console.log('Cart items:', JSON.parse(localStorage.getItem('cart') || '[]'));
```

## ✅ Success Checklist

- [ ] Local preview server starts without errors
- [ ] Main POS interface loads completely
- [ ] All navigation buttons work
- [ ] Menu items display correctly
- [ ] Cart functionality works
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] All external resources load (CDN)
- [ ] Performance is acceptable

## 🚀 Next Steps

Once preview is working:
1. **Deploy to Cloudflare Pages**
2. **Test production URL**
3. **Configure custom domain**
4. **Set up Cloudflare Access**

---

**Need Help?** Check the browser console for specific error messages and refer to the troubleshooting section above. 
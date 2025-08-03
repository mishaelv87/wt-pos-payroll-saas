const fs = require('fs');
const path = require('path');

console.log('🚀 Building frontend for Cloudflare Pages...');

// Create dist directory
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('✅ Created dist directory');
}

// Files to copy
const filesToCopy = [
    'index.html',
    'styles.css',
    'script.js',
    'manifest.json',
    'sw.js'
];

// Copy files
filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied ${file}`);
    } else {
        console.log(`⚠️  Warning: ${file} not found`);
    }
});

// Create _redirects file for SPA routing
const redirectsContent = `/*    /index.html   200`;
fs.writeFileSync(path.join(distDir, '_redirects'), redirectsContent);
console.log('✅ Created _redirects for SPA routing');

// Create _headers file for security headers
const headersContent = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https://cdn.tailwindcss.com; connect-src 'self' https://wt-pos-payroll-saas.mishaelvallar.workers.dev;
`;
fs.writeFileSync(path.join(distDir, '_headers'), headersContent);
console.log('✅ Created _headers for security');

console.log('🎉 Frontend build completed successfully!');
console.log(`📁 Build output: ${distDir}`); 
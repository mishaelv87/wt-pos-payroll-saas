#!/bin/bash

# Cloudflare Pages Build Script
echo "Starting build process..."

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "Error: frontend directory not found"
    exit 1
fi

# Copy frontend files to build output
echo "Copying frontend files..."
cp -r frontend/* .

# Create a simple index.html redirect if needed
if [ ! -f "index.html" ]; then
    echo "Creating index.html redirect..."
    cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0; url=./frontend/index.html">
    <title>Redirecting to POS System</title>
</head>
<body>
    <p>Redirecting to POS System...</p>
    <script>window.location.href = './frontend/index.html';</script>
</body>
</html>
EOF
fi

echo "Build completed successfully!"
ls -la 
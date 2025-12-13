#!/bin/bash

echo "🚀 Building Beetle Diffuser for production..."

# Navigate to User frontend directory
cd User

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building React app..."
npm run build

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps for VPS deployment:"
echo "1. Upload the 'User/build' folder to your VPS"
echo "2. Place it in your Nginx web root (usually /var/www/html or /usr/share/nginx/html)"
echo "3. Restart Nginx: sudo systemctl restart nginx"
echo "4. Restart backend: pm2 restart beetle-backend (or your process name)"
echo ""
echo "🔧 Or use this quick deploy command on VPS:"
echo "   rsync -avz User/build/ your-vps:/var/www/html/"

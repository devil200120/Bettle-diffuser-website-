# PowerShell deployment script for Windows

Write-Host "🚀 Building Beetle Diffuser for production..." -ForegroundColor Green

# Navigate to User frontend directory
Set-Location User

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🔨 Building React app..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps for VPS deployment:" -ForegroundColor Cyan
Write-Host "1. Upload the 'User/build' folder to your VPS"
Write-Host "2. Place it in your Nginx web root (usually /var/www/html or /usr/share/nginx/html)"
Write-Host "3. Restart Nginx: sudo systemctl restart nginx"
Write-Host "4. Restart backend: pm2 restart beetle-backend (or your process name)"
Write-Host ""
Write-Host "🔧 Files to upload:" -ForegroundColor Yellow
Write-Host "   User/build/* -> VPS:/var/www/html/"

# Production Deployment Script for Windows
Write-Host "🚀 Starting Production Deployment..." -ForegroundColor Green
Write-Host ""

# Step 1: Build Frontend
Write-Host "📦 Building React frontend..." -ForegroundColor Yellow
cd client
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
cd ..

# Step 2: Copy build to server
Write-Host "📋 Copying build to server..." -ForegroundColor Yellow
if (-not (Test-Path "server\public")) {
    New-Item -ItemType Directory -Path "server\public" | Out-Null
}
Copy-Item -Path "client\build\*" -Destination "server\public\" -Recurse -Force
Write-Host "✅ Build copied successfully" -ForegroundColor Green

# Step 3: Set production environment
Write-Host "🔧 Setting production environment..." -ForegroundColor Yellow
$env:NODE_ENV = "production"

# Step 4: Check if .env exists
if (-not (Test-Path "server\.env")) {
    Write-Host "⚠️  Warning: server/.env file not found!" -ForegroundColor Yellow
    Write-Host "   Please create server/.env with your configuration" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the production server:" -ForegroundColor Cyan
Write-Host "  cd server" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Or use Docker:" -ForegroundColor Cyan
Write-Host "  docker-compose up -d" -ForegroundColor White


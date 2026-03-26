# Start Both Servers
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     STARTING CONFESSLY SERVERS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Project: R:\confessly" -ForegroundColor Gray
Write-Host ""
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Socket.IO: http://localhost:5001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop servers" -ForegroundColor Red
Write-Host ""

# Check MongoDB
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoCheck = python -c "import pymongo; client=pymongo.MongoClient('mongodb://localhost:27017/'); client.server_info(); print('✓ MongoDB is running')" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️ MongoDB not detected. Make sure it's running!" -ForegroundColor Red
        Write-Host "  Start MongoDB with: & 'C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe' --dbpath C:\data\db" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Could not verify MongoDB" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Green
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location R:\confessly\backend; Write-Host '🚀 BACKEND SERVER' -ForegroundColor Cyan; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location R:\confessly\frontend; Write-Host '🎨 FRONTEND SERVER' -ForegroundColor Cyan; npm run dev"

Write-Host "✓ Servers started in separate windows" -ForegroundColor Green
Write-Host ""
Write-Host "📝 To access the application:" -ForegroundColor Cyan
Write-Host "   1. Open browser to: http://localhost:5173" -ForegroundColor White
Write-Host "   2. Wait for both servers to fully load" -ForegroundColor White
Write-Host "   3. Start exploring Confessly!" -ForegroundColor White
Write-Host ""
Write-Host "🔧 To stop servers, close the terminal windows" -ForegroundColor Yellow

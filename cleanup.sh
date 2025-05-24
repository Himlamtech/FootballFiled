#!/bin/bash

# Football Field Management System - Project Cleanup Script
# This script ensures the project is clean and production-ready

echo "🧹 Starting Football Field Management System Cleanup..."

# Remove any temporary files
echo "📁 Cleaning temporary files..."
find . -name "*.tmp" -delete 2>/dev/null
find . -name "*.log" -delete 2>/dev/null
find . -name ".DS_Store" -delete 2>/dev/null

# Remove test artifacts
echo "🧪 Cleaning test artifacts..."
rm -rf test-results/ 2>/dev/null
rm -rf screenshots/ 2>/dev/null
rm -rf playwright-report/ 2>/dev/null

# Clean node_modules if needed (optional)
echo "📦 Node modules status:"
if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend dependencies missing - run 'cd backend && npm install'"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependencies missing - run 'cd frontend && npm install'"
fi

# Verify core files exist
echo "📋 Verifying core project files..."

# Backend files
backend_files=(
    "backend/server.js"
    "backend/package.json"
    "backend/.env"
    "backend/database/create-database.sql"
    "backend/database/seed-data.sql"
    "backend/database/init-database.js"
)

for file in "${backend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
    fi
done

# Frontend files
frontend_files=(
    "frontend/package.json"
    "frontend/src/App.tsx"
    "frontend/index.html"
    "frontend/vite.config.ts"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
    fi
done

# Documentation files
doc_files=(
    "docs/API_DOCUMENTATION.md"
    "docs/FINAL_TESTING_REPORT.md"
    "README.md"
)

for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
    fi
done

# Check environment configuration
echo "🔧 Checking environment configuration..."
if [ -f "backend/.env" ]; then
    echo "✅ Environment file exists"
    if grep -q "DB_HOST" backend/.env; then
        echo "✅ Database configuration found"
    else
        echo "❌ Database configuration missing in .env"
    fi
    if grep -q "EMAIL_USER" backend/.env; then
        echo "✅ Email configuration found"
    else
        echo "❌ Email configuration missing in .env"
    fi
else
    echo "❌ Environment file missing - copy from .env.example"
fi

# Check database files
echo "🗄️ Checking database setup..."
if [ -f "backend/database/create-database.sql" ]; then
    tables=$(grep -c "CREATE TABLE" backend/database/create-database.sql)
    echo "✅ Database schema with $tables tables"
fi

if [ -f "backend/database/seed-data.sql" ]; then
    echo "✅ Sample data file exists"
fi

# Verify ports are available
echo "🌐 Checking port availability..."
if lsof -i :9001 >/dev/null 2>&1; then
    echo "⚠️  Port 9001 is in use (Frontend)"
else
    echo "✅ Port 9001 available (Frontend)"
fi

if lsof -i :9002 >/dev/null 2>&1; then
    echo "⚠️  Port 9002 is in use (Backend)"
else
    echo "✅ Port 9002 available (Backend)"
fi

if lsof -i :3306 >/dev/null 2>&1; then
    echo "✅ Port 3306 in use (MySQL)"
else
    echo "⚠️  Port 3306 not in use - MySQL may not be running"
fi

# Final summary
echo ""
echo "🎉 Cleanup completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Ensure MySQL is running on port 3306"
echo "2. Run database setup: cd backend && node database/init-database.js"
echo "3. Start backend: cd backend && npm start"
echo "4. Start frontend: cd frontend && npm run dev"
echo "5. Access admin dashboard: http://localhost:9001/admin"
echo "6. Login with: username='admin', password='admin'"
echo ""
echo "📖 Documentation:"
echo "- API Documentation: docs/API_DOCUMENTATION.md"
echo "- Testing Report: docs/FINAL_TESTING_REPORT.md"
echo "- Setup Guide: README.md"
echo ""
echo "✨ Your Football Field Management System is ready for production!"

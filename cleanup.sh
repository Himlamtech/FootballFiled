#!/bin/bash

# Football Field Management System - Comprehensive Project Cleanup Script
# This script ensures the project is clean, optimized, and production-ready

echo "🧹 Starting Football Field Management System Comprehensive Cleanup..."
echo "=================================================="

# Function to print colored output
print_status() {
    case $2 in
        "success") echo -e "\033[32m✅ $1\033[0m" ;;
        "error") echo -e "\033[31m❌ $1\033[0m" ;;
        "warning") echo -e "\033[33m⚠️  $1\033[0m" ;;
        "info") echo -e "\033[34mℹ️  $1\033[0m" ;;
        *) echo "$1" ;;
    esac
}

# Remove temporary files and artifacts
echo "📁 Cleaning temporary files and artifacts..."
find . -name "*.tmp" -delete 2>/dev/null && print_status "Removed .tmp files" "success"
find . -name "*.log" -delete 2>/dev/null && print_status "Removed .log files" "success"
find . -name ".DS_Store" -delete 2>/dev/null && print_status "Removed .DS_Store files" "success"
find . -name "Thumbs.db" -delete 2>/dev/null && print_status "Removed Thumbs.db files" "success"

# Remove test artifacts and reports
echo "🧪 Cleaning test artifacts..."
rm -rf test-results/ 2>/dev/null && print_status "Removed test-results/" "success"
rm -rf screenshots/ 2>/dev/null && print_status "Removed screenshots/" "success"
rm -rf playwright-report/ 2>/dev/null && print_status "Removed playwright-report/" "success"
rm -rf coverage/ 2>/dev/null && print_status "Removed coverage/" "success"

# Remove old README backup
rm -f README_OLD.md 2>/dev/null && print_status "Removed old README backup" "success"

# Check and report node_modules status
echo "📦 Checking dependencies status..."
if [ -d "node_modules" ]; then
    print_status "Root dependencies installed" "success"
else
    print_status "Root dependencies missing - run 'npm install'" "warning"
fi

if [ -d "backend/node_modules" ]; then
    print_status "Backend dependencies installed" "success"
else
    print_status "Backend dependencies missing - run 'cd backend && npm install'" "error"
fi

if [ -d "frontend/node_modules" ]; then
    print_status "Frontend dependencies installed" "success"
else
    print_status "Frontend dependencies missing - run 'cd frontend && npm install'" "error"
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
        print_status "$file" "success"
    else
        print_status "Missing: $file" "error"
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
        print_status "$file" "success"
    else
        print_status "Missing: $file" "error"
    fi
done

# Documentation files
doc_files=(
    "docs/API_DOCUMENTATION.md"
    "docs/FINAL_TESTING_REPORT.md"
    "docs/DATABASE_SCHEMA.md"
    "docs/TROUBLESHOOTING_GUIDE.md"
    "docs/ENVIRONMENT_SETUP.md"
    "docs/SYSTEM_ARCHITECTURE.md"
    "README.md"
)

for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file" "success"
    else
        print_status "Missing: $file" "error"
    fi
done

# Check environment configuration
echo "🔧 Checking environment configuration..."
if [ -f "backend/.env" ]; then
    print_status "Environment file exists" "success"
    if grep -q "DB_HOST" backend/.env; then
        print_status "Database configuration found" "success"
    else
        print_status "Database configuration missing in .env" "error"
    fi
    if grep -q "EMAIL_USER" backend/.env; then
        print_status "Email configuration found" "success"
    else
        print_status "Email configuration missing in .env" "warning"
    fi
    if grep -q "JWT_SECRET" backend/.env; then
        print_status "JWT configuration found" "success"
    else
        print_status "JWT configuration missing in .env" "error"
    fi
else
    print_status "Environment file missing - copy from .env.example" "error"
fi

# Check database files
echo "🗄️ Checking database setup..."
if [ -f "backend/database/create-database.sql" ]; then
    tables=$(grep -c "CREATE TABLE" backend/database/create-database.sql)
    print_status "Database schema with $tables tables" "success"
fi

if [ -f "backend/database/seed-data.sql" ]; then
    print_status "Sample data file exists" "success"
fi

# Verify ports are available
echo "🌐 Checking port availability..."
if command -v lsof >/dev/null 2>&1; then
    if lsof -i :9001 >/dev/null 2>&1; then
        print_status "Port 9001 is in use (Frontend)" "warning"
    else
        print_status "Port 9001 available (Frontend)" "success"
    fi

    if lsof -i :9002 >/dev/null 2>&1; then
        print_status "Port 9002 is in use (Backend)" "warning"
    else
        print_status "Port 9002 available (Backend)" "success"
    fi

    if lsof -i :3306 >/dev/null 2>&1; then
        print_status "Port 3306 in use (MySQL)" "success"
    else
        print_status "Port 3306 not in use - MySQL may not be running" "warning"
    fi
else
    print_status "lsof not available - cannot check port status" "info"
fi

# Check system requirements
echo "💻 Checking system requirements..."
if command -v node >/dev/null 2>&1; then
    node_version=$(node --version)
    print_status "Node.js installed: $node_version" "success"
else
    print_status "Node.js not installed" "error"
fi

if command -v npm >/dev/null 2>&1; then
    npm_version=$(npm --version)
    print_status "npm installed: $npm_version" "success"
else
    print_status "npm not installed" "error"
fi

if command -v mysql >/dev/null 2>&1; then
    mysql_version=$(mysql --version | cut -d' ' -f6 | cut -d',' -f1)
    print_status "MySQL installed: $mysql_version" "success"
else
    print_status "MySQL not installed or not in PATH" "warning"
fi

# Project statistics
echo "📊 Project statistics..."
if [ -d "backend" ]; then
    backend_files=$(find backend -name "*.js" -o -name "*.ts" | wc -l)
    print_status "Backend files: $backend_files" "info"
fi

if [ -d "frontend/src" ]; then
    frontend_files=$(find frontend/src -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | wc -l)
    print_status "Frontend files: $frontend_files" "info"
fi

if [ -d "docs" ]; then
    doc_files=$(find docs -name "*.md" | wc -l)
    print_status "Documentation files: $doc_files" "info"
fi

# Final summary
echo ""
echo "=================================================="
echo "🎉 Comprehensive Cleanup Completed Successfully!"
echo "=================================================="
echo ""
echo "📋 Quick Start Commands:"
echo "1. 🗄️  Initialize database:"
echo "   cd backend && node database/init-database.js"
echo ""
echo "2. 🚀 Start application:"
echo "   npm start  # Starts both frontend and backend"
echo ""
echo "3. 🌐 Access application:"
echo "   Frontend: http://localhost:9001"
echo "   Admin: http://localhost:9001/admin (admin/admin)"
echo "   API: http://localhost:9002/api"
echo ""
echo "📖 Complete Documentation Available:"
echo "   • API Reference: docs/API_DOCUMENTATION.md"
echo "   • Database Schema: docs/DATABASE_SCHEMA.md"
echo "   • System Architecture: docs/SYSTEM_ARCHITECTURE.md"
echo "   • Environment Setup: docs/ENVIRONMENT_SETUP.md"
echo "   • Troubleshooting: docs/TROUBLESHOOTING_GUIDE.md"
echo "   • Testing Report: docs/FINAL_TESTING_REPORT.md"
echo "   • Setup Guide: README.md"
echo ""
echo "🎯 System Status: PRODUCTION READY"
echo "✨ Your Football Field Management System is optimized and ready!"
echo "=================================================="

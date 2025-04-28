#!/bin/bash

# Football Field Management System - Run Script

echo "=== Football Field Management System ==="
echo "Starting the application..."
echo "===================================="
echo

# MySQL credentials - hardcoded to avoid prompting
DB_USER="root"
DB_PASS="Himlam04@"

# Check if MySQL is running
echo "Checking MySQL status..."
# Try to connect to MySQL (without password prompt)
if [ -z "$DB_PASS" ]; then
  # No password
  if ! mysql -h localhost -u "$DB_USER" -e "SELECT 1" >/dev/null 2>&1; then
    echo "Error: MySQL is not running or credentials are incorrect. Please check and try again."
    exit 1
  fi
else
  # With password
  if ! mysql -h localhost -u "$DB_USER" -p"$DB_PASS" -e "SELECT 1" >/dev/null 2>&1; then
    echo "Error: MySQL is not running or credentials are incorrect. Please check and try again."
    exit 1
  fi
fi
echo "MySQL connection successful."

# Create database if it doesn't exist
echo "Setting up database..."
if [ -z "$DB_PASS" ]; then
  # No password
  mysql -h localhost -u "$DB_USER" -e "CREATE DATABASE IF NOT EXISTS football_field_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
else
  # With password
  mysql -h localhost -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS football_field_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
fi

# Import database schema and sample data
echo "Importing database schema and sample data..."
if [ -f "database.sql" ]; then
  if [ -z "$DB_PASS" ]; then
    # No password
    mysql -h localhost -u "$DB_USER" football_field_db < database.sql
  else
    # With password
    mysql -h localhost -u "$DB_USER" -p"$DB_PASS" football_field_db < database.sql
  fi
  echo "Database schema and sample data imported successfully."
else
  echo "Warning: database.sql file not found in the current directory."
  echo "Skipping database schema and sample data import."
  echo "You may need to manually import the database schema and sample data."
fi

# Update .env file with correct MySQL credentials
echo "Updating backend .env file with database credentials..."
if [ -f "backend/.env" ]; then
  # Create a backup of the original .env file
  cp backend/.env backend/.env.bak

  # Update the .env file with the new credentials
  cat backend/.env.bak |
    sed "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" |
    sed "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" |
    sed "s/DB_DIALECT=.*/DB_DIALECT=mysql/" > backend/.env

  echo "Database credentials updated in .env file."
else
  echo "Warning: .env file not found at backend/.env"
  echo "Creating new .env file with database credentials..."

  cat > backend/.env << EOF
# Environment
NODE_ENV=development
PORT=9002
HOST=localhost
CORS_ORIGIN=http://localhost:9001

# Database
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASS
DB_DATABASE=football_field_db
DB_SYNC=true
DB_SYNC_ALTER=true

# JWT settings
JWT_SECRET=football_field_jwt_secret_key_2023
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
JWT_RESET_PASSWORD_EXPIRATION=10m

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# File uploads
UPLOAD_DIR=uploads
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif
EOF

  echo "New .env file created with database credentials."
fi

# Get current directory
CURRENT_DIR=$(pwd)

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "Error: npm is not installed or not in the PATH."
  echo "Please install Node.js and npm before running this script."
  exit 1
fi

# Install backend dependencies if node_modules doesn't exist
if [ -d "$CURRENT_DIR/backend" ]; then
  if [ ! -d "$CURRENT_DIR/backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd "$CURRENT_DIR/backend" && npm install
    if [ $? -ne 0 ]; then
      echo "Error: Failed to install backend dependencies."
      exit 1
    fi
    cd "$CURRENT_DIR"
  fi
else
  echo "Error: Backend directory not found at $CURRENT_DIR/backend"
  exit 1
fi

# Install frontend dependencies if node_modules doesn't exist and frontend directory exists
if [ -d "$CURRENT_DIR/frontend" ]; then
  if [ ! -d "$CURRENT_DIR/frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$CURRENT_DIR/frontend"

    # Make sure vite is installed
    if ! grep -q '"vite"' package.json; then
      echo "Adding vite to package.json..."
      npm install --save-dev vite@4.4.5 @vitejs/plugin-react-swc --legacy-peer-deps
    fi

    # Install dependencies
    npm install --legacy-peer-deps

    if [ $? -ne 0 ]; then
      echo "Warning: Failed to install frontend dependencies."
      echo "Frontend server may not start correctly."
    fi
    cd "$CURRENT_DIR"
  else
    # Check if vite is installed in node_modules
    if [ ! -d "$CURRENT_DIR/frontend/node_modules/vite" ]; then
      echo "Installing vite..."
      cd "$CURRENT_DIR/frontend" && npm install --save-dev vite@4.4.5 @vitejs/plugin-react-swc --legacy-peer-deps
      cd "$CURRENT_DIR"
    fi
  fi
else
  echo "Warning: Frontend directory not found at $CURRENT_DIR/frontend"
  echo "Skipping frontend dependencies installation."
fi

# Start backend server
echo "Starting backend server on port 9002..."
if [ -d "$CURRENT_DIR/backend" ]; then
  cd "$CURRENT_DIR/backend" && npm run dev &
  BACKEND_PID=$!
  echo "Backend server started with PID: $BACKEND_PID"
else
  echo "Error: Backend directory not found at $CURRENT_DIR/backend"
  echo "Cannot start the backend server."
  exit 1
fi

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend server
echo "Starting frontend server on port 9001..."
if [ -d "$CURRENT_DIR/frontend" ]; then
  # Check if vite is installed
  if [ -d "$CURRENT_DIR/frontend/node_modules/vite" ]; then
    cd "$CURRENT_DIR/frontend"
    # Use npx to ensure vite is found
    npx vite --port 9001 &
    FRONTEND_PID=$!
    echo "Frontend server started with PID: $FRONTEND_PID"
  else
    echo "Warning: vite not found in node_modules."
    echo "Trying to start frontend server anyway..."
    cd "$CURRENT_DIR/frontend" && npm run dev -- --port 9001 &
    FRONTEND_PID=$!
  fi
else
  echo "Warning: Frontend directory not found at $CURRENT_DIR/frontend"
  echo "Skipping frontend server startup."
  FRONTEND_PID=""
fi

# Function to handle script termination
function cleanup {
  echo "Stopping servers..."
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
    echo "Backend server stopped."
  fi

  if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null || true
    echo "Frontend server stopped."
  fi

  echo "All servers stopped."
  exit 0
}

# Register the cleanup function for when script receives SIGINT
trap cleanup SIGINT

echo
echo "Football Field Management System is running!"
echo "- Frontend: http://localhost:9001"
echo "- Backend: http://localhost:9002"
echo
echo "Press Ctrl+C to stop the servers."

# Keep the script running
wait

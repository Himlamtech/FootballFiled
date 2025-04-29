#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

# Function to check if a port is in use
is_port_in_use() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
    return 0 # Port is in use
  else
    return 1 # Port is free
  fi
}

# Function to kill process using a specific port
kill_process_on_port() {
  local port=$1
  print_message "$YELLOW" "Killing process on port $port..."
  lsof -ti :$port | xargs kill -9 2>/dev/null
  sleep 1
}

# Main script starts here
print_message "$GREEN" "=== Football Field Management System ==="
print_message "$GREEN" "Starting application..."

# Check if ports are in use and kill processes if needed
if is_port_in_use 9001; then
  kill_process_on_port 9001
fi

if is_port_in_use 9002; then
  kill_process_on_port 9002
fi

# Start backend
print_message "$BLUE" "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
print_message "$GREEN" "Backend started at http://localhost:9002"

# Wait a bit for backend to initialize
sleep 3

# Start frontend
print_message "$BLUE" "Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
print_message "$GREEN" "Frontend started at http://localhost:9001"

# Wait a bit for frontend to initialize
sleep 3

# Open browser
print_message "$GREEN" "Opening application in browser..."
xdg-open http://localhost:9001 || open http://localhost:9001 || start http://localhost:9001

# Wait for user to exit
print_message "$GREEN" "Application is running!"
print_message "$YELLOW" "Press Ctrl+C to stop the servers and exit..."

# Keep script running until user presses Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait

#!/bin/bash

# Colors for console output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${GREEN}${BOLD}Starting Football Field Management System...${NC}"

# Check if .env file exists, create it if not
if [ ! -f .env ]; then
  echo -e "${YELLOW}Creating .env file...${NC}"
  cat > .env << EOF
PORT=9002
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=FootballField
DB_USER=root
DB_PASSWORD=2123
JWT_SECRET=football_field_management_jwt_secret_key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:9001
EOF
  echo -e "${GREEN}.env file created. Please update with your database credentials if needed.${NC}"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing backend dependencies...${NC}"
  npm install
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
  echo -e "${YELLOW}Installing frontend dependencies...${NC}"
  cd frontend && npm install && cd ..
fi

# Initialize database
echo -e "${BLUE}${BOLD}Initializing database...${NC}"
if [ -f "backend/database/.db_initialized" ]; then
  echo -e "${YELLOW}Database already initialized. To reinitialize, delete the file:${NC}"
  echo -e "${YELLOW}backend/database/.db_initialized${NC}"

  # Ask if user wants to reinitialize
  read -p "Do you want to reinitialize the database? (y/n): " answer
  if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
    echo -e "${YELLOW}Removing database flag file...${NC}"
    rm -f backend/database/.db_initialized
    echo -e "${BLUE}Running database initialization script...${NC}"
    cd backend/database && node init-database.js
    if [ $? -ne 0 ]; then
      echo -e "${RED}${BOLD}Database initialization failed. Please check the error messages above.${NC}"
      exit 1
    fi
    cd ../..
  fi
else
  echo -e "${BLUE}Running database initialization script...${NC}"
  cd backend/database && node init-database.js
  if [ $? -ne 0 ]; then
    echo -e "${RED}${BOLD}Database initialization failed. Please check the error messages above.${NC}"
    exit 1
  fi
  cd ../..
fi

# Start backend and frontend servers in parallel
echo -e "${GREEN}${BOLD}Starting backend server...${NC}"
cd backend && npm run dev &
BACKEND_PID=$!

echo -e "${GREEN}${BOLD}Starting frontend server...${NC}"
cd frontend && npm start &
FRONTEND_PID=$!

# Function to handle script termination
function cleanup {
  echo -e "\n${YELLOW}${BOLD}Shutting down servers...${NC}"
  kill $BACKEND_PID
  kill $FRONTEND_PID
  echo -e "${GREEN}${BOLD}Servers stopped successfully.${NC}"
  exit 0
}

# Register the cleanup function for when script receives SIGINT, SIGTERM
trap cleanup SIGINT SIGTERM

echo -e "\n${GREEN}${BOLD}====================================================${NC}"
echo -e "${GREEN}${BOLD}    Football Field Management System is running!${NC}"
echo -e "${GREEN}${BOLD}====================================================${NC}\n"

echo -e "${CYAN}${BOLD}Backend:${NC} http://localhost:9002"
echo -e "${CYAN}${BOLD}Frontend:${NC} http://localhost:9001\n"

echo -e "${YELLOW}${BOLD}Admin credentials:${NC}"
echo -e "${YELLOW}Username:${NC} admin"
echo -e "${YELLOW}Password:${NC} admin\n"

echo -e "${BLUE}${BOLD}Press Ctrl+C to stop both servers${NC}"

# Keep the script running
wait
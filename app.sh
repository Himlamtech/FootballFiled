#!/bin/bash

# Football Field Management System - Startup Script
# This script provides a simple interface to the new startup system

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    print_success "Node.js and npm are installed"
}

# Show usage information
show_usage() {
    echo -e "${YELLOW}Football Field Management System - Startup Script${NC}"
    echo ""
    echo "Usage: ./app.sh [options]"
    echo ""
    echo "Options:"
    echo "  --reset-db      Reset database before starting"
    echo "  --backend-only  Start only backend server"
    echo "  --frontend-only Start only frontend server"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./app.sh                    # Normal startup"
    echo "  ./app.sh --reset-db         # Reset DB and start"
    echo "  ./app.sh --backend-only     # Start backend only"
    echo ""
}

# Install dependencies if needed
install_dependencies() {
    print_status "Checking dependencies..."

    # Install root dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing root dependencies..."
        npm install
    fi

    # Install backend dependencies if they don't exist
    if [ ! -d "backend/node_modules" ]; then
        print_status "Installing backend dependencies..."
        cd backend && npm install && cd ..
    fi

    # Install frontend dependencies if they don't exist
    if [ ! -d "frontend/node_modules" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend && npm install && cd ..
    fi

    print_success "Dependencies ready!"
}

# Main execution
main() {
    # Check for help flag
    if [[ "$1" == "--help" || "$1" == "-h" ]]; then
        show_usage
        exit 0
    fi

    print_header "Football Field Management System"

    # Check prerequisites
    check_nodejs

    # Install dependencies
    install_dependencies

    # Handle different startup options
    if [[ "$1" == "--reset-db" ]]; then
        print_status "Resetting database and starting application..."
        npm run db:reset && npm start
    elif [[ "$1" == "--backend-only" ]]; then
        print_status "Starting backend only..."
        npm run start:backend
    elif [[ "$1" == "--frontend-only" ]]; then
        print_status "Starting frontend only..."
        npm run start:frontend
    else
        print_status "Starting application..."
        npm start
    fi
}

# Handle script interruption
trap 'echo -e "\n${YELLOW}Script interrupted. Exiting...${NC}"; exit 1' INT

# Run main function with all arguments
main "$@"
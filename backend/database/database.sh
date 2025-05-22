#!/bin/bash

# Football Field Management System - Database Initialization Script
# This script initializes the database only once by checking if it already exists

# ANSI color codes for console output
RESET='\033[0m'
BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'

# Database configuration
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"3306"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-"2123"}
DB_NAME="FootballField"

# Script paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CREATE_DB_SCRIPT="${SCRIPT_DIR}/create-database.sql"
SEED_DATA_SCRIPT="${SCRIPT_DIR}/seed-data.sql"
DB_FLAG_FILE="${SCRIPT_DIR}/.db_initialized"

# Print header
echo -e "\n${CYAN}${BOLD}========================================${RESET}"
echo -e "${CYAN}${BOLD}  Football Field Database Initialization${RESET}"
echo -e "${CYAN}${BOLD}========================================${RESET}\n"

# Check if database flag file exists (indicating database was already initialized)
if [ -f "$DB_FLAG_FILE" ]; then
    echo -e "${YELLOW}Database has already been initialized.${RESET}"
    echo -e "${YELLOW}If you want to reinitialize the database, delete the file:${RESET}"
    echo -e "${YELLOW}${DB_FLAG_FILE}${RESET}"
    echo -e "${YELLOW}and run this script again.${RESET}\n"
    exit 0
fi

# Display database configuration
echo -e "${YELLOW}Database configuration:${RESET}"
echo -e "Host: ${DB_HOST}"
echo -e "Port: ${DB_PORT}"
echo -e "User: ${DB_USER}"
echo -e "Database: ${DB_NAME}\n"

# Check if MySQL client is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}${BOLD}Error: MySQL client is not installed.${RESET}"
    echo -e "${YELLOW}Please install MySQL client and try again.${RESET}\n"
    exit 1
fi

# Function to execute SQL script
execute_sql_script() {
    local script_path=$1
    local description=$2
    
    echo -e "${BLUE}${BOLD}Executing ${description}...${RESET}"
    
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --default-character-set=utf8mb4 < "$script_path"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ ${description} executed successfully!${RESET}\n"
        return 0
    else
        echo -e "${RED}✗ Error executing ${description}!${RESET}\n"
        return 1
    fi
}

# Check if scripts exist
if [ ! -f "$CREATE_DB_SCRIPT" ]; then
    echo -e "${RED}${BOLD}Error: Database creation script not found:${RESET}"
    echo -e "${RED}${CREATE_DB_SCRIPT}${RESET}\n"
    exit 1
fi

if [ ! -f "$SEED_DATA_SCRIPT" ]; then
    echo -e "${RED}${BOLD}Error: Seed data script not found:${RESET}"
    echo -e "${RED}${SEED_DATA_SCRIPT}${RESET}\n"
    exit 1
fi

# Test database connection
echo -e "${BLUE}Testing database connection...${RESET}"
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✓ Database connection successful!${RESET}\n"
else
    echo -e "${RED}${BOLD}✗ Error: Could not connect to database server.${RESET}"
    echo -e "${YELLOW}Please check your database credentials and try again.${RESET}\n"
    exit 1
fi

# Execute database creation script
if ! execute_sql_script "$CREATE_DB_SCRIPT" "database schema creation"; then
    echo -e "${RED}${BOLD}Database initialization failed at schema creation step.${RESET}\n"
    exit 1
fi

# Execute seed data script
if ! execute_sql_script "$SEED_DATA_SCRIPT" "sample data insertion"; then
    echo -e "${RED}${BOLD}Database initialization failed at data seeding step.${RESET}\n"
    exit 1
fi

# Create flag file to indicate database has been initialized
touch "$DB_FLAG_FILE"

echo -e "${GREEN}${BOLD}✓ Database initialization completed successfully!${RESET}"
echo -e "${CYAN}You can now start the backend server.${RESET}\n"

exit 0

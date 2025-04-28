#!/bin/bash

# Football Field Management System - MySQL Setup Script

# Default values
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASS=""
DB_NAME="football_field_db"
CREATE_DB=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --host=*)
      DB_HOST="${1#*=}"
      shift
      ;;
    --port=*)
      DB_PORT="${1#*=}"
      shift
      ;;
    --user=*)
      DB_USER="${1#*=}"
      shift
      ;;
    --password=*)
      DB_PASS="${1#*=}"
      shift
      ;;
    --db=*)
      DB_NAME="${1#*=}"
      shift
      ;;
    --no-create-db)
      CREATE_DB=false
      shift
      ;;
    --help)
      echo "MySQL Setup Script for Football Field Management System"
      echo
      echo "Usage: ./setup-mysql.sh [options]"
      echo
      echo "Options:"
      echo "  --host=HOSTNAME       MySQL host (default: localhost)"
      echo "  --port=PORT           MySQL port (default: 3306)"
      echo "  --user=USERNAME       MySQL username (default: root)"
      echo "  --password=PASSWORD   MySQL password (default: empty)"
      echo "  --db=DATABASE         MySQL database name (default: football_field_db)"
      echo "  --no-create-db        Skip database creation"
      echo "  --help                Show this help message"
      echo
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Run './setup-mysql.sh --help' for usage information."
      exit 1
      ;;
  esac
done

echo "=== Football Field Management System ==="
echo "MySQL Setup Script"
echo "===================================="
echo

# Display configuration
echo "MySQL Configuration:"
echo "  Host:     $DB_HOST"
echo "  Port:     $DB_PORT"
echo "  User:     $DB_USER"
echo "  Database: $DB_NAME"
echo

# Create database if needed
if [ "$CREATE_DB" = true ]; then
  echo "Creating database '$DB_NAME'..."
  if [ -z "$DB_PASS" ]; then
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  else
    mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  fi

  if [ $? -ne 0 ]; then
    echo "Error: Failed to create database."
    exit 1
  fi
  echo "Database created/verified successfully."
else
  echo "Skipping database creation."
fi

echo
echo "Running MySQL data generation script..."

# Run the setup script with the provided credentials
if [ -z "$DB_PASS" ]; then
  node src/utils/generateMySQLData.js --host=$DB_HOST --port=$DB_PORT --username=$DB_USER --database=$DB_NAME
else
  node src/utils/generateMySQLData.js --host=$DB_HOST --port=$DB_PORT --username=$DB_USER --password=$DB_PASS --database=$DB_NAME
fi

if [ $? -ne 0 ]; then
  echo "Error: Failed to generate data."
  exit 1
fi

echo
echo "MySQL setup completed successfully!"
echo "You can now start the application with 'npm start' or 'npm run dev'." 
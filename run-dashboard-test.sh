#!/bin/bash

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

# Check if Playwright is installed
if ! command -v npx playwright &> /dev/null; then
    echo "Installing Playwright..."
    npm install -D @playwright/test
    npx playwright install chromium
fi

# Run the test
echo "Running admin dashboard test..."
npx playwright test tests/admin-dashboard.test.js --headed

# Open the report
echo "Opening test report..."
npx playwright show-report

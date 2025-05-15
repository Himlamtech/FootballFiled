/**
 * Football Field Management System - Setup and Test Script
 * 
 * This script:
 * 1. Initializes the database with the new schema and sample data
 * 2. Starts the backend server
 * 3. Tests all API endpoints
 */

const { spawn, exec } = require('child_process');
const colors = require('./test-utils/colors');

// Configuration
const BACKEND_PORT = process.env.PORT || 9002;
const SERVER_STARTUP_WAIT_MS = 5000; // Wait 5 seconds for server to start

/**
 * Log a message with color
 * @param {string} message - Message to log
 * @param {string} type - Message type (info, success, error, warning)
 */
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  switch (type) {
    case 'success':
      console.log(`${colors.green}[${timestamp}] ✓ ${message}${colors.reset}`);
      break;
    case 'error':
      console.log(`${colors.red}[${timestamp}] ✗ ${message}${colors.reset}`);
      break;
    case 'warning':
      console.log(`${colors.yellow}[${timestamp}] ⚠ ${message}${colors.reset}`);
      break;
    case 'info':
    default:
      console.log(`${colors.blue}[${timestamp}] ℹ ${message}${colors.reset}`);
      break;
  }
}

/**
 * Run a command and return its output
 * @param {string} command - Command to run
 * @returns {Promise<string>} - Command output
 */
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Command failed: ${error.message}\n${stderr}`));
        return;
      }
      
      resolve(stdout);
    });
  });
}

/**
 * Initialize the database
 */
async function initializeDatabase() {
  log('Initializing database...');
  
  try {
    await runCommand('node init-database.js');
    log('Database initialized successfully', 'success');
    return true;
  } catch (error) {
    log(`Database initialization failed: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Start the backend server
 * @returns {Promise<ChildProcess>} - Server process
 */
function startBackendServer() {
  return new Promise((resolve, reject) => {
    log(`Starting backend server on port ${BACKEND_PORT}...`);
    
    const serverProcess = spawn('node', ['server.js'], {
      stdio: 'pipe',
      detached: true
    });
    
    let output = '';
    
    serverProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(`${colors.dim}[Server] ${text}${colors.reset}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stderr.write(`${colors.red}[Server Error] ${text}${colors.reset}`);
    });
    
    serverProcess.on('error', (error) => {
      reject(new Error(`Failed to start server: ${error.message}`));
    });
    
    // Wait for server to start
    setTimeout(() => {
      if (output.includes('Server running on port')) {
        log(`Backend server started on port ${BACKEND_PORT}`, 'success');
        resolve(serverProcess);
      } else {
        serverProcess.kill();
        reject(new Error('Server failed to start properly'));
      }
    }, SERVER_STARTUP_WAIT_MS);
  });
}

/**
 * Run API tests
 */
async function runApiTests() {
  log('Running API tests...');
  
  try {
    await runCommand('node test-api-endpoints.js');
    log('API tests completed successfully', 'success');
    return true;
  } catch (error) {
    log(`API tests failed: ${error.message}`, 'error');
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log(`\n${colors.cyan}${colors.bright}========================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  Football Field Setup and Test Script${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}========================================${colors.reset}\n`);
  
  let serverProcess = null;
  
  try {
    // Step 1: Initialize database
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      throw new Error('Database initialization failed');
    }
    
    // Step 2: Start backend server
    serverProcess = await startBackendServer();
    
    // Step 3: Run API tests
    const testsSuccessful = await runApiTests();
    if (!testsSuccessful) {
      throw new Error('API tests failed');
    }
    
    console.log(`\n${colors.green}${colors.bright}✓ Setup and tests completed successfully!${colors.reset}\n`);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}✗ Setup and tests failed:${colors.reset}`, error.message);
    process.exit(1);
  } finally {
    // Clean up: Kill server process if it was started
    if (serverProcess) {
      log('Shutting down backend server...');
      
      // Kill process and all children
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', serverProcess.pid, '/f', '/t']);
      } else {
        process.kill(-serverProcess.pid);
      }
      
      log('Backend server shut down', 'success');
    }
  }
  
  process.exit(0);
}

// Run the script
main();

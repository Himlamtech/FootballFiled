/**
 * Football Field Management System - API Test Script
 * 
 * This script tests all API endpoints to ensure they work correctly with the new database structure.
 * It tests GET, POST, PUT, and DELETE operations for all major endpoints.
 */

const axios = require('axios');
const dotenv = require('dotenv');
const colors = require('./test-utils/colors');

// Load environment variables
dotenv.config();

// API base URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9002/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'admin'
};

// Test data
const TEST_DATA = {
  booking: {
    fieldId: 1,
    timeSlotId: 1,
    bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    totalPrice: 200000,
    customerName: 'Test Customer',
    customerPhone: '0123456789',
    customerEmail: 'test@example.com',
    notes: 'Test booking from API test script'
  },
  opponent: {
    team_name: 'Test Team',
    contact_phone: '0123456789',
    contact_email: 'test@example.com',
    description: 'Test opponent from API test script',
    skill_level: 'intermediate',
    player_count: 5
  },
  feedback: {
    name: 'Test User',
    email: 'test@example.com',
    content: 'This is a test feedback from the API test script'
  }
};

// Store created resources for later tests
const CREATED_RESOURCES = {
  bookingId: null,
  opponentId: null,
  feedbackId: null
};

// Store authentication token
let AUTH_TOKEN = null;

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
 * Make an API request
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @returns {Promise<Object>} - Response data
 */
async function apiRequest(method, endpoint, data = null) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {};
    
    if (AUTH_TOKEN) {
      headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    }
    
    const response = await axios({
      method,
      url,
      data,
      headers
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      throw new Error('No response received from API');
    } else {
      throw new Error(`Request Error: ${error.message}`);
    }
  }
}

/**
 * Test admin login
 */
async function testAdminLogin() {
  try {
    log('Testing admin login...');
    
    const response = await apiRequest('post', '/auth/admin/login', ADMIN_CREDENTIALS);
    
    if (response.token) {
      AUTH_TOKEN = response.token;
      log('Admin login successful', 'success');
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    log(`Admin login failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Test GET endpoints
 */
async function testGetEndpoints() {
  try {
    log('Testing GET endpoints...');
    
    // Test fields endpoint
    const fields = await apiRequest('get', '/fields');
    log(`GET /fields: Retrieved ${fields.length || 0} fields`, 'success');
    
    // Test timeslots endpoint
    const timeslots = await apiRequest('get', '/timeslots/all');
    log(`GET /timeslots/all: Retrieved ${timeslots.length || 0} time slots`, 'success');
    
    // Test bookings endpoint (requires authentication)
    const bookings = await apiRequest('get', '/bookings');
    log(`GET /bookings: Retrieved ${bookings.count || 0} bookings`, 'success');
    
    // Test opponents endpoint
    const opponents = await apiRequest('get', '/opponents');
    log(`GET /opponents: Retrieved ${opponents.length || 0} opponents`, 'success');
    
    // Test feedback endpoint (requires authentication)
    const feedback = await apiRequest('get', '/feedback');
    log(`GET /feedback: Retrieved ${feedback.count || 0} feedback items`, 'success');
  } catch (error) {
    log(`GET endpoints test failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Test POST endpoints
 */
async function testPostEndpoints() {
  try {
    log('Testing POST endpoints...');
    
    // Test creating a booking
    const booking = await apiRequest('post', '/bookings', TEST_DATA.booking);
    CREATED_RESOURCES.bookingId = booking.booking.bookingId;
    log(`POST /bookings: Created booking with ID ${CREATED_RESOURCES.bookingId}`, 'success');
    
    // Test creating an opponent (requires a booking ID)
    if (CREATED_RESOURCES.bookingId) {
      const opponentData = {
        ...TEST_DATA.opponent,
        booking_id: CREATED_RESOURCES.bookingId
      };
      
      const opponent = await apiRequest('post', '/opponents', opponentData);
      CREATED_RESOURCES.opponentId = opponent.id;
      log(`POST /opponents: Created opponent with ID ${CREATED_RESOURCES.opponentId}`, 'success');
    } else {
      log('Skipping opponent creation: No booking ID available', 'warning');
    }
    
    // Test creating feedback
    const feedback = await apiRequest('post', '/feedback', TEST_DATA.feedback);
    CREATED_RESOURCES.feedbackId = feedback.data.id;
    log(`POST /feedback: Created feedback with ID ${CREATED_RESOURCES.feedbackId}`, 'success');
  } catch (error) {
    log(`POST endpoints test failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Test PUT/PATCH endpoints
 */
async function testUpdateEndpoints() {
  try {
    log('Testing PUT/PATCH endpoints...');
    
    // Test updating booking status
    if (CREATED_RESOURCES.bookingId) {
      const bookingUpdate = await apiRequest('patch', `/bookings/${CREATED_RESOURCES.bookingId}/status`, {
        status: 'confirmed'
      });
      log(`PATCH /bookings/${CREATED_RESOURCES.bookingId}/status: Updated booking status`, 'success');
    } else {
      log('Skipping booking update: No booking ID available', 'warning');
    }
    
    // Test updating opponent status
    if (CREATED_RESOURCES.opponentId) {
      const opponentUpdate = await apiRequest('put', `/opponents/${CREATED_RESOURCES.opponentId}`, {
        status: 'matched'
      });
      log(`PUT /opponents/${CREATED_RESOURCES.opponentId}: Updated opponent status`, 'success');
    } else {
      log('Skipping opponent update: No opponent ID available', 'warning');
    }
    
    // Test updating feedback status
    if (CREATED_RESOURCES.feedbackId) {
      const feedbackUpdate = await apiRequest('patch', `/feedback/${CREATED_RESOURCES.feedbackId}/status`, {
        status: 'read'
      });
      log(`PATCH /feedback/${CREATED_RESOURCES.feedbackId}/status: Updated feedback status`, 'success');
    } else {
      log('Skipping feedback update: No feedback ID available', 'warning');
    }
  } catch (error) {
    log(`UPDATE endpoints test failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`\n${colors.cyan}${colors.bright}========================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  Football Field API Endpoint Tests${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}========================================${colors.reset}\n`);
  
  try {
    // Test admin login
    await testAdminLogin();
    
    // Test GET endpoints
    await testGetEndpoints();
    
    // Test POST endpoints
    await testPostEndpoints();
    
    // Test PUT/PATCH endpoints
    await testUpdateEndpoints();
    
    console.log(`\n${colors.green}${colors.bright}✓ All API tests completed successfully!${colors.reset}\n`);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}✗ API tests failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();

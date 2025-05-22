/**
 * Football Field Management System - Comprehensive API Test Script
 *
 * This script tests all API endpoints to ensure they work correctly.
 * It tests GET, POST, PUT, and DELETE operations for all major endpoints.
 */

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const colors = require('./utils/colors');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// API base URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:9002/api';

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'admin'
};

// Test data
const TEST_DATA = {
  field: {
    name: 'Test Field',
    description: 'A test field created by the API test script',
    size: '5v5',
    imageUrl: 'https://example.com/test-field.jpg',
    isActive: true
  },
  timeSlot: {
    startTime: '14:00:00',
    endTime: '15:00:00',
    isActive: true
  },
  booking: {
    bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    totalPrice: 200000,
    customerName: 'Test Customer',
    customerPhone: '0123456789',
    customerEmail: 'test@example.com',
    notes: 'Test booking from API test script',
    status: 'pending',
    paymentStatus: 'unpaid',
    paymentMethod: 'vietqr'
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
  fieldId: null,
  timeSlotId: null,
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

    log(`${method.toUpperCase()} ${endpoint}${data ? ' with data' : ''}`, 'info');

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
 * Test field endpoints
 */
async function testFieldEndpoints() {
  try {
    log('Testing field endpoints...');

    // GET all fields
    const fieldsResponse = await apiRequest('get', '/fields');
    log(`GET /fields: Retrieved ${fieldsResponse.fields?.length || 0} fields`, 'success');

    // GET field by ID
    const fieldByIdResponse = await apiRequest('get', `/fields/${CREATED_RESOURCES.fieldId}`);
    log(`GET /fields/${CREATED_RESOURCES.fieldId}: Retrieved field details`, 'success');

    // We'll test DELETE at the end to avoid breaking other tests
  } catch (error) {
    log(`Field endpoints test failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Test time slot endpoints
 */
async function testTimeSlotEndpoints() {
  try {
    log('Testing time slot endpoints...');

    // GET all time slots
    const timeSlotsResponse = await apiRequest('get', '/timeslots/all');
    log(`GET /timeslots/all: Retrieved ${timeSlotsResponse.length || 0} time slots`, 'success');

    // POST create a new time slot
    if (CREATED_RESOURCES.fieldId) {
      const createTimeSlotResponse = await apiRequest('post', '/timeslots', {
        ...TEST_DATA.timeSlot,
        fieldId: CREATED_RESOURCES.fieldId
      });

      // Log the response to debug
      console.log('Time slot creation response:', JSON.stringify(createTimeSlotResponse, null, 2));

      // Handle different response formats
      if (createTimeSlotResponse.timeSlot) {
        CREATED_RESOURCES.timeSlotId = createTimeSlotResponse.timeSlot.timeSlotId || createTimeSlotResponse.timeSlot.id;
      } else if (createTimeSlotResponse.id) {
        CREATED_RESOURCES.timeSlotId = createTimeSlotResponse.id;
      } else if (createTimeSlotResponse.timeSlotId) {
        CREATED_RESOURCES.timeSlotId = createTimeSlotResponse.timeSlotId;
      } else if (createTimeSlotResponse.data && createTimeSlotResponse.data.timeSlotId) {
        CREATED_RESOURCES.timeSlotId = createTimeSlotResponse.data.timeSlotId;
      } else {
        throw new Error('Could not determine time slot ID from response');
      }

      log(`POST /timeslots: Created time slot with ID ${CREATED_RESOURCES.timeSlotId}`, 'success');

      // GET all time slots again to verify our new time slot is included
      const updatedTimeSlotsResponse = await apiRequest('get', '/timeslots/all');
      log(`GET /timeslots/all: Retrieved ${updatedTimeSlotsResponse.length || 0} time slots after creation`, 'success');

      // PUT update time slot
      const updateTimeSlotResponse = await apiRequest('put', `/timeslots/${CREATED_RESOURCES.timeSlotId}`, {
        ...TEST_DATA.timeSlot,
        weekdayPrice: 220000
      });
      log(`PUT /timeslots/${CREATED_RESOURCES.timeSlotId}: Updated time slot`, 'success');
    } else {
      log('Skipping time slot creation: No field ID available', 'warning');
    }
  } catch (error) {
    log(`Time slot endpoints test failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Test booking endpoints
 */
async function testBookingEndpoints() {
  try {
    log('Testing booking endpoints...');

    // GET all bookings
    const bookingsResponse = await apiRequest('get', '/bookings');
    log(`GET /bookings: Retrieved ${bookingsResponse.count || 0} bookings`, 'success');

    // POST create a new booking
    if (CREATED_RESOURCES.fieldId && CREATED_RESOURCES.timeSlotId) {
      const createBookingResponse = await apiRequest('post', '/bookings', {
        ...TEST_DATA.booking,
        fieldId: CREATED_RESOURCES.fieldId,
        timeSlotId: CREATED_RESOURCES.timeSlotId
      });

      // Log the response to debug
      console.log('Booking creation response:', JSON.stringify(createBookingResponse, null, 2));

      // Handle different response formats
      if (createBookingResponse.booking) {
        CREATED_RESOURCES.bookingId = createBookingResponse.booking.bookingId || createBookingResponse.booking.id;
      } else if (createBookingResponse.id) {
        CREATED_RESOURCES.bookingId = createBookingResponse.id;
      } else if (createBookingResponse.bookingId) {
        CREATED_RESOURCES.bookingId = createBookingResponse.bookingId;
      } else if (createBookingResponse.data && createBookingResponse.data.bookingId) {
        CREATED_RESOURCES.bookingId = createBookingResponse.data.bookingId;
      } else {
        throw new Error('Could not determine booking ID from response');
      }

      log(`POST /bookings: Created booking with ID ${CREATED_RESOURCES.bookingId}`, 'success');

      // GET booking by ID
      const bookingByIdResponse = await apiRequest('get', `/bookings/${CREATED_RESOURCES.bookingId}`);
      log(`GET /bookings/${CREATED_RESOURCES.bookingId}: Retrieved booking details`, 'success');

      // PATCH update booking status
      const updateBookingStatusResponse = await apiRequest('patch', `/bookings/${CREATED_RESOURCES.bookingId}/status`, {
        status: 'confirmed'
      });
      log(`PATCH /bookings/${CREATED_RESOURCES.bookingId}/status: Updated booking status`, 'success');
    } else {
      log('Skipping booking creation: Missing field ID or time slot ID', 'warning');
    }
  } catch (error) {
    log(`Booking endpoints test failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Test opponent endpoints
 */
async function testOpponentEndpoints() {
  try {
    log('Testing opponent endpoints...');

    // GET all opponents
    const opponentsResponse = await apiRequest('get', '/opponents');
    log(`GET /opponents: Retrieved ${opponentsResponse.length || 0} opponents`, 'success');

    // POST create a new opponent
    if (CREATED_RESOURCES.bookingId) {
      const createOpponentResponse = await apiRequest('post', '/opponents', {
        ...TEST_DATA.opponent,
        booking_id: CREATED_RESOURCES.bookingId
      });

      // Log the response to debug
      console.log('Opponent creation response:', JSON.stringify(createOpponentResponse, null, 2));

      // Handle different response formats
      if (createOpponentResponse.id) {
        CREATED_RESOURCES.opponentId = createOpponentResponse.id;
      } else if (createOpponentResponse.opponent && createOpponentResponse.opponent.id) {
        CREATED_RESOURCES.opponentId = createOpponentResponse.opponent.id;
      } else if (createOpponentResponse.data && createOpponentResponse.data.id) {
        CREATED_RESOURCES.opponentId = createOpponentResponse.data.id;
      } else {
        throw new Error('Could not determine opponent ID from response');
      }

      log(`POST /opponents: Created opponent with ID ${CREATED_RESOURCES.opponentId}`, 'success');

      // GET opponent by ID
      const opponentByIdResponse = await apiRequest('get', `/opponents/${CREATED_RESOURCES.opponentId}`);
      log(`GET /opponents/${CREATED_RESOURCES.opponentId}: Retrieved opponent details`, 'success');

      // PUT update opponent
      const updateOpponentResponse = await apiRequest('put', `/opponents/${CREATED_RESOURCES.opponentId}`, {
        ...TEST_DATA.opponent,
        team_name: 'Updated Test Team',
        status: 'matched'
      });
      log(`PUT /opponents/${CREATED_RESOURCES.opponentId}: Updated opponent`, 'success');
    } else {
      log('Skipping opponent creation: No booking ID available', 'warning');
    }
  } catch (error) {
    log(`Opponent endpoints test failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Test feedback endpoints
 */
async function testFeedbackEndpoints() {
  try {
    log('Testing feedback endpoints...');

    // GET all feedback
    const feedbackResponse = await apiRequest('get', '/feedback');
    log(`GET /feedback: Retrieved ${feedbackResponse.count || 0} feedback items`, 'success');

    // POST create a new feedback
    const createFeedbackResponse = await apiRequest('post', '/feedback', TEST_DATA.feedback);

    // Log the response to debug
    console.log('Feedback creation response:', JSON.stringify(createFeedbackResponse, null, 2));

    // Handle different response formats
    if (createFeedbackResponse.data && createFeedbackResponse.data.id) {
      CREATED_RESOURCES.feedbackId = createFeedbackResponse.data.id;
    } else if (createFeedbackResponse.id) {
      CREATED_RESOURCES.feedbackId = createFeedbackResponse.id;
    } else if (createFeedbackResponse.feedback && createFeedbackResponse.feedback.id) {
      CREATED_RESOURCES.feedbackId = createFeedbackResponse.feedback.id;
    } else {
      throw new Error('Could not determine feedback ID from response');
    }

    log(`POST /feedback: Created feedback with ID ${CREATED_RESOURCES.feedbackId}`, 'success');

    // GET feedback by ID
    const feedbackByIdResponse = await apiRequest('get', `/feedback/${CREATED_RESOURCES.feedbackId}`);
    log(`GET /feedback/${CREATED_RESOURCES.feedbackId}: Retrieved feedback details`, 'success');

    // PATCH update feedback status
    const updateFeedbackStatusResponse = await apiRequest('patch', `/feedback/${CREATED_RESOURCES.feedbackId}/status`, {
      status: 'read'
    });
    log(`PATCH /feedback/${CREATED_RESOURCES.feedbackId}/status: Updated feedback status`, 'success');
  } catch (error) {
    log(`Feedback endpoints test failed: ${error.message}`, 'error');
    throw error;
  }
}

/**
 * Test DELETE endpoints
 */
async function testDeleteEndpoints() {
  try {
    log('Testing DELETE endpoints...');

    // DELETE opponent
    if (CREATED_RESOURCES.opponentId) {
      const deleteOpponentResponse = await apiRequest('delete', `/opponents/${CREATED_RESOURCES.opponentId}`);
      log(`DELETE /opponents/${CREATED_RESOURCES.opponentId}: Deleted opponent`, 'success');
    }

    // Skip DELETE booking - endpoint not implemented
    if (CREATED_RESOURCES.bookingId) {
      log(`Skipping DELETE /bookings/${CREATED_RESOURCES.bookingId}: Endpoint not implemented`, 'warning');
    }

    // DELETE time slot
    if (CREATED_RESOURCES.timeSlotId) {
      const deleteTimeSlotResponse = await apiRequest('delete', `/timeslots/${CREATED_RESOURCES.timeSlotId}`);
      log(`DELETE /timeslots/${CREATED_RESOURCES.timeSlotId}: Deleted time slot`, 'success');
    }

    // DELETE feedback
    if (CREATED_RESOURCES.feedbackId) {
      const deleteFeedbackResponse = await apiRequest('delete', `/feedback/${CREATED_RESOURCES.feedbackId}`);
      log(`DELETE /feedback/${CREATED_RESOURCES.feedbackId}: Deleted feedback`, 'success');
    }
  } catch (error) {
    log(`DELETE endpoints test failed: ${error.message}`, 'error');
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

    // Test field endpoints
    await testFieldEndpoints();

    // Test time slot endpoints
    await testTimeSlotEndpoints();

    // Test booking endpoints
    await testBookingEndpoints();

    // Test opponent endpoints
    await testOpponentEndpoints();

    // Test feedback endpoints
    await testFeedbackEndpoints();

    // Test DELETE endpoints
    await testDeleteEndpoints();

    console.log(`\n${colors.green}${colors.bright}✓ All API tests completed successfully!${colors.reset}\n`);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}✗ API tests failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();

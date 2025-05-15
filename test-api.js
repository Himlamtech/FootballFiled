/**
 * API Test Script for Football Field Management System
 * 
 * This script tests all API endpoints to ensure they are working correctly.
 * It tests GET, POST, PUT, and DELETE methods for all resources.
 */

const axios = require('axios');
const chalk = require('chalk');

// Configuration
const API_URL = 'http://localhost:9002/api';
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'admin'
};

// Global variables
let adminToken = '';
let testFieldId = null;
let testBookingId = null;
let testFeedbackId = null;
let testOpponentId = null;

// Helper functions
const logSuccess = (message) => console.log(chalk.green(`✓ ${message}`));
const logError = (message, error) => {
  console.log(chalk.red(`✗ ${message}`));
  if (error.response) {
    console.log(chalk.red(`  Status: ${error.response.status}`));
    console.log(chalk.red(`  Data: ${JSON.stringify(error.response.data, null, 2)}`));
  } else if (error.request) {
    console.log(chalk.red(`  No response received`));
  } else {
    console.log(chalk.red(`  Error: ${error.message}`));
  }
};
const logInfo = (message) => console.log(chalk.blue(`ℹ ${message}`));
const logWarning = (message) => console.log(chalk.yellow(`⚠ ${message}`));

// API client with authorization header
const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Test functions
async function testAdminLogin() {
  try {
    logInfo('Testing admin login...');
    const response = await api.post('/auth/login', ADMIN_CREDENTIALS);
    adminToken = response.data.token;
    logSuccess('Admin login successful');
    return true;
  } catch (error) {
    logError('Admin login failed', error);
    return false;
  }
}

async function testGetFields() {
  try {
    logInfo('Testing GET /fields...');
    const response = await api.get('/fields');
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      logSuccess(`GET /fields returned ${response.data.length} fields`);
      return response.data;
    } else {
      logWarning('GET /fields returned no fields');
      return [];
    }
  } catch (error) {
    logError('GET /fields failed', error);
    return [];
  }
}

async function testCreateField() {
  try {
    logInfo('Testing POST /fields...');
    const newField = {
      name: 'Test Field',
      description: 'Test field for API testing',
      size: '5v5',
      pricePerHour: 250000,
      imageUrl: '/images/fields/test-field.jpg'
    };
    const response = await api.post('/fields', newField);
    if (response.data && response.data.fieldId) {
      testFieldId = response.data.fieldId;
      logSuccess(`POST /fields created field with ID ${testFieldId}`);
      return response.data;
    } else {
      logWarning('POST /fields returned unexpected response format');
      return null;
    }
  } catch (error) {
    logError('POST /fields failed', error);
    return null;
  }
}

async function testUpdateField() {
  if (!testFieldId) {
    logWarning('Skipping PUT /fields test because no field was created');
    return null;
  }
  
  try {
    logInfo(`Testing PUT /fields/${testFieldId}...`);
    const updatedField = {
      name: 'Updated Test Field',
      description: 'Updated test field description',
      pricePerHour: 300000
    };
    const response = await api.put(`/fields/${testFieldId}`, updatedField);
    logSuccess(`PUT /fields/${testFieldId} successful`);
    return response.data;
  } catch (error) {
    logError(`PUT /fields/${testFieldId} failed`, error);
    return null;
  }
}

async function testDeleteField() {
  if (!testFieldId) {
    logWarning('Skipping DELETE /fields test because no field was created');
    return false;
  }
  
  try {
    logInfo(`Testing DELETE /fields/${testFieldId}...`);
    const response = await api.delete(`/fields/${testFieldId}`);
    logSuccess(`DELETE /fields/${testFieldId} successful`);
    return true;
  } catch (error) {
    logError(`DELETE /fields/${testFieldId} failed`, error);
    return false;
  }
}

async function testCreateBooking() {
  try {
    logInfo('Testing POST /bookings...');
    const fields = await testGetFields();
    if (fields.length === 0) {
      logWarning('Skipping POST /bookings test because no fields are available');
      return null;
    }
    
    const fieldId = fields[0].fieldId;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];
    
    const newBooking = {
      fieldId: fieldId,
      timeSlotId: 1, // Assuming time slot 1 exists
      bookingDate: formattedDate,
      totalPrice: 200000
    };
    
    const response = await api.post('/bookings', newBooking);
    if (response.data && response.data.id) {
      testBookingId = response.data.id;
      logSuccess(`POST /bookings created booking with ID ${testBookingId}`);
      return response.data;
    } else {
      logWarning('POST /bookings returned unexpected response format');
      return null;
    }
  } catch (error) {
    logError('POST /bookings failed', error);
    return null;
  }
}

async function testUpdateBookingStatus() {
  if (!testBookingId) {
    logWarning('Skipping PATCH /bookings/status test because no booking was created');
    return null;
  }
  
  try {
    logInfo(`Testing PATCH /bookings/${testBookingId}/status...`);
    const response = await api.patch(`/bookings/${testBookingId}/status`, {
      status: 'confirmed'
    });
    logSuccess(`PATCH /bookings/${testBookingId}/status successful`);
    return response.data;
  } catch (error) {
    logError(`PATCH /bookings/${testBookingId}/status failed`, error);
    return null;
  }
}

async function testCreateFeedback() {
  try {
    logInfo('Testing POST /feedback...');
    const newFeedback = {
      name: 'Test User',
      email: 'test@example.com',
      content: 'This is a test feedback message'
    };
    const response = await api.post('/feedback', newFeedback);
    if (response.data && response.data.data && response.data.data.id) {
      testFeedbackId = response.data.data.id;
      logSuccess(`POST /feedback created feedback with ID ${testFeedbackId}`);
      return response.data;
    } else {
      logWarning('POST /feedback returned unexpected response format');
      return null;
    }
  } catch (error) {
    logError('POST /feedback failed', error);
    return null;
  }
}

async function testGetFeedback() {
  try {
    logInfo('Testing GET /feedback...');
    const response = await api.get('/feedback');
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      logSuccess(`GET /feedback returned ${response.data.data.length} feedback items`);
      return response.data;
    } else {
      logWarning('GET /feedback returned unexpected response format');
      return null;
    }
  } catch (error) {
    logError('GET /feedback failed', error);
    return null;
  }
}

async function testUpdateFeedback() {
  if (!testFeedbackId) {
    logWarning('Skipping PATCH /feedback/status test because no feedback was created');
    return null;
  }
  
  try {
    logInfo(`Testing PATCH /feedback/${testFeedbackId}/status...`);
    const response = await api.patch(`/feedback/${testFeedbackId}/status`, {
      status: 'read',
      response: 'Thank you for your feedback!'
    });
    logSuccess(`PATCH /feedback/${testFeedbackId}/status successful`);
    return response.data;
  } catch (error) {
    logError(`PATCH /feedback/${testFeedbackId}/status failed`, error);
    return null;
  }
}

async function testDeleteFeedback() {
  if (!testFeedbackId) {
    logWarning('Skipping DELETE /feedback test because no feedback was created');
    return false;
  }
  
  try {
    logInfo(`Testing DELETE /feedback/${testFeedbackId}...`);
    const response = await api.delete(`/feedback/${testFeedbackId}`);
    logSuccess(`DELETE /feedback/${testFeedbackId} successful`);
    return true;
  } catch (error) {
    logError(`DELETE /feedback/${testFeedbackId} failed`, error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log(chalk.bold.blue('=== Football Field Management API Test ==='));
  console.log(chalk.blue(`Testing API at ${API_URL}`));
  console.log(chalk.blue('----------------------------------------'));
  
  // Test authentication
  const loginSuccess = await testAdminLogin();
  if (!loginSuccess) {
    logError('Authentication failed, aborting tests');
    return;
  }
  
  // Test fields API
  await testGetFields();
  await testCreateField();
  await testUpdateField();
  
  // Test bookings API
  await testCreateBooking();
  await testUpdateBookingStatus();
  
  // Test feedback API
  await testCreateFeedback();
  await testGetFeedback();
  await testUpdateFeedback();
  await testDeleteFeedback();
  
  // Clean up
  await testDeleteField();
  
  console.log(chalk.blue('----------------------------------------'));
  console.log(chalk.bold.green('API tests completed!'));
}

// Run the tests
runTests().catch(error => {
  console.error(chalk.red('Test execution failed:'), error);
});

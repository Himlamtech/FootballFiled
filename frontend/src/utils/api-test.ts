import axios from 'axios';

// Hàm kiểm tra kết nối đến backend
export const testBackendConnection = async () => {
  try {
    const response = await axios.get('/api');
    console.log('Backend connection test:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return {
      success: false,
      error
    };
  }
};

// Hàm test GET request
export const testGetRequest = async (endpoint: string) => {
  try {
    console.log(`Testing GET ${endpoint}...`);
    const response = await axios.get(`/api${endpoint}`);
    console.log(`GET ${endpoint} response:`, response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`GET ${endpoint} failed:`, error);
    return {
      success: false,
      error
    };
  }
};

// Hàm test POST request
export const testPostRequest = async (endpoint: string, data: any) => {
  try {
    console.log(`Testing POST ${endpoint}...`);
    const response = await axios.post(`/api${endpoint}`, data);
    console.log(`POST ${endpoint} response:`, response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error);
    return {
      success: false,
      error
    };
  }
};

// Hàm test PUT request
export const testPutRequest = async (endpoint: string, data: any) => {
  try {
    console.log(`Testing PUT ${endpoint}...`);
    const response = await axios.put(`/api${endpoint}`, data);
    console.log(`PUT ${endpoint} response:`, response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`PUT ${endpoint} failed:`, error);
    return {
      success: false,
      error
    };
  }
};

// Hàm test DELETE request
export const testDeleteRequest = async (endpoint: string) => {
  try {
    console.log(`Testing DELETE ${endpoint}...`);
    const response = await axios.delete(`/api${endpoint}`);
    console.log(`DELETE ${endpoint} response:`, response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`DELETE ${endpoint} failed:`, error);
    return {
      success: false,
      error
    };
  }
};

// Hàm chạy tất cả các test
export const runAllTests = async () => {
  console.log('=== Starting API Tests ===');
  
  // Test kết nối
  const connectionTest = await testBackendConnection();
  if (!connectionTest.success) {
    console.error('Backend connection failed. Stopping tests.');
    return;
  }
  
  // Test GET endpoints
  await testGetRequest('/fields');
  await testGetRequest('/timeslots');
  await testGetRequest('/bookings');
  await testGetRequest('/products');
  await testGetRequest('/opponents/available');
  
  // Test POST endpoints (với dữ liệu mẫu)
  const bookingData = {
    fieldId: 1,
    timeSlotId: 1,
    customerName: 'Test User',
    customerPhone: '0123456789',
    customerEmail: 'test@example.com',
    bookingDate: new Date().toISOString().split('T')[0],
    notes: 'Test booking'
  };
  
  const bookingResult = await testPostRequest('/bookings', bookingData);
  
  // Nếu tạo booking thành công, test các endpoint khác
  if (bookingResult.success && bookingResult.data) {
    const bookingId = bookingResult.data.id;
    
    // Test opponent
    const opponentData = {
      bookingId,
      teamName: 'Test Team',
      contactPhone: '0123456789',
      contactEmail: 'test@example.com',
      description: 'Test opponent'
    };
    
    const opponentResult = await testPostRequest('/opponents', opponentData);
    
    if (opponentResult.success && opponentResult.data) {
      const opponentId = opponentResult.data.id;
      
      // Test PUT
      await testPutRequest(`/opponents/${opponentId}`, {
        ...opponentData,
        teamName: 'Updated Test Team'
      });
      
      // Test DELETE
      await testDeleteRequest(`/opponents/${opponentId}`);
    }
    
    // Xóa booking test
    await testDeleteRequest(`/bookings/${bookingId}`);
  }
  
  console.log('=== API Tests Completed ===');
};

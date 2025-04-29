import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { 
  testBackendConnection, 
  testGetRequest, 
  testPostRequest, 
  testPutRequest, 
  testDeleteRequest,
  runAllTests
} from '@/utils/api-test';

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  data?: any;
  error?: any;
  timestamp: Date;
}

const ApiTest = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('get');
  
  // Test kết nối khi trang được tải
  useEffect(() => {
    const checkConnection = async () => {
      setLoading(true);
      const result = await testBackendConnection();
      setResults([{
        endpoint: '/api',
        method: 'GET',
        success: result.success,
        data: result.data,
        error: result.success ? undefined : result.error,
        timestamp: new Date()
      }]);
      setLoading(false);
    };
    
    checkConnection();
  }, []);
  
  // Hàm chạy test GET
  const runGetTests = async () => {
    setLoading(true);
    setResults([]);
    
    const endpoints = [
      '/fields',
      '/fields/1',
      '/timeslots',
      '/bookings',
      '/products',
      '/opponents/available',
      '/feedbacks'
    ];
    
    for (const endpoint of endpoints) {
      const result = await testGetRequest(endpoint);
      setResults(prev => [...prev, {
        endpoint,
        method: 'GET',
        success: result.success,
        data: result.data,
        error: result.success ? undefined : result.error,
        timestamp: new Date()
      }]);
    }
    
    setLoading(false);
  };
  
  // Hàm chạy test POST
  const runPostTests = async () => {
    setLoading(true);
    setResults([]);
    
    // Test tạo booking
    const bookingData = {
      fieldId: 1,
      timeSlotId: 1,
      customerName: 'Test User',
      customerPhone: '0123456789',
      customerEmail: 'test@example.com',
      bookingDate: new Date().toISOString().split('T')[0],
      notes: 'Test booking from API test'
    };
    
    const bookingResult = await testPostRequest('/bookings', bookingData);
    setResults(prev => [...prev, {
      endpoint: '/bookings',
      method: 'POST',
      success: bookingResult.success,
      data: bookingResult.data,
      error: bookingResult.success ? undefined : bookingResult.error,
      timestamp: new Date()
    }]);
    
    // Test tạo opponent
    if (bookingResult.success && bookingResult.data) {
      const opponentData = {
        bookingId: bookingResult.data.id,
        teamName: 'Test Team',
        contactPhone: '0123456789',
        contactEmail: 'test@example.com',
        description: 'Test opponent from API test'
      };
      
      const opponentResult = await testPostRequest('/opponents', opponentData);
      setResults(prev => [...prev, {
        endpoint: '/opponents',
        method: 'POST',
        success: opponentResult.success,
        data: opponentResult.data,
        error: opponentResult.success ? undefined : opponentResult.error,
        timestamp: new Date()
      }]);
    }
    
    // Test tạo feedback
    const feedbackData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '0123456789',
      rating: 5,
      comment: 'Test feedback from API test'
    };
    
    const feedbackResult = await testPostRequest('/feedbacks', feedbackData);
    setResults(prev => [...prev, {
      endpoint: '/feedbacks',
      method: 'POST',
      success: feedbackResult.success,
      data: feedbackResult.data,
      error: feedbackResult.success ? undefined : feedbackResult.error,
      timestamp: new Date()
    }]);
    
    setLoading(false);
  };
  
  // Hàm chạy test PUT
  const runPutTests = async () => {
    setLoading(true);
    setResults([]);
    
    // Lấy danh sách bookings để có ID để update
    const bookingsResult = await testGetRequest('/bookings');
    
    if (bookingsResult.success && bookingsResult.data && bookingsResult.data.bookings && bookingsResult.data.bookings.length > 0) {
      const bookingId = bookingsResult.data.bookings[0].id;
      
      // Update booking
      const bookingData = {
        customerName: 'Updated Test User',
        customerPhone: '9876543210',
        notes: 'Updated test booking'
      };
      
      const updateResult = await testPutRequest(`/bookings/${bookingId}`, bookingData);
      setResults(prev => [...prev, {
        endpoint: `/bookings/${bookingId}`,
        method: 'PUT',
        success: updateResult.success,
        data: updateResult.data,
        error: updateResult.success ? undefined : updateResult.error,
        timestamp: new Date()
      }]);
    } else {
      setResults(prev => [...prev, {
        endpoint: '/bookings/update',
        method: 'PUT',
        success: false,
        error: 'No bookings found to update',
        timestamp: new Date()
      }]);
    }
    
    // Lấy danh sách opponents để có ID để update
    const opponentsResult = await testGetRequest('/opponents/available');
    
    if (opponentsResult.success && opponentsResult.data && opponentsResult.data.opponents && opponentsResult.data.opponents.length > 0) {
      const opponentId = opponentsResult.data.opponents[0].id;
      
      // Update opponent
      const opponentData = {
        teamName: 'Updated Test Team',
        description: 'Updated test opponent'
      };
      
      const updateResult = await testPutRequest(`/opponents/${opponentId}`, opponentData);
      setResults(prev => [...prev, {
        endpoint: `/opponents/${opponentId}`,
        method: 'PUT',
        success: updateResult.success,
        data: updateResult.data,
        error: updateResult.success ? undefined : updateResult.error,
        timestamp: new Date()
      }]);
    } else {
      setResults(prev => [...prev, {
        endpoint: '/opponents/update',
        method: 'PUT',
        success: false,
        error: 'No opponents found to update',
        timestamp: new Date()
      }]);
    }
    
    setLoading(false);
  };
  
  // Hàm chạy test DELETE
  const runDeleteTests = async () => {
    setLoading(true);
    setResults([]);
    
    // Tạo booking mới để xóa
    const bookingData = {
      fieldId: 1,
      timeSlotId: 1,
      customerName: 'Delete Test User',
      customerPhone: '0123456789',
      customerEmail: 'delete@example.com',
      bookingDate: new Date().toISOString().split('T')[0],
      notes: 'Test booking to delete'
    };
    
    const bookingResult = await testPostRequest('/bookings', bookingData);
    
    if (bookingResult.success && bookingResult.data) {
      const bookingId = bookingResult.data.id;
      
      // Xóa booking
      const deleteResult = await testDeleteRequest(`/bookings/${bookingId}`);
      setResults(prev => [...prev, {
        endpoint: `/bookings/${bookingId}`,
        method: 'DELETE',
        success: deleteResult.success,
        data: deleteResult.data,
        error: deleteResult.success ? undefined : deleteResult.error,
        timestamp: new Date()
      }]);
    } else {
      setResults(prev => [...prev, {
        endpoint: '/bookings/delete',
        method: 'DELETE',
        success: false,
        error: 'Failed to create booking to delete',
        timestamp: new Date()
      }]);
    }
    
    // Tạo opponent mới để xóa
    const newBookingData = {
      fieldId: 1,
      timeSlotId: 2,
      customerName: 'Delete Test User',
      customerPhone: '0123456789',
      customerEmail: 'delete@example.com',
      bookingDate: new Date().toISOString().split('T')[0],
      notes: 'Test booking for opponent to delete'
    };
    
    const newBookingResult = await testPostRequest('/bookings', newBookingData);
    
    if (newBookingResult.success && newBookingResult.data) {
      const bookingId = newBookingResult.data.id;
      
      // Tạo opponent
      const opponentData = {
        bookingId,
        teamName: 'Delete Test Team',
        contactPhone: '0123456789',
        description: 'Test opponent to delete'
      };
      
      const opponentResult = await testPostRequest('/opponents', opponentData);
      
      if (opponentResult.success && opponentResult.data) {
        const opponentId = opponentResult.data.id;
        
        // Xóa opponent
        const deleteResult = await testDeleteRequest(`/opponents/${opponentId}`);
        setResults(prev => [...prev, {
          endpoint: `/opponents/${opponentId}`,
          method: 'DELETE',
          success: deleteResult.success,
          data: deleteResult.data,
          error: deleteResult.success ? undefined : deleteResult.error,
          timestamp: new Date()
        }]);
        
        // Xóa booking
        await testDeleteRequest(`/bookings/${bookingId}`);
      } else {
        setResults(prev => [...prev, {
          endpoint: '/opponents/delete',
          method: 'DELETE',
          success: false,
          error: 'Failed to create opponent to delete',
          timestamp: new Date()
        }]);
        
        // Xóa booking
        await testDeleteRequest(`/bookings/${bookingId}`);
      }
    } else {
      setResults(prev => [...prev, {
        endpoint: '/bookings/delete-for-opponent',
        method: 'DELETE',
        success: false,
        error: 'Failed to create booking for opponent to delete',
        timestamp: new Date()
      }]);
    }
    
    setLoading(false);
  };
  
  // Hàm chạy tất cả các test
  const runAll = async () => {
    setLoading(true);
    setResults([]);
    
    // Test kết nối
    const connectionResult = await testBackendConnection();
    setResults([{
      endpoint: '/api',
      method: 'GET',
      success: connectionResult.success,
      data: connectionResult.data,
      error: connectionResult.success ? undefined : connectionResult.error,
      timestamp: new Date()
    }]);
    
    if (!connectionResult.success) {
      setLoading(false);
      return;
    }
    
    // Chạy các test GET
    await runGetTests();
    
    // Chạy các test POST
    await runPostTests();
    
    // Chạy các test PUT
    await runPutTests();
    
    // Chạy các test DELETE
    await runDeleteTests();
    
    setLoading(false);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Test Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Backend Connection</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 && results[0].endpoint === '/api' ? (
              results[0].success ? (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Connected</span>
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <XCircle className="h-5 w-5 mr-2" />
                  <span>Failed</span>
                </div>
              )
            ) : (
              <div className="flex items-center text-gray-500">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                <span>Checking...</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{results.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {results.filter(r => r.success).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {results.filter(r => !r.success).length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={runAll} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Run All Tests
        </Button>
        
        <Button 
          onClick={runGetTests} 
          disabled={loading}
          variant="outline"
        >
          Test GET Endpoints
        </Button>
        
        <Button 
          onClick={runPostTests} 
          disabled={loading}
          variant="outline"
        >
          Test POST Endpoints
        </Button>
        
        <Button 
          onClick={runPutTests} 
          disabled={loading}
          variant="outline"
        >
          Test PUT Endpoints
        </Button>
        
        <Button 
          onClick={runDeleteTests} 
          disabled={loading}
          variant="outline"
        >
          Test DELETE Endpoints
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="get">GET Results</TabsTrigger>
          <TabsTrigger value="post">POST Results</TabsTrigger>
          <TabsTrigger value="put">PUT Results</TabsTrigger>
          <TabsTrigger value="delete">DELETE Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="get">
          {results.filter(r => r.method === 'GET').length === 0 ? (
            <Alert>
              <AlertTitle>No GET tests run yet</AlertTitle>
              <AlertDescription>
                Click "Test GET Endpoints" to run GET tests.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {results
                .filter(r => r.method === 'GET')
                .map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <span>GET {result.endpoint}</span>
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.success ? (
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      ) : (
                        <div className="text-red-500">
                          <p>Error: {result.error?.message || 'Unknown error'}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="post">
          {results.filter(r => r.method === 'POST').length === 0 ? (
            <Alert>
              <AlertTitle>No POST tests run yet</AlertTitle>
              <AlertDescription>
                Click "Test POST Endpoints" to run POST tests.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {results
                .filter(r => r.method === 'POST')
                .map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <span>POST {result.endpoint}</span>
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.success ? (
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      ) : (
                        <div className="text-red-500">
                          <p>Error: {result.error?.message || 'Unknown error'}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="put">
          {results.filter(r => r.method === 'PUT').length === 0 ? (
            <Alert>
              <AlertTitle>No PUT tests run yet</AlertTitle>
              <AlertDescription>
                Click "Test PUT Endpoints" to run PUT tests.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {results
                .filter(r => r.method === 'PUT')
                .map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <span>PUT {result.endpoint}</span>
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.success ? (
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      ) : (
                        <div className="text-red-500">
                          <p>Error: {result.error?.message || 'Unknown error'}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="delete">
          {results.filter(r => r.method === 'DELETE').length === 0 ? (
            <Alert>
              <AlertTitle>No DELETE tests run yet</AlertTitle>
              <AlertDescription>
                Click "Test DELETE Endpoints" to run DELETE tests.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {results
                .filter(r => r.method === 'DELETE')
                .map((result, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between">
                        <span>DELETE {result.endpoint}</span>
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {result.success ? (
                        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      ) : (
                        <div className="text-red-500">
                          <p>Error: {result.error?.message || 'Unknown error'}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiTest;

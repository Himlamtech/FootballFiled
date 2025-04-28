import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldAPI, bookingAPI, productAPI } from '../../lib/api';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useAuth } from '../../lib/auth';

const BookingForm = ({ fieldId }) => {
  const [field, setField] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/fields/${fieldId}` } });
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch field details
        const fieldResponse = await fieldAPI.getFieldById(fieldId);
        setField(fieldResponse.data);
        
        // Fetch available products
        const productsResponse = await productAPI.getAllProducts();
        setProducts(productsResponse.data.products);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [fieldId, isAuthenticated, navigate]);
  
  useEffect(() => {
    // Calculate total price whenever form data or selected products change
    if (!field) return;
    
    let total = 0;
    
    // Calculate field rental price if both start and end times are set
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      
      // Calculate duration in hours
      const durationMs = end - start;
      const durationHours = durationMs / (1000 * 60 * 60);
      
      // Calculate field rental cost
      if (durationHours > 0) {
        total += field.hourlyRate * durationHours;
      }
    }
    
    // Add costs of selected products
    selectedProducts.forEach((product) => {
      total += product.price * product.quantity;
    });
    
    setTotalPrice(total);
  }, [field, formData, selectedProducts]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Reset availability check when times change
    if (name === 'startTime' || name === 'endTime' || name === 'date') {
      setIsAvailable(null);
    }
  };
  
  const checkAvailability = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setError('Please select date and time');
      return;
    }
    
    try {
      setLoading(true);
      const params = {
        fieldId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };
      
      const response = await fieldAPI.checkAvailability(params);
      setIsAvailable(response.data.isAvailable);
      
      if (!response.data.isAvailable) {
        setError('This time slot is not available. Please choose another time.');
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setError('Failed to check availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleProductSelect = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    
    if (!product) return;
    
    const existingProduct = selectedProducts.find((p) => p.id === product.id);
    
    if (existingProduct) {
      // If already selected, remove it
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id));
    } else {
      // Otherwise add it with quantity 1
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };
  
  const handleQuantityChange = (productId, quantity) => {
    setSelectedProducts(
      selectedProducts.map((product) =>
        product.id === productId ? { ...product, quantity: parseInt(quantity, 10) } : product
      )
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/fields/${fieldId}` } });
      return;
    }
    
    if (!formData.date || !formData.startTime || !formData.endTime) {
      setError('Please select date and time');
      return;
    }
    
    if (isAvailable !== true) {
      setError('Please check availability before booking');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const bookingData = {
        fieldId: parseInt(fieldId, 10),
        bookingDate: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        totalPrice,
        products: selectedProducts.map((product) => ({
          id: product.id,
          quantity: product.quantity,
        })),
      };
      
      await bookingAPI.createBooking(bookingData);
      
      setSuccess('Booking created successfully!');
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading && !field) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <Card title="Book this Field">
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              name="startTime"
              type="time"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
            
            <Input
              label="End Time"
              name="endTime"
              type="time"
              value={formData.endTime}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <Button
            type="button"
            variant="secondary"
            onClick={checkAvailability}
            disabled={!formData.date || !formData.startTime || !formData.endTime || loading}
            isLoading={loading && isAvailable === null}
          >
            Check Availability
          </Button>
          
          {isAvailable === true && (
            <div className="mt-2 text-green-600 text-sm">
              ✓ This time slot is available
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Products/Services
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`border rounded-md p-3 cursor-pointer 
                  ${selectedProducts.some((p) => p.id === product.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300'
                  }`}
                onClick={() => handleProductSelect(product.id)}
              >
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <p className="text-sm text-gray-600">${product.price}</p>
                  </div>
                  
                  {selectedProducts.some((p) => p.id === product.id) && (
                    <input
                      type="number"
                      min="1"
                      value={
                        selectedProducts.find((p) => p.id === product.id)?.quantity || 1
                      }
                      onChange={(e) => {
                        e.stopPropagation(); // Prevent toggling selection
                        handleQuantityChange(product.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()} // Prevent toggling selection
                      className="w-16 border border-gray-300 rounded-md p-1 text-center"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Booking Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Field Rental:</span>
              <span>${(totalPrice - selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0)).toFixed(2)}</span>
            </div>
            
            {selectedProducts.length > 0 && (
              <div>
                <div className="text-sm font-medium mt-2 mb-1">Additional Items:</div>
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex justify-between text-sm pl-4">
                    <span>
                      {product.name} x{product.quantity}
                    </span>
                    <span>${(product.price * product.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t pt-2 mt-2 font-bold flex justify-between">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={!isAvailable || submitting}
          isLoading={submitting}
        >
          Complete Booking
        </Button>
      </form>
    </Card>
  );
};

export default BookingForm; 
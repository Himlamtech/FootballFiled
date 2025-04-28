import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fieldAPI } from '../../lib/api';
import MainLayout from '../../components/layouts/MainLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../lib/auth';

const FieldList = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    size: '',
  });
  
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    fetchFields();
  }, [pagination.currentPage, filters]);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.currentPage,
        limit: 6,
        ...filters,
      };
      
      const response = await fieldAPI.getAllFields(params);
      setFields(response.data.fields);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems,
      });
    } catch (error) {
      console.error('Error fetching fields:', error);
      setError('Failed to fetch fields. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Football Fields</h1>
          {isAdmin && (
            <Link to="/fields/create">
              <Button variant="primary">Add New Field</Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="booked">Booked</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Size
              </label>
              <select
                name="size"
                value={filters.size}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Sizes</option>
                <option value="5-a-side">5-a-side</option>
                <option value="7-a-side">7-a-side</option>
                <option value="11-a-side">11-a-side</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setFilters({ status: '', size: '' });
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* Error icon */}
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fields grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : fields.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <Card key={field.id} className="h-full flex flex-col">
                <div className="flex-1 flex flex-col">
                  <div className="relative pb-2/3 w-full">
                    <img
                      src={field.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={field.name}
                      className="absolute h-full w-full object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-semibold 
                          ${field.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : field.status === 'maintenance' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {field.status.charAt(0).toUpperCase() + field.status.slice(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{field.location}</p>
                    <p className="mt-1 text-sm text-gray-600">Size: {field.size}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      ${field.hourlyRate} / hour
                    </p>
                    {field.rating ? (
                      <div className="mt-2 flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="text-sm text-gray-600">
                          {field.rating.toFixed(1)} ({field.ratingCount} reviews)
                        </span>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">No ratings yet</p>
                    )}
                  </div>
                  <div className="p-4 pt-0 mt-auto">
                    <Link to={`/fields/${field.id}`}>
                      <Button variant="primary" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    {isAdmin && (
                      <div className="flex space-x-2 mt-2">
                        <Link to={`/fields/edit/${field.id}`} className="flex-1">
                          <Button variant="secondary" className="w-full" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/fields/bookings/${field.id}`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm">
                            Bookings
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900">No fields found</h3>
            <p className="mt-2 text-sm text-gray-600">
              Try adjusting your filters or check back later for new field listings.
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                size="sm"
              >
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                    ${
                      pagination.currentPage === index + 1
                        ? 'z-10 bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                size="sm"
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FieldList; 
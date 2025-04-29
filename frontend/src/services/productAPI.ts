import axios from 'axios';

const BASE_URL = 'http://localhost:9002/api/products';

export interface ProductData {
  name: string;
  price: number;
  image_url?: string;
  category: string;
  type: string;
  description?: string;
  stock_quantity: number;
  is_available?: boolean;
}

const productAPI = {
  getAllProducts: async () => {
    try {
      const response = await axios.get(BASE_URL);
      return response;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id: number) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching product with id ${id}:`, error);
      throw error;
    }
  },

  createProduct: async (productData: ProductData) => {
    try {
      const response = await axios.post(BASE_URL, productData);
      return response;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (id: number, productData: Partial<ProductData>) => {
    try {
      const response = await axios.put(`${BASE_URL}/${id}`, productData);
      return response;
    } catch (error) {
      console.error(`Error updating product with id ${id}:`, error);
      throw error;
    }
  },

  deleteProduct: async (id: number) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting product with id ${id}:`, error);
      throw error;
    }
  }
};

export default productAPI;

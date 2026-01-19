import api from './api';

const categoryService = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data.categories;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch categories' };
    }
  },

  // Get a single category by ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data.category;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch category' };
    }
  },

  // Create a new category
  createCategory: async (name) => {
    try {
      const response = await api.post('/categories', { name });
      return response.data.category;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create category' };
    }
  },

  // Update a category
  updateCategory: async (id, name) => {
    try {
      const response = await api.put(`/categories/${id}`, { name });
      return response.data.category;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update category' };
    }
  },

  // Delete a category
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete category' };
    }
  }
};

export default categoryService;


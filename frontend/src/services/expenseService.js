import api from './api';

const expenseService = {
  // Get all expenses with optional filters
  getExpenses: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.categoryId) {
        params.append('categoryId', filters.categoryId);
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }
      
      const queryString = params.toString();
      const url = queryString ? `/expenses?${queryString}` : '/expenses';
      
      const response = await api.get(url);
      return response.data.expenses;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch expenses' };
    }
  },

  // Get a single expense by ID
  getExpenseById: async (id) => {
    try {
      const response = await api.get(`/expenses/${id}`);
      return response.data.expense;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch expense' };
    }
  },

  // Create a new expense
  createExpense: async (expenseData) => {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data.expense;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create expense' };
    }
  },

  // Update an expense
  updateExpense: async (id, expenseData) => {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return response.data.expense;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update expense' };
    }
  },

  // Delete an expense
  deleteExpense: async (id) => {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete expense' };
    }
  }
};

export default expenseService;


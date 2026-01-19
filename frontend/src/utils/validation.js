/**
 * Validation utilities for expense form
 */

export const validateExpenseForm = (formData) => {
    const errors = {};

    // Amount validation
    if (!formData.amount || formData.amount === '') {
        errors.amount = 'Amount is required';
    } else {
        const amount = parseFloat(formData.amount);
        if (isNaN(amount)) {
            errors.amount = 'Please enter a valid number';
        } else if (amount <= 0) {
            errors.amount = 'Amount must be greater than 0';
        } else if (amount > 10000000) {
            errors.amount = 'Amount cannot exceed ₹1,00,00,000';
        }
    }

    // Category validation
    if (!formData.categoryId || formData.categoryId === '') {
        errors.categoryId = 'Please select a category';
    }

    // Date validation
    if (!formData.date || formData.date === '') {
        errors.date = 'Date is required';
    } else {
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        
        if (isNaN(selectedDate.getTime())) {
            errors.date = 'Please enter a valid date';
        } else if (selectedDate > today) {
            errors.date = 'Date cannot be in the future';
        }
        
        // Check if date is too far in the past (more than 10 years)
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        if (selectedDate < tenYearsAgo) {
            errors.date = 'Date cannot be more than 10 years ago';
        }
    }

    // Description validation (optional but if provided, should be valid)
    if (formData.description && formData.description.length > 500) {
        errors.description = 'Description cannot exceed 500 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateCategoryName = (name) => {
    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Category name is required' };
    }
    
    if (name.trim().length < 2) {
        return { isValid: false, error: 'Category name must be at least 2 characters' };
    }
    
    if (name.trim().length > 50) {
        return { isValid: false, error: 'Category name cannot exceed 50 characters' };
    }
    
    return { isValid: true, error: null };
};

/**
 * Format validation error messages for display
 */
export const formatValidationErrors = (errors) => {
    return Object.values(errors).filter(Boolean);
};


import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import expenseService from '../services/expenseService';
import categoryService from '../services/categoryService';
import authService from '../services/authService';
import CategoryPieChart, { CategoryBreakdown } from '../components/CategoryPieChart';
import { validateExpenseForm, validateCategoryName } from '../utils/validation';

// Skeleton loader component
const SkeletonLoader = ({ className = '' }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

// Toast notification component
const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-blue-50 border-blue-200 text-blue-700';

    const icon = type === 'success' ? (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
    ) : type === 'error' ? (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ) : (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl border ${bgColor} shadow-lg flex items-center gap-3 animate-slide-up`}>
            {icon}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

// Empty state component
const EmptyState = ({ title, description, icon, action }) => (
    <div className="p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            {icon}
        </div>
        <p className="text-slate-600 font-semibold text-lg mb-1">{title}</p>
        <p className="text-slate-400 text-sm mb-4">{description}</p>
        {action}
    </div>
);

// Field error component
const FieldError = ({ error }) => {
    if (!error) return null;
    return (
        <p className="mt-1 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
        </p>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]); // For summary view (unfiltered)
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        amount: '',
        categoryId: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [formErrors, setFormErrors] = useState({});
    const [formTouched, setFormTouched] = useState({});
    const [submitting, setSubmitting] = useState(false);
    
    // Filter and sort state
    const [filterCategoryId, setFilterCategoryId] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // New category state
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [categorySubmitting, setCategorySubmitting] = useState(false);
    const [categoryError, setCategoryError] = useState(null);

    // Edit expense state
    const [editingExpense, setEditingExpense] = useState(null);
    
    // Delete confirmation state
    const [deletingId, setDeletingId] = useState(null);

    // View toggle state
    const [activeView, setActiveView] = useState('list'); // 'list' or 'summary'

    // Check auth on mount
    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate('/login');
        }
    }, [navigate]);

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [expensesData, allExpensesData, categoriesData] = await Promise.all([
                expenseService.getExpenses({
                    categoryId: filterCategoryId || undefined,
                    sortBy: 'date',
                    sortOrder: sortOrder
                }),
                expenseService.getExpenses({ sortBy: 'date', sortOrder: 'desc' }),
                categoryService.getCategories()
            ]);
            setExpenses(expensesData);
            setAllExpenses(allExpensesData);
            setCategories(categoriesData);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load data. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }, [filterCategoryId, sortOrder]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Calculate total of visible expenses
    const totalAmount = useMemo(() => {
        return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    }, [expenses]);

    // Real-time validation
    useEffect(() => {
        if (Object.keys(formTouched).length > 0) {
            const { errors } = validateExpenseForm(formData);
            setFormErrors(errors);
        }
    }, [formData, formTouched]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle field blur for validation
    const handleBlur = (e) => {
        const { name } = e.target;
        setFormTouched(prev => ({ ...prev, [name]: true }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all fields
        const { isValid, errors } = validateExpenseForm(formData);
        setFormErrors(errors);
        setFormTouched({ amount: true, categoryId: true, date: true, description: true });
        
        if (!isValid) {
            setToast({ message: 'Please fix the errors in the form', type: 'error' });
            return;
        }

        setSubmitting(true);

        try {
            const expenseData = {
                amount: parseFloat(formData.amount),
                categoryId: parseInt(formData.categoryId),
                description: formData.description || null,
                date: formData.date
            };

            if (editingExpense) {
                await expenseService.updateExpense(editingExpense.id, expenseData);
                setToast({ message: 'Expense updated successfully!', type: 'success' });
                setEditingExpense(null);
            } else {
                await expenseService.createExpense(expenseData);
                setToast({ message: 'Expense added successfully!', type: 'success' });
            }

            // Reset form and refresh data
            setFormData({
                amount: '',
                categoryId: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            setFormErrors({});
            setFormTouched({});
            await fetchData();
        } catch (err) {
            setToast({ message: err.message || 'Failed to save expense', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit expense
    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            amount: expense.amount.toString(),
            categoryId: expense.category_id?.toString() || expense.categoryId?.toString() || '',
            description: expense.description || '',
            date: expense.date?.split('T')[0] || expense.date
        });
        setFormErrors({});
        setFormTouched({});
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingExpense(null);
        setFormData({
            amount: '',
            categoryId: '',
            description: '',
            date: new Date().toISOString().split('T')[0]
        });
        setFormErrors({});
        setFormTouched({});
    };

    // Handle delete expense
    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await expenseService.deleteExpense(id);
            setToast({ message: 'Expense deleted successfully!', type: 'success' });
            await fetchData();
        } catch (err) {
            setToast({ message: err.message || 'Failed to delete expense', type: 'error' });
        } finally {
            setDeletingId(null);
        }
    };

    // Handle create category
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        
        const validation = validateCategoryName(newCategoryName);
        if (!validation.isValid) {
            setCategoryError(validation.error);
            return;
        }

        setCategorySubmitting(true);
        setCategoryError(null);
        
        try {
            const newCategory = await categoryService.createCategory(newCategoryName.trim());
            setNewCategoryName('');
            setShowCategoryForm(false);
            setFormData(prev => ({ ...prev, categoryId: newCategory.id.toString() }));
            setToast({ message: `Category "${newCategoryName.trim()}" created!`, type: 'success' });
            await fetchData();
        } catch (err) {
            setCategoryError(err.message || 'Failed to create category');
        } finally {
            setCategorySubmitting(false);
        }
    };

    // Handle logout
    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Get category name by ID
    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category?.name || 'Unknown';
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const user = authService.getCurrentUser();

    // Loading skeleton
    if (loading && expenses.length === 0) {
        return (
            <div className="min-h-screen mesh-gradient">
                <header className="glass sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <SkeletonLoader className="h-10 w-48" />
                            <SkeletonLoader className="h-8 w-24" />
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="space-y-6">
                            <div className="glass rounded-2xl p-6">
                                <SkeletonLoader className="h-6 w-32 mb-4" />
                                <div className="space-y-4">
                                    <SkeletonLoader className="h-12 w-full" />
                                    <SkeletonLoader className="h-12 w-full" />
                                    <SkeletonLoader className="h-12 w-full" />
                                    <SkeletonLoader className="h-24 w-full" />
                                    <SkeletonLoader className="h-12 w-full" />
                                </div>
                            </div>
                            <div className="glass rounded-2xl p-6">
                                <SkeletonLoader className="h-8 w-full" />
                            </div>
                        </div>
                        <div className="lg:col-span-2">
                            <div className="glass rounded-2xl p-6">
                                <SkeletonLoader className="h-6 w-48 mb-6" />
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <SkeletonLoader key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen h-screen overflow-hidden mesh-gradient flex flex-col">
            {/* Toast Notification */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            {/* Header */}
            <header className="glass sticky top-0 z-50 shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                                Fenmo Expense Tracker
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-slate-600 text-sm hidden sm:block">
                                Welcome, <span className="font-semibold text-slate-800">{user?.name || 'User'}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-accent transition-colors flex items-center gap-2 rounded-lg hover:bg-slate-100"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 min-h-0">
                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 animate-fade-in">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <p className="font-medium">Something went wrong</p>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-100 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                <div className="grid lg:grid-cols-4 gap-6 h-full min-h-0">
                    {/* Left Column - Form & Summary */}
                    <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto pr-1">
                        {/* Add Expense Form */}
                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                {editingExpense ? (
                                    <>
                                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Expense
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Expense
                                    </>
                                )}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Amount <span className="text-brand-accent">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0.01"
                                            className={`input-field pl-8 ${formTouched.amount && formErrors.amount ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                                        />
                                    </div>
                                    <FieldError error={formTouched.amount && formErrors.amount} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Category <span className="text-brand-accent">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            className={`input-field flex-1 ${formTouched.categoryId && formErrors.categoryId ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                                        >
                                            <option value="">Select category</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCategoryForm(!showCategoryForm);
                                                setCategoryError(null);
                                            }}
                                            className={`px-3 py-2 rounded-xl transition-colors ${showCategoryForm ? 'bg-brand-primary text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                                            title="Add new category"
                                        >
                                            <svg className={`w-5 h-5 transition-transform ${showCategoryForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </button>
                                    </div>
                                    <FieldError error={formTouched.categoryId && formErrors.categoryId} />
                                </div>

                                {/* Add Category Mini Form */}
                                {showCategoryForm && (
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 space-y-3 animate-fade-in">
                                        <p className="text-sm font-medium text-slate-700">Create New Category</p>
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => {
                                                setNewCategoryName(e.target.value);
                                                setCategoryError(null);
                                            }}
                                            placeholder="e.g., Groceries, Transport"
                                            className="input-field text-sm"
                                            maxLength={50}
                                        />
                                        {categoryError && <FieldError error={categoryError} />}
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={handleCreateCategory}
                                                disabled={categorySubmitting || !newCategoryName.trim()}
                                                className="flex-1 px-3 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                            >
                                                {categorySubmitting ? (
                                                    <>
                                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Creating...
                                                    </>
                                                ) : (
                                                    'Create Category'
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCategoryForm(false);
                                                    setNewCategoryName('');
                                                    setCategoryError(null);
                                                }}
                                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Date <span className="text-brand-accent">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        max={new Date().toISOString().split('T')[0]}
                                        className={`input-field ${formTouched.date && formErrors.date ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                                    />
                                    <FieldError error={formTouched.date && formErrors.date} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Description
                                        <span className="text-slate-400 font-normal ml-1">(optional)</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        placeholder="What was this expense for?"
                                        rows={3}
                                        maxLength={500}
                                        className={`input-field resize-none ${formTouched.description && formErrors.description ? 'border-red-300 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                                    />
                                    <div className="flex justify-between items-center mt-1">
                                        <FieldError error={formTouched.description && formErrors.description} />
                                        <span className={`text-xs ${formData.description.length > 450 ? 'text-amber-500' : 'text-slate-400'}`}>
                                            {formData.description.length}/500
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {editingExpense ? 'Update Expense' : 'Add Expense'}
                                            </>
                                        )}
                                    </button>
                                    {editingExpense && (
                                        <button
                                            type="button"
                                            onClick={handleCancelEdit}
                                            className="px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Total & Stats Card */}
                        <div className="glass rounded-2xl p-6 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-lg shadow-brand-primary/20">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">
                                            {filterCategoryId ? 'Filtered Total' : 'Total Expenses'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
                                        </p>
                                    </div>
                                </div>
                                {filterCategoryId && (
                                    <button
                                        onClick={() => setFilterCategoryId('')}
                                        className="text-xs text-brand-primary hover:text-brand-primary/80 underline"
                                    >
                                        Clear filter
                                    </button>
                                )}
                            </div>
                            <p className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                                {formatCurrency(totalAmount)}
                            </p>
                            {filterCategoryId && allExpenses.length !== expenses.length && (
                                <p className="text-xs text-slate-500 mt-2">
                                    Total all expenses: {formatCurrency(allExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0))}
                                </p>
                            )}
                        </div>

                    </div>

                    {/* Right Column - Table */}
                    <div className="lg:col-span-2 h-full min-h-0">
                        <div className="glass rounded-2xl overflow-hidden h-full flex flex-col min-h-0">
                            {/* Table Header with Filters */}
                            <div className="p-6 border-b border-slate-200/50 shrink-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            Expense List
                                        </h2>
                                        {loading && expenses.length > 0 && (
                                            <svg className="animate-spin w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3">
                                        {/* Category Filter */}
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-slate-600 whitespace-nowrap">Filter:</label>
                                            <select
                                                value={filterCategoryId}
                                                onChange={(e) => setFilterCategoryId(e.target.value)}
                                                className="px-3 py-2 text-sm bg-white/70 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-colors"
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Sort Order */}
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-slate-600">Sort:</label>
                                            <button
                                                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                                                className="flex items-center gap-1 px-3 py-2 text-sm bg-white/70 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                Date
                                                {sortOrder === 'desc' ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Table Content */}
                            {expenses.length === 0 ? (
                                <EmptyState
                                    title={filterCategoryId ? 'No expenses in this category' : 'No expenses yet'}
                                    description={filterCategoryId ? 'Try selecting a different category or clear the filter' : 'Add your first expense using the form on the left'}
                                    icon={
                                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    }
                                    action={filterCategoryId && (
                                        <button
                                            onClick={() => setFilterCategoryId('')}
                                            className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
                                        >
                                            Clear filter
                                        </button>
                                    )}
                                />
                            ) : (
                                <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {expenses.map((expense) => (
                                                <tr 
                                                    key={expense.id} 
                                                    className={`hover:bg-slate-50/80 transition-colors ${editingExpense?.id === expense.id ? 'bg-amber-50/50 ring-1 ring-amber-200' : ''} ${deletingId === expense.id ? 'opacity-50' : ''}`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-slate-600">
                                                            {formatDate(expense.date)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => setFilterCategoryId((expense.category_id || expense.categoryId).toString())}
                                                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors cursor-pointer"
                                                            title="Click to filter by this category"
                                                        >
                                                            {getCategoryName(expense.category_id || expense.categoryId)}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs">
                                                        <span className="text-sm text-slate-700 line-clamp-2" title={expense.description || undefined}>
                                                            {expense.description || (
                                                                <span className="text-slate-400 italic">No description</span>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {formatCurrency(expense.amount)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                onClick={() => handleEdit(expense)}
                                                                disabled={deletingId === expense.id}
                                                                className="p-2 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-brand-primary/10 transition-colors disabled:opacity-50"
                                                                title="Edit expense"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(expense.id)}
                                                                disabled={deletingId === expense.id}
                                                                className="p-2 rounded-lg text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 transition-colors disabled:opacity-50"
                                                                title="Delete expense"
                                                            >
                                                                {deletingId === expense.id ? (
                                                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                    </svg>
                                                                ) : (
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Charts */}
                    <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto pr-1">
                        {/* Pie Chart Summary */}
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                </svg>
                                Spending by Category
                            </h3>
                            <CategoryPieChart 
                                expenses={allExpenses} 
                                categories={categories} 
                                formatCurrency={formatCurrency}
                            />
                        </div>

                        {/* Category Breakdown */}
                        <div className="glass rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Category Breakdown
                            </h3>
                            <CategoryBreakdown 
                                expenses={allExpenses} 
                                categories={categories} 
                                formatCurrency={formatCurrency}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

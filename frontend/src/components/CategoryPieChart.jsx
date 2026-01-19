import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useMemo } from 'react';

// Beautiful color palette for categories
const COLORS = [
    '#6366f1', // Indigo
    '#f43f5e', // Rose
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ec4899', // Pink
    '#84cc16', // Lime
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#a855f7', // Purple
    '#22c55e', // Green
];

const CategoryPieChart = ({ expenses, categories, formatCurrency }) => {
    // Calculate totals per category
    const categoryData = useMemo(() => {
        const totals = {};
        
        expenses.forEach(expense => {
            const categoryId = expense.category_id || expense.categoryId;
            if (!totals[categoryId]) {
                totals[categoryId] = 0;
            }
            totals[categoryId] += parseFloat(expense.amount || 0);
        });
        
        return Object.entries(totals)
            .map(([categoryId, total]) => {
                const category = categories.find(c => c.id === parseInt(categoryId));
                return {
                    id: categoryId,
                    name: category?.name || 'Unknown',
                    value: total,
                };
            })
            .sort((a, b) => b.value - a.value); // Sort by value descending
    }, [expenses, categories]);

    const totalAmount = useMemo(() => {
        return categoryData.reduce((sum, item) => sum + item.value, 0);
    }, [categoryData]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / totalAmount) * 100).toFixed(1);
            return (
                <div className="glass rounded-lg p-3 shadow-lg border border-white/30">
                    <p className="font-semibold text-slate-800">{data.name}</p>
                    <p className="text-brand-primary font-bold">{formatCurrency(data.value)}</p>
                    <p className="text-slate-500 text-sm">{percentage}% of total</p>
                </div>
            );
        }
        return null;
    };

    // Custom legend
    const CustomLegend = ({ payload }) => {
        return (
            <div className="flex flex-wrap justify-center gap-3 mt-4 px-2">
                {payload.map((entry, index) => (
                    <div 
                        key={entry.value}
                        className="flex items-center gap-1.5 text-xs"
                    >
                        <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-600 truncate max-w-[80px]" title={entry.value}>
                            {entry.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    if (categoryData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[280px] text-slate-400">
                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-sm">No data to display</p>
            </div>
        );
    }

    return (
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={categoryData}
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                        animationEasing="ease-out"
                    >
                        {categoryData.map((entry, index) => (
                            <Cell 
                                key={entry.id} 
                                fill={COLORS[index % COLORS.length]}
                                stroke="white"
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

// Category breakdown list component
export const CategoryBreakdown = ({ expenses, categories, formatCurrency }) => {
    // Calculate totals per category
    const categoryData = useMemo(() => {
        const totals = {};
        
        expenses.forEach(expense => {
            const categoryId = expense.category_id || expense.categoryId;
            if (!totals[categoryId]) {
                totals[categoryId] = { count: 0, total: 0 };
            }
            totals[categoryId].count++;
            totals[categoryId].total += parseFloat(expense.amount || 0);
        });
        
        const totalAmount = Object.values(totals).reduce((sum, item) => sum + item.total, 0);
        
        return Object.entries(totals)
            .map(([categoryId, data]) => {
                const category = categories.find(c => c.id === parseInt(categoryId));
                return {
                    id: categoryId,
                    name: category?.name || 'Unknown',
                    count: data.count,
                    total: data.total,
                    percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
                };
            })
            .sort((a, b) => b.total - a.total);
    }, [expenses, categories]);

    if (categoryData.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {categoryData.map((item, index) => (
                <div key={item.id} className="group">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                                {item.name}
                            </span>
                            <span className="text-xs text-slate-400">
                                ({item.count} {item.count === 1 ? 'expense' : 'expenses'})
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">
                            {formatCurrency(item.total)}
                        </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ 
                                width: `${item.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                            }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 text-right">
                        {item.percentage.toFixed(1)}%
                    </p>
                </div>
            ))}
        </div>
    );
};

export default CategoryPieChart;


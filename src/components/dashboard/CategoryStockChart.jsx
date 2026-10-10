import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, Layers } from 'lucide-react';

const PALETTE = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#64748b', // Slate
];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const item = payload[0].payload;
        return (
            <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs shadow-xl border border-slate-700">
                <p className="font-bold">{item.category}</p>
                <p className="text-emerald-400 font-mono mt-0.5">TZS {Number(item.stock_value).toLocaleString()}</p>
                <p className="text-gray-400 text-[10px] mt-0.5">{item.total_items} items · {item.product_count} types</p>
            </div>
        );
    }
    return null;
};

const CategoryStockChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-[280px] w-full flex flex-col items-center justify-center text-gray-400 text-xs">
                <PieIcon className="w-8 h-8 text-gray-300 mb-2" />
                <p>Hakuna taarifa za makundi ya bidhaa bado.</p>
            </div>
        );
    }

    const totalValuation = data.reduce((s, x) => s + Number(x.stock_value || 0), 0);

    return (
        <div className="flex flex-col h-full min-w-0">
            <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="stock_value"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Mtaji Stoo</p>
                    <p className="text-xs font-black text-gray-800">
                        {totalValuation >= 1000000 
                            ? `${(totalValuation / 1000000).toFixed(1)}M` 
                            : `${(totalValuation / 1000).toFixed(0)}k`}
                    </p>
                </div>
            </div>

            {/* Custom Legend Chips */}
            <div className="space-y-2 mt-2 max-h-[120px] overflow-y-auto pr-1">
                {data.map((item, idx) => {
                    const pct = totalValuation > 0 ? ((item.stock_value / totalValuation) * 100).toFixed(0) : 0;
                    return (
                        <div key={item.category || idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                                <span 
                                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                                    style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} 
                                />
                                <span className="font-semibold text-gray-700 truncate max-w-[130px]">{item.category}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="font-mono text-gray-500 text-[11px]">TZS {Number(item.stock_value).toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {pct}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryStockChart;

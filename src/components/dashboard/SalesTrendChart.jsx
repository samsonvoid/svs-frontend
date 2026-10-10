import React from 'react';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area,
    Legend
} from 'recharts';
import { TrendingUp, AlertCircle } from 'lucide-react';

const SalesTrendChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] w-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                <AlertCircle className="w-8 h-8 text-gray-300" />
                <p className="font-semibold">Hakuna taarifa za mauzo kwa siku 7 zilizopita</p>
            </div>
        );
    }

    const totalActivity = data.reduce(
        (sum, item) => sum + (Number(item.sales) || 0) + (Number(item.purchases) || 0),
        0
    );

    return (
        <div className="h-[300px] w-full relative min-w-0">
            {totalActivity === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-2xs rounded-2xl z-10 p-4 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-xs">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">Hakuna Miamala Siku 7 Zilizopita</p>
                    <p className="text-xs text-gray-500 max-w-xs mt-1">
                        Mauzo au manunuzi yakirekodiwa, mchoro huu utaonyesha mwenendo wa fedha mara moja.
                    </p>
                </div>
            )}

            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        domain={totalActivity > 0 ? [0, 'auto'] : [0, 50000]}
                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                        tickFormatter={(value) => `TZS ${value >= 1000 ? (value/1000) + 'k' : value}`}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '16px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                        formatter={(value, name) => [`TZS ${value.toLocaleString()}`, name === 'sales' ? 'Mauzo (Sales)' : 'Manunuzi (Purchases)']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '10px' }} />
                    <Area 
                        type="monotone" 
                        dataKey="purchases" 
                        name="Purchases"
                        stroke="#3b82f6" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorPurchases)" 
                        animationDuration={1500}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="sales" 
                        name="Sales"
                        stroke="#10b981" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesTrendChart;

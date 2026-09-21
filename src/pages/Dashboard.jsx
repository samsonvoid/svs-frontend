import React, { useEffect, useState } from 'react';
import { 
    TrendingUp, 
    Box, 
    AlertTriangle, 
    Clock, 
    Plus,
    Loader2
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import SalesTrendChart from '../components/dashboard/SalesTrendChart';
import api from '../api/axios';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [trend, setTrend] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('svs_user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, trendRes, topRes, lowStockRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/analytics/sales-trend'),
                    api.get('/analytics/top-products'),
                    api.get('/analytics/low-stock')
                ]);
                setStats(statsRes.data);
                setTrend(trendRes.data);
                setTopProducts(topRes.data);
                setLowStock(lowStockRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Welcome Hero */}
            <div className="bg-[#192231] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/15">
                <div className="relative z-10">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-2">
                        Karibu Tena, <span className="text-blue-400">{user.name || 'Admin'}</span>
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm lg:text-base max-w-xl leading-relaxed">
                        Hapa kuna muhtasari wa kile kinachotokea kwenye stoo yako kwa sasa. Kila kitu kiko sawa na data inasasishwa moja kwa moja.
                    </p>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard 
                    title="Mauzo ya Leo" 
                    value={`TZS ${stats?.today_sales?.toLocaleString() || '0'}`} 
                    icon={TrendingUp} 
                    colorClass="bg-green-50 text-green-600" 
                    trend="+12.5%" 
                />
                <StatCard 
                    title="Jumla ya Bidhaa" 
                    value={stats?.total_products?.toString() || '0'} 
                    icon={Box} 
                    colorClass="bg-blue-50 text-blue-600" 
                />
                <StatCard 
                    title="Bidhaa Chache" 
                    value={`${stats?.low_stock_count || '0'} Items`} 
                    icon={AlertTriangle} 
                    colorClass="bg-orange-50 text-orange-600" 
                    borderForce="border-l-orange-500" 
                />
                <StatCard 
                    title="Oda Zinazosubiri" 
                    value={`${stats?.pending_orders || '0'} Oda`} 
                    icon={Clock} 
                    colorClass="bg-indigo-50 text-indigo-600" 
                />
            </div>

            {/* Charts & Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 min-w-0">
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 sm:mb-8">
                        <div>
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg">Cashflow: Mauzo vs Manunuzi (7 Days)</h3>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">CEO Analytics View</p>
                        </div>
                    </div>
                    <div className="w-full min-w-0 flex-1">
                        <SalesTrendChart data={trend} />
                    </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
                    <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-6">Bidhaa Zinazotoka Sana</h3>
                    <div className="space-y-4 sm:space-y-5 flex-1">
                        {topProducts.map((item, idx) => (
                            <div key={item.product_id} className="flex items-center gap-3.5 group">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-xs shrink-0
                                    ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {idx + 1}
                                </div>
                                <div className="flex-1 overflow-hidden min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                                        {item.product?.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400 truncate font-mono">{item.product?.sku}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-black text-blue-600">{item.total_sold}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Sold</p>
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <div className="text-center py-12 text-gray-400 italic text-xs">
                                No sales data yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStock.length > 0 && (
                <div className="bg-red-50/70 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 border border-red-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <AlertTriangle className="w-48 h-48 text-red-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-900 text-base sm:text-lg">Zinakaribia Kuisha (Low Stock)</h3>
                                <p className="text-xs text-red-700">These items have reached or fallen below their minimum stock threshold.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
                            {lowStock.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-2xl border border-red-100 flex justify-between items-center shadow-xs">
                                    <div className="min-w-0 pr-3">
                                        <p className="font-bold text-gray-900 truncate text-sm">{item.name}</p>
                                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{item.sku}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-black text-red-600 text-base">{item.stock_quantity}</p>
                                        <p className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Left</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;

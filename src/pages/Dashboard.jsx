import React, { useEffect, useState } from 'react';
import { 
    TrendingUp, 
    Box, 
    AlertTriangle, 
    Clock, 
    Loader2,
    DollarSign,
    PieChart as PieIcon,
    Flame,
    ArrowUpRight
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import SalesTrendChart from '../components/dashboard/SalesTrendChart';
import CategoryStockChart from '../components/dashboard/CategoryStockChart';
import api from '../api/axios';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [trend, setTrend] = useState([]);
    const [categoryDist, setCategoryDist] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [trendDays, setTrendDays] = useState(7);
    const [loading, setLoading] = useState(true);
    const [trendLoading, setTrendLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('svs_user') || '{}');

    const fetchDashboardData = async () => {
        try {
            const [statsRes, trendRes, catRes, topRes, lowStockRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get(`/analytics/sales-trend?days=${trendDays}`),
                api.get('/analytics/category-distribution'),
                api.get('/analytics/top-products'),
                api.get('/analytics/low-stock')
            ]);
            setStats(statsRes.data);
            setTrend(trendRes.data);
            setCategoryDist(catRes.data);
            setTopProducts(topRes.data);
            setLowStock(lowStockRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // When trend timeframe changes
    const handleTrendDaysChange = async (days) => {
        setTrendDays(days);
        setTrendLoading(true);
        try {
            const res = await api.get(`/analytics/sales-trend?days=${days}`);
            setTrend(res.data);
        } catch (e) {
            console.error('Failed to update trend days:', e);
        } finally {
            setTrendLoading(false);
        }
    };

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
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-2">
                            Karibu Tena, <span className="text-blue-400">{user.name || 'Admin'}</span>
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm lg:text-base max-w-xl leading-relaxed">
                            Ripoti ya wakati halisi ya stoo, mwenendo wa mapato, faida halisi, na ugawaji wa mtaji.
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-semibold text-gray-200 shrink-0">
                        ⚡ Live Sync Active
                    </div>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Executive KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard 
                    title="Mauzo ya Leo" 
                    value={`TZS ${Number(stats?.today_sales || 0).toLocaleString()}`} 
                    icon={TrendingUp} 
                    colorClass="bg-emerald-50 text-emerald-600" 
                    trend="Leo" 
                />
                <StatCard 
                    title="Faida ya Mwezi (Gross)" 
                    value={`TZS ${Number(stats?.month_profit || 0).toLocaleString()}`} 
                    icon={DollarSign} 
                    colorClass="bg-purple-50 text-purple-600" 
                    trend={`${stats?.gross_margin_pct || 0}% Margin`} 
                />
                <StatCard 
                    title="Thamani ya Mtaji Stoo" 
                    value={`TZS ${Number(stats?.total_stock_value || 0).toLocaleString()}`} 
                    icon={Box} 
                    colorClass="bg-blue-50 text-blue-600" 
                    trend={`${stats?.total_products || 0} Bidhaa`}
                />
                <StatCard 
                    title="Bidhaa Chache (Alert)" 
                    value={`${stats?.low_stock_count || 0} Items`} 
                    icon={AlertTriangle} 
                    colorClass="bg-orange-50 text-orange-600" 
                    borderForce="border-l-orange-500" 
                />
            </div>

            {/* Core BI Visualizations: Cashflow/Profit Trend & Category Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 min-w-0">
                {/* Trend Chart (Mauzo vs Faida vs Manunuzi) */}
                <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                                Mwenendo wa Mapato na Faida (Revenue vs Profit)
                            </h3>
                            <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                                Cashflow & Gross Profit Analytics
                            </p>
                        </div>
                        
                        {/* Timeframe Dropdown */}
                        <div className="flex items-center gap-2">
                            <select
                                value={trendDays}
                                onChange={e => handleTrendDaysChange(Number(e.target.value))}
                                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                            >
                                <option value={7}>📅 Siku 7 Zilizopita</option>
                                <option value={14}>📅 Siku 14 Zilizopita</option>
                                <option value={30}>📅 Mwezi Huu (30 Days)</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full min-w-0 flex-1 relative">
                        {trendLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-2xs z-20 flex items-center justify-center rounded-2xl">
                                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                            </div>
                        )}
                        <SalesTrendChart data={trend} />
                    </div>
                </div>

                {/* Category Stock Value Donut Chart */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col min-w-0">
                    <div className="mb-4">
                        <h3 className="font-bold text-gray-900 text-base sm:text-lg">Mgawanyo wa Mtaji Stoo</h3>
                        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                            Inventory Valuation by Category
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                        <CategoryStockChart data={categoryDist} />
                    </div>
                </div>
            </div>

            {/* Row 2: Top Selling Products & Low Stock Watchlist */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Top Selling Products */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                                Bidhaa Zinazotoka Sana (Fast Movers)
                            </h3>
                            <p className="text-xs text-gray-400">Bidhaa 5 za juu kulingana na mauzo halisi</p>
                        </div>
                    </div>

                    <div className="space-y-3.5 flex-1">
                        {topProducts.map((item, idx) => (
                            <div key={item.product_id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-blue-50/60 transition-colors group">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0
                                        ${idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-white border border-gray-200 text-gray-700'}`}>
                                        #{idx + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                            {item.product?.name}
                                        </p>
                                        <p className="text-xs text-gray-400 font-mono truncate">{item.product?.sku}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 pl-2">
                                    <p className="text-sm font-black text-blue-600">
                                        {item.total_sold} <span className="text-xs font-semibold text-gray-500">{item.product?.unit || 'Pcs'}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Total Sold</p>
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <div className="text-center py-12 text-gray-400 italic text-xs">
                                Hakuna taarifa za mauzo bado.
                            </div>
                        )}
                    </div>
                </div>

                {/* Low Stock Watchlist */}
                <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                Tahadhari ya Stoo (Low Stock Watchlist)
                            </h3>
                            <p className="text-xs text-gray-400">Bidhaa zilizofikia au chini ya kiwango cha chini</p>
                        </div>
                    </div>

                    <div className="space-y-3.5 flex-1">
                        {lowStock.slice(0, 5).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-red-50/50 border border-red-100/70">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">{item.name}</p>
                                    <p className="text-xs text-gray-400 font-mono">{item.sku} · Min: {item.min_stock}</p>
                                </div>
                                <div className="text-right shrink-0 pl-2">
                                    <span className="inline-flex items-center gap-1 text-xs font-black text-red-600 bg-red-100/80 px-2.5 py-1 rounded-lg">
                                        {item.stock_quantity} {item.unit || 'Pcs'} left
                                    </span>
                                </div>
                            </div>
                        ))}
                        {lowStock.length === 0 && (
                            <div className="text-center py-12 text-emerald-600 font-medium text-xs bg-emerald-50 rounded-2xl">
                                🎉 Kila kitu kiko salama! Hakuna bidhaa iliyopungua chini ya kiwango.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

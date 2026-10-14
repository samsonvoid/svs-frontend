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
    ArrowUpRight,
    ArrowDownLeft,
    ArrowRight,
    ShoppingCart,
    PackagePlus,
    Plus,
    BarChart3,
    Bell,
    Hourglass,
    Wallet,
    SlidersHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import SalesTrendChart from '../components/dashboard/SalesTrendChart';
import CategoryStockChart from '../components/dashboard/CategoryStockChart';
import api from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
    const { t } = useLanguage();
    const [stats, setStats] = useState(null);
    const [trend, setTrend] = useState([]);
    const [categoryDist, setCategoryDist] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [trendDays, setTrendDays] = useState(7);
    const [loading, setLoading] = useState(true);
    const [trendLoading, setTrendLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem('svs_user') || '{}');
    const isAdmin = !user.role || user.role.toLowerCase() === 'admin';

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
                            {t('dash_welcome')}, <span className="text-blue-400">{user.name || 'Admin'}</span>
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm lg:text-base max-w-xl leading-relaxed">
                            {t('dash_welcome_sub')}
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-semibold text-gray-200 shrink-0">
                        ⚡ {t('dash_live_sync')}
                    </div>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Quick Actions Dock */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 pl-2 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500">{t('qa_title')}:</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <Link 
                        to="/sales" 
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-xs transition-all active:scale-95 shrink-0"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{t('qa_quick_pos')}</span>
                    </Link>
                    {isAdmin && (
                        <Link 
                            to="/purchases" 
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-blue-200/60 transition-all active:scale-95 shrink-0"
                        >
                            <PackagePlus className="w-4 h-4" />
                            <span>{t('qa_stock_in')}</span>
                        </Link>
                    )}
                    {isAdmin && (
                        <Link 
                            to="/inventory" 
                            className="flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-purple-200/60 transition-all active:scale-95 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t('qa_add_prod')}</span>
                        </Link>
                    )}
                    {isAdmin && (
                        <Link 
                            to="/adjustments" 
                            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-rose-200/60 transition-all active:scale-95 shrink-0"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>{t('qa_adjustments')}</span>
                        </Link>
                    )}
                    {isAdmin && (
                        <Link 
                            to="/reports" 
                            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-gray-200/60 transition-all active:scale-95 shrink-0"
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>{t('qa_reports')}</span>
                        </Link>
                    )}
                    <Link 
                        to="/alerts" 
                        className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-red-200/60 transition-all active:scale-95 shrink-0"
                    >
                        <Bell className="w-4 h-4" />
                        <span>{t('qa_alerts')}</span>
                        {stats?.low_stock_count > 0 && (
                            <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                                {stats.low_stock_count}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Executive KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard 
                    title={t('dash_today_sales')} 
                    value={`TZS ${Number(stats?.today_sales || 0).toLocaleString()}`} 
                    icon={TrendingUp} 
                    colorClass="bg-emerald-50 text-emerald-600" 
                    trend={t('dash_today_trend')} 
                />
                <StatCard 
                    title={t('dash_month_profit')} 
                    value={`TZS ${Number(stats?.month_profit || 0).toLocaleString()}`} 
                    icon={DollarSign} 
                    colorClass="bg-purple-50 text-purple-600" 
                    trend={t('dash_margin', { pct: stats?.gross_margin_pct || 0 })} 
                />
                <StatCard 
                    title={t('dash_stock_value')} 
                    value={`TZS ${Number(stats?.total_stock_value || 0).toLocaleString()}`} 
                    icon={Box} 
                    colorClass="bg-blue-50 text-blue-600" 
                    trend={t('dash_products_count', { n: stats?.total_products || 0 })}
                />
                <StatCard 
                    title={t('dash_low_stock')} 
                    value={t('dash_items_count', { n: stats?.low_stock_count || 0 })} 
                    icon={AlertTriangle} 
                    colorClass="bg-orange-50 text-orange-600" 
                    borderForce="border-l-orange-500" 
                />
            </div>

            {/* Strategic Health & Cashflow Strip: Dormant Capital + Net Cashflow Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Dormant Capital (Dead Stock) Card */}
                <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-200/70 shadow-xs flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                                <Hourglass className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-black uppercase tracking-wider text-amber-900">{t('dash_dead_stock')}</p>
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">Slow Movers</span>
                                </div>
                                <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                                    TZS {Number(stats?.dead_stock_value || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        {isAdmin && (
                            <Link 
                                to="/inventory?filter=dormant" 
                                className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1"
                            >
                                <span>{t('dash_dead_action')}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 font-medium">
                        {t('dash_dead_stock_sub', { n: stats?.dead_stock_count || 0 })}
                    </p>
                </div>

                {/* Net Cashflow Pulse Card */}
                <div className="bg-gradient-to-br from-blue-500/10 via-white to-emerald-500/5 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-200/70 shadow-xs flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-black uppercase tracking-wider text-blue-900">{t('dash_net_cashflow')}</p>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                                        (stats?.today_net_cashflow || 0) >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {(stats?.today_net_cashflow || 0) >= 0 ? '+ Surplus' : '- Deficit'}
                                    </span>
                                </div>
                                <p className={`text-xl sm:text-2xl font-black mt-1 ${
                                    (stats?.today_net_cashflow || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                    TZS {Number(stats?.today_net_cashflow || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('dash_net_month')}</p>
                            <p className="text-sm font-black text-gray-800 mt-0.5">
                                TZS {Number(stats?.month_net_cashflow || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs">
                        <div className="flex items-center justify-between bg-emerald-50/80 px-2.5 py-1.5 rounded-lg">
                            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" /> {t('dash_cash_in')}
                            </span>
                            <span className="font-black text-emerald-700">
                                TZS {Number(stats?.today_sales || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50/80 px-2.5 py-1.5 rounded-lg">
                            <span className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                                <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" /> {t('dash_cash_out')}
                            </span>
                            <span className="font-black text-blue-700">
                                TZS {Number(stats?.today_purchases || 0).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
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

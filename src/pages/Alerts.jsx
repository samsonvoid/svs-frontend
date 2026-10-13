import React, { useState, useEffect, useMemo } from 'react';
import { 
    AlertTriangle, 
    Bell, 
    PackagePlus, 
    Search, 
    Loader2, 
    Box, 
    Clock, 
    CheckCircle2, 
    ArrowRight,
    TrendingDown,
    XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/common/Pagination';
import { useLanguage } from '../context/LanguageContext';

const Alerts = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('ALL'); // ALL, OUT, LOW, FORECAST
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    useEffect(() => {
        const fetchAlertData = async () => {
            try {
                const res = await api.get('/products');
                const prods = res.data.data || res.data || [];
                setProducts(prods);
            } catch (e) {
                console.error('Failed to load products for alerts', e);
            } finally {
                setLoading(false);
            }
        };
        fetchAlertData();
    }, []);

    // Categorize alerts
    const alertsData = useMemo(() => {
        return products.map(p => {
            const qty = parseInt(p.stock_quantity ?? 0);
            const min = parseInt(p.min_stock ?? 5);
            const totalSold = parseInt(p.sale_items_sum_quantity ?? 0);
            const dailyRate = totalSold / 30;
            const daysLeft = dailyRate > 0 ? Math.floor(qty / dailyRate) : null;

            let severity = null;
            let statusLabel = '';
            let badgeClass = '';

            if (qty === 0) {
                severity = 'OUT';
                statusLabel = '🔴 Imekwisha Kabisa (0 Qty)';
                badgeClass = 'bg-red-50 text-red-700 border-red-200';
            } else if (qty <= min) {
                severity = 'LOW';
                statusLabel = `🟠 Chini ya Kiwango (${qty}/${min})`;
                badgeClass = 'bg-orange-50 text-orange-700 border-orange-200';
            } else if (daysLeft !== null && daysLeft <= 14) {
                severity = 'FORECAST';
                statusLabel = `🟡 Karibu Kuisha (~${daysLeft}d)`;
                badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
            }

            return {
                ...p,
                severity,
                statusLabel,
                badgeClass,
                daysLeft,
                dailyRate
            };
        }).filter(p => p.severity !== null);
    }, [products]);

    // Counts for summary pills
    const outCount = useMemo(() => alertsData.filter(a => a.severity === 'OUT').length, [alertsData]);
    const lowCount = useMemo(() => alertsData.filter(a => a.severity === 'LOW').length, [alertsData]);
    const forecastCount = useMemo(() => alertsData.filter(a => a.severity === 'FORECAST').length, [alertsData]);

    // Filter by search & severity
    const filteredAlerts = useMemo(() => {
        return alertsData.filter(item => {
            const term = search.toLowerCase();
            const matchesSearch = item.name.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term);
            const matchesSeverity = filterSeverity === 'ALL' || item.severity === filterSeverity;
            return matchesSearch && matchesSeverity;
        });
    }, [alertsData, search, filterSeverity]);

    const paginatedAlerts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredAlerts.slice(start, start + pageSize);
    }, [filteredAlerts, currentPage, pageSize]);

    const handleRestock = (product) => {
        navigate(`/purchases?product_id=${product.id}`);
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
            {/* Header Hero */}
            <div className="bg-[#192231] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/15">
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-xl text-xs font-bold mb-3">
                            <Bell className="w-3.5 h-3.5" />
                            <span>Kituo cha Tahadhari (Alerts Hub)</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-2">
                            Tahadhari za Stoo <span className="text-red-400">/ Stock Alerts</span>
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm lg:text-base max-w-xl leading-relaxed">
                            Fuatilia bidhaa zilizokwisha au zinazokaribia kuisha ili kuagiza mzigo kwa wakati kabla wateja hawajakosa.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shrink-0">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-300">Jumla ya Tahadhari</p>
                            <p className="text-lg font-black text-white">{alertsData.length} Bidhaa</p>
                        </div>
                    </div>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-600/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Severity KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div 
                    onClick={() => { setFilterSeverity(filterSeverity === 'OUT' ? 'ALL' : 'OUT'); setCurrentPage(1); }}
                    className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all shadow-xs flex items-center justify-between ${
                        filterSeverity === 'OUT' ? 'ring-2 ring-red-500 border-red-300' : 'border-gray-100 hover:border-red-200'
                    }`}
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('alerts_out_stock')}</p>
                            <p className="text-xl font-black text-red-600">{outCount}</p>
                            <p className="text-[11px] text-gray-400">{t('alerts_out_sub')}</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => { setFilterSeverity(filterSeverity === 'LOW' ? 'ALL' : 'LOW'); setCurrentPage(1); }}
                    className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all shadow-xs flex items-center justify-between ${
                        filterSeverity === 'LOW' ? 'ring-2 ring-orange-500 border-orange-300' : 'border-gray-100 hover:border-orange-200'
                    }`}
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('alerts_low_stock')}</p>
                            <p className="text-xl font-black text-orange-600">{lowCount}</p>
                            <p className="text-[11px] text-gray-400">{t('alerts_low_sub')}</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => { setFilterSeverity(filterSeverity === 'FORECAST' ? 'ALL' : 'FORECAST'); setCurrentPage(1); }}
                    className={`cursor-pointer bg-white p-5 rounded-2xl border transition-all shadow-xs flex items-center justify-between ${
                        filterSeverity === 'FORECAST' ? 'ring-2 ring-amber-500 border-amber-300' : 'border-gray-100 hover:border-amber-200'
                    }`}
                >
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('alerts_forecast')}</p>
                            <p className="text-xl font-black text-amber-600">{forecastCount}</p>
                            <p className="text-[11px] text-gray-400">{t('alerts_forecast_sub')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        value={search} 
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
                        type="text" 
                        placeholder="Tafuta bidhaa au SKU..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-xs" 
                    />
                </div>

                <select
                    value={filterSeverity}
                    onChange={e => { setFilterSeverity(e.target.value); setCurrentPage(1); }}
                    className="bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-xs cursor-pointer shrink-0"
                >
                    <option value="ALL">📋 Tahadhari Zote ({alertsData.length})</option>
                    <option value="OUT">🔴 Zimekwisha Kabisa (0 Qty)</option>
                    <option value="LOW">🟠 Chini ya Kiwango (Low Stock)</option>
                    <option value="FORECAST">🟡 Zinazotabiriwa Kuisha (&lt; 14d)</option>
                </select>
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
                {paginatedAlerts.map((item) => (
                    <div 
                        key={item.id} 
                        className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md ${
                            item.severity === 'OUT' ? 'border-red-200 bg-red-50/20' : 'border-gray-100'
                        }`}
                    >
                        <div className="flex items-start sm:items-center gap-4 min-w-0">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm ${
                                item.severity === 'OUT' 
                                    ? 'bg-red-100 text-red-600' 
                                    : item.severity === 'LOW' 
                                    ? 'bg-orange-100 text-orange-600' 
                                    : 'bg-amber-100 text-amber-600'
                            }`}>
                                <Box className="w-6 h-6" />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-base uppercase tracking-tight truncate">
                                        {item.name}
                                    </h3>
                                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                        {item.sku}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                    <span>Kundi: <strong className="text-gray-700">{item.category?.name || '—'}</strong></span>
                                    <span>•</span>
                                    <span>Bei ya Kununulia: <strong className="text-gray-700">TZS {Number(item.buying_price).toLocaleString()}</strong></span>
                                    {item.daysLeft !== null && (
                                        <>
                                            <span>•</span>
                                            <span className="font-semibold text-amber-700">~{item.daysLeft} siku zimebaki kwa kasi ya sasa</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status badge & Quick Restock Button */}
                        <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 shrink-0">
                            <div className="text-left md:text-right">
                                <span className={`inline-block text-xs font-black px-3 py-1 rounded-xl border ${item.badgeClass}`}>
                                    {item.statusLabel}
                                </span>
                                <p className="text-[11px] text-gray-400 mt-1">
                                    Iliyopo: <strong className="text-gray-900 font-bold">{item.stock_quantity} {item.unit || 'Pcs'}</strong> · Kiwango: {item.min_stock}
                                </p>
                            </div>

                            <button
                                onClick={() => handleRestock(item)}
                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 shrink-0"
                            >
                                <PackagePlus className="w-4 h-4" />
                                <span>Pokea Mzigo</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredAlerts.length === 0 && (
                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h3 className="font-black text-gray-900 text-lg mb-1">Stoo Yako Iko Salama Kabisa!</h3>
                        <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
                            Hakuna bidhaa iliyofikia au kushuka chini ya kiwango salama kwa sasa. Kila kitu kiko vizuri.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredAlerts.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filteredAlerts.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                        pageSizeOptions={[8, 16, 32]}
                    />
                </div>
            )}
        </div>
    );
};

export default Alerts;

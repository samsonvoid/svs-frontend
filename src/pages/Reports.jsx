import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart3, TrendingUp, Package, DollarSign,
    Loader2, Calendar, RefreshCw, ArrowUpRight, ArrowDownRight,
    Download, FileText, Sheet
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../api/axios';

// Build a download URL with token in query string (browser-native file download)
const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';
const downloadFile = (path, params = {}) => {
    const token = localStorage.getItem('svs_token');
    const url = new URL(`${API_BASE}${path}`);
    Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
    if (token) url.searchParams.set('_token', token);
    const a = document.createElement('a');
    a.href = url.toString();
    a.click();
};

const tabs = [
    { id: 'sales',     label: 'Sales Summary',        icon: TrendingUp,  color: 'green'  },
    { id: 'products',  label: 'Top Products',          icon: BarChart3,   color: 'blue'   },
    { id: 'inventory', label: 'Inventory Valuation',   icon: Package,     color: 'amber'  },
    { id: 'profit',    label: 'Profit & Loss',         icon: DollarSign,  color: 'purple' },
];

const colorMap = {
    green:  { pill: 'bg-green-600 text-white shadow-green-500/20',  light: 'bg-green-50 text-green-700 border-green-200', accent: '#16a34a' },
    blue:   { pill: 'bg-blue-600 text-white shadow-blue-500/20',    light: 'bg-blue-50 text-blue-700 border-blue-200',    accent: '#2563eb' },
    amber:  { pill: 'bg-amber-600 text-white shadow-amber-500/20',  light: 'bg-amber-50 text-amber-700 border-amber-200', accent: '#d97706' },
    purple: { pill: 'bg-purple-600 text-white shadow-purple-500/20',light: 'bg-purple-50 text-purple-700 border-purple-200',accent: '#7c3aed'},
};

const fmt = (n) => Number(n || 0).toLocaleString('en-TZ', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtCur = (n) => `TZS ${fmt(n)}`;

function SummaryCard({ label, value, sub, color = 'blue', icon: Icon }) {
    const c = colorMap[color];
    return (
        <div className={`p-6 rounded-2xl border ${c.light} flex items-start gap-4`}>
            <div className={`p-3 rounded-xl ${c.pill.split(' ').slice(0,2).join(' ')}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-60">{label}</p>
                <p className="text-xl font-black mt-0.5">{value}</p>
                {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

const Reports = () => {
    const [activeTab, setActiveTab] = useState('sales');
    const [loading, setLoading]     = useState(false);
    const [data, setData]           = useState({});
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 864e5).toISOString().split('T')[0],
        to: today,
    });

    const endpointMap = {
        sales:     '/reports/sales-summary',
        products:  '/reports/top-products',
        inventory: '/reports/inventory-valuation',
        profit:    '/reports/profit-loss',
    };

    const fetchReport = useCallback(async (tab = activeTab) => {
        setLoading(true);
        try {
            const url = endpointMap[tab];
            const params = tab !== 'inventory' ? dateRange : {};
            const res = await api.get(url, { params });
            setData(prev => ({ ...prev, [tab]: res.data }));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, dateRange]);

    useEffect(() => { fetchReport(activeTab); }, [activeTab]);

    const tabData = data[activeTab];

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#192231] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/15">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-1">
                            Business Reports <span className="text-purple-400">/ Ripoti</span>
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm">Intelligence at a glance — sales, products, inventory, and profit.</p>
                    </div>
                    {/* Date Range Picker */}
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shrink-0 flex-wrap sm:flex-nowrap border border-white/10">
                        <Calendar className="w-4 h-4 text-gray-300 shrink-0 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={dateRange.from}
                                onChange={e => setDateRange(d => ({ ...d, from: e.target.value }))}
                                className="bg-white/10 sm:bg-transparent text-white text-xs px-2 py-1 rounded-lg outline-none font-medium" 
                            />
                            <span className="text-gray-400 text-xs">→</span>
                            <input 
                                type="date" 
                                value={dateRange.to}
                                onChange={e => setDateRange(d => ({ ...d, to: e.target.value }))}
                                className="bg-white/10 sm:bg-transparent text-white text-xs px-2 py-1 rounded-lg outline-none font-medium" 
                            />
                        </div>
                        <button 
                            onClick={() => fetchReport(activeTab)}
                            title="Refresh Report"
                            className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-xl transition-all ml-auto sm:ml-1"
                        >
                            <RefreshCw className="w-3.5 h-3.5 text-white" />
                        </button>
                    </div>
                </div>
                <div className="absolute -right-24 -top-24 w-72 h-72 bg-purple-600/20 rounded-full blur-[90px]" />
            </div>

            {/* Tabs + Export Bar */}
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex gap-2 flex-wrap">
                    {tabs.map(tab => {
                        const c = colorMap[tab.color];
                        return (
                            <button 
                                key={tab.id} 
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95
                                    ${activeTab === tab.id ? `${c.pill}` : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
                {/* Export Buttons */}
                <div className="flex gap-2 flex-wrap">
                    {activeTab === 'sales' && (
                        <>
                            <button 
                                onClick={() => downloadFile('/export/sales-csv', dateRange)}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                                <Sheet className="w-3.5 h-3.5" /> Export CSV
                            </button>
                            <button 
                                onClick={() => downloadFile('/export/report-pdf', dateRange)}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 rounded-xl text-xs font-bold transition-all shadow-xs"
                            >
                                <FileText className="w-3.5 h-3.5" /> PDF Report
                            </button>
                        </>
                    )}
                    {activeTab === 'products' && (
                        <button 
                            onClick={() => downloadFile('/export/top-products-csv', dateRange)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                            <Sheet className="w-3.5 h-3.5" /> Export CSV
                        </button>
                    )}
                    {activeTab === 'inventory' && (
                        <button 
                            onClick={() => downloadFile('/export/inventory-csv')}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                            <Sheet className="w-3.5 h-3.5" /> Export CSV
                        </button>
                    )}
                    {activeTab === 'profit' && (
                        <button 
                            onClick={() => downloadFile('/export/report-pdf', dateRange)}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                            <FileText className="w-3.5 h-3.5" /> PDF Report
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-28">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                </div>
            ) : (
                <>
                    {/* ── Tab 1: Sales Summary ── */}
                    {activeTab === 'sales' && tabData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <SummaryCard icon={TrendingUp} color="green" label="Total Revenue"   value={fmtCur(tabData.totals?.total_revenue)}   sub={`${tabData.period?.from} → ${tabData.period?.to}`} />
                                <SummaryCard icon={BarChart3}  color="blue"  label="Total Sales"     value={fmt(tabData.totals?.total_sales)}          sub="transactions" />
                                <SummaryCard icon={DollarSign} color="amber" label="Avg Order Value" value={fmtCur(tabData.totals?.avg_order_value)}   sub="per transaction" />
                                <SummaryCard icon={ArrowUpRight} color="purple" label="Highest Sale" value={fmtCur(tabData.totals?.highest_sale)}      sub="single transaction" />
                            </div>
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-sm border border-gray-100 min-w-0">
                                <h3 className="font-bold text-gray-800 mb-4 text-xs sm:text-sm uppercase tracking-wider">Daily Revenue Trend</h3>
                                {(tabData.daily?.length ?? 0) === 0 ? (
                                    <p className="text-center text-gray-400 italic py-12 text-sm">No sales data in this date range.</p>
                                ) : (
                                    <div className="w-full min-w-0">
                                        <ResponsiveContainer width="100%" height={280}>
                                            <AreaChart data={tabData.daily} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
                                                <defs>
                                                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                                <Tooltip formatter={(v) => [`TZS ${fmt(v)}`, 'Revenue']} />
                                                <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#gRevenue)" strokeWidth={2} dot={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Tab 2: Top Products ── */}
                    {activeTab === 'products' && tabData && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-sm border border-gray-100 min-w-0">
                                <h3 className="font-bold text-gray-800 mb-4 text-xs sm:text-sm uppercase tracking-wider">Top Products by Units Sold</h3>
                                {tabData.length === 0 ? (
                                    <p className="text-center text-gray-400 italic py-12 text-sm">No sales in this date range.</p>
                                ) : (
                                    <div className="w-full min-w-0">
                                        <ResponsiveContainer width="100%" height={320}>
                                            <BarChart data={tabData} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={75} />
                                                <Tooltip formatter={(v, n) => [n === 'total_sold' ? `${fmt(v)} units` : fmtCur(v), n === 'total_sold' ? 'Units Sold' : 'Revenue']} />
                                                <Legend />
                                                <Bar dataKey="total_sold" name="Units Sold" fill="#2563eb" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                            {/* Table with overflow-x-auto */}
                            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[620px]">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="text-left text-xs font-bold text-gray-400 uppercase px-6 py-4">#</th>
                                                <th className="text-left text-xs font-bold text-gray-400 uppercase px-4 py-4">Product</th>
                                                <th className="text-left text-xs font-bold text-gray-400 uppercase px-4 py-4">Category</th>
                                                <th className="text-right text-xs font-bold text-gray-400 uppercase px-4 py-4">Units Sold</th>
                                                <th className="text-right text-xs font-bold text-gray-400 uppercase px-6 py-4">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {tabData.map((p, i) => (
                                                <tr key={p.id} className="hover:bg-gray-50/50">
                                                    <td className="px-6 py-3 text-xs font-bold text-gray-400">{i + 1}</td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-bold text-gray-900">{p.name}</p>
                                                        <p className="text-xs text-gray-400 font-mono">{p.sku}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-500">{p.category_name ?? '—'}</td>
                                                    <td className="px-4 py-3 text-right font-black text-blue-700 whitespace-nowrap">{fmt(p.total_sold)}</td>
                                                    <td className="px-6 py-3 text-right font-black text-green-700 whitespace-nowrap">{fmtCur(p.total_revenue)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 3: Inventory Valuation ── */}
                    {activeTab === 'inventory' && tabData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <SummaryCard icon={Package}    color="amber"  label="Total Units in Stock" value={fmt(tabData.grand_total?.total_units)}        sub="across all products" />
                                <SummaryCard icon={ArrowDownRight} color="blue" label="Cost Value (At Cost)" value={fmtCur(tabData.grand_total?.total_cost_value)} sub="buying price basis" />
                                <SummaryCard icon={ArrowUpRight}   color="green" label="Retail Value"        value={fmtCur(tabData.grand_total?.total_retail_value)} sub="selling price basis" />
                            </div>
                            {/* Table with overflow-x-auto */}
                            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-5 sm:p-6 border-b border-gray-100">
                                    <h3 className="font-bold text-gray-800 text-xs sm:text-sm uppercase tracking-wider">Stock Value by Category</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[620px]">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="text-left text-xs font-bold text-gray-400 uppercase px-6 py-4">Category</th>
                                                <th className="text-right text-xs font-bold text-gray-400 uppercase px-4 py-4">Products</th>
                                                <th className="text-right text-xs font-bold text-gray-400 uppercase px-4 py-4">Units</th>
                                                <th className="text-right text-xs font-bold text-gray-400 uppercase px-4 py-4">Cost Value</th>
                                                <th className="text-right text-xs font-bold text-gray-400 uppercase px-6 py-4">Retail Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(tabData.by_category ?? []).map((c, i) => (
                                                <tr key={i} className="hover:bg-amber-50/30">
                                                    <td className="px-6 py-3 font-bold text-gray-900">{c.category_name}</td>
                                                    <td className="px-4 py-3 text-right text-gray-500">{c.product_count}</td>
                                                    <td className="px-4 py-3 text-right font-semibold text-gray-700 whitespace-nowrap">{fmt(c.total_units)}</td>
                                                    <td className="px-4 py-3 text-right text-blue-600 font-bold whitespace-nowrap">{fmtCur(c.stock_value_cost)}</td>
                                                    <td className="px-6 py-3 text-right text-green-700 font-black whitespace-nowrap">{fmtCur(c.stock_value_retail)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 4: Profit & Loss ── */}
                    {activeTab === 'profit' && tabData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <SummaryCard icon={ArrowUpRight}   color="green"  label="Total Revenue"    value={fmtCur(tabData.revenue)}       sub="from sales" />
                                <SummaryCard icon={ArrowDownRight} color="blue"   label="Cost of Goods"   value={fmtCur(tabData.cogs)}          sub="buying price × units sold" />
                                <SummaryCard icon={DollarSign}     color="purple" label="Gross Profit"    value={fmtCur(tabData.gross_profit)}  sub={`${tabData.gross_margin}% margin`} />
                                <SummaryCard icon={Package}        color="amber"  label="Purchase Spend"  value={fmtCur(tabData.purchase_spend)} sub="total stock-in cost" />
                            </div>

                            {/* Profit Gauge */}
                            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 text-xs sm:text-sm uppercase tracking-wider">Revenue vs Cost Breakdown</h3>
                                <div className="flex gap-4 sm:gap-6 items-center mb-6">
                                    <div className="flex-1 h-5 sm:h-6 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-700"
                                            style={{ width: `${Math.min(tabData.gross_margin, 100)}%` }}
                                        />
                                    </div>
                                    <span className="font-black text-green-700 shrink-0 text-base sm:text-lg">{tabData.gross_margin}% margin</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                                    <div className="p-4 bg-green-50 rounded-2xl border border-green-100">
                                        <p className="text-xs font-bold text-green-800 uppercase mb-1">Revenue</p>
                                        <p className="text-base sm:text-lg font-black text-green-700 truncate">{fmtCur(tabData.revenue)}</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center justify-center">
                                        <p className="text-xs font-bold text-blue-800 uppercase mb-1">minus COGS</p>
                                        <p className="text-base sm:text-lg font-black text-blue-700 truncate">- {fmtCur(tabData.cogs)}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                                        <p className="text-xs font-bold text-purple-800 uppercase mb-1">Gross Profit</p>
                                        <p className="text-base sm:text-lg font-black text-purple-700 truncate">= {fmtCur(tabData.gross_profit)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Chart */}
                            {(tabData.monthly?.length ?? 0) > 0 && (
                                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-sm border border-gray-100 min-w-0">
                                    <h3 className="font-bold text-gray-800 mb-4 text-xs sm:text-sm uppercase tracking-wider">Monthly Revenue</h3>
                                    <div className="w-full min-w-0">
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={tabData.monthly} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                                                <Tooltip formatter={(v) => fmtCur(v)} />
                                                <Bar dataKey="revenue" name="Revenue" fill="#7c3aed" radius={[6,6,0,0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Reports;

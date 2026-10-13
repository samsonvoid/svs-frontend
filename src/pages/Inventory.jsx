import React, { useState, useEffect, useMemo } from 'react';
import { Box, Plus, Pencil, Trash2, Loader2, Search, AlertTriangle, CheckCircle, X, AlertCircle, Filter, Layers, Coins, Hourglass } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/common/Pagination';
import { useLanguage } from '../context/LanguageContext';

const Inventory = () => {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [filterMode, setFilterMode] = useState(() => searchParams.get('filter') || 'all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const emptyForm = { name: '', sku: '', category_id: '', buying_price: '', selling_price: '', stock_quantity: '', unit: 'Pcs', min_stock: '5' };
    const [form, setForm] = useState(emptyForm);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
            setProducts(prodRes.data.data || prodRes.data);
            setCategories(catRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openAdd = () => { setEditTarget(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (p) => {
        setEditTarget(p);
        setForm({
            name: p.name, sku: p.sku, category_id: p.category_id,
            buying_price: p.buying_price, selling_price: p.selling_price,
            stock_quantity: p.stock_quantity, unit: p.unit || 'Pcs', min_stock: p.min_stock ?? 5,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editTarget) {
                await api.put(`/products/${editTarget.id}`, form);
                showToast('success', 'Product updated successfully.');
            } else {
                await api.post('/products', form);
                showToast('success', 'Product created successfully.');
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {})[0]?.[0] || 'Failed.';
            showToast('error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (p) => {
        if (!window.confirm(`Delete "${p.name}"?`)) return;
        try {
            await api.delete(`/products/${p.id}`);
            showToast('success', 'Product deleted.');
            fetchData();
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to delete.');
        }
    };

    const thirtyDaysAgo = useMemo(() => new Date(Date.now() - 30 * 864e5), []);

    const isDormantProduct = (p) => {
        const qty = parseInt(p.stock_quantity) || 0;
        if (qty <= 0) return false;
        if (!p.sale_items_max_created_at) return true;
        return new Date(p.sale_items_max_created_at) < thirtyDaysAgo;
    };

    const lowStockCount = useMemo(() => {
        return products.filter(p => p.stock_quantity <= (p.min_stock ?? 5)).length;
    }, [products]);

    const inventoryStats = useMemo(() => {
        const totalProducts = products.length;
        const totalUnits = products.reduce((acc, p) => acc + (parseInt(p.stock_quantity) || 0), 0);
        const totalCostValue = products.reduce((acc, p) => acc + ((parseInt(p.stock_quantity) || 0) * (parseFloat(p.buying_price) || 0)), 0);
        const totalRetailValue = products.reduce((acc, p) => acc + ((parseInt(p.stock_quantity) || 0) * (parseFloat(p.selling_price) || 0)), 0);
        const lowStock = products.filter(p => (parseInt(p.stock_quantity) || 0) <= (p.min_stock ?? 5)).length;
        const outOfStock = products.filter(p => (parseInt(p.stock_quantity) || 0) <= 0).length;
        const dormantItems = products.filter(isDormantProduct);
        const dormantCount = dormantItems.length;
        const dormantValue = dormantItems.reduce((acc, p) => acc + ((parseInt(p.stock_quantity) || 0) * (parseFloat(p.buying_price) || 0)), 0);
        return { 
            totalProducts, 
            totalUnits, 
            totalCostValue,
            totalValue: totalCostValue, 
            totalRetailValue,
            lowStock, 
            outOfStock,
            dormantCount,
            dormantValue
        };
    }, [products, thirtyDaysAgo]);

    // ── ABC Analysis (Pareto) ────────────────────────────────────────────────
    // Rank products by total revenue generated (selling_price × qty_sold)
    // A = top items covering 80% of revenue, B = next 15%, C = bottom 5%
    const abcMap = useMemo(() => {
        const withRevenue = products.map(p => ({
            id: p.id,
            rev: parseFloat(p.selling_price) * parseInt(p.sale_items_sum_quantity ?? 0),
        })).sort((a, b) => b.rev - a.rev);

        const totalRev = withRevenue.reduce((s, x) => s + x.rev, 0);
        const map = {};
        let cumulative = 0;
        for (const item of withRevenue) {
            cumulative += item.rev;
            const pct = totalRev > 0 ? cumulative / totalRev : 1;
            map[item.id] = pct <= 0.80 ? 'A' : pct <= 0.95 ? 'B' : 'C';
        }
        return map;
    }, [products]);

    // ── Reorder Suggestions ──────────────────────────────────────────────────
    // daily_rate = total_sold / 30 days (rolling estimate)
    // days_left  = stock_quantity / daily_rate
    // Flag products where days_left < 14 and they actually sell
    const reorderAlerts = useMemo(() => {
        return products
            .map(p => {
                const totalSold = parseInt(p.sale_items_sum_quantity ?? 0);
                const dailyRate = totalSold / 30;
                const daysLeft = dailyRate > 0 ? Math.floor(p.stock_quantity / dailyRate) : null;
                return { ...p, dailyRate, daysLeft };
            })
            .filter(p => p.daysLeft !== null && p.daysLeft < 14)
            .sort((a, b) => a.daysLeft - b.daysLeft);
    }, [products]);

    const [showReorderPanel, setShowReorderPanel] = useState(true);

    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase());
            let matchesFilter = true;
            if (filterMode === 'low') {
                matchesFilter = (parseInt(p.stock_quantity) || 0) <= (p.min_stock ?? 5);
            } else if (filterMode === 'dormant') {
                matchesFilter = isDormantProduct(p);
            }
            return matchesSearch && matchesFilter;
        });
    }, [products, search, filterMode, thirtyDaysAgo]);

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);


    if (loading) return (
        <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header Hero */}
            <div className="bg-[#192231] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/15">
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-2">
                            Inventory <span className="text-blue-400">/ Bidhaa</span>
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm max-w-lg">
                            Manage your full product catalog — add, edit, and track all items in real time.
                        </p>
                    </div>
                    <button 
                        onClick={openAdd} 
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-5 py-3 rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-blue-500/25 shrink-0 text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Product
                    </button>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]" />
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {/* Card 1: Total SKUs */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Box className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{t('kpi_total_skus')}</p>
                        <p className="text-lg sm:text-2xl font-black text-gray-900 mt-0.5">{inventoryStats.totalProducts.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{t('kpi_total_skus_sub')}</p>
                    </div>
                </div>

                {/* Card 2: Total Units */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{t('kpi_stock_units')}</p>
                        <p className="text-lg sm:text-2xl font-black text-gray-900 mt-0.5">{inventoryStats.totalUnits.toLocaleString()}</p>
                        <p className="text-[10px] text-purple-600 font-medium">{t('kpi_stock_units_sub')}</p>
                    </div>
                </div>

                {/* Card 3: Total Money of Store (Cost vs Retail Valuation) */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Coins className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{t('kpi_inv_value')} (Cost)</p>
                        <p className="text-sm sm:text-xl font-black text-emerald-600 mt-0.5 truncate">
                            TZS {Math.round(inventoryStats.totalCostValue).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium truncate">
                            {t('kpi_retail_value')}: TZS {Math.round(inventoryStats.totalRetailValue).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Card 4: Dormant Capital & Low Stock Alerts */}
                <div 
                    onClick={() => {
                        const next = filterMode === 'dormant' ? 'all' : 'dormant';
                        setFilterMode(next);
                        setCurrentPage(1);
                    }}
                    title="Click to filter dormant items"
                    className={`cursor-pointer bg-white p-4 sm:p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 ${
                        filterMode === 'dormant' ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20' : 'border-gray-100'
                    }`}
                >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        inventoryStats.dormantCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'
                    }`}>
                        <Hourglass className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{t('kpi_dormant_stock')}</p>
                            {inventoryStats.dormantCount > 0 && (
                                <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded uppercase">Slow</span>
                            )}
                        </div>
                        <p className={`text-sm sm:text-xl font-black mt-0.5 truncate ${inventoryStats.dormantCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                            TZS {Math.round(inventoryStats.dormantValue).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium truncate">
                            {t('kpi_dormant_stock_sub', { n: inventoryStats.dormantCount })} · {inventoryStats.lowStock} Low
                        </p>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl sm:rounded-2xl font-semibold text-sm shadow-md
                    ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        value={search} 
                        onChange={e => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }} 
                        type="text" 
                        placeholder="Search by name or SKU..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-xs" 
                    />
                </div>

                <select
                    value={filterMode}
                    onChange={e => {
                        setFilterMode(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-xs cursor-pointer shrink-0"
                >
                    <option value="all">📦 {t('inv_filter_all')} ({products.length})</option>
                    <option value="low">⚠️ {t('inv_filter_low')} ({inventoryStats.lowStock})</option>
                    <option value="dormant">💤 {t('inv_filter_dormant')} ({inventoryStats.dormantCount})</option>
                </select>
            </div>

            {/* ── Reorder Suggestions Panel ─────────────────────────────── */}
            {reorderAlerts.length > 0 && showReorderPanel && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-amber-800">
                                    Reorder Suggestions — {reorderAlerts.length} item{reorderAlerts.length > 1 ? 's' : ''} need restocking soon
                                </p>
                                <p className="text-[11px] text-amber-600">Based on your last 30-day average daily sales rate</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowReorderPanel(false)}
                            className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors text-amber-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {reorderAlerts.map(p => (
                            <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-3.5 py-2.5 border border-amber-100 shadow-xs">
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">{p.sku} · {p.stock_quantity} {p.unit || 'Pcs'} left</p>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                    <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                                        p.daysLeft <= 3
                                            ? 'bg-red-100 text-red-600'
                                            : p.daysLeft <= 7
                                            ? 'bg-orange-100 text-orange-600'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        ~{p.daysLeft}d left
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Product</th>
                                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Category</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Stock</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Buy Price</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Sell Price</th>
                                <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">ABC / Velocity</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-6 sm:px-8 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedProducts.map(p => {
                                const isLow = p.stock_quantity <= (p.min_stock ?? 5);
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors group">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <p className="font-bold text-gray-900 text-sm uppercase tracking-tight">{p.name}</p>
                                                {isDormantProduct(p) && (
                                                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                                                        💤 30d+ Unsold
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                                {p.category?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1.5 justify-end">
                                                <span className={`text-sm font-black ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {p.stock_quantity}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                                    {p.unit || 'Pcs'}
                                                </span>
                                                {isLow && <AlertTriangle className="w-3.5 h-3.5 inline text-red-500 shrink-0" />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right text-sm text-gray-600 font-semibold whitespace-nowrap">
                                            TZS {parseFloat(p.buying_price).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-right text-sm font-black text-green-700 whitespace-nowrap">
                                            TZS {parseFloat(p.selling_price).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-center whitespace-nowrap">
                                            <div className="flex flex-col items-center gap-1">
                                                {/* ABC Badge */}
                                                {(() => {
                                                    const cls = abcMap[p.id] || 'C';
                                                    const styles = {
                                                        A: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
                                                        B: 'text-blue-700 bg-blue-50 border border-blue-200',
                                                        C: 'text-gray-500 bg-gray-50 border border-gray-200',
                                                    };
                                                    return (
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${styles[cls]}`}>
                                                            Class {cls}
                                                        </span>
                                                    );
                                                })()}
                                                {/* Velocity */}
                                                {(() => {
                                                    const sold = parseInt(p.sale_items_sum_quantity ?? 0);
                                                    if (sold >= 50) return <span className="text-[10px] font-semibold text-orange-500">🔥 Fast</span>;
                                                    if (sold >= 10) return <span className="text-[10px] font-semibold text-blue-500">⚡ Medium</span>;
                                                    return <span className="text-[10px] font-semibold text-gray-400">🐢 Slow</span>;
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 sm:px-8 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => openEdit(p)} 
                                                    title="Edit product"
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 active:scale-95 transition-all"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(p)} 
                                                    title="Delete product"
                                                    className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-gray-400 italic text-sm">
                                        No products found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 sm:p-6 bg-white">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filtered.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                        pageSizeOptions={[10, 20, 50]}
                    />
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                {editTarget ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Name</label>
                                    <input 
                                        value={form.name} 
                                        onChange={e => setForm({...form, name: e.target.value})} 
                                        required 
                                        placeholder="e.g. Rice 25kg" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">SKU</label>
                                    <input 
                                        value={form.sku} 
                                        onChange={e => setForm({...form, sku: e.target.value})} 
                                        required 
                                        placeholder="e.g. FOOD-001" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category</label>
                                <select 
                                    value={form.category_id} 
                                    onChange={e => setForm({...form, category_id: e.target.value})} 
                                    required 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">-- Select Category --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Buying Price (TZS)</label>
                                    <input 
                                        type="number" 
                                        value={form.buying_price} 
                                        onChange={e => setForm({...form, buying_price: e.target.value})} 
                                        required 
                                        min="0" 
                                        step="0.01" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Selling Price (TZS)</label>
                                    <input 
                                        type="number" 
                                        value={form.selling_price} 
                                        onChange={e => setForm({...form, selling_price: e.target.value})} 
                                        required 
                                        min="0" 
                                        step="0.01" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Unit (Kipimo)</label>
                                    <select 
                                        value={form.unit || 'Pcs'} 
                                        onChange={e => setForm({...form, unit: e.target.value})} 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Pcs">Pcs (Vipande)</option>
                                        <option value="Roll">Roll (Roli)</option>
                                        <option value="Meter">Meter (Mita)</option>
                                        <option value="Box">Box (Boksi)</option>
                                        <option value="Pack">Pack (Pakiti)</option>
                                        <option value="Set">Set (Seti)</option>
                                        <option value="Pair">Pair (Jozi)</option>
                                        <option value="Bag">Bag (Mfuko)</option>
                                        <option value="Kg">Kg (Kilo)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Stock Quantity</label>
                                    <input 
                                        type="number" 
                                        value={form.stock_quantity} 
                                        onChange={e => setForm({...form, stock_quantity: e.target.value})} 
                                        required 
                                        min="0" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Min Stock Alert</label>
                                    <input 
                                        type="number" 
                                        value={form.min_stock} 
                                        onChange={e => setForm({...form, min_stock: e.target.value})} 
                                        min="0" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit" 
                                disabled={submitting} 
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-blue-500/20"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Box className="w-4 h-4" />}
                                {submitting ? 'Saving...' : (editTarget ? 'Update Product' : 'Create Product')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;

import React, { useState, useEffect, useMemo } from 'react';
import { 
    SlidersHorizontal, 
    AlertTriangle, 
    PackageX, 
    TrendingDown, 
    Search, 
    Plus, 
    Loader2, 
    CheckCircle2, 
    X, 
    Clock, 
    User,
    ShieldAlert
} from 'lucide-react';
import api from '../api/axios';
import Pagination from '../components/common/Pagination';
import { useLanguage } from '../context/LanguageContext';

const Adjustments = () => {
    const { t } = useLanguage();

    const [products, setProducts] = useState([]);
    const [adjustments, setAdjustments] = useState([]);
    const [stats, setStats] = useState({
        monthly_count: 0,
        monthly_units: 0,
        value_lost: 0,
        by_reason: []
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [toast, setToast] = useState(null);

    // Filter & Search states
    const [search, setSearch] = useState('');
    const [reasonFilter, setReasonFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Form state
    const [form, setForm] = useState({
        product_id: '',
        quantity: '',
        reason: 'damaged',
        notes: ''
    });

    // Reason definitions & badges
    const REASONS = [
        { key: 'damaged', labelKey: 'adj_reason_damaged', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: '💥' },
        { key: 'expired', labelKey: 'adj_reason_expired', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '⌛' },
        { key: 'stocktake', labelKey: 'adj_reason_stocktake', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: '📋' },
        { key: 'theft', labelKey: 'adj_reason_theft', color: 'bg-red-50 text-red-700 border-red-200', icon: '🚨' },
    ];

    const getReasonMeta = (reasonKey) => {
        return REASONS.find(r => r.key === reasonKey) || {
            key: reasonKey,
            labelKey: 'adj_reason',
            color: 'bg-gray-50 text-gray-700 border-gray-200',
            icon: '⚠️'
        };
    };

    const loadData = async () => {
        try {
            const [prodsRes, adjRes, statsRes] = await Promise.all([
                api.get('/products'),
                api.get('/adjustments'),
                api.get('/adjustments/stats'),
            ]);

            setProducts(prodsRes.data.data || prodsRes.data || []);
            setAdjustments(adjRes.data.data || adjRes.data || []);
            setStats(statsRes.data || { monthly_count: 0, monthly_units: 0, value_lost: 0, by_reason: [] });
        } catch (e) {
            console.error('Failed to load adjustments data:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const selectedProduct = useMemo(() => {
        return products.find(p => p.id === form.product_id) || null;
    }, [products, form.product_id]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!form.product_id || !form.quantity || !form.reason) return;

        const qtyNum = parseInt(form.quantity, 10);
        if (isNaN(qtyNum) || qtyNum <= 0) {
            setToast({ type: 'error', message: 'Quantity must be at least 1' });
            return;
        }

        if (selectedProduct && qtyNum > selectedProduct.stock_quantity) {
            setToast({
                type: 'error',
                message: `Cannot deduct ${qtyNum}. Only ${selectedProduct.stock_quantity} available in stock.`
            });
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/adjustments', {
                product_id: form.product_id,
                quantity: qtyNum,
                reason: form.reason,
                notes: form.notes
            });

            setToast({
                type: 'success',
                message: t('adj_success')
            });

            // Reset and close
            setForm({
                product_id: '',
                quantity: '',
                reason: 'damaged',
                notes: ''
            });
            setShowModal(false);

            // Reload data
            await loadData();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Error saving adjustment';
            setToast({ type: 'error', message: msg });
        } finally {
            setSubmitting(false);
        }
    };

    // Filtered adjustments
    const filteredAdjustments = useMemo(() => {
        return adjustments.filter(item => {
            const matchesReason = reasonFilter === 'ALL' || item.reason === reasonFilter;
            const term = search.toLowerCase();
            const name = item.product?.name?.toLowerCase() || '';
            const sku = item.product?.sku?.toLowerCase() || '';
            const notes = item.notes?.toLowerCase() || '';
            const user = item.user?.name?.toLowerCase() || '';
            const matchesSearch = !term || name.includes(term) || sku.includes(term) || notes.includes(term) || user.includes(term);
            return matchesReason && matchesSearch;
        });
    }, [adjustments, reasonFilter, search]);

    const paginatedAdjustments = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredAdjustments.slice(start, start + pageSize);
    }, [filteredAdjustments, currentPage, pageSize]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-9 h-9 text-rose-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
            {/* Toast Alert */}
            {toast && (
                <div className={`p-4 rounded-2xl flex items-center justify-between text-sm shadow-md transition-all ${
                    toast.type === 'success' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700' 
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-700'
                }`}>
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
                        <span className="font-semibold">{toast.message}</span>
                    </div>
                    <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Header Hero Section */}
            <div className="bg-gradient-to-br from-[#1b1c24] via-[#241f2b] to-[#1a1c22] rounded-3xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl border border-gray-800/60">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Module 2 • Admin Audit
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2">
                            {t('page_adjustments')}
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm lg:text-base leading-relaxed">
                            {t('page_adjustments_sub')}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-rose-600/30 transition-all shrink-0 cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        <span>{t('adj_btn_record')}</span>
                    </button>
                </div>
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-600/15 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute right-60 -bottom-20 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                {/* Monthly Count */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('adj_kpi_monthly_count')}</span>
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <SlidersHorizontal className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">
                        {stats.monthly_count.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{t('adj_kpi_monthly_count_sub')}</p>
                </div>

                {/* Units Removed */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('adj_kpi_units_lost')}</span>
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <PackageX className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600 mb-1">
                        {stats.monthly_units.toLocaleString()} <span className="text-sm font-bold text-gray-400">units</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{t('adj_kpi_units_lost_sub')}</p>
                </div>

                {/* Value Lost (Cost Basis) */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('adj_kpi_value_lost')}</span>
                        <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-600 mb-1">
                        TZS {Math.round(stats.value_lost).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{t('adj_kpi_value_lost_sub')}</p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <button
                        onClick={() => { setReasonFilter('ALL'); setCurrentPage(1); }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            reasonFilter === 'ALL'
                                ? 'bg-gray-900 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        All Reasons
                    </button>
                    {REASONS.map(r => (
                        <button
                            key={r.key}
                            onClick={() => { setReasonFilter(r.key); setCurrentPage(1); }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                                reasonFilter === r.key
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <span>{r.icon}</span>
                            <span>{t(r.labelKey)}</span>
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        type="text"
                        placeholder="Search product, SKU, user..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none"
                    />
                </div>
            </div>

            {/* Adjustments Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-gray-900">{t('adj_history_title')}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{t('adj_history_desc')}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {filteredAdjustments.length} records
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                <th className="px-6 py-4">{t('adj_col_product')}</th>
                                <th className="px-4 py-4">{t('adj_col_reason')}</th>
                                <th className="px-4 py-4 text-right">{t('adj_col_qty')}</th>
                                <th className="px-4 py-4">{t('adj_col_notes')}</th>
                                <th className="px-4 py-4">{t('adj_col_user')}</th>
                                <th className="px-6 py-4 text-right">{t('adj_col_date')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {paginatedAdjustments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                                        {t('adj_empty')}
                                    </td>
                                </tr>
                            ) : (
                                paginatedAdjustments.map((log) => {
                                    const meta = getReasonMeta(log.reason);
                                    const dateStr = new Date(log.created_at).toLocaleString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });

                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                                            {/* Product */}
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{log.product?.name || 'Deleted Product'}</div>
                                                <div className="text-xs text-gray-400 font-mono">SKU: {log.product?.sku || 'N/A'}</div>
                                            </td>

                                            {/* Reason Badge */}
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${meta.color}`}>
                                                    <span>{meta.icon}</span>
                                                    <span>{t(meta.labelKey)}</span>
                                                </span>
                                            </td>

                                            {/* Quantity Deducted */}
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                                                    {log.quantity}
                                                </span>
                                            </td>

                                            {/* Notes */}
                                            <td className="px-4 py-4 max-w-xs">
                                                <p className="text-xs text-gray-600 line-clamp-2">
                                                    {log.notes || <span className="text-gray-300 italic">—</span>}
                                                </p>
                                            </td>

                                            {/* User */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                        {log.user?.name ? log.user.name.substring(0, 2).toUpperCase() : 'U'}
                                                    </div>
                                                    <span>{log.user?.name || 'System Admin'}</span>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 text-right text-xs text-gray-500 font-medium whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{dateStr}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredAdjustments.length > pageSize && (
                    <div className="p-4 border-t border-gray-100 flex justify-end">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredAdjustments.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Modal: Record Stock Adjustment */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-xs">
                                    <SlidersHorizontal className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{t('adj_form_title')}</h3>
                                    <p className="text-xs text-rose-100">Write-off inventory without sales impact</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5">
                            {/* Product Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    {t('adj_select_product')} <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={form.product_id}
                                    onChange={e => setForm({ ...form, product_id: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none cursor-pointer"
                                >
                                    <option value="">-- Choose Product to Adjust --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (SKU: {p.sku || 'N/A'}) — Stock: {p.stock_quantity}
                                        </option>
                                    ))}
                                </select>

                                {selectedProduct && (
                                    <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-between text-xs">
                                        <span className="text-gray-500">{t('adj_current_stock')}:</span>
                                        <span className={`font-black px-2 py-0.5 rounded-lg ${
                                            selectedProduct.stock_quantity <= 0 
                                                ? 'bg-rose-100 text-rose-700' 
                                                : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {selectedProduct.stock_quantity} units
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Reason Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    {t('adj_reason')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {REASONS.map(r => (
                                        <button
                                            type="button"
                                            key={r.key}
                                            onClick={() => setForm({ ...form, reason: r.key })}
                                            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                                                form.reason === r.key
                                                    ? 'border-rose-500 bg-rose-50/60 text-rose-700 ring-2 ring-rose-500/20'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-base">{r.icon}</span>
                                            <span>{t(r.labelKey)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity to Deduct */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    {t('adj_qty_to_remove')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    max={selectedProduct ? selectedProduct.stock_quantity : undefined}
                                    placeholder="Enter quantity to deduct (e.g. 5)"
                                    value={form.quantity}
                                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none"
                                />
                                {selectedProduct && (
                                    <p className="text-[11px] text-gray-400 mt-1">
                                        Max allowed: {selectedProduct.stock_quantity} units
                                    </p>
                                )}
                            </div>

                            {/* Notes Field */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                                    {t('adj_notes')}
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder={t('adj_notes_ph')}
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-900 focus:ring-2 focus:ring-rose-500 focus:bg-white outline-none resize-none"
                                />
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-xs transition-colors cursor-pointer"
                                >
                                    {t('adj_cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{t('adj_submit')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Adjustments;

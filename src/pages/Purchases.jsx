import React, { useState, useEffect, useMemo } from 'react';
import { PackagePlus, CheckCircle, AlertCircle, Loader2, ShoppingBag, Search, Truck, ClipboardCheck, Wallet } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Pagination from '../components/common/Pagination';
import { useLanguage } from '../context/LanguageContext';

const Purchases = () => {
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const queryProductId = searchParams.get('product_id');

    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [history, setHistory] = useState([]);
    const [purchaseSearch, setPurchaseSearch] = useState('');
    const [filterSupplier, setFilterSupplier] = useState(''); // '' = All
    const [purchasePage, setPurchasePage] = useState(1);
    const [purchasePageSize, setPurchasePageSize] = useState(6);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        product_id: '',
        quantity: '',
        purchase_price: '',
        new_selling_price: '',
        supplier_id: '',
        supplier_name: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, historyRes, supRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/purchases'),
                    api.get('/suppliers'),
                ]);
                const prods = prodRes.data.data || prodRes.data || [];
                setProducts(prods);
                setHistory(historyRes.data || []);
                setSuppliers(supRes.data.data || supRes.data || []);

                if (queryProductId) {
                    const matched = prods.find(p => p.id === queryProductId);
                    if (matched) {
                        setForm(prev => ({
                            ...prev,
                            product_id: matched.id,
                            purchase_price: matched.buying_price || '',
                            new_selling_price: matched.selling_price || ''
                        }));
                    }
                }
            } catch (e) {
                console.error('Failed to load purchase data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [queryProductId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'product_id') {
            const picked = products.find(p => p.id === value);
            setForm(prev => ({
                ...prev,
                product_id: value,
                purchase_price: picked ? picked.buying_price || '' : prev.purchase_price,
                new_selling_price: picked ? picked.selling_price || '' : prev.new_selling_price,
            }));
            return;
        }
        setForm({ ...form, [name]: value });
    };

    const selectedProduct = useMemo(() => {
        return products.find(p => p.id === form.product_id) || null;
    }, [products, form.product_id]);

    const liveMargin = useMemo(() => {
        const cost = parseFloat(form.purchase_price);
        const sell = parseFloat(form.new_selling_price || selectedProduct?.selling_price);
        if (!cost || !sell || sell <= 0) return null;
        const marginPct = ((sell - cost) / sell) * 100;
        return marginPct.toFixed(1);
    }, [form.purchase_price, form.new_selling_price, selectedProduct]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.product_id || !form.quantity || !form.purchase_price) return;

        setSubmitting(true);
        try {
            const payload = {
                product_id: form.product_id,
                quantity: parseInt(form.quantity),
                purchase_price: parseFloat(form.purchase_price),
                supplier_id: form.supplier_id === '__other__' ? null : (form.supplier_id || null),
                supplier_name: form.supplier_name || null,
            };

            if (form.new_selling_price && parseFloat(form.new_selling_price) > 0) {
                payload.new_selling_price = parseFloat(form.new_selling_price);
            }

            const res = await api.post('/purchases', payload);

            setToast({ type: 'success', message: `✅ ${res.data.message} New stock: ${res.data.new_stock_level}` });
            setForm({ product_id: '', quantity: '', purchase_price: '', new_selling_price: '', supplier_id: '', supplier_name: '' });

            // Refresh history and product list
            const [prodRes, historyRes] = await Promise.all([
                api.get('/products'),
                api.get('/purchases'),
            ]);
            setProducts(prodRes.data.data || prodRes.data || []);
            setHistory(historyRes.data || []);
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Failed to process purchase.';
            setToast({ type: 'error', message: errMsg });
        } finally {
            setSubmitting(false);
            setTimeout(() => setToast(null), 5000);
        }
    };

    const filteredHistory = useMemo(() => {
        return history.filter(item => {
            const term = purchaseSearch.toLowerCase();
            const name = item.product?.name?.toLowerCase() || '';
            const sku = item.product?.sku?.toLowerCase() || '';
            const sup = item.supplier_name?.toLowerCase() || '';
            const matchesSearch = !term || name.includes(term) || sku.includes(term) || sup.includes(term);
            const matchesSupplier = !filterSupplier || item.supplier_name === filterSupplier;
            return matchesSearch && matchesSupplier;
        });
    }, [history, purchaseSearch, filterSupplier]);

    // Totals for the current filtered view
    const filteredSummary = useMemo(() => {
        const totalQty = filteredHistory.reduce((s, i) => s + parseInt(i.quantity ?? 0), 0);
        const totalValue = filteredHistory.reduce((s, i) => s + parseFloat(i.purchase_price ?? 0) * parseInt(i.quantity ?? 0), 0);
        return { totalQty, totalValue, count: filteredHistory.length };
    }, [filteredHistory]);

    // KPI summary cards — all-time totals across full history (not filtered)
    const purchaseStats = useMemo(() => {
        const totalCost = history.reduce((s, i) => s + (parseFloat(i.purchase_price ?? 0) * parseInt(i.quantity ?? 0)), 0);
        const totalUnits = history.reduce((s, i) => s + parseInt(i.quantity ?? 0), 0);
        const totalBatches = history.length;
        const uniqueSuppliers = new Set(history.map(i => i.supplier_name).filter(Boolean)).size;
        return { totalCost, totalUnits, totalBatches, uniqueSuppliers };
    }, [history]);

    // Unique supplier names present in history (for chips)
    const historySuppliers = useMemo(() => {
        const names = history.map(i => i.supplier_name).filter(Boolean);
        return [...new Set(names)].sort();
    }, [history]);

    const paginatedHistory = useMemo(() => {
        const start = (purchasePage - 1) * purchasePageSize;
        return filteredHistory.slice(start, start + purchasePageSize);
    }, [filteredHistory, purchasePage, purchasePageSize]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#192231] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/15">
                <div className="relative z-10">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-2">
                        Pokea Mzigo, <span className="text-blue-400">Stock In</span>
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm lg:text-base max-w-lg leading-relaxed">
                        Weka rekodi ya bidhaa inayoingia kutoka kwa Supplier. Mfumo utaongeza stock moja kwa moja na kuweka kumbukumbu.
                    </p>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {/* Card 1: Total Purchase Cost */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{t('kpi_pur_cost')}</p>
                        <p className="text-sm sm:text-xl font-black text-blue-600 mt-0.5 truncate">
                            TZS {Math.round(purchaseStats.totalCost).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">{t('kpi_pur_cost_sub')}</p>
                    </div>
                </div>

                {/* Card 2: Total Units Received */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <PackagePlus className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{t('kpi_pur_units')}</p>
                        <p className="text-lg sm:text-2xl font-black text-gray-900 mt-0.5">{purchaseStats.totalUnits.toLocaleString()}</p>
                        <p className="text-[10px] text-purple-600 font-medium">{t('kpi_pur_units_sub')}</p>
                    </div>
                </div>

                {/* Card 3: Total Batches */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{t('kpi_pur_batches')}</p>
                        <p className="text-lg sm:text-2xl font-black text-gray-900 mt-0.5">{purchaseStats.totalBatches.toLocaleString()}</p>
                        <p className="text-[10px] text-teal-600 font-medium">{t('kpi_pur_batches_sub')}</p>
                    </div>
                </div>

                {/* Card 4: Unique Suppliers */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider truncate">{t('kpi_pur_suppliers')}</p>
                        <p className="text-lg sm:text-2xl font-black text-gray-900 mt-0.5">{purchaseStats.uniqueSuppliers}</p>
                        <p className="text-[10px] text-amber-600 font-medium">{t('kpi_pur_sup_sub')}</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
                {/* Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                <PackagePlus className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base sm:text-lg">Ingiza Mzigo Mpya</h3>
                                <p className="text-xs text-gray-500">Jaza fomu hii kupokea bidhaa</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Bidhaa</label>
                                <select
                                    name="product_id"
                                    value={form.product_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-3 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">-- Chagua Bidhaa --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.sku}) · {p.unit || 'Pcs'}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Kiasi (Quantity)</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={form.quantity}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                        placeholder="e.g. 50"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-3 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Bei ya Kununulia (TZS)</label>
                                    <input
                                        type="number"
                                        name="purchase_price"
                                        value={form.purchase_price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                        placeholder="e.g. 4500"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-3 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Optional Selling Price Update & Live Margin Pulse */}
                            {selectedProduct && (
                                <div className="p-3.5 bg-blue-50/60 border border-blue-200/70 rounded-2xl space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-600">Bei ya Sasa ya Kuuzia:</span>
                                        <span className="font-bold text-gray-900">TZS {Number(selectedProduct.selling_price || 0).toLocaleString()}</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                                        <div className="flex-1 w-full">
                                            <label className="block text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                                                Sasisha Bei ya Kuuzia (Hiari)
                                            </label>
                                            <input
                                                type="number"
                                                name="new_selling_price"
                                                value={form.new_selling_price}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                placeholder={`Default: ${selectedProduct.selling_price}`}
                                                className="w-full bg-white border border-blue-200 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>

                                        {liveMargin && (
                                            <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-1 sm:pt-4">
                                                <span className="text-[10px] text-gray-500 uppercase font-bold">Faida (Margin):</span>
                                                <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg ${
                                                    parseFloat(liveMargin) > 20 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {liveMargin}% Margin
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Supplier (Msambazaji)</label>
                                <select
                                    name="supplier_id"
                                    value={form.supplier_id}
                                    onChange={e => {
                                        const id = e.target.value;
                                        const sup = suppliers.find(s => s.id === id);
                                        setForm({ ...form, supplier_id: id, supplier_name: sup ? sup.name : (id === '__other__' ? '' : '') });
                                    }}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-3 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="">-- Chagua Supplier --</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}{s.contact_person ? ` (${s.contact_person})` : ''}</option>
                                    ))}
                                    <option value="__other__">➕ Ingiza Jina Lingine...</option>
                                </select>
                                {form.supplier_id === '__other__' && (
                                    <input
                                        type="text"
                                        name="supplier_name"
                                        value={form.supplier_name}
                                        onChange={handleChange}
                                        placeholder="e.g. Kariakoo Supplier"
                                        className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 text-sm mt-2"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />}
                                {submitting ? 'Inaprocess...' : 'Pokea Mzigo (Stock In)'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* History Table */}
                <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        {/* History Panel Header */}
                        <div className="space-y-3 mb-5">
                            {/* Title */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">Historia ya Manunuzi</h3>
                                    <p className="text-xs text-gray-500">Rekodi ya Stock In</p>
                                </div>
                            </div>

                            {/* Filter Controls Row */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                {/* Supplier dropdown */}
                                <select
                                    value={filterSupplier}
                                    onChange={e => { setFilterSupplier(e.target.value); setPurchasePage(1); }}
                                    className="bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer shrink-0"
                                >
                                    <option value="">🏬 Wote — Suppliers ({history.length})</option>
                                    {historySuppliers.map(name => {
                                        const count = history.filter(i => i.supplier_name === name).length;
                                        const val = history
                                            .filter(i => i.supplier_name === name)
                                            .reduce((s, i) => s + parseFloat(i.purchase_price ?? 0) * parseInt(i.quantity ?? 0), 0);
                                        return (
                                            <option key={name} value={name}>
                                                🚚 {name} ({count} deliveries · TZS {val.toLocaleString()})
                                            </option>
                                        );
                                    })}
                                </select>

                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search product or SKU..."
                                        value={purchaseSearch}
                                        onChange={e => { setPurchaseSearch(e.target.value); setPurchasePage(1); }}
                                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Summary bar */}
                            <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-xs font-semibold text-blue-700">
                                <span>📦 <span className="font-black">{filteredSummary.count}</span> deliveries</span>
                                <span className="text-blue-300">|</span>
                                <span>🔢 <span className="font-black">{filteredSummary.totalQty.toLocaleString()}</span> units</span>
                                <span className="text-blue-300">|</span>
                                <span>💰 TZS <span className="font-black">{filteredSummary.totalValue.toLocaleString()}</span></span>
                                {filterSupplier && (
                                    <button
                                        onClick={() => { setFilterSupplier(''); setPurchasePage(1); }}
                                        className="ml-auto text-[10px] font-black text-blue-500 hover:text-red-500 transition-colors"
                                    >
                                        ✕ Clear
                                    </button>
                                )}
                            </div>
                        </div>


                        <div className="space-y-3">
                            {filteredHistory.length === 0 && (
                                <div className="text-center py-16 text-gray-400 italic text-sm">
                                    Hakuna rekodi ya manunuzi bado.
                                </div>
                            )}
                            {paginatedHistory.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl sm:rounded-2xl bg-gray-50 hover:bg-blue-50/60 transition-colors group">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            IN
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 uppercase tracking-tight truncate">{item.product?.name}</p>
                                            <p className="text-xs text-gray-400 truncate font-medium">{item.supplier_name || 'Direct Supplier'} · <span className="font-mono">{item.product?.sku}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0 pl-12 sm:pl-0">
                                        <p className="text-sm font-black text-blue-600">+{item.quantity} {item.product?.unit || 'Pcs'}</p>
                                        <p className="text-xs text-gray-400 font-semibold">TZS {parseFloat(item.purchase_price).toLocaleString()}/{item.product?.unit || 'unit'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <Pagination
                            currentPage={purchasePage}
                            totalItems={filteredHistory.length}
                            pageSize={purchasePageSize}
                            onPageChange={setPurchasePage}
                            onPageSizeChange={setPurchasePageSize}
                            pageSizeOptions={[6, 10, 20]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Purchases;

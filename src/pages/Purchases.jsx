import React, { useState, useEffect, useMemo } from 'react';
import { PackagePlus, CheckCircle, AlertCircle, Loader2, ShoppingBag, Search } from 'lucide-react';
import api from '../api/axios';
import Pagination from '../components/common/Pagination';

const Purchases = () => {
    const [products, setProducts] = useState([]);
    const [history, setHistory] = useState([]);
    const [purchaseSearch, setPurchaseSearch] = useState('');
    const [purchasePage, setPurchasePage] = useState(1);
    const [purchasePageSize, setPurchasePageSize] = useState(6);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        product_id: '',
        quantity: '',
        purchase_price: '',
        supplier_name: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, historyRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/purchases'),
                ]);
                setProducts(prodRes.data.data || prodRes.data || []);
                setHistory(historyRes.data || []);
            } catch (e) {
                console.error('Failed to load purchase data', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.product_id || !form.quantity || !form.purchase_price) return;

        setSubmitting(true);
        try {
            const res = await api.post('/purchases', {
                ...form,
                quantity: parseInt(form.quantity),
                purchase_price: parseFloat(form.purchase_price),
            });

            setToast({ type: 'success', message: `✅ ${res.data.message} New stock: ${res.data.new_stock_level}` });
            setForm({ product_id: '', quantity: '', purchase_price: '', supplier_name: '' });

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
            return name.includes(term) || sku.includes(term) || sup.includes(term);
        });
    }, [history, purchaseSearch]);

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
                                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
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
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-3 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Jina la Supplier (Optional)</label>
                                <input
                                    type="text"
                                    name="supplier_name"
                                    value={form.supplier_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Bakhresa Food Products"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 sm:py-3 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
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
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">Historia ya Manunuzi</h3>
                                    <p className="text-xs text-gray-500">Rekodi ya mwisho ya Stock In</p>
                                </div>
                            </div>

                            <div className="relative w-full sm:w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search product / supplier..."
                                    value={purchaseSearch}
                                    onChange={(e) => {
                                        setPurchaseSearch(e.target.value);
                                        setPurchasePage(1);
                                    }}
                                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                />
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
                                        <p className="text-sm font-black text-blue-600">+{item.quantity} units</p>
                                        <p className="text-xs text-gray-400 font-semibold">TZS {parseFloat(item.purchase_price).toLocaleString()}/unit</p>
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

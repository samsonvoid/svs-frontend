import React, { useState, useEffect } from 'react';
import { PackagePlus, CheckCircle, AlertCircle, Loader2, ShoppingBag } from 'lucide-react';
import api from '../api/axios';

const Purchases = () => {
    const [products, setProducts] = useState([]);
    const [history, setHistory] = useState([]);
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
                // Reuse top-products to get a product list, plus purchase history
                const [topRes, historyRes] = await Promise.all([
                    api.get('/analytics/top-products'),
                    api.get('/purchases'),
                ]);
                // Build a unique product list from top-products data
                const prods = topRes.data.map(i => i.product).filter(Boolean);
                setProducts(prods);
                setHistory(historyRes.data);
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

            // Refresh history
            const historyRes = await api.get('/purchases');
            setHistory(historyRes.data);
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Failed to process purchase.';
            setToast({ type: 'error', message: errMsg });
        } finally {
            setSubmitting(false);
            setTimeout(() => setToast(null), 5000);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#1e293b] rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl shadow-blue-900/10">
                <div className="relative z-10">
                    <h1 className="text-2xl lg:text-4xl font-bold tracking-tight mb-2">
                        Pokea Mzigo, <span className="text-blue-400">Stock In</span>
                    </h1>
                    <p className="text-gray-400 text-sm lg:text-base max-w-lg leading-relaxed">
                        Weka rekodi ya bidhaa inayoingia kutoka kwa Supplier. Mfumo utaongeza stock moja kwa moja.
                    </p>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[80px]"></div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl font-semibold text-sm shadow-lg
                    ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    {toast.message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Form */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                            <PackagePlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Ingiza Mzigo Mpya</h3>
                            <p className="text-xs text-gray-500">Jaza fomu hii kupokea bidhaa</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Bidhaa</label>
                            <select
                                name="product_id"
                                value={form.product_id}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">-- Chagua Bidhaa --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Kiasi (Quantity)</label>
                            <input
                                type="number"
                                name="quantity"
                                value={form.quantity}
                                onChange={handleChange}
                                min="1"
                                required
                                placeholder="e.g. 50"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Bei ya Kununulia (TZS)</label>
                            <input
                                type="number"
                                name="purchase_price"
                                value={form.purchase_price}
                                onChange={handleChange}
                                min="0"
                                step="0.01"
                                required
                                placeholder="e.g. 4500"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Jina la Supplier (Optional)</label>
                            <input
                                type="text"
                                name="supplier_name"
                                value={form.supplier_name}
                                onChange={handleChange}
                                placeholder="e.g. Bakhresa Food Products"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />}
                            {submitting ? 'Inaprocess...' : 'Pokea Mzigo'}
                        </button>
                    </form>
                </div>

                {/* History Table */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Historia ya Manunuzi</h3>
                            <p className="text-xs text-gray-500">Rekodi ya mwisho ya Stock In</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {history.length === 0 && (
                            <div className="text-center py-16 text-gray-400 italic text-sm">
                                Hakuna rekodi ya manunuzi bado.
                            </div>
                        )}
                        {history.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    IN
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-tight truncate">{item.product?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{item.supplier_name || 'Unknown Supplier'} · {item.product?.sku}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-black text-blue-600">+{item.quantity} units</p>
                                    <p className="text-xs text-gray-400">TZS {parseFloat(item.purchase_price).toLocaleString()}/unit</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Purchases;

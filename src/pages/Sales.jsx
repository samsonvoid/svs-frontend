import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, Receipt, Search, Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';
const downloadFile = (path) => {
    const token = localStorage.getItem('svs_token');
    const url = new URL(`${API_BASE}${path}`);
    if (token) url.searchParams.set('_token', token);
    const a = document.createElement('a');
    a.href = url.toString();
    a.click();
};

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);

    const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 5000); };

    const fetchData = async () => {
        try {
            const prodRes = await api.get('/products');
            setProducts(prodRes.data.data || prodRes.data);
        } catch (e) { console.error('Failed to load products', e); }

        try {
            const salesRes = await api.get('/sales');
            setSalesHistory(salesRes.data.data || salesRes.data);
        } catch (e) { console.error('Failed to load sales', e); }

        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
    const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
    const updateItem = (i, field, value) => {
        const updated = [...items];
        updated[i] = { ...updated[i], [field]: value };
        setItems(updated);
    };

    const getProduct = (id) => products.find(p => p.id === id);

    const lineTotal = (item) => {
        const prod = getProduct(item.product_id);
        if (!prod || !item.quantity) return 0;
        return parseFloat(prod.selling_price) * parseInt(item.quantity);
    };

    const grandTotal = items.reduce((sum, item) => sum + lineTotal(item), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validItems = items.filter(i => i.product_id && i.quantity > 0);
        if (validItems.length === 0) return showToast('error', 'Please add at least one item.');

        setSubmitting(true);
        try {
            const res = await api.post('/sales', { items: validItems.map(i => ({ ...i, quantity: parseInt(i.quantity) })) });
            showToast('success', `✅ ${res.data.message} Total: TZS ${res.data.total_amount?.toLocaleString()}`);
            setItems([{ product_id: '', quantity: 1 }]);
            fetchData();
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Sale failed.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>;

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#1e293b] rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-2xl lg:text-4xl font-bold tracking-tight mb-2">Mauzo <span className="text-green-400">/ Sales</span></h1>
                    <p className="text-gray-400 text-sm max-w-lg">Process a new sale. Stock is deducted automatically and logged in the audit trail.</p>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-600/20 rounded-full blur-[80px]" />
            </div>

            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl font-semibold text-sm shadow-lg
                    ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    {toast.message}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* New Sale Form */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><ShoppingCart className="w-5 h-5" /></div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Uza Bidhaa</h3>
                            <p className="text-xs text-gray-500">New sale transaction</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {items.map((item, i) => {
                            const prod = getProduct(item.product_id);
                            return (
                                <div key={i} className="flex gap-2 items-end p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bidhaa</label>
                                        <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                                            <option value="">-- Chagua --</option>
                                            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stk: {p.stock_quantity})</option>)}
                                        </select>
                                    </div>
                                    <div className="w-20">
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Qty</label>
                                        <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} min="1"
                                            max={prod?.stock_quantity || 9999}
                                            className="w-full bg-white border border-gray-200 rounded-xl py-2 px-2 text-sm text-center focus:ring-2 focus:ring-green-500 outline-none" />
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total</p>
                                        <p className="text-sm font-black text-green-700">TZS {lineTotal(item).toLocaleString()}</p>
                                    </div>
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}

                        <button type="button" onClick={addItem} className="w-full border-2 border-dashed border-gray-200 hover:border-green-400 text-gray-400 hover:text-green-600 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                            <Plus className="w-4 h-4" /> Add Another Item
                        </button>

                        <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl border border-green-200">
                            <span className="text-sm font-bold text-green-800">Grand Total</span>
                            <span className="text-xl font-black text-green-700">TZS {grandTotal.toLocaleString()}</span>
                        </div>

                        <button type="submit" disabled={submitting} className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                            {submitting ? 'Processing...' : 'Complete Sale'}
                        </button>
                    </form>
                </div>

                {/* Sales History */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Receipt className="w-5 h-5" /></div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Historia ya Mauzo</h3>
                            <p className="text-xs text-gray-500">Recent sales transactions</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {salesHistory.length === 0 && <div className="text-center py-16 text-gray-400 italic text-sm">No sales yet.</div>}
                        {salesHistory.map((sale) => (
                            <div key={sale.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xs font-black shrink-0">OUT</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900">Sale #{sale.id.slice(0, 8).toUpperCase()}</p>
                                    <p className="text-xs text-gray-400">{new Date(sale.created_at).toLocaleString()}</p>
                                </div>
                                <div className="text-right shrink-0 flex items-center gap-4">
                                    <div>
                                        <p className="text-sm font-black text-green-700">TZS {parseFloat(sale.total_amount).toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">{(sale.sale_items?.length ?? 0)} items</p>
                                    </div>
                                    <button onClick={() => downloadFile(`/export/receipt/${sale.id}`)} title="Download Receipt"
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;

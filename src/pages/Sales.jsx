import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Plus, Trash2, Receipt, Search, Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import Pagination from '../components/common/Pagination';

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
    const [salesSearch, setSalesSearch] = useState('');
    const [salesPage, setSalesPage] = useState(1);
    const [salesPageSize, setSalesPageSize] = useState(6);
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

    const filteredSales = useMemo(() => {
        return salesHistory.filter(sale => {
            const term = salesSearch.toLowerCase();
            const id = sale.id?.toLowerCase() || '';
            return id.includes(term);
        });
    }, [salesHistory, salesSearch]);

    const paginatedSales = useMemo(() => {
        const start = (salesPage - 1) * salesPageSize;
        return filteredSales.slice(start, start + salesPageSize);
    }, [filteredSales, salesPage, salesPageSize]);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#192231] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/15">
                <div className="relative z-10">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-2">
                        Mauzo <span className="text-green-400">/ Sales</span>
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm lg:text-base max-w-lg">
                        Process a new sale. Stock is deducted automatically and logged in the audit trail.
                    </p>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-600/20 rounded-full blur-[80px]" />
            </div>

            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl sm:rounded-2xl font-semibold text-sm shadow-md
                    ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
                {/* New Sale Form */}
                <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base sm:text-lg">Uza Bidhaa</h3>
                                <p className="text-xs text-gray-500">New sale transaction</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                                {items.map((item, i) => {
                                    const prod = getProduct(item.product_id);
                                    return (
                                        <div key={i} className="p-3.5 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl space-y-3 border border-gray-100/80">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bidhaa</label>
                                                <select 
                                                    value={item.product_id} 
                                                    onChange={e => updateItem(i, 'product_id', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                                >
                                                    <option value="">-- Chagua Bidhaa --</option>
                                                    {products.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name} (Stk: {p.stock_quantity})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex items-center justify-between gap-3 pt-1">
                                                <div className="w-24 sm:w-28 shrink-0">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Qty</label>
                                                    <input 
                                                        type="number" 
                                                        value={item.quantity} 
                                                        onChange={e => updateItem(i, 'quantity', e.target.value)} 
                                                        min="1"
                                                        max={prod?.stock_quantity || 9999}
                                                        className="w-full bg-white border border-gray-200 rounded-xl py-2 px-2.5 text-sm text-center focus:ring-2 focus:ring-green-500 outline-none" 
                                                    />
                                                </div>
                                                <div className="text-right flex-1 min-w-0 pr-1">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">Total</p>
                                                    <p className="text-sm font-black text-green-700 truncate">
                                                        TZS {lineTotal(item).toLocaleString()}
                                                    </p>
                                                </div>
                                                {items.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeItem(i)} 
                                                        title="Remove item"
                                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button 
                                type="button" 
                                onClick={addItem} 
                                className="w-full border-2 border-dashed border-gray-200 hover:border-green-500 text-gray-500 hover:text-green-600 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
                            >
                                <Plus className="w-4 h-4" /> Ongeza Bidhaa Nyingine (Add Item)
                            </button>

                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl sm:rounded-2xl border border-green-200/80">
                                <span className="text-xs sm:text-sm font-bold text-green-900">Jumla Kuu (Grand Total)</span>
                                <span className="text-lg sm:text-xl font-black text-green-700">TZS {grandTotal.toLocaleString()}</span>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting} 
                                className="w-full bg-green-600 hover:bg-green-700 active:scale-95 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 text-sm"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                                {submitting ? 'Inaprocess...' : 'Kamilisha Mauzo (Complete Sale)'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sales History */}
                <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-base sm:text-lg">Historia ya Mauzo</h3>
                                    <p className="text-xs text-gray-500">Recent sales transactions</p>
                                </div>
                            </div>
                            <div className="relative w-full sm:w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search sale ID..."
                                    value={salesSearch}
                                    onChange={(e) => {
                                        setSalesSearch(e.target.value);
                                        setSalesPage(1);
                                    }}
                                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {filteredSales.length === 0 && (
                                <div className="text-center py-16 text-gray-400 italic text-sm">No sales found.</div>
                            )}
                            {paginatedSales.map((sale) => (
                                <div key={sale.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl sm:rounded-2xl bg-gray-50 hover:bg-green-50/50 transition-colors">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center text-xs font-black shrink-0">
                                            OUT
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">Sale #{sale.id.slice(0, 8).toUpperCase()}</p>
                                            <p className="text-xs text-gray-400">{new Date(sale.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0 flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                                        <div>
                                            <p className="text-sm font-black text-green-700">TZS {parseFloat(sale.total_amount).toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">{(sale.sale_items?.length ?? 0)} items</p>
                                        </div>
                                        <button 
                                            onClick={() => downloadFile(`/export/receipt/${sale.id}`)} 
                                            title="Download Receipt"
                                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 active:scale-95 rounded-xl transition-all border border-gray-200 sm:border-transparent"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4">
                        <Pagination
                            currentPage={salesPage}
                            totalItems={filteredSales.length}
                            pageSize={salesPageSize}
                            onPageChange={setSalesPage}
                            onPageSizeChange={setSalesPageSize}
                            pageSizeOptions={[5, 10, 20]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;

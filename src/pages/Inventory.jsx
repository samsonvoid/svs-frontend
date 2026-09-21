import React, { useState, useEffect, useMemo } from 'react';
import { Box, Plus, Pencil, Trash2, Loader2, Search, AlertTriangle, CheckCircle, X, AlertCircle, Filter } from 'lucide-react';
import api from '../api/axios';
import Pagination from '../components/common/Pagination';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const emptyForm = { name: '', sku: '', category_id: '', buying_price: '', selling_price: '', stock_quantity: '', min_stock: '5' };
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
            stock_quantity: p.stock_quantity, min_stock: p.min_stock ?? 5,
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

    const lowStockCount = useMemo(() => {
        return products.filter(p => p.stock_quantity <= (p.min_stock ?? 5)).length;
    }, [products]);

    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase());
            const matchesLowStock = filterLowStockOnly ? (p.stock_quantity <= (p.min_stock ?? 5)) : true;
            return matchesSearch && matchesLowStock;
        });
    }, [products, search, filterLowStockOnly]);

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

            {/* Toast */}
            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl sm:rounded-2xl font-semibold text-sm shadow-md
                    ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Search & BI Filter Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-xs" 
                    />
                </div>

                {/* BI Quick Filter Toggle */}
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl sm:rounded-2xl border border-gray-100 shadow-xs">
                    <button
                        onClick={() => {
                            setFilterLowStockOnly(false);
                            setCurrentPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            !filterLowStockOnly
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        All ({products.length})
                    </button>
                    <button
                        onClick={() => {
                            setFilterLowStockOnly(true);
                            setCurrentPage(1);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            filterLowStockOnly
                                ? 'bg-red-600 text-white shadow-xs'
                                : lowStockCount > 0
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-gray-400 hover:text-gray-700'
                        }`}
                    >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Low Stock ({lowStockCount})
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-6 sm:px-8 py-4">Product</th>
                                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Category</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Stock</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Buy Price</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Sell Price</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-6 sm:px-8 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedProducts.map(p => {
                                const isLow = p.stock_quantity <= (p.min_stock ?? 5);
                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors group">
                                        <td className="px-6 sm:px-8 py-4">
                                            <p className="font-bold text-gray-900 text-sm uppercase tracking-tight">{p.name}</p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                                {p.category?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right whitespace-nowrap">
                                            <span className={`text-sm font-black ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                                                {p.stock_quantity}
                                                {isLow && <AlertTriangle className="w-3.5 h-3.5 inline ml-1 text-red-500" />}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right text-sm text-gray-600 font-semibold whitespace-nowrap">
                                            TZS {parseFloat(p.buying_price).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-right text-sm font-black text-green-700 whitespace-nowrap">
                                            TZS {parseFloat(p.selling_price).toLocaleString()}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

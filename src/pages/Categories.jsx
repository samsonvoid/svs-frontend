import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Pencil, Trash2, Loader2, CheckCircle, AlertCircle, X, Hash } from 'lucide-react';
import api from '../api/axios';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const emptyForm = { name: '', description: '' };
    const [form, setForm] = useState(emptyForm);

    const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openAdd = () => { setEditTarget(null); setForm(emptyForm); setShowModal(true); };
    const openEdit = (c) => {
        setEditTarget(c);
        setForm({ name: c.name, description: c.description || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editTarget) {
                await api.put(`/categories/${editTarget.id}`, form);
                showToast('success', 'Category updated.');
            } else {
                await api.post('/categories', form);
                showToast('success', 'Category created.');
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {})[0]?.[0] || 'Failed.';
            showToast('error', msg);
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (c) => {
        if (!window.confirm(`Delete "${c.name}" category?`)) return;
        try {
            await api.delete(`/categories/${c.id}`);
            showToast('success', 'Category deleted.');
            fetchCategories();
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed.');
        }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="w-9 h-9 text-amber-600 animate-spin" />
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#192231] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/15">
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-2">
                            Categories <span className="text-amber-400">/ Makundi</span>
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm max-w-lg">
                            Organize your products into logical groups for structured inventory tracking and financial reporting.
                        </p>
                    </div>
                    <button 
                        onClick={openAdd} 
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold px-5 py-3 rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-amber-500/25 shrink-0 text-sm"
                    >
                        <Plus className="w-4 h-4" /> New Category
                    </button>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-600/20 rounded-full blur-[80px]" />
            </div>

            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl sm:rounded-2xl font-semibold text-sm shadow-md
                    ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {categories.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
                                    <FolderOpen className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openEdit(c)} 
                                        title="Edit category"
                                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 active:scale-95 transition-all"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(c)} 
                                        title="Delete category"
                                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{c.name}</h3>
                            <p className="text-xs text-gray-400 mb-4 line-clamp-2">{c.description || 'No description provided.'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                <Hash className="w-3.5 h-3.5" />
                                <span className="font-mono text-[11px]">{c.slug || '—'}</span>
                            </div>
                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                {c.products_count ?? 0} products
                            </span>
                        </div>
                    </div>
                ))}
                {categories.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-400 italic text-sm">
                        No categories found. Create your first category above!
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                {editTarget ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Category Name</label>
                                <input 
                                    value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})} 
                                    required 
                                    placeholder="e.g. Drinks, Electronics"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                    Description <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea 
                                    value={form.description} 
                                    onChange={e => setForm({...form, description: e.target.value})} 
                                    rows={3} 
                                    placeholder="Short description of this category..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none" 
                                />
                            </div>
                            <p className="text-[11px] text-gray-400">Slug will be auto-generated from the name (e.g. "drinks").</p>
                            <button 
                                type="submit" 
                                disabled={submitting} 
                                className="w-full bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-amber-500/20 text-sm"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderOpen className="w-4 h-4" />}
                                {submitting ? 'Saving...' : (editTarget ? 'Update Category' : 'Create Category')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;

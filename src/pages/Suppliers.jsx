import React, { useState, useEffect, useMemo } from 'react';
import { 
    Truck, 
    Plus, 
    Pencil, 
    Trash2, 
    Loader2, 
    Search, 
    CheckCircle, 
    AlertCircle, 
    X, 
    Phone, 
    Mail, 
    MapPin, 
    User,
    Building2,
    ShoppingBag
} from 'lucide-react';
import api from '../api/axios';
import Pagination from '../components/common/Pagination';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const emptyForm = {
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
    };
    const [form, setForm] = useState(emptyForm);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/suppliers');
            setSuppliers(res.data || []);
        } catch (e) {
            console.error('Failed to load suppliers:', e);
            showToast('error', 'Failed to load suppliers.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const openAdd = () => {
        setEditTarget(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (s) => {
        setEditTarget(s);
        setForm({
            name: s.name || '',
            contact_person: s.contact_person || '',
            phone: s.phone || '',
            email: s.email || '',
            address: s.address || '',
            notes: s.notes || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editTarget) {
                await api.put(`/suppliers/${editTarget.id}`, form);
                showToast('success', 'Supplier updated successfully.');
            } else {
                await api.post('/suppliers', form);
                showToast('success', 'Supplier added successfully.');
            }
            setShowModal(false);
            fetchSuppliers();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save supplier.';
            showToast('error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (s) => {
        if (!window.confirm(`Delete supplier "${s.name}"?`)) return;
        try {
            await api.delete(`/suppliers/${s.id}`);
            showToast('success', 'Supplier deleted.');
            fetchSuppliers();
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed to delete supplier.');
        }
    };

    const filtered = useMemo(() => {
        return suppliers.filter(s => {
            const term = search.toLowerCase();
            const name = s.name?.toLowerCase() || '';
            const contact = s.contact_person?.toLowerCase() || '';
            const phone = s.phone?.toLowerCase() || '';
            const address = s.address?.toLowerCase() || '';
            return name.includes(term) || contact.includes(term) || phone.includes(term) || address.includes(term);
        });
    }, [suppliers, search]);

    const paginatedSuppliers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage, pageSize]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-9 h-9 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header Hero */}
            <div className="bg-[#192231] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/15">
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-2">
                            Wasambazaji <span className="text-blue-400">/ Suppliers</span>
                        </h1>
                        <p className="text-gray-400 text-xs sm:text-sm max-w-lg">
                            Manage your direct suppliers for electrical cables, lights, sockets, and hardware materials.
                        </p>
                    </div>
                    <button 
                        onClick={openAdd} 
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-5 py-3 rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-blue-500/25 shrink-0 text-sm"
                    >
                        <Plus className="w-4 h-4" /> Sajili Supplier Mpya
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

            {/* Search and Stats */}
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
                        placeholder="Tafuta kwa jina, simu, au eneo..."
                        className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-xs" 
                    />
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-xs">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Jumla ya Wasambazaji: <span className="text-gray-900 font-black">{suppliers.length}</span></span>
                </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {paginatedSuppliers.map(s => (
                    <div key={s.id} className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col justify-between">
                        <div>
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <div className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openEdit(s)} 
                                        title="Edit supplier"
                                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 active:scale-95 transition-all"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(s)} 
                                        title="Delete supplier"
                                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-snug">{s.name}</h3>
                            
                            {s.contact_person && (
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-2 font-medium">
                                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    {s.contact_person}
                                </p>
                            )}

                            {s.phone && (
                                <a 
                                    href={`tel:${s.phone}`} 
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1.5 mb-2 font-semibold"
                                >
                                    <Phone className="w-3.5 h-3.5 shrink-0" />
                                    {s.phone}
                                </a>
                            )}

                            {s.address && (
                                <p className="text-xs text-gray-400 flex items-start gap-1.5 mb-3 line-clamp-2">
                                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                    {s.address}
                                </p>
                            )}

                            {s.notes && (
                                <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mb-3 italic">
                                    "{s.notes}"
                                </p>
                            )}
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                            <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                                <ShoppingBag className="w-3.5 h-3.5" />
                                {s.purchases_count ?? 0} Miamala ya Mzigo
                            </span>
                            <span className="text-xs font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-lg">
                                Active
                            </span>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full bg-white rounded-3xl p-12 text-center text-gray-400 italic text-sm border border-gray-100">
                        Hakuna msambazaji aliyepatikana. Bonyeza "Sajili Supplier Mpya" hapo juu.
                    </div>
                )}
            </div>

            {/* Pagination Footer */}
            {filtered.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={filtered.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                        pageSizeOptions={[8, 16, 32]}
                    />
                </div>
            )}

            {/* Add / Edit Supplier Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                {editTarget ? 'Hariri Taarifa za Supplier' : 'Sajili Supplier Mpya'}
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
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Jina la Kampuni / Supplier *</label>
                                <input 
                                    value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})} 
                                    required 
                                    placeholder="mf. Kariakoo Electrical Mart" 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mtu wa Mawasiliano</label>
                                    <input 
                                        value={form.contact_person} 
                                        onChange={e => setForm({...form, contact_person: e.target.value})} 
                                        placeholder="mf. Juma Bakari" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Namba ya Simu</label>
                                    <input 
                                        value={form.phone} 
                                        onChange={e => setForm({...form, phone: e.target.value})} 
                                        placeholder="mf. 0712 345 678" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Barua Pepe (Email)</label>
                                    <input 
                                        type="email"
                                        value={form.email} 
                                        onChange={e => setForm({...form, email: e.target.value})} 
                                        placeholder="supplier@gmail.com" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mtaa / Eneo</label>
                                    <input 
                                        value={form.address} 
                                        onChange={e => setForm({...form, address: e.target.value})} 
                                        placeholder="mf. Msimbazi St, Kariakoo" 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Maelezo ya Ziada (Bidhaa anazosambaza)</label>
                                <textarea 
                                    value={form.notes} 
                                    onChange={e => setForm({...form, notes: e.target.value})} 
                                    rows={3}
                                    placeholder="mf. Anauza Waya za Metro, Taa za LED, na Control Boxes kwa bei ya jumla..." 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting} 
                                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 text-sm mt-4"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                                {editTarget ? 'Hifadhi Mabadiliko' : 'Sajili Supplier'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;

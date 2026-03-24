import React, { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Search } from 'lucide-react';
import api from '../api/axios';

const StockLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL | IN | OUT

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const params = filter !== 'ALL' ? { type: filter } : {};
                const res = await api.get('/stock-logs', { params });
                setLogs(res.data.data || res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchLogs();
    }, [filter]);

    if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>;

    return (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#1e293b] rounded-[2.5rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-2xl lg:text-4xl font-bold tracking-tight mb-2">Stock Log <span className="text-purple-400">/ Audit Trail</span></h1>
                    <p className="text-gray-400 text-sm max-w-lg">Every stock movement — IN and OUT — is permanently recorded here.</p>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-3">
                {['ALL', 'IN', 'OUT'].map(f => (
                    <button key={f} onClick={() => { setFilter(f); setLoading(true); }}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${filter === f
                            ? (f === 'IN' ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                                : f === 'OUT' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                                : 'bg-gray-900 text-white shadow-lg')
                            : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}`}>
                        {f === 'ALL' ? '🗂 All Movements' : f === 'IN' ? '🟢 Stock IN' : '🔴 Stock OUT'}
                    </button>
                ))}
                <span className="ml-auto text-xs text-gray-400 font-semibold">{logs.length} records</span>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Type</th>
                                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-5">Product</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-5">Qty</th>
                                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-5">Reference</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-8 py-5">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider
                                            ${log.type === 'IN' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                            <span className={`w-2 h-2 rounded-full ${log.type === 'IN' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-bold text-gray-900">{log.product?.name ?? '—'}</p>
                                        <p className="text-xs text-gray-400 font-mono">{log.product?.sku}</p>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className={`text-sm font-black ${log.type === 'IN' ? 'text-green-700' : 'text-red-600'}`}>
                                            {log.type === 'IN' ? '+' : '-'}{log.quantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-500 font-mono text-xs">{log.reference}</td>
                                    <td className="px-8 py-4 text-right text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-20 text-gray-400 italic text-sm">No log entries found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockLogs;

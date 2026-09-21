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

    if (loading) return (
        <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="w-9 h-9 text-purple-600 animate-spin" />
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#192231] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/15">
                <div className="relative z-10">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-2">
                        Stock Log <span className="text-purple-400">/ Audit Trail</span>
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm lg:text-base max-w-lg leading-relaxed">
                        Every stock movement — IN and OUT — is permanently recorded here for complete transparency and accountability.
                    </p>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]" />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {['ALL', 'IN', 'OUT'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => { setFilter(f); setLoading(true); }}
                            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${filter === f
                                ? (f === 'IN' ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                                    : f === 'OUT' ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                                    : 'bg-gray-900 text-white shadow-lg')
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 shadow-xs'}`}
                        >
                            {f === 'ALL' ? '🗂 All Movements' : f === 'IN' ? '🟢 Stock IN' : '🔴 Stock OUT'}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-gray-500 font-semibold px-2 py-1 bg-gray-100 rounded-lg">
                    {logs.length} records
                </span>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px]">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-6 sm:px-8 py-4">Type</th>
                                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Product</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Qty</th>
                                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-4 py-4">Reference</th>
                                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-widest px-6 sm:px-8 py-4">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-6 sm:px-8 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider
                                            ${log.type === 'IN' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                            <span className={`w-2 h-2 rounded-full ${log.type === 'IN' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="text-sm font-bold text-gray-900">{log.product?.name ?? '—'}</p>
                                        <p className="text-xs text-gray-400 font-mono">{log.product?.sku}</p>
                                    </td>
                                    <td className="px-4 py-4 text-right whitespace-nowrap">
                                        <span className={`text-sm font-black ${log.type === 'IN' ? 'text-green-700' : 'text-red-600'}`}>
                                            {log.type === 'IN' ? '+' : '-'}{log.quantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-xs text-gray-600 font-mono whitespace-nowrap">
                                        {log.reference}
                                    </td>
                                    <td className="px-6 sm:px-8 py-4 text-right text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-gray-400 italic text-sm">
                                        No log entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockLogs;

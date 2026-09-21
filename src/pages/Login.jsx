import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('svs_token');
        const user = localStorage.getItem('svs_user');
        if (token && user) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const cleanForm = {
                email: form.email.trim().toLowerCase(),
                password: form.password,
            };
            const res = await api.post('/login', cleanForm);
            const { token, user } = res.data;
            localStorage.setItem('svs_token', token);
            localStorage.setItem('svs_user', JSON.stringify(user));
            // Set token for future Axios requests
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            onLogin && onLogin(user);
            navigate('/');
        } catch (err) {
            if (err.message === 'Network Error') {
                setError('Cannot reach backend server. Check your internet connection or backend API URL.');
            } else {
                setError(err.response?.data?.message || 'Login failed. Check your email and password.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (email, password) => {
        setForm({ email, password });
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4 sm:p-6">
            {/* Ambient glow */}
            <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] top-1/4 left-1/4 pointer-events-none" />
            <div className="absolute w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] bottom-1/4 right-1/4 pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Glass Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl">
                    {/* Logo / Brand */}
                    <div className="text-center mb-8 sm:mb-10">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
                            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">S.Void Stock</h1>
                        <p className="text-gray-400 text-sm mt-1">Inventory Intelligence System</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-semibold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                type="text"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                                placeholder="admin@svs.com"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                    placeholder="••••••••"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    spellCheck={false}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 pr-12 text-white placeholder-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 mt-2 active:scale-98">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                            {loading ? 'Signing in...' : 'Sign In to SVS'}
                        </button>
                    </form>

                    {/* Quick Demo Fill Buttons */}
                    <div className="mt-6 pt-5 border-t border-white/10">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-3">
                            Quick Demo Sign-In
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => fillDemo('admin@svs.com', 'password')}
                                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all text-center"
                            >
                                👑 Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemo('cashier@svs.com', 'password')}
                                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-green-400 hover:text-green-300 transition-all text-center"
                            >
                                💼 Cashier
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-gray-600 text-xs mt-8">
                        S.Void Stock — Inventory Intelligence System v1.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

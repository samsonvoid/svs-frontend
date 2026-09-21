import React, { useState, useEffect } from 'react';
import { Settings2, User, Building2, SlidersHorizontal, Loader2, CheckCircle, AlertCircle, Save, Lock } from 'lucide-react';
import api from '../api/axios';

const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'business', label: 'Business Profile', icon: Building2 },
    { id: 'prefs', label: 'System Preferences', icon: SlidersHorizontal },
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Profile state
    const storedUser = JSON.parse(localStorage.getItem('svs_user') || '{}');
    const [profile, setProfile] = useState({ name: storedUser.name || '', email: storedUser.email || '' });
    const [passwords, setPasswords] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });

    // Business + prefs state
    const [settings, setSettings] = useState({
        business_name: '', business_address: '', business_phone: '', business_currency: 'TZS',
        low_stock_threshold: '5', tax_rate: '0',
    });

    const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                setSettings(prev => ({ ...prev, ...res.data }));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchSettings();
    }, []);

    const saveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/profile', profile);
            localStorage.setItem('svs_user', JSON.stringify(res.data.user));
            showToast('success', res.data.message);
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed.');
        } finally { setSaving(false); }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/change-password', passwords);
            showToast('success', res.data.message);
            setPasswords({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {
            const msg = err.response?.data?.errors?.current_password?.[0] || err.response?.data?.errors?.new_password?.[0] || err.response?.data?.message || 'Failed.';
            showToast('error', msg);
        } finally { setSaving(false); }
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', { settings });
            showToast('success', 'Settings saved successfully.');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed.');
        } finally { setSaving(false); }
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center p-8">
            <Loader2 className="w-9 h-9 text-indigo-600 animate-spin" />
        </div>
    );

    return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[#192231] rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/15">
                <div className="relative z-10">
                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-black tracking-tight mb-2">
                        Settings <span className="text-indigo-400">/ Mipangilio</span>
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm lg:text-base max-w-lg leading-relaxed">
                        Manage your profile, business details, currency, and system threshold preferences from one place.
                    </p>
                </div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px]" />
            </div>

            {toast && (
                <div className={`flex items-center gap-3 p-4 rounded-xl sm:rounded-2xl font-semibold text-sm shadow-md
                    ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 sm:gap-3 flex-wrap">
                {tabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 shadow-xs'}`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-sm border border-gray-100">

                {/* Tab A: User Profile */}
                {activeTab === 'profile' && (
                    <div className="space-y-8 max-w-xl">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Update Profile</h3>
                            <p className="text-xs text-gray-400 mb-6">Change your name and email address.</p>
                            <form onSubmit={saveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
                                    <input 
                                        value={profile.name} 
                                        onChange={e => setProfile({...profile, name: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email</label>
                                    <input 
                                        type="email" 
                                        value={profile.email} 
                                        onChange={e => setProfile({...profile, email: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={saving} 
                                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 text-sm shadow-md shadow-indigo-500/20"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
                                </button>
                            </form>
                        </div>

                        <hr className="border-gray-100" />

                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-gray-700" /> Change Password
                            </h3>
                            <p className="text-xs text-gray-400 mb-6">Keep your account secure by updating your password regularly.</p>
                            <form onSubmit={savePassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Current Password</label>
                                    <input 
                                        type="password" 
                                        value={passwords.current_password} 
                                        onChange={e => setPasswords({...passwords, current_password: e.target.value})} 
                                        required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">New Password</label>
                                        <input 
                                            type="password" 
                                            value={passwords.new_password} 
                                            onChange={e => setPasswords({...passwords, new_password: e.target.value})} 
                                            required 
                                            minLength={8}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Confirm</label>
                                        <input 
                                            type="password" 
                                            value={passwords.new_password_confirmation} 
                                            onChange={e => setPasswords({...passwords, new_password_confirmation: e.target.value})} 
                                            required 
                                            minLength={8}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={saving} 
                                    className="bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 text-sm shadow-md shadow-red-500/20"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Change Password
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tab B: Business Profile */}
                {activeTab === 'business' && (
                    <form onSubmit={saveSettings} className="space-y-4 max-w-xl">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Business Details</h3>
                        <p className="text-xs text-gray-400 mb-6">This information appears on invoices, receipts, and exported reports.</p>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Business Name</label>
                            <input 
                                value={settings.business_name} 
                                onChange={e => setSettings({...settings, business_name: e.target.value})} 
                                placeholder="e.g. Samson General Supplies"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Address</label>
                            <input 
                                value={settings.business_address} 
                                onChange={e => setSettings({...settings, business_address: e.target.value})} 
                                placeholder="e.g. Mabibo, Dar es Salaam"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Phone</label>
                                <input 
                                    value={settings.business_phone} 
                                    onChange={e => setSettings({...settings, business_phone: e.target.value})} 
                                    placeholder="+255 7XX XXX XXX"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Currency</label>
                                <select 
                                    value={settings.business_currency} 
                                    onChange={e => setSettings({...settings, business_currency: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                >
                                    <option value="TZS">TZS (Tanzanian Shilling)</option>
                                    <option value="USD">USD (US Dollar)</option>
                                    <option value="KES">KES (Kenyan Shilling)</option>
                                </select>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={saving} 
                            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 mt-2 text-sm shadow-md shadow-indigo-500/20"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Business Info
                        </button>
                    </form>
                )}

                {/* Tab C: System Preferences */}
                {activeTab === 'prefs' && (
                    <form onSubmit={saveSettings} className="space-y-4 max-w-xl">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">System Preferences</h3>
                        <p className="text-xs text-gray-400 mb-6">Configure threshold parameters and sales tax calculations.</p>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Low Stock Alert Threshold</label>
                            <p className="text-[11px] text-gray-400 mb-2">You'll be alerted when any product's stock drops below this number.</p>
                            <input 
                                type="number" 
                                value={settings.low_stock_threshold} 
                                onChange={e => setSettings({...settings, low_stock_threshold: e.target.value})} 
                                min="1" 
                                max="100"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tax Rate (%)</label>
                            <p className="text-[11px] text-gray-400 mb-2">Applied to sales for VAT / tax calculations. Set to 0 if no tax.</p>
                            <input 
                                type="number" 
                                value={settings.tax_rate} 
                                onChange={e => setSettings({...settings, tax_rate: e.target.value})} 
                                min="0" 
                                max="50" 
                                step="0.5"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={saving} 
                            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2 mt-2 text-sm shadow-md shadow-indigo-500/20"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Preferences
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Settings;

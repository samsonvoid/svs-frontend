import React, { useState, useEffect } from 'react';
import { 
    Settings2, 
    User, 
    Building2, 
    SlidersHorizontal, 
    Loader2, 
    CheckCircle, 
    AlertCircle, 
    Save, 
    Lock,
    Bell,
    Mail,
    MessageSquare,
    Smartphone,
    Send,
    Clock
} from 'lucide-react';
import api from '../api/axios';

const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'business', label: 'Business Profile', icon: Building2 },
    { id: 'prefs', label: 'System Preferences', icon: SlidersHorizontal },
    { id: 'notifications', label: 'Alerts & Channels', icon: Bell },
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingNotification, setTestingNotification] = useState(false);
    const [toast, setToast] = useState(null);

    // Profile state
    const storedUser = JSON.parse(localStorage.getItem('svs_user') || '{}');
    const [profile, setProfile] = useState({ name: storedUser.name || '', email: storedUser.email || '' });
    const [passwords, setPasswords] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });

    // Business + prefs + notification state
    const [settings, setSettings] = useState({
        business_name: '', 
        business_address: '', 
        business_phone: '', 
        business_currency: 'TZS',
        low_stock_threshold: '5', 
        tax_rate: '0',
        // Notification Channels
        notify_email_enabled: '1',
        notify_email_address: storedUser.email || '',
        notify_whatsapp_enabled: '1',
        notify_whatsapp_number: '255626638099',
        notify_sms_enabled: '0',
        notify_sms_number: '',
        // Triggers
        alert_on_out_of_stock: '1',
        alert_on_low_stock: '1',
        daily_summary_enabled: '1',
        daily_summary_time: '20:00',
    });

    const showToast = (type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 4000); };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                setSettings(prev => ({ ...prev, ...res.data }));
            } catch (e) { 
                console.error(e); 
            } finally { 
                setLoading(false); 
            }
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
        } finally { 
            setSaving(false); 
        }
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
        } finally { 
            setSaving(false); 
        }
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/settings', { settings });
            showToast('success', 'Settings saved successfully.');
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Failed.');
        } finally { 
            setSaving(false); 
        }
    };

    const handleTestNotification = async () => {
        setTestingNotification(true);
        try {
            const res = await api.post('/settings/test-notification');
            showToast('success', res.data.message);
        } catch (err) {
            showToast('error', err.response?.data?.message || 'Jaribio limeshindikana.');
        } finally {
            setTestingNotification(false);
        }
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
                        Manage your profile, business details, currency, alerts, and multi-channel notifications (WhatsApp, SMS, Email).
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

            {/* Settings Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-sm border border-gray-100">
                {/* Tab A: User Profile */}
                {activeTab === 'profile' && (
                    <div className="space-y-8 max-w-xl">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Personal Details</h3>
                            <p className="text-xs text-gray-400 mb-6">Update your display name and email address.</p>
                            <form onSubmit={saveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Full Name</label>
                                    <input 
                                        value={profile.name} 
                                        onChange={e => setProfile({...profile, name: e.target.value})} 
                                        required 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={profile.email} 
                                        onChange={e => setProfile({...profile, email: e.target.value})} 
                                        required 
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

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Change Password</h3>
                            <p className="text-xs text-gray-400 mb-6">Ensure your account is protected with a secure password.</p>
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
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Confirm Password</label>
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

                {/* Tab D: Alerts & Multi-Channel Notifications */}
                {activeTab === 'notifications' && (
                    <form onSubmit={saveSettings} className="space-y-8 max-w-2xl">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                                Njia za Tahadhari (Notification Channels)
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">
                                Weka namba na barua pepe zitakazopokea tahadhari za dharura pale mzigo unapoisha au ripoti za jioni.
                            </p>

                            <div className="space-y-5">
                                {/* Channel 1: WhatsApp */}
                                <div className="p-4 sm:p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">WhatsApp Notifications</h4>
                                                <p className="text-[11px] text-gray-500">Tahadhari za papo kwa hapo kwenye WhatsApp ya mmiliki</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.notify_whatsapp_enabled === '1'} 
                                                onChange={e => setSettings({...settings, notify_whatsapp_enabled: e.target.checked ? '1' : '0'})}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                    {settings.notify_whatsapp_enabled === '1' && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                                Namba ya WhatsApp (yenye 255)
                                            </label>
                                            <input 
                                                type="text"
                                                value={settings.notify_whatsapp_number || ''}
                                                onChange={e => setSettings({...settings, notify_whatsapp_number: e.target.value})}
                                                placeholder="mf. 255712345678"
                                                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Channel 2: SMS (Bongo Gateway) */}
                                <div className="p-4 sm:p-5 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                                <Smartphone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">SMS (Kawaida - Beem Gateway)</h4>
                                                <p className="text-[11px] text-gray-500">Inafika hata kama simu haina bando la internet</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.notify_sms_enabled === '1'} 
                                                onChange={e => setSettings({...settings, notify_sms_enabled: e.target.checked ? '1' : '0'})}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                    {settings.notify_sms_enabled === '1' && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                                Namba ya Simu ya Kupokea SMS
                                            </label>
                                            <input 
                                                type="text"
                                                value={settings.notify_sms_number || ''}
                                                onChange={e => setSettings({...settings, notify_sms_number: e.target.value})}
                                                placeholder="mf. 0712345678 au 255712345678"
                                                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Channel 3: Email */}
                                <div className="p-4 sm:p-5 rounded-2xl border border-purple-100 bg-purple-50/30 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-sm">Barua Pepe (Email)</h4>
                                                <p className="text-[11px] text-gray-500">Inatuma ripoti rasmi, faili za PDF, na LPO kwa suppliers</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={settings.notify_email_enabled === '1'} 
                                                onChange={e => setSettings({...settings, notify_email_enabled: e.target.checked ? '1' : '0'})}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                    {settings.notify_email_enabled === '1' && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                                Barua Pepe ya Mmiliki (Email)
                                            </label>
                                            <input 
                                                type="email"
                                                value={settings.notify_email_address || ''}
                                                onChange={e => setSettings({...settings, notify_email_address: e.target.value})}
                                                placeholder="mf. mmiliki@gmail.com"
                                                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Event Triggers */}
                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                                Matukio Yanayowasha Tahadhari (Triggers)
                            </h3>
                            <p className="text-xs text-gray-500 mb-4">
                                Chagua ni taarifa zipi unazotaka zitumwe kwenye channels ulizoamsha hapo juu:
                            </p>

                            <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={settings.alert_on_out_of_stock === '1'}
                                        onChange={e => setSettings({...settings, alert_on_out_of_stock: e.target.checked ? '1' : '0'})}
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    />
                                    <span className="text-xs font-bold text-gray-800">
                                        🚨 Mzigo Ukiisha Kabisa (0 Qty Stock-Out) — Tuma dharura mara moja
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={settings.alert_on_low_stock === '1'}
                                        onChange={e => setSettings({...settings, alert_on_low_stock: e.target.checked ? '1' : '0'})}
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    />
                                    <span className="text-xs font-bold text-gray-800">
                                        ⚠️ Bidhaa Ikifikia Kiwango cha Chini (≤ Min Stock Alert)
                                    </span>
                                </label>

                                <div className="pt-2 border-t border-gray-200/60">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox"
                                            checked={settings.daily_summary_enabled === '1'}
                                            onChange={e => setSettings({...settings, daily_summary_enabled: e.target.checked ? '1' : '0'})}
                                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <span className="text-xs font-bold text-gray-800">
                                            📊 Tuma Muhtasari wa Mauzo & Faida ya Siku (Daily Closing Report)
                                        </span>
                                    </label>
                                    {settings.daily_summary_enabled === '1' && (
                                        <div className="mt-2 pl-7 flex items-center gap-2 text-xs text-gray-600">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            <span>Muda wa kutuma:</span>
                                            <input 
                                                type="time" 
                                                value={settings.daily_summary_time || '20:00'}
                                                onChange={e => setSettings({...settings, daily_summary_time: e.target.value})}
                                                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                            <button 
                                type="submit" 
                                disabled={saving} 
                                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-500/20"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Hifadhi Mipangilio ya Alerts
                            </button>

                            <button 
                                type="button" 
                                onClick={handleTestNotification}
                                disabled={testingNotification} 
                                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 active:scale-95 disabled:opacity-50 text-gray-700 font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-gray-200"
                            >
                                {testingNotification ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Tuma Majaribio (Test Channels)
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Settings;

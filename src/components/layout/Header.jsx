import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Calendar, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Header = ({ toggleSidebar }) => {
    const location = useLocation();
    const { lang, toggleLang, t } = useLanguage();
    const user = JSON.parse(localStorage.getItem('svs_user') || '{}');

    // Dynamic page meta driven by translations
    const PAGE_META = {
        '/':           { titleKey: 'page_dashboard',  subKey: 'page_dashboard_sub' },
        '/alerts':     { titleKey: 'page_alerts',     subKey: 'page_alerts_sub' },
        '/inventory':  { titleKey: 'page_inventory',  subKey: 'page_inventory_sub' },
        '/purchases':  { titleKey: 'page_purchases',  subKey: 'page_purchases_sub' },
        '/suppliers':  { titleKey: 'page_suppliers',  subKey: 'page_suppliers_sub' },
        '/sales':      { titleKey: 'page_sales',      subKey: 'page_sales_sub' },
        '/reports':    { titleKey: 'page_reports',    subKey: 'page_reports_sub' },
        '/stock-logs': { titleKey: 'page_logs',       subKey: 'page_logs_sub' },
        '/categories': { titleKey: 'page_categories', subKey: 'page_categories_sub' },
        '/settings':   { titleKey: 'page_settings',  subKey: 'page_settings_sub' },
    };

    const meta = PAGE_META[location.pathname];
    const pageTitle    = meta ? t(meta.titleKey)  : 'S.Void Stock';
    const pageSubtitle = meta ? t(meta.subKey)    : 'Inventory Intelligence System';

    const today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const rawName = user.name || 'User';
    const displayName = rawName.replace(/\s*\([^)]*\)/g, '').trim() || rawName;

    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w[0]?.toUpperCase())
        .filter(c => /[A-Z0-9]/i.test(c))
        .slice(0, 2)
        .join('') || 'U';

    return (
        <header className="h-16 lg:h-20 bg-white border-b border-gray-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
            {/* Left: Mobile menu toggle + Dynamic page title */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <button 
                    onClick={toggleSidebar} 
                    aria-label="Toggle navigation menu"
                    className="lg:hidden p-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition-all shrink-0"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
                        {pageTitle}
                    </h2>
                    <p className="text-[11px] text-gray-500 hidden sm:block truncate font-medium">
                        {pageSubtitle}
                    </p>
                </div>
            </div>

            {/* Right: Lang toggle + Date + User Profile */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">

                {/* ── Language Toggle ── */}
                <button
                    onClick={toggleLang}
                    title={lang === 'en' ? 'Switch to Kiswahili' : 'Switch to English'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-xs font-bold text-gray-600 transition-all active:scale-95 select-none"
                >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-wider">
                        {lang === 'en' ? 'SW' : 'EN'}
                    </span>
                </button>

                {/* Date */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{today}</span>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2 sm:pl-3 sm:border-l border-gray-200">
                    <div className="hidden sm:block text-right">
                        <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[130px]">
                            {displayName}
                        </p>
                        <span className="inline-block text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5">
                            {user.role || 'Admin'}
                        </span>
                    </div>

                    <div 
                        title={`${displayName} (${user.role || 'User'})`}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-sm ring-2 ring-blue-500/20 shrink-0 select-none cursor-default"
                    >
                        {initials}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Calendar } from 'lucide-react';

const PAGE_META = {
    '/': {
        title: 'Dashboard Overview',
        subtitle: 'Muhtasari wa Biashara & Takwimu',
    },
    '/inventory': {
        title: 'Inventory / Bidhaa',
        subtitle: 'Usimamizi wa Stock & Orodha ya Bidhaa',
    },
    '/purchases': {
        title: 'Manunuzi (Stock In)',
        subtitle: 'Kupokea Mzigo Mpya Kutoka Suppliers',
    },
    '/sales': {
        title: 'Mauzo (Sales)',
        subtitle: 'Utoaji wa Bidhaa & Mauzo Mapya',
    },
    '/reports': {
        title: 'Ripoti (Business Reports)',
        subtitle: 'Uchambuzi wa Mapato, Faida & Mizania',
    },
    '/stock-logs': {
        title: 'Audit Trail (Stock Logs)',
        subtitle: 'Historia ya Mienendo Yote ya Stock (IN / OUT)',
    },
    '/categories': {
        title: 'Makundi (Categories)',
        subtitle: 'Upangaji wa Makundi ya Bidhaa',
    },
    '/settings': {
        title: 'Mipangilio (Settings)',
        subtitle: 'Taarifa za Biashara & Mfumo',
    },
};

const Header = ({ toggleSidebar }) => {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('svs_user') || '{}');
    const page = PAGE_META[location.pathname] || {
        title: 'S.Void Stock',
        subtitle: 'Inventory Intelligence System',
    };

    const today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const userName = user.name || 'User';
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563EB&color=fff&bold=true`;

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
                        {page.title}
                    </h2>
                    <p className="text-[11px] text-gray-500 hidden sm:block truncate font-medium">
                        {page.subtitle}
                    </p>
                </div>
            </div>

            {/* Right: Date & User Profile */}
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{today}</span>
                </div>

                <div className="flex items-center gap-3 pl-2 sm:pl-3 sm:border-l border-gray-200">
                    <div className="hidden sm:block text-right">
                        <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[130px]">
                            {userName}
                        </p>
                        <span className="inline-block text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            {user.role || 'User'}
                        </span>
                    </div>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-white shadow-sm ring-1 ring-gray-200 overflow-hidden shrink-0 bg-blue-600">
                        <img 
                            src={avatarUrl} 
                            alt={userName}
                            className="w-full h-full object-cover" 
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

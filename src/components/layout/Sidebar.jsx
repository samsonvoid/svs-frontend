import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Box, 
    ShoppingCart, 
    BarChart3, 
    Settings, 
    ChevronDown, 
    LogOut,
    Menu,
    X,
    PackagePlus,
    ClipboardList,
    Truck,
    Bell,
    SlidersHorizontal
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';

const Sidebar = ({ isOpen, toggleSidebar, closeSidebar }) => {
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('svs_user') || '{}');
    const isAdmin = user.role === 'Admin';

    const isInventoryPath = location.pathname === '/inventory' || location.pathname === '/categories';
    const [inventoryOpen, setInventoryOpen] = useState(isInventoryPath);
    const [alertCount, setAlertCount] = useState(0);

    useEffect(() => {
        const fetchAlertCount = async () => {
            try {
                const res = await api.get('/analytics/low-stock');
                setAlertCount(res.data?.length || 0);
            } catch (e) {
                // ignore
            }
        };
        fetchAlertCount();
        const interval = setInterval(fetchAlertCount, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isInventoryPath) {
            setInventoryOpen(true);
        }
    }, [location.pathname, isInventoryPath]);

    const isActive = (path) => location.pathname === path;

    const handleLinkClick = () => {
        if (closeSidebar) closeSidebar();
    };

    const navGroups = [
        {
            title: t('nav_overview'),
            items: [
                { name: t('nav_dashboard'), path: '/', icon: LayoutDashboard },
                { name: t('nav_alerts'), path: '/alerts', icon: Bell, badge: alertCount },
            ]
        },
        {
            title: t('nav_inventory_grp'),
            items: [
                { 
                    name: t('nav_inventory'), 
                    path: '/inventory', 
                    icon: Box,
                    hasDropdown: true,
                    isOpen: inventoryOpen,
                    toggle: () => setInventoryOpen(!inventoryOpen),
                    submenu: [
                        { name: t('nav_stock_list'), path: '/inventory' },
                        { name: t('nav_categories'), path: '/categories' },
                    ]
                },
                { name: t('nav_purchases'), path: '/purchases', icon: PackagePlus, adminOnly: true },
                { name: t('nav_adjustments'), path: '/adjustments', icon: SlidersHorizontal, adminOnly: true },
                { name: t('nav_suppliers'), path: '/suppliers', icon: Truck, adminOnly: true },
                { name: t('nav_logs'), path: '/stock-logs', icon: ClipboardList, adminOnly: true },
            ]
        },
        {
            title: t('nav_sales_grp'),
            items: [
                { name: t('nav_sales'), path: '/sales', icon: ShoppingCart },
                { name: t('nav_reports'), path: '/reports', icon: BarChart3, adminOnly: true },
            ]
        },
        {
            title: t('nav_system'),
            items: [
                { name: t('nav_settings'), path: '/settings', icon: Settings, adminOnly: true },
            ]
        }
    ].map(group => ({
        ...group,
        items: group.items
            .filter(item => !item.adminOnly || isAdmin)
            .map(item => {
                if (item.submenu) {
                    item.submenu = item.submenu.filter(sub => !sub.adminOnly || isAdmin);
                }
                return item;
            })
    })).filter(group => group.items.length > 0);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error('Logout failed:', e);
        }
        localStorage.removeItem('svs_token');
        localStorage.removeItem('svs_user');
        navigate('/login');
    };

    return (
        <>
            {/* Backdrop overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300" 
                    onClick={closeSidebar || toggleSidebar}
                    aria-hidden="true"
                />
            )}

            <aside className={`
                fixed lg:relative z-50 w-72 bg-[#0d131f] text-gray-300 h-full flex flex-col border-r border-gray-800/80
                sidebar-transition shadow-2xl lg:shadow-none shrink-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand Header */}
                <div className="p-5 sm:p-6 flex items-center justify-between border-b border-gray-800/80">
                    <Link to="/" onClick={handleLinkClick} className="flex items-center gap-3 group">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black px-3 py-1.5 rounded-xl text-lg shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                            SVS
                        </div>
                        <div>
                            <h1 className="font-black text-white text-sm tracking-tight uppercase">S.Void Stock</h1>
                            <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">Inventory Pro</p>
                        </div>
                    </Link>
                    <button 
                        onClick={closeSidebar || toggleSidebar} 
                        className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links Grouped by Business Modules */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-5">
                    {navGroups.map((group) => (
                        <div key={group.title} className="space-y-1">
                            <p className="text-[10px] uppercase text-gray-500 font-bold px-3 tracking-[0.18em] mb-1.5">
                                {group.title}
                            </p>
                            <ul className="space-y-1">
                                {group.items.map((item) => (
                                    <li key={item.name}>
                                        {item.hasDropdown ? (
                                            <>
                                                <button 
                                                    onClick={item.toggle}
                                                    className={`
                                                        w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all
                                                        ${isInventoryPath 
                                                            ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20' 
                                                            : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className="w-4 h-4 text-blue-400" />
                                                        <span>{item.name}</span>
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${item.isOpen ? 'rotate-180 text-blue-400' : 'text-gray-500'}`} />
                                                </button>
                                                {item.isOpen && (
                                                    <ul className="pl-9 mt-1.5 space-y-1 text-xs border-l-2 border-gray-800 ml-5 py-1">
                                                        {item.submenu.map((sub) => {
                                                            const isSubActive = isActive(sub.path);
                                                            return (
                                                                <li key={sub.name}>
                                                                    <Link 
                                                                        to={sub.path} 
                                                                        onClick={handleLinkClick}
                                                                        className={`py-2 px-3 rounded-lg block font-medium transition-all ${
                                                                            isSubActive 
                                                                                ? 'text-white bg-blue-600/25 font-bold' 
                                                                                : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                                                                        }`}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}
                                            </>
                                        ) : (
                                            <Link 
                                                to={item.path}
                                                onClick={handleLinkClick}
                                                className={`
                                                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all
                                                    ${isActive(item.path) 
                                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' 
                                                        : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <item.icon className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">{item.name}</span>
                                                </div>
                                                {item.badge > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-xs animate-pulse">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Quick Info Box */}
                    <div className="px-3 pt-2">
                        <div className="p-3.5 rounded-2xl bg-gray-900/70 border border-gray-800/70">
                            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-2">{t('lbl_live_system')}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="font-medium text-emerald-400">{t('lbl_db_synced')}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">Laravel 12 + React 19</p>
                        </div>
                    </div>
                </nav>

                {/* Footer User Profile */}
                <div className="p-3 bg-gray-950/80 border-t border-gray-800/80 m-3 rounded-2xl flex items-center gap-3 mt-auto">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shrink-0">
                        {user.name ? user.name.substring(0,2).toUpperCase() : 'SV'}
                    </div>
                    <div className="overflow-hidden flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user.name || 'User'}</p>
                        <p className={`text-[10px] truncate ${isAdmin ? 'text-blue-400 font-bold uppercase' : 'text-gray-400'}`}>
                            {user.role || 'Cashier'}
                        </p>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        title="Sign Out"
                        className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

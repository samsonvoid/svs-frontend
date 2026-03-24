import React, { useState } from 'react';
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
    ClipboardList
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [inventoryOpen, setInventoryOpen] = useState(false);
    
    const user = JSON.parse(localStorage.getItem('svs_user') || '{}');
    const isAdmin = user.role === 'Admin';

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Manunuzi (Stock In)', path: '/purchases', icon: PackagePlus, adminOnly: true },
        { 
            name: 'Inventory / Items', 
            path: '/inventory', 
            icon: Box,
            hasDropdown: true,
            isOpen: inventoryOpen,
            toggle: () => setInventoryOpen(!inventoryOpen),
            submenu: [
                { name: 'Stock List', path: '/inventory' },
                { name: 'Categories', path: '/categories' },
            ]
        },
        { name: 'Mauzo (Sales)', path: '/sales', icon: ShoppingCart },
        { name: 'Ripoti (Reports)', path: '/reports', icon: BarChart3, adminOnly: true },
        { name: 'Audit Trail (Logs)', path: '/stock-logs', icon: ClipboardList, adminOnly: true },
        { name: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
    ].filter(item => !item.adminOnly || isAdmin).map(item => {
        if (item.submenu) {
            item.submenu = item.submenu.filter(sub => !sub.adminOnly || isAdmin);
        }
        return item;
    });

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
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
                    onClick={toggleSidebar}
                ></div>
            )}

            <aside className={`
                fixed lg:relative z-50 w-72 bg-[#111827] h-full flex flex-col border-r border-gray-800
                sidebar-transition ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between border-b border-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white font-black px-3 py-1 rounded-xl text-lg shadow-lg shadow-blue-900/40">SVS</div>
                        <h1 className="font-bold text-white text-sm tracking-tight uppercase">S.Void Stock</h1>
                    </div>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <p className="text-[10px] uppercase text-gray-600 font-bold mb-4 px-3 tracking-[0.2em]">Main Navigation</p>
                        <ul className="space-y-1.5">
                            {navItems.map((item) => (
                                <li key={item.name}>
                                    {item.hasDropdown ? (
                                        <>
                                            <button 
                                                onClick={item.toggle}
                                                className={`
                                                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all
                                                    ${isActive(item.path) 
                                                        ? 'bg-blue-600/10 text-blue-400' 
                                                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="w-5 h-5" />
                                                    <span className="font-semibold">{item.name}</span>
                                                </div>
                                                <ChevronDown className={`w-4 h-4 transition-transform ${item.isOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {item.isOpen && (
                                                <ul className="pl-11 mt-1 space-y-1 text-[13px] border-l border-gray-800 ml-5">
                                                    {item.submenu.map((sub) => (
                                                        <li key={sub.name}>
                                                            <Link 
                                                                to={sub.path} 
                                                                className={`py-2 block transition-colors ${sub.isAction ? 'text-blue-500 font-bold' : 'text-gray-500 hover:text-blue-400'}`}
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </>
                                    ) : (
                                        <Link 
                                            to={item.path}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                                                ${isActive(item.path) 
                                                    ? 'bg-blue-600/10 text-blue-400 font-semibold shadow-sm' 
                                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}
                                            `}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase text-gray-600 font-bold mb-4 px-3 tracking-[0.2em]">Recent Activity</p>
                        <div className="space-y-4 px-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 animate-pulse"></div>
                                <div className="flex-1">
                                    <p className="text-xs text-white font-medium">#1204 - Rice 25kg</p>
                                    <p className="text-[10px] text-gray-500">TZS 65,000 | Just now</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                                <div className="flex-1">
                                    <p className="text-xs text-white font-medium">#1203 - Soda Pack</p>
                                    <p className="text-[10px] text-gray-500">TZS 15,000 | 12m ago</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="p-4 bg-gray-900/50 border-t border-gray-800 m-3 rounded-2xl flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-lg">
                        {user.name ? user.name.substring(0,2).toUpperCase() : 'SV'}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-xs font-bold text-white truncate">{user.name || 'User'}</p>
                        <p className={`text-[10px] truncate ${isAdmin ? 'text-blue-400 font-bold uppercase' : 'text-gray-500'}`}>
                            {user.role || 'Cashier'}
                        </p>
                    </div>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

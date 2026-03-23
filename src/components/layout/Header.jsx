import React from 'react';
import { Search, Menu, Calendar } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    const today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <header className="h-16 lg:h-20 bg-white border-b border-gray-200 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar} 
                    className="lg:hidden p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden md:block">
                    <h2 className="text-lg font-bold text-gray-900 leading-none">Dashboard Overview</h2>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">
                        System Status: <span className="text-green-600 underline">Optimal</span>
                    </p>
                </div>
            </div>

            <div className="flex-1 max-w-md px-8 hidden sm:block">
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <Search className="w-4 h-4" />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Search product..." 
                        className="w-full bg-gray-100 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-blue-500 outline-none border-none transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden lg:block text-right">
                    <p className="text-xs font-bold text-gray-900">{today}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">Dar es Salaam, TZ</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-gray-200 overflow-hidden cursor-pointer hover:border-blue-100 transition-all">
                    <img src="https://ui-avatars.com/api/?name=Samson+Void&background=0D8ABC&color=fff" alt="User Profile" />
                </div>
            </div>
        </header>
    );
};

export default Header;

"use client";

import React, { useState } from 'react';
import { Menu, Bell, LogOut, ChevronDown } from 'lucide-react';

export default function DashboardLayout({ 
    user,           // Object: { name, role, email, photoUrl }
    menuItems,      // Array dari dashboardMenus.js
    activePage,     // State activeTab dari parent
    setActivePage,  // Setter setActiveTab dari parent
    children        // Konten spesifik
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-gray-200 transition-all duration-300 fixed md:relative z-30 h-screen flex flex-col ${sidebarOpen ? 'w-64' : 'w-20 hidden md:flex'}`}>
                <div className="h-20 flex items-center justify-center border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-green-600">{sidebarOpen ? 'RecycleYuk' : 'RY'}</h1>
                </div>
                <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <button key={item.id} onClick={() => setActivePage(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activePage === item.id ? 'bg-green-50 text-green-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>
                                <Icon size={20} />
                                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all group">
                        <LogOut size={20} />
                        {sidebarOpen && <span className="font-bold text-sm">Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-6 h-20 flex items-center justify-between shadow-sm shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Menu size={24} /></button>
                        <h2 className="text-xl font-bold text-gray-900 capitalize hidden sm:block">{menuItems.find(m => m.id === activePage)?.label || 'Dashboard'}</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2"><Bell size={20} className="text-gray-500"/><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span></button>
                        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">{user.name?.charAt(0)}</div></div>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50"><div className="max-w-7xl mx-auto">{children}</div></main>
            </div>
        </div>
    );
}
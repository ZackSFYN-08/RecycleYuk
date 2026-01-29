'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import {
    LayoutDashboard, Truck, MapPin, CheckCircle, History, User, 
    LogOut, Menu, X, ChevronLeft, Search, Filter, 
    Navigation, Clock, Calendar, CheckCircle2, AlertCircle, Shield
} from 'lucide-react';

// Import Leaflet CSS (Wajib untuk peta)
import 'leaflet/dist/leaflet.css';

// --- INISIALISASI SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DriverDashboard() {
    const router = useRouter();

    // --- 1. STATE MANAGEMENT ---
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState('dashboard');
    
    // Data States
    const [currentUser, setCurrentUser] = useState(null);
    const [tasks, setTasks] = useState([]);      // Tugas Pending/In Progress
    const [history, setHistory] = useState([]);  // Tugas Selesai
    const [driverProfile, setDriverProfile] = useState(null); // Data khusus tabel drivers

    // Filter & UI States
    const [searchQuery, setSearchQuery] = useState('');

    // --- 2. MAPS CONFIGURATION (Dynamic Import) ---
    const MapContainer = useMemo(() => dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false }), []);
    const TileLayer = useMemo(() => dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false }), []);
    const Marker = useMemo(() => dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false }), []);
    const Popup = useMemo(() => dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false }), []);

    // --- 3. MENU CONFIGURATION ---
    const SIDEBAR_MENUS = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'tasks', label: 'Tugas Jemput', icon: Truck },
        { id: 'map', label: 'Peta Lokasi', icon: MapPin },
        { id: 'history', label: 'Riwayat', icon: History },
    ];

    // --- 4. CORE LOGIC ---
    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        fetchData();
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // A. Cek User Login
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            // B. Ambil Profil Umum
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setCurrentUser({ ...user, ...profile });

            // C. Ambil Profil Khusus Driver
            const { data: dProfile } = await supabase.from('drivers').select('*').eq('name', profile?.full_name).single();
            if (dProfile) setDriverProfile(dProfile);

            // D. Ambil Tugas (Pending / In Progress)
            const { data: pendingData } = await supabase
                .from('transactions')
                .select('*, profiles(full_name, address, alamat), waste_types(name)')
                .neq('status', 'done')
                .order('created_at', { ascending: true });
            
            setTasks(pendingData || []);

            // E. Ambil Riwayat (Done)
            const { data: historyData } = await supabase
                .from('transactions')
                .select('*, profiles(full_name, address), waste_types(name)')
                .eq('status', 'done')
                .order('updated_at', { ascending: false })
                .limit(20);
            
            setHistory(historyData || []);

        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- 5. ACTIONS ---
    const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

    const handleUpdateStatus = async (taskId, newStatus) => {
        if (!confirm(`Ubah status tugas menjadi ${newStatus}?`)) return;
        try {
            const { error } = await supabase.from('transactions').update({ 
                status: newStatus,
                driver_name: currentUser?.full_name 
            }).eq('id', taskId);
            
            if (error) throw error;
            fetchData();
        } catch (err) { alert("Gagal update: " + err.message); }
    };

    const handleDriverStatusToggle = async () => {
        if (!driverProfile) return alert("Profil driver tidak ditemukan di database.");
        const newStatus = driverProfile.status === 'On Duty' ? 'Off Duty' : 'On Duty';
        
        try {
            await supabase.from('drivers').update({ status: newStatus }).eq('id', driverProfile.id);
            setDriverProfile({ ...driverProfile, status: newStatus });
            alert(`Status Anda sekarang: ${newStatus}`);
        } catch (err) { alert("Gagal update status driver."); }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await supabase.from('profiles').update({ 
                full_name: currentUser.full_name, 
                alamat: currentUser.alamat 
            }).eq('id', currentUser.id);

            if (driverProfile) {
                await supabase.from('drivers').update({ 
                    name: currentUser.full_name,
                    vehicle: driverProfile.vehicle 
                }).eq('id', driverProfile.id);
            }
            alert("Profil berhasil disimpan!");
            fetchData();
        } catch (err) { alert(err.message); }
    };

    // --- 6. RENDERERS ---

    const renderDashboard = () => (
        <div className="space-y-6 animate-in fade-in">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Halo, {currentUser?.full_name || 'Driver'}! 👋</h2>
                    <p className="opacity-90">Siap untuk menjemput sampah dan menjaga lingkungan hari ini?</p>
                    <div className="mt-6 inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                        <span className={`w-3 h-3 rounded-full mr-2 ${driverProfile?.status === 'On Duty' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                        <span className="font-medium">Status: {driverProfile?.status || 'Unknown'}</span>
                        <button onClick={handleDriverStatusToggle} className="ml-4 text-xs bg-white text-green-700 px-2 py-1 rounded font-bold hover:bg-gray-100 transition">
                            Ubah Status
                        </button>
                    </div>
                </div>
                <Truck className="absolute right-4 bottom-4 opacity-10 w-32 h-32" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Tugas Pending</p>
                        <h3 className="text-3xl font-bold text-gray-800">{tasks.filter(t => t.status === 'Pending').length}</h3>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full text-yellow-600"><AlertCircle size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Dalam Proses</p>
                        <h3 className="text-3xl font-bold text-gray-800">{tasks.filter(t => t.status === 'In Progress').length}</h3>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Truck size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Selesai Hari Ini</p>
                        <h3 className="text-3xl font-bold text-gray-800">
                            {history.filter(h => new Date(h.updated_at).toDateString() === new Date().toDateString()).length}
                        </h3>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full text-green-600"><CheckCircle2 size={24}/></div>
                </div>
            </div>

            {/* Quick Actions (Recent Tasks) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-800">Tugas Prioritas</h3>
                    <button onClick={() => setActivePage('tasks')} className="text-green-600 text-sm font-medium hover:underline">Lihat Semua</button>
                </div>
                <div className="space-y-3">
                    {tasks.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">Tidak ada tugas aktif saat ini.</p>
                    ) : tasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-4 mb-3 md:mb-0">
                                <div className="bg-green-100 p-3 rounded-full text-green-600"><MapPin size={20}/></div>
                                <div>
                                    <h4 className="font-bold text-gray-800">{task.profiles?.full_name || 'User'}</h4>
                                    <p className="text-sm text-gray-500">{task.profiles?.address || task.profiles?.alamat || 'Alamat tidak tersedia'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold border shadow-sm">{task.waste_types?.name} • {task.weight} kg</span>
                                <button onClick={() => handleUpdateStatus(task.id, 'done')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700">Selesai</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderTasks = () => (
        <div className="space-y-6 animate-in slide-in-from-right">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="Cari lokasi atau nama user..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 ring-green-500 text-gray-700"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> Pending: {tasks.filter(t=>t.status==='Pending').length}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1"><Truck size={12}/> Proses: {tasks.filter(t=>t.status==='In Progress').length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.filter(t => (t.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                    <div key={item.id} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 transition hover:shadow-md ${item.status === 'In Progress' ? 'border-l-blue-500' : 'border-l-yellow-400'}`}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-xs font-bold text-gray-400">ID: {item.id.slice(0,8)}</span>
                                <h3 className="font-bold text-lg text-gray-800 mt-1">{item.profiles?.full_name}</h3>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {item.status}
                            </span>
                        </div>
                        
                        <div className="flex items-start gap-2 text-gray-600 text-sm mb-4">
                            <MapPin size={16} className="mt-1 flex-shrink-0 text-red-500"/>
                            <p>{item.profiles?.address || item.profiles?.alamat || 'Alamat belum diisi user'}</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm grid grid-cols-2 gap-2">
                            <div><p className="text-gray-400 text-xs">Jenis Sampah</p><p className="font-medium text-gray-800">{item.waste_types?.name}</p></div>
                            <div><p className="text-gray-400 text-xs">Berat Estimasi</p><p className="font-medium text-gray-800">{item.weight} Kg</p></div>
                        </div>

                        <div className="flex gap-2">
                            {item.status === 'Pending' && (
                                <button 
                                    onClick={() => handleUpdateStatus(item.id, 'In Progress')}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 text-sm"
                                >
                                    <Truck size={16}/> Jemput
                                </button>
                            )}
                            <button 
                                onClick={() => handleUpdateStatus(item.id, 'done')}
                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition flex justify-center items-center gap-2 text-sm"
                            >
                                <CheckCircle size={16}/> Selesai
                            </button>
                        </div>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-xl border border-dashed">
                        <CheckCircle2 size={48} className="mx-auto mb-2 text-green-200"/>
                        <p>Tidak ada tugas penjemputan saat ini.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderMap = () => (
        <div className="h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative animate-in fade-in">
            {mounted && (
                <MapContainer center={[-6.9175, 107.6191]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {tasks.map((t, idx) => (
                        <Marker key={t.id} position={[-6.9175 + (Math.random() * 0.02 - 0.01), 107.6191 + (Math.random() * 0.02 - 0.01)]}>
                            <Popup>
                                <div className="p-1">
                                    <strong className="block text-gray-800">{t.profiles?.full_name}</strong>
                                    <span className="text-xs text-gray-500">{t.profiles?.address}</span><br/>
                                    <span className="text-xs font-bold text-green-600">{t.weight} kg • {t.waste_types?.name}</span>
                                    <button onClick={() => setActivePage('tasks')} className="mt-2 w-full bg-green-600 text-white text-xs py-1 rounded">Lihat Detail</button>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-6 animate-in slide-in-from-right">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><History size={20}/> Riwayat Penjemputan</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700">
                        <thead className="bg-gray-50 text-gray-500 border-b">
                            <tr>
                                <th className="p-4">Tanggal</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Sampah</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(h => (
                                <tr key={h.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{new Date(h.updated_at).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(h.updated_at).toLocaleTimeString()}</span></td>
                                    <td className="p-4 font-medium">{h.profiles?.full_name}<br/><span className="text-xs text-gray-400 font-normal">{h.profiles?.address}</span></td>
                                    <td className="p-4">{h.waste_types?.name} ({h.weight}kg)</td>
                                    <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Selesai</span></td>
                                </tr>
                            ))}
                            {history.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-400">Belum ada riwayat tugas selesai.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl font-bold text-green-600">
                        {currentUser?.full_name?.charAt(0) || 'D'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{currentUser?.full_name}</h2>
                        <p className="text-gray-500">{currentUser?.email}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${driverProfile?.status==='On Duty' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {driverProfile?.status || 'Driver'}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                        <input className="w-full border p-3 rounded-lg text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 ring-green-500 outline-none" value={currentUser?.full_name || ''} onChange={e=>setCurrentUser({...currentUser, full_name:e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Kendaraan (Plat No)</label>
                        <input className="w-full border p-3 rounded-lg text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 ring-green-500 outline-none" value={driverProfile?.vehicle || ''} onChange={e=>setDriverProfile({...driverProfile, vehicle:e.target.value})} placeholder="Contoh: D 1234 ABC" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Domisili</label>
                        <textarea className="w-full border p-3 rounded-lg text-gray-800 bg-gray-50 focus:bg-white focus:ring-2 ring-green-500 outline-none h-24 resize-none" value={currentUser?.alamat || ''} onChange={e=>setCurrentUser({...currentUser, alamat:e.target.value})} />
                    </div>
                    
                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition mt-4">
                        Simpan Perubahan
                    </button>
                </form>
            </div>
        </div>
    );

    // --- 7. MAIN CONTENT SWITCH ---
    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return renderDashboard();
            case 'tasks': return renderTasks();
            case 'map': return renderMap();
            case 'history': return renderHistory();
            case 'profile': return renderProfile();
            default: return <div>Halaman tidak ditemukan</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-gray-800">
            {/* SIDEBAR */}
            <aside className={`fixed z-30 h-full bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                    {/* Logo */}
                    {isSidebarOpen ? (
                        <img src="/logo.png" alt="RecycleYuk" className="h-8 w-auto object-contain" />
                    ) : (
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
                    )}
                    
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                        {isSidebarOpen ? <ChevronLeft size={20}/> : <Menu size={20}/>}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {SIDEBAR_MENUS.map(menu => (
                        <button 
                            key={menu.id} 
                            onClick={() => setActivePage(menu.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activePage === menu.id ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'}`}
                        >
                            <menu.icon size={22} className={activePage === menu.id ? 'text-green-600' : 'text-gray-400'}/>
                            {isSidebarOpen && <span>{menu.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-bold">
                        <LogOut size={22}/> {isSidebarOpen && "Keluar"}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                <div className="max-w-6xl mx-auto">
                    {/* TOP HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 capitalize">{activePage === 'dashboard' ? 'Overview' : activePage}</h2>
                            <p className="text-gray-500 text-sm">Panel Kontrol Driver</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm text-sm font-medium text-gray-600">
                                <Clock size={16} className="text-green-600"/> {mounted ? currentTime : '...'}
                            </div>
                            
                            {/* TOMBOL PROFIL KANAN ATAS */}
                            <button 
                                onClick={() => setActivePage('profile')} 
                                className="flex items-center gap-3 bg-white p-1.5 px-3 rounded-xl border shadow-sm hover:bg-gray-50 transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                    {currentUser?.full_name?.charAt(0) || 'D'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-xs font-bold text-gray-800 line-clamp-1">{currentUser?.full_name || 'Driver'}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">{driverProfile?.status || 'Driver'}</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* DYNAMIC CONTENT */}
                    {loading && !mounted ? (
                        <div className="h-96 flex flex-col items-center justify-center text-gray-400">
                            <Truck size={48} className="animate-bounce mb-4 text-green-200"/>
                            <p>Memuat data driver...</p>
                        </div>
                    ) : renderContent()}
                </div>
            </main>
        </div>
    );
}
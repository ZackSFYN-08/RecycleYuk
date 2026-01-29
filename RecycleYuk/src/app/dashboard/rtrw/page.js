'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import {
    LayoutDashboard, Users, Trash2, TrendingUp, Calendar, MapPin,
    Search, Download, MessageSquare, AlertCircle,
    CheckCircle, X, Truck, Eye, FileText, Send, Star, Map, Filter,
    User, LogOut, Clock, ChevronLeft, Menu, BarChart3, Wallet
} from 'lucide-react';

// --- INISIALISASI SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function KepalaDashboard() {
    const router = useRouter();

    // --- STATE MANAGEMENT ---
    const [activePage, setActivePage] = useState('dashboard');
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Data States
    const [currentUser, setCurrentUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [usersCount, setUsersCount] = useState(0);

    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [responseMessage, setResponseMessage] = useState('');

    // Filter Laporan
    const [reportFilterType, setReportFilterType] = useState('monthly');
    const [reportFilter, setReportFilter] = useState({
        date: new Date().toISOString().split('T')[0],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        startDate: '',
        endDate: '',
        region: 'All'
    });

    // --- MENU CONFIGURATION ---
    const SIDEBAR_MENUS = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'monitoring', label: 'Monitoring Global', icon: MapPin },
        { id: 'laporan', label: 'Laporan & Analitik', icon: FileText },
        { id: 'pengaduan', label: 'Pusat Pengaduan', icon: MessageSquare },
        { id: 'profile', label: 'Profil RT/RW', icon: User },
    ];

    // --- CORE LOGIC ---
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
            // A. Cek User
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }

            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setCurrentUser({ ...user, ...profile });

            // B. Ambil Semua Transaksi (Global)
            const { data: trx } = await supabase
                .from('transactions')
                .select('*, profiles(full_name, address, alamat), waste_types(name)')
                .order('created_at', { ascending: false });
            setTransactions(trx || []);

            // C. Ambil Pengaduan
            const { data: comp } = await supabase
                .from('complaints')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false });
            setComplaints(comp || []);

            // D. Hitung Total User
            const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');
            setUsersCount(count || 0);

        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- STATISTIK ---
    const stats = useMemo(() => {
        const totalWeight = transactions.reduce((acc, curr) => acc + (curr.weight || 0), 0);
        const totalIncome = transactions.reduce((acc, curr) => acc + (curr.total_price || 0), 0);
        const pendingPickup = transactions.filter(t => t.status !== 'done').length;
        const pendingComplaint = complaints.filter(c => c.status === 'Pending').length;

        return { totalWeight, totalIncome, pendingPickup, pendingComplaint };
    }, [transactions, complaints]);

    // --- HELPERS ---
    const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'done' || s === 'selesai' || s === 'resolved') return 'bg-green-100 text-green-800 border-green-200';
        if (s === 'in progress' || s === 'proses') return 'bg-blue-100 text-blue-800 border-blue-200';
        if (s === 'pending' || s === 'menunggu') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

    const handleSendResponse = async () => {
        if (!responseMessage.trim()) return alert("Respon tidak boleh kosong");
        try {
            await supabase.from('complaints').update({ 
                response: responseMessage, 
                status: 'Resolved' 
            }).eq('id', selectedComplaint.id);
            
            alert("Tanggapan berhasil dikirim!");
            setResponseMessage('');
            setSelectedComplaint(null);
            fetchData();
        } catch (err) { alert(err.message); }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await supabase.from('profiles').update({ 
                full_name: currentUser.full_name, 
                alamat: currentUser.alamat 
            }).eq('id', currentUser.id);
            alert("Profil RT/RW berhasil diperbarui!");
        } catch (err) { alert(err.message); }
    };

    const handleExportExcel = (data) => {
        if (!data.length) return alert("Data kosong!");
        alert("Mengunduh Laporan Excel... (Simulasi)");
    };

    // --- RENDERERS ---

    const renderDashboard = () => (
        <div className="space-y-6 animate-in fade-in">
            {/* Kartu Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Sampah', val: `${stats.totalWeight.toFixed(1)} Kg`, icon: Trash2, col: 'emerald' },
                    { label: 'Pendapatan', val: `Rp ${stats.totalIncome.toLocaleString()}`, icon: Wallet, col: 'blue' },
                    { label: 'Warga Terdaftar', val: usersCount, icon: Users, col: 'purple' },
                    { label: 'Aduan Masuk', val: stats.pendingComplaint, icon: MessageSquare, col: 'orange' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{s.label}</p>
                            <h3 className={`text-2xl font-bold mt-1 text-${s.col}-700`}>{s.val}</h3>
                        </div>
                        <div className={`bg-${s.col}-50 p-3 rounded-full text-${s.col}-600`}>
                            <s.icon size={24}/>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grafik & Table Wrapper */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2"><BarChart3 size={20}/> Grafik Sampah Bulanan</h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[100, 150, 120, 170, 140, 190, 210, 180, 220, 250, 230, 200].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                                <div className="w-full bg-emerald-500 rounded-t-sm hover:bg-emerald-600 transition-all relative" style={{ height: `${(h/300)*100}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                        {h} Kg
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-500 mt-2">{i+1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2"><AlertCircle size={20}/> Perlu Perhatian</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                            <p className="text-orange-800 font-bold text-sm">Pickup Pending</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingPickup}</p>
                            <p className="text-xs text-orange-500 mt-1">Transaksi belum diselesaikan driver</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-red-800 font-bold text-sm">Komplain Baru</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{stats.pendingComplaint}</p>
                            <p className="text-xs text-red-500 mt-1">Menunggu tanggapan RT/RW</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMonitoring = () => {
        const filtered = transactions.filter(t => 
            (filterCategory === 'All' || t.status === filterCategory) &&
            (searchQuery === '' || (t.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return (
            <div className="space-y-6 animate-in slide-in-from-right">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Monitoring Transaksi Global</h3>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                                <input className="pl-10 pr-4 py-2 border rounded-lg text-sm bg-gray-50 outline-none text-gray-800" placeholder="Cari nama warga..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                            </div>
                            <select className="border rounded-lg px-3 py-2 text-sm bg-gray-50 outline-none text-gray-800" value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
                                <option value="All">Semua Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">Proses</option>
                                <option value="done">Selesai</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr><th className="p-4 text-gray-600">ID</th><th className="p-4 text-gray-600">Warga</th><th className="p-4 text-gray-600">Lokasi</th><th className="p-4 text-gray-600">Berat</th><th className="p-4 text-gray-600">Status</th><th className="p-4 text-gray-600">Aksi</th></tr>
                            </thead>
                            <tbody>
                                {filtered.map(t => (
                                    <tr key={t.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-500 font-mono text-xs">{t.id.slice(0,8)}</td>
                                        <td className="p-4 font-bold text-gray-800">{t.profiles?.full_name}</td>
                                        <td className="p-4 text-gray-600">{t.profiles?.alamat || t.profiles?.address || '-'}</td>
                                        <td className="p-4 text-gray-800">{t.weight} Kg</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(t.status)}`}>{t.status}</span></td>
                                        <td className="p-4"><button onClick={() => setSelectedTransaction(t)} className="text-blue-600 bg-blue-50 p-2 rounded hover:bg-blue-100"><Eye size={16}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderLaporan = () => {
        // Filter Laporan Logic (Sama dengan RT/RW tapi scope global)
        const filteredReports = transactions.filter(item => {
            const date = new Date(item.created_at);
            const dateStr = date.toISOString().split('T')[0];
            
            if (reportFilterType === 'daily') return dateStr === reportFilter.date;
            if (reportFilterType === 'monthly') return (date.getMonth() + 1) === parseInt(reportFilter.month) && date.getFullYear() === parseInt(reportFilter.year);
            if (reportFilterType === 'yearly') return date.getFullYear() === parseInt(reportFilter.year);
            if (reportFilterType === 'custom') return (!reportFilter.startDate || !reportFilter.endDate) ? true : (dateStr >= reportFilter.startDate && dateStr <= reportFilter.endDate);
            return true;
        });

        return (
            <div className="space-y-6 animate-in slide-in-from-right">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="font-bold text-lg text-gray-800">Laporan & Analitik</h3>
                        <div className="flex gap-2">
                            <button onClick={()=>handleExportExcel(filteredReports)} className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 text-gray-700 font-medium"><FileText size={16}/> Excel</button>
                            <button onClick={()=>window.print()} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 font-bold"><Download size={16}/> PDF</button>
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Tipe Laporan</label>
                            <select className="w-full border rounded p-2 text-sm bg-gray-50 text-gray-800" value={reportFilterType} onChange={(e)=>setReportFilterType(e.target.value)}>
                                <option value="daily">Harian</option><option value="monthly">Bulanan</option><option value="yearly">Tahunan</option><option value="custom">Range Tanggal</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-600 mb-1">Periode Waktu</label>
                            <div className="flex gap-2">
                                {reportFilterType === 'daily' && <input type="date" className="w-full border rounded p-2 text-sm bg-gray-50 text-gray-800" value={reportFilter.date} onChange={(e)=>setReportFilter({...reportFilter, date:e.target.value})}/>}
                                {reportFilterType === 'monthly' && <div className="flex gap-2 w-full"><select className="w-1/2 border rounded p-2 text-sm bg-gray-50 text-gray-800" value={reportFilter.month} onChange={(e)=>setReportFilter({...reportFilter, month:e.target.value})}>{[...Array(12)].map((_,i)=><option key={i+1} value={i+1}>{new Date(0,i).toLocaleString('id-ID',{month:'long'})}</option>)}</select><input type="number" className="w-1/2 border rounded p-2 text-sm bg-gray-50 text-gray-800" value={reportFilter.year} onChange={(e)=>setReportFilter({...reportFilter, year:e.target.value})}/></div>}
                                {reportFilterType === 'yearly' && <input type="number" className="w-full border rounded p-2 text-sm bg-gray-50 text-gray-800" value={reportFilter.year} onChange={(e)=>setReportFilter({...reportFilter, year:e.target.value})}/>}
                                {reportFilterType === 'custom' && <div className="flex gap-2 w-full"><input type="date" className="w-1/2 border rounded p-2 text-sm bg-gray-50 text-gray-800" value={reportFilter.startDate} onChange={(e)=>setReportFilter({...reportFilter, startDate:e.target.value})}/><input type="date" className="w-1/2 border rounded p-2 text-sm bg-gray-50 text-gray-800" value={reportFilter.endDate} onChange={(e)=>setReportFilter({...reportFilter, endDate:e.target.value})}/></div>}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr><th className="p-4 text-gray-600">Tanggal</th><th className="p-4 text-gray-600">Warga</th><th className="p-4 text-gray-600">Jenis</th><th className="p-4 text-gray-600">Berat</th><th className="p-4 text-gray-600">Nilai</th><th className="p-4 text-gray-600">Status</th></tr>
                            </thead>
                            <tbody>
                                {filteredReports.length > 0 ? filteredReports.map((r,i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50">
                                        <td className="p-4 text-gray-800">{new Date(r.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-800 font-medium">{r.profiles?.full_name}</td>
                                        <td className="p-4 text-gray-600">{r.waste_types?.name}</td>
                                        <td className="p-4 text-gray-800 font-bold">{r.weight} kg</td>
                                        <td className="p-4 text-gray-800">Rp {r.total_price?.toLocaleString()}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(r.status)}`}>{r.status}</span></td>
                                    </tr>
                                )) : <tr><td colSpan="6" className="p-8 text-center text-gray-400">Data tidak ditemukan.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderPengaduan = () => (
        <div className="space-y-6 animate-in slide-in-from-right">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Pusat Pengaduan Masyarakat</h3>
                <div className="space-y-4">
                    {complaints.length === 0 ? <p className="text-center text-gray-400 py-8">Belum ada pengaduan masuk.</p> : complaints.map(c => (
                        <div key={c.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition bg-white">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-800 text-lg">{c.subject}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${c.status==='Resolved'?'bg-green-100 text-green-700 border-green-200':'bg-red-100 text-red-700 border-red-200'}`}>{c.status}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Oleh: <span className="font-bold">{c.profiles?.full_name || 'Anonim'}</span> • {new Date(c.created_at).toLocaleDateString()}</p>
                                </div>
                                {c.status === 'Pending' && <button onClick={() => setSelectedComplaint(c)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700"><Send size={14}/> Tanggapi</button>}
                            </div>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm italic">"{c.content}"</p>
                            {c.response && (
                                <div className="mt-3 pl-4 border-l-4 border-emerald-500">
                                    <p className="text-xs text-emerald-600 font-bold mb-1">Tanggapan RT/RW:</p>
                                    <p className="text-sm text-gray-800">{c.response}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderProfile = () => (
        <div className="max-w-2xl mx-auto animate-in slide-in-from-right">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-4xl font-bold text-emerald-600">
                        {currentUser?.full_name?.charAt(0) || 'K'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{currentUser?.full_name}</h2>
                        <p className="text-gray-500">{currentUser?.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Kepala RT/RW</span>
                    </div>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
                        <input className="w-full border p-3 rounded-lg text-gray-800 bg-gray-50 focus:ring-2 ring-emerald-500 outline-none" value={currentUser?.full_name || ''} onChange={e=>setCurrentUser({...currentUser, full_name:e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Kantor</label>
                        <textarea className="w-full border p-3 rounded-lg text-gray-800 bg-gray-50 focus:ring-2 ring-emerald-500 outline-none h-24 resize-none" value={currentUser?.alamat || ''} onChange={e=>setCurrentUser({...currentUser, alamat:e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition mt-4">Simpan Perubahan</button>
                </form>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return renderDashboard();
            case 'monitoring': return renderMonitoring();
            case 'laporan': return renderLaporan();
            case 'pengaduan': return renderPengaduan();
            case 'profile': return renderProfile();
            default: return <div>Halaman tidak ditemukan</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-gray-800">
            {/* SIDEBAR */}
            <aside className={`fixed z-30 h-full bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex flex-col`}>
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                    {isSidebarOpen ? <img src="/logo.png" alt="RecycleYuk" className="h-8 w-auto object-contain" /> : <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">{isSidebarOpen ? <ChevronLeft size={20}/> : <Menu size={20}/>}</button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {SIDEBAR_MENUS.map(menu => (
                        <button key={menu.id} onClick={() => setActivePage(menu.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activePage === menu.id ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'}`}>
                            <menu.icon size={22} className={activePage === menu.id ? 'text-emerald-600' : 'text-gray-400'}/>
                            {isSidebarOpen && <span>{menu.label}</span>}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-bold"><LogOut size={22}/> {isSidebarOpen && "Keluar"}</button>
                </div>
            </aside>

            {/* CONTENT AREA */}
            <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                        <div><h2 className="text-2xl font-bold text-gray-800 capitalize">{activePage}</h2><p className="text-gray-500 text-sm">Panel Kepala RT/RW</p></div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm text-sm font-medium text-gray-600"><Clock size={16} className="text-emerald-600"/> {mounted ? currentTime : '...'}</div>
                            <button onClick={()=>setActivePage('profile')} className="flex items-center gap-3 bg-white p-1.5 px-3 rounded-xl border shadow-sm hover:bg-gray-50 transition"><div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">{currentUser?.full_name?.charAt(0) || 'K'}</div><div className="hidden md:block text-left"><p className="text-xs font-bold text-gray-800 line-clamp-1">{currentUser?.full_name || 'Kepala RT/RW'}</p><p className="text-[10px] text-gray-500">Administrator Utama</p></div></button>
                        </div>
                    </div>

                    {loading && !mounted ? <div className="h-96 flex flex-col items-center justify-center text-gray-400"><div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div><p>Memuat Sistem...</p></div> : renderContent()}
                </div>
            </main>

            {/* MODAL RESPONSE COMPLAINT */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between mb-4 border-b pb-4"><h3 className="font-bold text-lg text-gray-800">Tanggapi Pengaduan</h3><button onClick={() => setSelectedComplaint(null)}><X size={20} className="text-gray-400"/></button></div>
                        <div className="bg-gray-50 p-3 rounded mb-4 text-sm border border-gray-200"><p className="font-bold text-gray-700 mb-1">Pesan Masuk:</p><p className="italic text-gray-600">"{selectedComplaint.content}"</p></div>
                        <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm h-32 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 bg-white" placeholder="Tulis instruksi atau tanggapan resmi RT/RW..." value={responseMessage} onChange={e=>setResponseMessage(e.target.value)}></textarea>
                        <div className="mt-4 flex justify-end gap-2"><button onClick={() => setSelectedComplaint(null)} className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-50">Batal</button><button onClick={handleSendResponse} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-2 font-bold"><Send size={14}/> Kirim Tanggapan</button></div>
                    </div>
                </div>
            )}

            {/* MODAL DETAIL TRANSACTION */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between mb-4 border-b pb-4"><h3 className="font-bold text-lg text-gray-800">Detail Transaksi</h3><button onClick={() => setSelectedTransaction(null)}><X size={20} className="text-gray-400 hover:text-red-500" /></button></div>
                        <div className="space-y-3 text-sm text-gray-700">
                            <div className="grid grid-cols-3"><span className="font-medium text-gray-500">ID</span><span className="col-span-2 font-mono text-xs bg-gray-100 p-1 rounded w-fit">{selectedTransaction.id}</span></div>
                            <div className="grid grid-cols-3"><span className="font-medium text-gray-500">Warga</span><span className="col-span-2 font-bold">{selectedTransaction.profiles?.full_name}</span></div>
                            <div className="grid grid-cols-3"><span className="font-medium text-gray-500">Alamat</span><span className="col-span-2">{selectedTransaction.profiles?.address || selectedTransaction.profiles?.alamat}</span></div>
                            <div className="grid grid-cols-3"><span className="font-medium text-gray-500">Berat</span><span className="col-span-2 font-bold">{selectedTransaction.weight} kg</span></div>
                            <div className="grid grid-cols-3"><span className="font-medium text-gray-500">Total Biaya</span><span className="col-span-2 text-emerald-600 font-bold">Rp {selectedTransaction.total_price?.toLocaleString()}</span></div>
                            <div className="grid grid-cols-3"><span className="font-medium text-gray-500">Status</span><div className="col-span-2"><span className={`px-2 py-0.5 rounded text-xs border font-bold ${getStatusColor(selectedTransaction.status)}`}>{selectedTransaction.status}</span></div></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
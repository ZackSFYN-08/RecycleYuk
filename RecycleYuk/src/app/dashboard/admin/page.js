'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
    LayoutDashboard, Users, Truck, MapPin, FileText, Wallet, Settings, 
    Bell, Search, Plus, Edit, Trash2, CheckCircle, X, ChevronLeft, ChevronRight,
    Clock, User, LogOut, Shield, Mail, Menu, Filter, Download, Save,
    AlertCircle, CheckCheck, Loader2, PlayCircle, BookOpen, ArrowRight, Lock
} from 'lucide-react';

// --- INISIALISASI SUPABASE ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
    const router = useRouter();

    // --- 1. STATE MANAGEMENT ---
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState('dashboard');

    // Data States
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [transactions, setTransactions] = useState([]); 
    const [pickups, setPickups] = useState([]); 
    const [notifications, setNotifications] = useState([]);
    
    // Filter & UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [financeStats, setFinanceStats] = useState({ income: 0, expense: 0 });
    const [reportFilter, setReportFilter] = useState({ date: '', status: 'All' });

    // Settings State
    const [settings, setSettings] = useState({
        tariff: 15000,
        opStart: '08:00',
        opEnd: '17:00',
        emailNotif: true
    });

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); 
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    // --- 2. MENU CONFIGURATION ---
    const SIDEBAR_MENUS = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Manajemen User', icon: Users },
        { id: 'drivers', label: 'Manajemen Driver', icon: Truck },
        { id: 'pickups', label: 'Pengangkutan', icon: Trash2 },
        { id: 'areas', label: 'Wilayah', icon: MapPin },
        { id: 'reports', label: 'Laporan', icon: FileText },
        { id: 'finance', label: 'Keuangan', icon: Wallet },
        { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
        // Profil tidak masuk sidebar, tapi diakses lewat header atas
    ];

    // --- 3. CORE LOGIC & EFFECTS ---
    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        }, 1000);
        fetchAllData(); 
        return () => clearInterval(timer);
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // A. User Profile (Admin)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login'); return; }
            
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setCurrentUser({ ...user, ...profile, newPassword: '' });

            // B. App Settings
            const { data: settingData } = await supabase.from('app_settings').select('*').single();
            if (settingData) {
                setSettings({
                    tariff: settingData.tariff_per_kg,
                    opStart: settingData.operational_start,
                    opEnd: settingData.operational_end,
                    emailNotif: settingData.email_notification
                });
            }

            // C. Notifications
            const { data: notifData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
            if (notifData) setNotifications(notifData);

            // D. Data Master
            const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (userData) setUsers(userData);

            const { data: driverData } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
            if (driverData) setDrivers(driverData);

            const { data: areaData } = await supabase.from('areas').select('*, drivers(name)').order('created_at', { ascending: false });
            if (areaData) setAreas(areaData);

            const { data: trxData } = await supabase.from('transactions')
                .select('*, profiles(full_name, address), waste_types(name)')
                .order('created_at', { ascending: false });

            if (trxData) {
                setTransactions(trxData);
                const mappedPickups = trxData.map(item => ({
                    id: item.id,
                    date: new Date(item.created_at).toLocaleDateString('id-ID'),
                    user: item.profiles?.full_name || 'Tanpa Nama',
                    area: item.profiles?.address || 'Belum ada alamat',
                    type: item.waste_types?.name || 'Umum',
                    weight: item.weight,
                    weightLabel: `${item.weight} kg`,
                    status: item.status,
                    driver: item.driver_name || '-', 
                    price: item.total_price
                }));
                setPickups(mappedPickups);

                // Hitung Keuangan
                const totalIncome = trxData.reduce((acc, curr) => acc + (curr.total_price || 0), 0);
                setFinanceStats({ income: totalIncome, expense: totalIncome * 0.3 });
            }

        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- 4. HANDLERS (CRUD & ACTIONS) ---

    const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            let error;
            if (modalType === 'driver') {
                const payload = { name: formData.name, vehicle: formData.vehicle, shift: formData.shift, status: formData.status };
                const query = editingItem ? supabase.from('drivers').update(payload).eq('id', editingItem.id) : supabase.from('drivers').insert([payload]);
                ({ error } = await query);
            } 
            else if (modalType === 'area') {
                const payload = { kelurahan: formData.kelurahan, rw: formData.rw, rt: formData.rt, driver_id: formData.driverId || null };
                const query = editingItem ? supabase.from('areas').update(payload).eq('id', editingItem.id) : supabase.from('areas').insert([payload]);
                ({ error } = await query);
            } 
            else if (modalType === 'user') {
                ({ error } = await supabase.from('profiles').update({ full_name: formData.name, role: formData.role, alamat: formData.region }).eq('id', editingItem.id));
            } 
            else if (modalType === 'pickup') {
                ({ error } = await supabase.from('transactions').update({ status: formData.status, driver_name: formData.driver }).eq('id', editingItem.id));
            }

            if (error) throw error;
            alert("Data berhasil disimpan!");
            setIsModalOpen(false);
            fetchAllData();
        } catch (err) { alert("Gagal: " + err.message); }
    };

    const handleDelete = async (id, type) => {
        if (!confirm('Hapus data ini?')) return;
        try {
            const table = type === 'driver' ? 'drivers' : type === 'area' ? 'areas' : type === 'notif' ? 'notifications' : '';
            if (table) await supabase.from(table).delete().eq('id', id);
            
            if (type === 'notif') setNotifications(prev => prev.filter(n => n.id !== id));
            else fetchAllData();
        } catch (err) { alert(err.message); }
    };

    const handleSaveSettings = async () => {
        try {
            await supabase.from('app_settings').update({
                tariff_per_kg: settings.tariff,
                operational_start: settings.opStart,
                operational_end: settings.opEnd,
                email_notification: settings.emailNotif
            }).eq('id', 1);
            await supabase.from('notifications').insert([{ title: 'Pengaturan Diubah', message: `Tarif baru: Rp ${settings.tariff}`, type: 'info' }]);
            alert("Pengaturan sistem berhasil disimpan!");
            fetchAllData();
        } catch (err) { alert(err.message); }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await supabase.from('profiles').update({ full_name: currentUser.full_name, alamat: currentUser.alamat }).eq('id', currentUser.id);
            if (currentUser.newPassword?.length >= 6) {
                await supabase.auth.updateUser({ password: currentUser.newPassword });
            }
            alert("Profil Admin berhasil diperbarui!");
        } catch (err) { alert(err.message); }
    };

    const handleMarkRead = async (id) => {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    // Helper Functions
    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    const openModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item);
        setIsModalOpen(true);
        if (item) {
             if (type === 'area') setFormData({ ...item, driverId: item.driver_id });
             else if (type === 'user') setFormData({ name: item.full_name, role: item.role, region: item.alamat, ...item });
             else setFormData({ ...item });
        } else {
             if (type === 'driver') setFormData({ status: 'Off Duty', shift: 'Shift 1 (08:00 - 12:00)' });
             else setFormData({});
        }
    };

    // --- 5. RENDERERS (UI COMPONENTS) ---

    const renderDashboard = () => (
        <div className="space-y-6 animate-in fade-in text-gray-800">
             <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">Dashboard Admin 👋</h2>
                <p>Ringkasan aktivitas sistem RecycleYuk hari ini.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { l: 'Total User', v: users.length, i: Users, c: 'blue' },
                    { l: 'Pickup Aktif', v: pickups.filter(p=>p.status!=='Done').length, i: Truck, c: 'green' },
                    { l: 'Laporan Baru', v: notifications.filter(n=>!n.is_read).length, i: Bell, c: 'red' },
                    { l: 'Pendapatan', v: formatRupiah(financeStats.income), i: Wallet, c: 'purple' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:shadow-md transition">
                        <div><p className="text-gray-500 text-sm font-medium">{s.l}</p><h3 className="text-2xl font-bold text-gray-800">{s.v}</h3></div>
                        <div className={`bg-${s.c}-50 p-3 rounded-lg text-${s.c}-600`}><s.i size={28}/></div>
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><FileText size={20}/> Aktivitas Terbaru</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500"><tr><th className="p-3">User</th><th className="p-3">Berat</th><th className="p-3">Status</th></tr></thead>
                            <tbody>
                                {pickups.slice(0, 5).map(p => (
                                    <tr key={p.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium text-gray-800">{p.user}</td>
                                        <td className="p-3 text-gray-600">{p.weightLabel}</td>
                                        <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><MapPin size={20}/> Status Driver</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {drivers.map(d => (
                            <div key={d.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">{d.name.charAt(0)}</div>
                                    <div><span className="font-bold text-gray-800">{d.name}</span><br/><span className="text-xs text-gray-500">{d.vehicle}</span></div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${d.status==='On Duty'?'bg-green-100 text-green-700':'bg-gray-200 text-gray-600'}`}>{d.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6 animate-in slide-in-from-right">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-full max-w-md">
                    <Search className="text-gray-400" size={18}/><input type="text" placeholder="Cari user..." className="w-full outline-none text-sm bg-transparent text-gray-800" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}/>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-800">
                    <thead className="bg-gray-50 text-gray-600 border-b"><tr><th className="p-4">Nama User</th><th className="p-4">Role</th><th className="p-4">Alamat</th><th className="p-4 text-right">Aksi</th></tr></thead>
                    <tbody>
                        {users.filter(u => (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                <td className="p-4"><div className="font-bold">{u.full_name || 'Tanpa Nama'}</div><div className="text-xs text-gray-500">{u.email}</div></td>
                                <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded uppercase text-xs font-bold text-gray-700">{u.role}</span></td>
                                <td className="p-4 text-gray-600">{u.alamat || '-'}</td>
                                <td className="p-4 text-right">
                                    <button onClick={()=>openModal('user', u)} className="text-blue-600 hover:bg-blue-50 p-2 rounded transition"><Edit size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDrivers = () => (
        <div className="space-y-6 animate-in slide-in-from-right">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800">List Driver</h3>
                <button onClick={()=>openModal('driver')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 hover:bg-green-700"><Plus size={18}/> Tambah Driver</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map(d => (
                    <div key={d.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative group hover:shadow-md transition">
                         <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={()=>openModal('driver', d)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16}/></button>
                            <button onClick={()=>handleDelete(d.id, 'driver')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-500">{d.name.charAt(0)}</div>
                            <div><h4 className="font-bold text-lg text-gray-800">{d.name}</h4><p className="text-sm text-gray-500">{d.vehicle}</p></div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium">{d.shift}</span>
                            <span className={`px-3 py-1 rounded-full font-bold ${d.status==='On Duty'?'bg-green-100 text-green-700':'bg-red-50 text-red-600'}`}>{d.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAreas = () => (
        <div className="space-y-6 animate-in slide-in-from-right">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800">Data Wilayah</h3>
                <button onClick={()=>openModal('area')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2 hover:bg-green-700"><Plus size={18}/> Tambah Wilayah</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas.map(a => (
                    <div key={a.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative group hover:shadow-md transition">
                        <div className="absolute top-4 right-4 flex gap-1">
                            <button onClick={()=>openModal('area', a)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                            <button onClick={()=>handleDelete(a.id, 'area')} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                        </div>
                        <h4 className="font-bold text-xl mb-1 text-gray-800">{a.kelurahan}</h4>
                        <div className="flex gap-2 text-sm text-gray-600 mb-4">
                            <span className="bg-gray-100 px-2 py-1 rounded">RW: {a.rw}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded">RT: {a.rt}</span>
                        </div>
                        <div className="pt-4 border-t border-gray-100 text-sm">
                            <p className="text-gray-400 text-xs uppercase font-bold mb-1">Penanggung Jawab</p>
                            <p className="font-bold text-gray-800 flex items-center gap-2"><Truck size={16} className="text-green-600"/> {a.drivers?.name || <span className="text-red-500 italic">Belum assign</span>}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPickups = () => (
        <div className="space-y-6 animate-in slide-in-from-right">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-lg text-gray-800">Manajemen Pengangkutan</h3>
                <div className="flex gap-2">
                    <select className="border p-2 rounded-lg text-sm text-gray-800 bg-gray-50 outline-none" onChange={e=>setFilterCategory(e.target.value)}>
                        <option value="All">Semua Status</option><option value="Pending">Pending</option><option value="Done">Selesai</option>
                    </select>
                </div>
            </div>
            <div className="space-y-4">
                {pickups.filter(p => filterCategory === 'All' || p.status === filterCategory).map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg text-gray-800">{p.area}</span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{p.date}</span>
                            </div>
                            <p className="text-sm text-gray-600">{p.user} • <span className="font-bold">{p.weightLabel}</span></p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-green-700 bg-green-50 w-fit px-3 py-1 rounded-lg">
                                <Truck size={14}/> Driver: <span className="font-bold">{p.driver}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status==='Done'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                            <button onClick={()=>openModal('pickup', p)} className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium w-full md:w-auto">Update Status</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderReports = () => {
        const filteredData = pickups.filter(item => {
            const matchStatus = reportFilter.status === 'All' ? true : item.status === reportFilter.status;
            const matchDate = reportFilter.date ? item.date.includes(new Date(reportFilter.date).toLocaleDateString('id-ID')) : true;
            return matchStatus && matchDate;
        });

        return (
            <div className="space-y-6 animate-in slide-in-from-right">
                <div className="flex flex-col md:flex-row justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4 items-center">
                    <div className="flex gap-4 items-center w-full">
                        <div className="flex items-center gap-2 border p-2 rounded-lg bg-gray-50 w-full md:w-auto">
                            <Settings size={18} className="text-gray-500"/>
                            <input type="date" className="bg-transparent text-sm outline-none text-gray-800 w-full" value={reportFilter.date} onChange={(e) => setReportFilter({...reportFilter, date: e.target.value})}/>
                        </div>
                        <select className="bg-gray-50 border p-2 rounded-lg text-sm text-gray-800 outline-none" value={reportFilter.status} onChange={(e) => setReportFilter({...reportFilter, status: e.target.value})}>
                            <option value="All">Semua Status</option><option value="Done">Selesai</option><option value="Pending">Pending</option>
                        </select>
                    </div>
                    <button onClick={()=>alert("Download Excel...")} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex gap-2 items-center hover:bg-green-700 font-bold"><Download size={16}/> Export Excel</button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Laporan Pengangkutan</div>
                    <table className="w-full text-left text-sm text-gray-800">
                        <thead><tr className="border-b"><th className="p-4">Tanggal</th><th className="p-4">User / Wilayah</th><th className="p-4">Berat</th><th className="p-4">Driver</th><th className="p-4">Status</th></tr></thead>
                        <tbody>
                            {filteredData.length > 0 ? filteredData.map(r => (
                                <tr key={r.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">{r.date}</td>
                                    <td className="p-4 font-medium">{r.user}<br/><span className="text-xs text-gray-500 font-normal">{r.area}</span></td>
                                    <td className="p-4 font-bold">{r.weightLabel}</td><td className="p-4">{r.driver}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${r.status==='Done'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{r.status}</span></td>
                                </tr>
                            )) : <tr><td colSpan="5" className="p-8 text-center text-gray-400">Data tidak ditemukan.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderFinance = () => (
        <div className="space-y-6 animate-in slide-in-from-right">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm">
                     <p className="text-green-800 font-medium mb-1">Total Pemasukan</p>
                     <h3 className="text-3xl font-bold text-green-900">{formatRupiah(financeStats.income)}</h3>
                     <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12}/> Dari transaksi selesai</p>
                 </div>
                 <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm">
                     <p className="text-red-800 font-medium mb-1">Estimasi Pengeluaran (30%)</p>
                     <h3 className="text-3xl font-bold text-red-900">{formatRupiah(financeStats.expense)}</h3>
                     <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertCircle size={12}/> Biaya operasional & gaji</p>
                 </div>
             </div>
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-4 bg-gray-50 font-bold border-b text-gray-700">Rincian Transaksi</div>
                 <table className="w-full text-left text-sm text-gray-800">
                     <tbody>
                        {transactions.slice(0, 10).map(t => (
                            <tr key={t.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">
                                    <span className="font-bold">Retribusi Sampah</span>
                                    <br/><span className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</span>
                                </td>
                                <td className="p-4 font-bold text-green-600 text-right">+ {formatRupiah(t.total_price)}</td>
                            </tr>
                        ))}
                     </tbody>
                 </table>
             </div>
        </div>
    );

    // --- 7. NEW RENDERS: SETTINGS & PROFILE (SEPARATED) ---

    // Halaman Pengaturan Sistem (General)
    const renderSettings = () => (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right text-gray-800">
             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-gray-800"><Settings size={22}/> Konfigurasi Sistem</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-sm font-bold mb-2 text-gray-600">Tarif Retribusi (Per Kg)</label>
                        <div className="flex items-center"><span className="bg-gray-200 border border-r-0 rounded-l px-3 py-2 text-gray-600 font-bold">Rp</span><input type="number" className="w-full border p-2 rounded-r text-gray-800 focus:ring-2 ring-green-500 outline-none" value={settings.tariff} onChange={e=>setSettings({...settings, tariff:e.target.value})} /></div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <label className="block text-sm font-bold mb-2 text-gray-600">Notifikasi Email</label>
                        <div className="flex items-center justify-between bg-white p-2 rounded border"><span className="text-sm font-medium ml-2">Aktifkan notifikasi?</span><button onClick={()=>setSettings({...settings, emailNotif:!settings.emailNotif})} className={`w-12 h-6 rounded-full relative transition-colors ${settings.emailNotif?'bg-green-500':'bg-gray-300'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.emailNotif?'right-1':'left-1'}`}></div></button></div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div><label className="block text-sm font-bold mb-1 text-gray-600">Jam Buka</label><input type="time" className="w-full border p-2 rounded bg-white text-gray-800" value={settings.opStart} onChange={e=>setSettings({...settings, opStart:e.target.value})}/></div>
                    <div><label className="block text-sm font-bold mb-1 text-gray-600">Jam Tutup</label><input type="time" className="w-full border p-2 rounded bg-white text-gray-800" value={settings.opEnd} onChange={e=>setSettings({...settings, opEnd:e.target.value})}/></div>
                </div>
                <button onClick={handleSaveSettings} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex justify-center gap-2"><Save size={18}/> Simpan Pengaturan Sistem</button>
            </div>
        </div>
    );

    // Halaman Profil Admin (Dedicated)
    const renderProfile = () => (
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right text-gray-800">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2 text-gray-800"><User size={22}/> Edit Profil Admin</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-xl">
                    <div><label className="block text-sm font-bold mb-1 text-gray-600">Email (Read Only)</label><input disabled className="w-full border p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed" value={currentUser?.email || ''} /></div>
                    <div><label className="block text-sm font-bold mb-1 text-gray-600">Nama Lengkap</label><input className="w-full border p-2 rounded bg-white text-gray-800" value={currentUser?.full_name || ''} onChange={e=>setCurrentUser({...currentUser, full_name:e.target.value})} /></div>
                    <div><label className="block text-sm font-bold mb-1 text-gray-600">Alamat</label><textarea className="w-full border p-2 rounded bg-white text-gray-800 h-24 resize-none" value={currentUser?.alamat || ''} onChange={e=>setCurrentUser({...currentUser, alamat:e.target.value})} /></div>
                    <div className="pt-4 border-t border-gray-100 mt-4"><h4 className="font-bold text-sm mb-3 flex items-center gap-2 text-orange-600"><Shield size={16}/> Keamanan Akun</h4><input type="password" className="w-full border p-2 rounded bg-white text-gray-800" placeholder="Password Baru (Min 6 karakter, Kosongkan jika tidak ubah)" onChange={e=>setCurrentUser({...currentUser, newPassword:e.target.value})} /></div>
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition mt-4">Simpan Perubahan Profil</button>
                </form>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in slide-in-from-right max-w-3xl mx-auto text-gray-800">
             <div className="flex justify-between mb-4"><h3 className="font-bold text-xl">Pusat Notifikasi</h3><span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">{unreadCount} Baru</span></div>
             <div className="space-y-1">
                {notifications.length === 0 ? <div className="text-center py-8 text-gray-400">Tidak ada notifikasi.</div> : notifications.map(n => (
                    <div key={n.id} onClick={()=>handleMarkRead(n.id)} className={`p-4 border-b flex gap-4 cursor-pointer hover:bg-gray-50 transition ${!n.is_read ? 'bg-green-50' : ''}`}>
                         <div className={`p-2 rounded-full h-fit ${n.type==='info'?'bg-blue-100 text-blue-600':'bg-orange-100 text-orange-600'}`}><Bell size={20}/></div>
                         <div className="flex-1">
                             <div className="flex justify-between"><h4 className={`font-bold text-sm ${!n.is_read ? 'text-green-800' : 'text-gray-700'}`}>{n.title}</h4><span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span></div>
                             <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                         </div>
                         <button onClick={(e)=>{e.stopPropagation(); handleDelete(n.id, 'notif')}} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                ))}
             </div>
        </div>
    );

    // --- 8. MAIN RENDER SWITCH ---
    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return renderDashboard();
            case 'users': return renderUsers();
            case 'drivers': return renderDrivers();
            case 'pickups': return renderPickups();
            case 'areas': return renderAreas();
            case 'reports': return renderReports();
            case 'finance': return renderFinance();
            case 'settings': return renderSettings(); // Settings hanya untuk sistem
            case 'profile': return renderProfile();   // Profile halaman terpisah
            case 'notifikasi': return renderNotifications();
            default: return <div>Halaman tidak ditemukan</div>;
        }
    };

    if (loading && !mounted) return <div className="min-h-screen flex justify-center items-center text-gray-800 font-bold bg-gray-50"><Loader2 className="animate-spin mr-2"/> Memuat Sistem Admin...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
            {/* SIDEBAR */}
            <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 fixed h-full z-20 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100">
                    {isSidebarOpen && (<h1 className="text-2xl font-bold text-green-600 flex items-center gap-2 overflow-hidden">RecycleYuk <span className="text-xs bg-gray-100 text-gray-500 px-1 rounded border">Admin</span></h1>)}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-lg hover:bg-gray-100 text-gray-500 ${!isSidebarOpen && 'mx-auto'}`}>{isSidebarOpen ? <ChevronLeft size={20}/> : <ChevronRight size={20}/>}</button>
                </div>
                <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
                    {SIDEBAR_MENUS.map(menu => (
                        <button key={menu.id} onClick={() => setActivePage(menu.id)} className={`w-full flex items-center rounded-xl font-medium transition-all duration-200 h-12 ${activePage === menu.id ? 'bg-green-50 text-green-700 shadow-sm border border-green-100' : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'} ${isSidebarOpen ? 'px-4 gap-3 justify-start' : 'justify-center px-0'}`}>
                            <menu.icon size={22} className={`min-w-[22px] ${activePage === menu.id ? 'text-green-600' : 'text-gray-400'}`}/> {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden">{menu.label}</span>}
                        </button>
                    ))}
                </nav>
                 <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className={`w-full flex items-center rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all h-12 ${isSidebarOpen ? 'px-4 gap-3 justify-start' : 'justify-center px-0'}`}>
                        <LogOut size={22} className="min-w-[22px]"/> {isSidebarOpen && "Keluar"}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                <div className="max-w-6xl mx-auto">
                    {/* HEADER */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold capitalize text-gray-800">{activePage === 'dashboard' ? 'Overview' : activePage.replace('-', ' ')}</h2>
                            <p className="text-gray-500 text-sm">Panel Kontrol Administrator</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex text-sm font-medium text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200 items-center gap-2 shadow-sm">
                                <Clock size={16} className="text-green-600"/> {mounted ? currentTime : '...'}
                            </div>
                            
                            {/* --- HEADER KANAN ATAS (MODIFIED) --- */}
                            <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                                {/* Tombol Notifikasi (Kiri) */}
                                <button onClick={() => setActivePage('notifikasi')} className="p-2 rounded-lg hover:bg-gray-100 relative text-gray-600 group transition">
                                    <Bell size={20} className="group-hover:text-green-600"/>
                                    {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}
                                </button>
                                
                                <div className="w-px h-6 bg-gray-200"></div>

                                {/* Tombol Profil (Kanan) */}
                                <button onClick={() => setActivePage('profile')} className="flex items-center gap-3 pl-2 pr-3 py-1 rounded-lg hover:bg-gray-50 transition">
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border border-green-200">
                                        {currentUser?.full_name?.charAt(0) || 'A'}
                                    </div>
                                    <div className="text-left hidden md:block">
                                        <p className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[100px]">{currentUser?.full_name || 'Admin'}</p>
                                        <p className="text-[10px] text-gray-500">Administrator</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* CONTENT RENDER */}
                    {renderContent()}
                </div>
            </main>

            {/* --- MODAL GLOBAL (Sama seperti sebelumnya) --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-bold text-gray-800">{editingItem ? `Edit ${modalType}` : `Tambah ${modalType}`}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-red-500"/></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            {modalType === 'driver' && <><input className="w-full border p-2 rounded bg-white text-gray-800" placeholder="Nama" value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})} required/><input className="w-full border p-2 rounded bg-white text-gray-800" placeholder="Kendaraan" value={formData.vehicle||''} onChange={e=>setFormData({...formData, vehicle:e.target.value})}/><select className="w-full border p-2 rounded bg-white text-gray-800" value={formData.shift||''} onChange={e=>setFormData({...formData, shift:e.target.value})}><option value="Shift 1 (08:00 - 12:00)">Shift 1</option><option value="Shift 2 (13:00 - 17:00)">Shift 2</option></select><select className="w-full border p-2 rounded bg-white text-gray-800" value={formData.status||'Off Duty'} onChange={e=>setFormData({...formData, status:e.target.value})}><option value="On Duty">On Duty</option><option value="Off Duty">Off Duty</option></select></>}
                            
                            {modalType === 'area' && <><input className="w-full border p-2 rounded bg-white text-gray-800" placeholder="Kelurahan" value={formData.kelurahan||''} onChange={e=>setFormData({...formData, kelurahan:e.target.value})} required/><div className="grid grid-cols-2 gap-4"><input className="border p-2 rounded bg-white text-gray-800" placeholder="RW" value={formData.rw||''} onChange={e=>setFormData({...formData, rw:e.target.value})}/><input className="border p-2 rounded bg-white text-gray-800" placeholder="RT" value={formData.rt||''} onChange={e=>setFormData({...formData, rt:e.target.value})}/></div><select className="w-full border p-2 rounded bg-white text-gray-800" value={formData.driverId||''} onChange={e=>setFormData({...formData, driverId:e.target.value})}><option value="">Pilih Driver</option>{drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select></>}
                            
                            {modalType === 'pickup' && <><div className="bg-gray-100 p-3 rounded text-sm text-gray-800 font-medium">User: {formData.user} ({formData.weightLabel})</div><select className="w-full border p-2 rounded bg-white text-gray-800" value={formData.status||'Pending'} onChange={e=>setFormData({...formData, status:e.target.value})}><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Done">Selesai</option><option value="Canceled">Dibatalkan</option></select><select className="w-full border p-2 rounded bg-white text-gray-800" value={formData.driver||''} onChange={e=>setFormData({...formData, driver:e.target.value})}><option value="">Assign Driver</option>{drivers.map(d=><option key={d.id} value={d.name}>{d.name}</option>)}</select></>}
                            
                            {modalType === 'user' && <><input className="w-full border p-2 rounded bg-white text-gray-800" placeholder="Nama" value={formData.name||''} onChange={e=>setFormData({...formData, name:e.target.value})}/><select className="w-full border p-2 rounded bg-white text-gray-800" value={formData.role||''} onChange={e=>setFormData({...formData, role:e.target.value})}><option value="user">User</option><option value="admin">Admin</option><option value="driver">Driver</option><option value="rtrw">RT/RW</option></select><input className="w-full border p-2 rounded bg-white text-gray-800" placeholder="Alamat" value={formData.region||''} onChange={e=>setFormData({...formData, region:e.target.value})}/></>}
                            
                            <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition mt-4">{loading?'Menyimpan...':'Simpan'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
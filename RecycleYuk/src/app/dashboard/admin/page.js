"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { MENUS } from '@/config/dashboardMenus';
import {
    TrendingUp, AlertCircle, Trash2, Edit, Plus, Search,
    Download, BarChart3, PieChart, Wallet, Truck, MapPin, 
    UserCheck, Clock, Settings, FileText, Save, X, 
    History, CheckCircle, XCircle, Power, Sun, Moon, Filter, Calendar
} from 'lucide-react';

export default function AdminDashboard() {
    const [activePage, setActivePage] = useState('dashboard');
    const [mounted, setMounted] = useState(false);
    const [currentTime, setCurrentTime] = useState('');

    // --- GLOBAL UI STATE ---
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    
    // --- STATE FILTER LAPORAN (BARU) ---
    const [reportFilter, setReportFilter] = useState({
        date: '',
        region: 'All'
    });

    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(''); 
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    // --- DATA STATES (MOCK DB) ---
    
    // 1. DATA USER
    const [users, setUsers] = useState([
        { id: 1, name: 'Bpk. Lurah Hartono', role: 'Kepala Lurah', email: 'lurah@cibeber.id', status: 'Aktif', region: 'Cibeber' },
        { id: 2, name: 'Ketua RW 05', role: 'RW', email: 'rw05@cibeber.id', status: 'Aktif', region: 'RW 05' },
        { id: 3, name: 'Ketua RT 01', role: 'RT', email: 'rt01@cibeber.id', status: 'Non-Aktif', region: 'RT 01' },
        { id: 4, name: 'Budi Warga', role: 'Warga', email: 'budi@mail.com', status: 'Aktif', region: 'RT 01' },
    ]);

    // 2. DATA DRIVER
    const [drivers, setDrivers] = useState([
        { id: 'DRV-01', name: 'Asep Kurawa', vehicle: 'Truk D 1234 XY', area: 'Cibeber', status: 'On Duty', rating: 4.8, shift: 'Shift 1 (08:00 - 12:00)' },
        { id: 'DRV-02', name: 'Udin Sedunia', vehicle: 'Pickup D 5678 AB', area: 'Leuwigajah', status: 'Off Duty', rating: 4.5, shift: 'Shift 2 (13:00 - 17:00)' },
    ]);

    // 3. PENGANGKUTAN
    const [pickups, setPickups] = useState([
        { id: 'PK-101', date: '2023-10-25', user: 'Budi Warga', area: 'Cibeber', type: 'Organik', weight: '5kg', status: 'Pending', driver: '' },
        { id: 'PK-102', date: '2023-10-25', user: 'Ketua RT 01', area: 'Cibeber', type: 'Campur', weight: '15kg', status: 'In Progress', driver: 'Asep Kurawa' },
        { id: 'PK-103', date: '2023-10-24', user: 'Bu Ani', area: 'Leuwigajah', type: 'Anorganik', weight: '8kg', status: 'Done', driver: 'Udin Sedunia' },
        { id: 'PK-104', date: '2023-10-24', user: 'Pak Joko', area: 'Cibeber', type: 'Campur', weight: '10kg', status: 'Canceled', driver: '-' },
    ]);

    // 4. WILAYAH
    const [areas, setAreas] = useState([
        { id: 'AR-01', kelurahan: 'Cibeber', rw: '05', rt: '01', driverId: 'DRV-01', volume: 'High Vol' },
        { id: 'AR-02', kelurahan: 'Leuwigajah', rw: '03', rt: '02', driverId: 'DRV-02', volume: 'Medium Vol' },
        { id: 'AR-03', kelurahan: 'Cimahi Utara', rw: '01', rt: '05', driverId: 'DRV-01', volume: 'Low Vol' },
    ]);

    // 5. DATA DUMMY LAPORAN (Diperbanyak agar filter terlihat efeknya)
    const [reportData] = useState([
        { id: 'RPT-001', date: '2023-10-25', region: 'Cibeber', totalWeight: '1200 kg', tripCount: 15, status: 'Optimal' },
        { id: 'RPT-002', date: '2023-10-25', region: 'Leuwigajah', totalWeight: '850 kg', tripCount: 10, status: 'Normal' },
        { id: 'RPT-003', date: '2023-10-24', region: 'Cibeber', totalWeight: '1350 kg', tripCount: 18, status: 'Overload' },
        { id: 'RPT-004', date: '2023-10-24', region: 'Cimahi Utara', totalWeight: '900 kg', tripCount: 12, status: 'Normal' },
        { id: 'RPT-005', date: '2023-10-23', region: 'Leuwigajah', totalWeight: '780 kg', tripCount: 9, status: 'Normal' },
        { id: 'RPT-006', date: '2023-10-23', region: 'Cibeber', totalWeight: '1100 kg', tripCount: 14, status: 'Optimal' },
    ]);

    // 6. KEUANGAN
    const [transactions, setTransactions] = useState([
        { id: 'TRX-001', date: '2023-10-25', desc: 'Retribusi Warga', category: 'Income', amount: 2500000 },
        { id: 'TRX-002', date: '2023-10-24', desc: 'Biaya Operasional BBM', category: 'Operational', amount: 350000 },
        { id: 'TRX-003', date: '2023-10-23', desc: 'Pembayaran Gaji Driver', category: 'DriverPay', amount: 1500000 },
    ]);

    // 7. SETTING
    const [settings, setSettings] = useState({
        tariff: 15000,
        opStart: '08:00',
        opEnd: '17:00',
        emailNotif: true
    });

    // --- UTILS & HANDLERS ---
    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('id-ID')), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const handleExportExcel = (data, filename) => {
        if (!data || data.length === 0) return alert("Data kosong atau tidak ada data yang sesuai filter!");
        const headers = Object.keys(data[0]).join(",");
        const rows = data.map(obj => Object.values(obj).join(","));
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        window.print();
    };

    const handleDelete = (id, type) => {
        if (!confirm('Yakin hapus data ini?')) return;
        if (type === 'user') setUsers(users.filter(u => u.id !== id));
        if (type === 'driver') setDrivers(drivers.filter(d => d.id !== id));
        if (type === 'pickup') setPickups(pickups.filter(p => p.id !== id));
        if (type === 'area') setAreas(areas.filter(a => a.id !== id));
    };

    const openModal = (type, item = null) => {
        setModalType(type);
        setEditingItem(item);
        setIsModalOpen(true);
        if (item) {
            setFormData({ ...item });
        } else {
            if (type === 'user') setFormData({ status: 'Aktif', role: 'Warga' });
            else if (type === 'driver') setFormData({ status: 'Off Duty', shift: 'Shift 1 (08:00 - 12:00)' });
            else setFormData({});
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        const genId = (pre) => `${pre}-${Date.now()}`;

        if (modalType === 'user') {
            const newItem = { ...formData, id: editingItem?.id || genId('USR') };
            setUsers(editingItem ? users.map(u => u.id === newItem.id ? newItem : u) : [...users, newItem]);
        } 
        else if (modalType === 'driver') {
            const newItem = { ...formData, id: editingItem?.id || genId('DRV') };
            setDrivers(editingItem ? drivers.map(d => d.id === newItem.id ? newItem : d) : [...drivers, newItem]);
        }
        else if (modalType === 'pickup') {
            const newItem = { ...formData, id: editingItem?.id || genId('PK') };
            setPickups(editingItem ? pickups.map(p => p.id === newItem.id ? newItem : p) : [...pickups, newItem]);
        }
        else if (modalType === 'area') {
            const newItem = { ...formData, id: editingItem?.id || genId('AR') };
            setAreas(editingItem ? areas.map(a => a.id === newItem.id ? newItem : a) : [...areas, newItem]);
        }
        
        setIsModalOpen(false);
    };

    // --- RENDER MODAL FORM ---
    const renderModal = () => {
        if (!isModalOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="text-xl font-bold text-black">{editingItem ? 'Edit Data' : 'Tambah Data Baru'}</h3>
                        <button onClick={() => setIsModalOpen(false)}><X className="text-black hover:text-red-500"/></button>
                    </div>
                    <form onSubmit={handleSave} className="space-y-4">
                        {modalType === 'user' && (
                            <>
                                <input className="w-full border p-2 rounded text-black" placeholder="Nama Lengkap" value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} required/>
                                <input className="w-full border p-2 rounded text-black" placeholder="Email" value={formData.email || ''} onChange={e=>setFormData({...formData, email:e.target.value})} required/>
                                <select className="w-full border p-2 rounded text-black" value={formData.role || 'Warga'} onChange={e=>setFormData({...formData, role:e.target.value})}>
                                    <option value="Kepala Lurah">Kepala Lurah</option><option value="RW">RW</option><option value="RT">RT</option><option value="Warga">Warga</option><option value="Driver">Driver</option>
                                </select>
                                <input className="w-full border p-2 rounded text-black" placeholder="Wilayah (RT/RW)" value={formData.region || ''} onChange={e=>setFormData({...formData, region:e.target.value})}/>
                                <div className="pt-2">
                                    <label className="block text-sm font-medium text-black mb-2">Status Akun</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setFormData({...formData, status: 'Aktif'})} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-colors ${formData.status === 'Aktif' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}><CheckCircle size={16}/> Aktif</button>
                                        <button type="button" onClick={() => setFormData({...formData, status: 'Non-Aktif'})} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border transition-colors ${formData.status === 'Non-Aktif' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`}><Power size={16}/> Tidak Aktif</button>
                                    </div>
                                </div>
                            </>
                        )}
                        {modalType === 'driver' && (
                            <>
                                <input className="w-full border p-2 rounded text-black" placeholder="Nama Driver" value={formData.name || ''} onChange={e=>setFormData({...formData, name:e.target.value})} required/>
                                <input className="w-full border p-2 rounded text-black" placeholder="Kendaraan (Plat No)" value={formData.vehicle || ''} onChange={e=>setFormData({...formData, vehicle:e.target.value})}/>
                                <div className="pt-2">
                                    <label className="block text-sm font-medium text-black mb-2">Pilih Shift Kerja</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button type="button" onClick={() => setFormData({...formData, shift: 'Shift 1 (08:00 - 12:00)'})} className={`w-full p-3 rounded-lg border text-left transition-all ${formData.shift === 'Shift 1 (08:00 - 12:00)' ? 'bg-blue-50 border-blue-600 text-blue-700 ring-1 ring-blue-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}><div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2"><Sun size={16}/> Shift 1</span><span className="text-xs font-mono">08:00 - 12:00</span></div></button>
                                        <button type="button" onClick={() => setFormData({...formData, shift: 'Shift 2 (13:00 - 17:00)'})} className={`w-full p-3 rounded-lg border text-left transition-all ${formData.shift === 'Shift 2 (13:00 - 17:00)' ? 'bg-orange-50 border-orange-600 text-orange-700 ring-1 ring-orange-600' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}><div className="flex justify-between items-center"><span className="font-bold flex items-center gap-2"><Moon size={16}/> Shift 2</span><span className="text-xs font-mono">13:00 - 17:00</span></div></button>
                                    </div>
                                </div>
                            </>
                        )}
                        {modalType === 'area' && (
                            <>
                                <input className="w-full border p-2 rounded text-black" placeholder="Nama Kelurahan" value={formData.kelurahan || ''} onChange={e=>setFormData({...formData, kelurahan:e.target.value})} required/>
                                <div className="grid grid-cols-2 gap-4">
                                    <input className="border p-2 rounded text-black" placeholder="RW" value={formData.rw || ''} onChange={e=>setFormData({...formData, rw:e.target.value})}/>
                                    <input className="border p-2 rounded text-black" placeholder="RT" value={formData.rt || ''} onChange={e=>setFormData({...formData, rt:e.target.value})}/>
                                </div>
                                <select className="w-full border p-2 rounded text-black" value={formData.driverId || ''} onChange={e=>setFormData({...formData, driverId:e.target.value})}>
                                    <option value="">Pilih Driver...</option>
                                    {drivers.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </>
                        )}
                        {modalType === 'pickup' && (
                            <>
                                <input className="w-full border p-2 rounded text-black" placeholder="Nama User" value={formData.user || ''} onChange={e=>setFormData({...formData, user:e.target.value})} />
                                <input className="w-full border p-2 rounded text-black" placeholder="Area" value={formData.area || ''} onChange={e=>setFormData({...formData, area:e.target.value})} />
                                <select className="w-full border p-2 rounded text-black" value={formData.driver || ''} onChange={e=>setFormData({...formData, driver:e.target.value})}>
                                    <option value="">Assign Driver...</option>
                                    {drivers.map(d=><option key={d.name} value={d.name}>{d.name}</option>)}
                                </select>
                                <select className="w-full border p-2 rounded text-black" value={formData.status || 'Pending'} onChange={e=>setFormData({...formData, status:e.target.value})}>
                                    <option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Done">Done</option><option value="Canceled">Canceled</option>
                                </select>
                            </>
                        )}
                        
                        <div className="flex gap-4 mt-6">
                            <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg text-black hover:bg-gray-50">Batal</button>
                            <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                                <Save size={18}/> Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // --- PAGE RENDERS ---

    const renderReports = () => {
        // Logika Filter Laporan
        const filteredReports = reportData.filter(item => {
            const matchesDate = reportFilter.date ? item.date === reportFilter.date : true;
            const matchesRegion = reportFilter.region !== 'All' ? item.region === reportFilter.region : true;
            return matchesDate && matchesRegion;
        });

        // Ambil list unik wilayah dari areas untuk dropdown
        const uniqueRegions = ['All', ...new Set(areas.map(a => a.kelurahan))];

        return (
            <div className="space-y-6 text-black">
                <div className="flex flex-col md:flex-row justify-between bg-white p-4 rounded-xl border gap-4 items-center">
                    
                    {/* FITUR BARU: Select By Date & Region */}
                    <div className="flex flex-1 flex-col md:flex-row gap-4 items-center w-full">
                        <div className="flex items-center gap-2 border p-2 rounded-lg bg-gray-50">
                            <Calendar size={18} className="text-gray-500"/>
                            <input 
                                type="date" 
                                className="bg-transparent text-sm outline-none text-black"
                                value={reportFilter.date}
                                onChange={(e) => setReportFilter({...reportFilter, date: e.target.value})}
                            />
                            {reportFilter.date && (
                                <button onClick={() => setReportFilter({...reportFilter, date: ''})} className="text-red-500 hover:text-red-700">
                                    <X size={14}/>
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 border p-2 rounded-lg bg-gray-50">
                            <MapPin size={18} className="text-gray-500"/>
                            <select 
                                className="bg-transparent text-sm outline-none text-black min-w-[120px]"
                                value={reportFilter.region}
                                onChange={(e) => setReportFilter({...reportFilter, region: e.target.value})}
                            >
                                {uniqueRegions.map((region, idx) => (
                                    <option key={idx} value={region}>{region === 'All' ? 'Semua Wilayah' : region}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="text-xs text-gray-500 italic">
                            Menampilkan {filteredReports.length} data
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={()=>handleExportExcel(filteredReports, 'Laporan_RecycleYuk')} className="border px-3 py-2 rounded-lg text-sm flex gap-2 items-center hover:bg-green-50 text-green-700 font-medium w-full justify-center md:w-auto"><FileText size={16}/> Excel</button>
                        <button onClick={handleExportPDF} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex gap-2 items-center hover:bg-blue-700 w-full justify-center md:w-auto"><Download size={16}/> PDF</button>
                    </div>
                </div>

                {/* Tabel Data Dummy untuk Preview Export */}
                <div className="bg-white rounded-xl border overflow-hidden">
                    <div className="p-4 border-b font-bold bg-gray-50 flex justify-between">
                        <span>Preview Data Laporan</span>
                        {(reportFilter.date || reportFilter.region !== 'All') && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Filter Aktif</span>}
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b"><th className="p-4">Tanggal</th><th className="p-4">Wilayah</th><th className="p-4">Total Berat</th><th className="p-4">Jml Trip</th><th className="p-4">Status Ops</th></tr>
                        </thead>
                        <tbody>
                            {filteredReports.length > 0 ? (
                                filteredReports.map(r => (
                                    <tr key={r.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">{r.date}</td>
                                        <td className="p-4">{r.region}</td>
                                        <td className="p-4">{r.totalWeight}</td>
                                        <td className="p-4">{r.tripCount}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${r.status === 'Optimal' ? 'bg-green-100 text-green-700' : r.status === 'Overload' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{r.status}</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400">Tidak ada data yang cocok dengan filter tanggal/wilayah ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border">
                        <h4 className="font-bold mb-4 flex gap-2"><BarChart3 size={18}/> Tren Pengangkutan</h4>
                        <div className="h-40 bg-gray-50 flex items-center justify-center text-xs text-gray-400">[Chart Visual Placeholder]</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border">
                        <h4 className="font-bold mb-4 flex gap-2"><PieChart size={18}/> Volume per Wilayah</h4>
                        <ul className="space-y-2 text-sm">
                            {areas.map(a => <li key={a.id} className="flex justify-between"><span>{a.kelurahan}</span><span>{a.volume}</span></li>)}
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    // ... (Fungsi renderDashboard, renderUsers, renderDrivers, renderPickups, renderAreas, renderFinance, renderSettings SAMA SEPERTI SEBELUMNYA - Hanya perlu memastikan Pickups punya opsi Done/Canceled di Filter UI)

    const renderDashboard = () => (
        <div className="space-y-6 text-black">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total User', val: users.length, icon: UserCheck, color: 'blue' },
                    { label: 'Pengangkutan', val: pickups.length, icon: Truck, color: 'green' },
                    { label: 'Masalah', val: '2', icon: AlertCircle, color: 'red' },
                    { label: 'Pendapatan', val: formatRupiah(transactions.filter(t=>t.category==='Income').reduce((a,b)=>a+b.amount,0)), icon: Wallet, color: 'purple' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-center">
                        <div><p className="text-sm">{s.label}</p><h3 className="text-2xl font-bold">{s.val}</h3></div>
                        <div className={`p-3 bg-${s.color}-50 rounded-full text-${s.color}-600`}><s.icon size={24}/></div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Truck size={20}/> Grafik Pengangkutan Bulanan</h3>
                    <div className="h-48 bg-gray-50 flex items-center justify-center text-gray-400 border border-dashed rounded">[Grafik Placeholder]</div>
                </div>
                <div className="bg-white p-6 rounded-xl border">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin size={20}/> Real-time Monitoring</h3>
                    <div className="space-y-3">
                        {pickups.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border text-sm">
                                <div><span className="font-bold">{p.area}</span><br/><span className="text-xs">{p.user}</span></div>
                                <span className={`px-2 py-0.5 rounded text-xs ${p.status==='Pending'?'bg-yellow-200':'bg-green-200'}`}>{p.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-4 text-black">
            <div className="flex justify-between bg-white p-4 rounded-xl border">
                <input placeholder="Cari User..." className="border p-2 rounded w-1/3 text-black" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                <button onClick={()=>openModal('user')} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"><Plus size={16}/> User Baru</button>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b"><tr><th className="p-4">Nama</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4 text-right">Aksi</th></tr></thead>
                    <tbody>
                        {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                            <tr key={u.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">{u.name}<div className="text-xs text-gray-500">{u.email}</div></td>
                                <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded">{u.role}</span></td>
                                <td className="p-4"><span className={`px-2 py-1 rounded font-bold text-xs ${u.status === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button title="Histori" className="text-gray-500 hover:bg-gray-100 p-1 rounded"><History size={16}/></button>
                                    <button onClick={()=>openModal('user', u)} title="Edit / Ganti Status" className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit size={16}/></button>
                                    <button onClick={()=>handleDelete(u.id, 'user')} title="Hapus" className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDrivers = () => (
        <div className="space-y-4 text-black">
            <div className="flex justify-between bg-white p-4 rounded-xl border">
                <h3 className="font-bold">Manajemen Driver</h3>
                <button onClick={()=>openModal('driver')} className="bg-green-600 text-white px-4 py-2 rounded flex gap-2"><Plus size={16}/> Driver Baru</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drivers.map(d => (
                    <div key={d.id} className="bg-white p-4 rounded-xl border shadow-sm">
                        <div className="flex justify-between items-start">
                            <div><h4 className="font-bold text-lg">{d.name}</h4><p className="text-sm">{d.vehicle}</p><div className="mt-2 text-xs bg-gray-50 p-2 rounded border inline-block"><span className="font-bold text-gray-700">{d.shift}</span></div></div>
                            <span className={`px-2 py-1 rounded text-xs ${d.status==='On Duty'?'bg-green-100 text-green-700':'bg-gray-100'}`}>{d.status}</span>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button className="flex-1 bg-blue-50 text-blue-600 py-1 rounded text-sm flex justify-center gap-1"><MapPin size={14}/> Lacak Lokasi</button>
                            <button onClick={()=>openModal('driver', d)} className="p-2 border rounded"><Edit size={16}/></button>
                            <button onClick={()=>handleDelete(d.id, 'driver')} className="p-2 border rounded text-red-600"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPickups = () => (
        <div className="space-y-4 text-black">
            <div className="flex justify-between bg-white p-4 rounded-xl border">
                <div className="flex gap-2 items-center">
                    <Filter size={16} className="text-gray-500"/>
                    <select className="border p-2 rounded text-black" onChange={e=>setFilterCategory(e.target.value)}>
                        <option value="All">Semua Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Canceled">Canceled</option>
                    </select>
                </div>
            </div>
            {pickups.filter(p => filterCategory === 'All' || p.status === filterCategory).map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
                    <div>
                        <h4 className="font-bold">{p.area} <span className="text-sm font-normal text-gray-500">({p.date})</span></h4>
                        <p className="text-sm">{p.user} • {p.type} • {p.weight}</p>
                        <p className="text-xs mt-1 text-blue-600">Driver: {p.driver || 'Belum di-assign'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            p.status==='Pending'?'bg-yellow-100 text-yellow-800':
                            p.status==='Done'?'bg-green-100 text-green-800':
                            p.status==='Canceled'?'bg-red-100 text-red-800':
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {p.status}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={()=>openModal('pickup', p)} className="text-xs border px-2 py-1 rounded hover:bg-gray-50">Reschedule / Edit</button>
                            {p.status === 'Pending' && <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded" onClick={()=>openModal('pickup', p)}>Assign Driver</button>}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderAreas = () => (
        <div className="space-y-4 text-black">
            <div className="flex justify-between bg-white p-4 rounded-xl border">
                <h3 className="font-bold">Manajemen Wilayah</h3>
                <button onClick={()=>openModal('area')} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2"><Plus size={16}/> Tambah Wilayah</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {areas.map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-xl border relative">
                        <div className="absolute top-4 right-4 flex gap-1">
                            <button onClick={()=>openModal('area', a)} className="text-blue-600"><Edit size={16}/></button>
                            <button onClick={()=>handleDelete(a.id, 'area')} className="text-red-600"><Trash2 size={16}/></button>
                        </div>
                        <h4 className="font-bold text-lg">{a.kelurahan}</h4>
                        <p className="text-sm text-gray-600">RW: {a.rw} • RT: {a.rt}</p>
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm flex justify-between items-center">
                            <span>Driver: <strong>{drivers.find(d=>d.id===a.driverId)?.name || 'Belum Ada'}</strong></span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFinance = () => (
        <div className="space-y-4 text-black">
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-100 p-4 rounded-xl border border-green-200">
                    <p className="text-sm text-green-800">Total Pendapatan</p>
                    <h3 className="text-2xl font-bold text-green-900">{formatRupiah(transactions.filter(t=>t.category==='Income').reduce((a,b)=>a+b.amount,0))}</h3>
                </div>
                <div className="bg-red-100 p-4 rounded-xl border border-red-200">
                    <p className="text-sm text-red-800">Biaya Operasional</p>
                    <h3 className="text-2xl font-bold text-red-900">{formatRupiah(transactions.filter(t=>t.category==='Operational').reduce((a,b)=>a+b.amount,0))}</h3>
                </div>
                <div className="bg-blue-100 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800">Pembayaran Driver</p>
                    <h3 className="text-2xl font-bold text-blue-900">{formatRupiah(transactions.filter(t=>t.category==='DriverPay').reduce((a,b)=>a+b.amount,0))}</h3>
                </div>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="p-4 bg-gray-50 font-bold border-b">Histori Transaksi</div>
                <table className="w-full text-left text-sm">
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id} className="border-b">
                                <td className="p-4">{t.desc}<div className="text-xs text-gray-500">{t.date}</div></td>
                                <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{t.category}</span></td>
                                <td className={`p-4 text-right font-bold ${t.category==='Income'?'text-green-600':'text-red-600'}`}>
                                    {t.category==='Income'?'+':'-'} {formatRupiah(t.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="max-w-2xl mx-auto space-y-6 text-black">
            <div className="bg-white p-6 rounded-xl border">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Settings size={20}/> Konfigurasi Sistem</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tarif Pengangkutan (Rp)</label>
                        <input type="number" className="w-full border p-2 rounded text-black" value={settings.tariff} onChange={e=>setSettings({...settings, tariff:e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm font-medium">Jam Buka</label><input type="time" className="w-full border p-2 rounded text-black" value={settings.opStart} onChange={e=>setSettings({...settings, opStart:e.target.value})}/></div>
                        <div><label className="text-sm font-medium">Jam Tutup</label><input type="time" className="w-full border p-2 rounded text-black" value={settings.opEnd} onChange={e=>setSettings({...settings, opEnd:e.target.value})}/></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                        <span>Notifikasi Email</span>
                        <button onClick={()=>setSettings({...settings, emailNotif:!settings.emailNotif})} className={`w-10 h-6 rounded-full ${settings.emailNotif?'bg-blue-600':'bg-gray-300'} relative`}>
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.emailNotif?'right-1':'left-1'}`}></div>
                        </button>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded font-bold mt-4">Simpan Pengaturan</button>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard': return renderDashboard();
            case 'users': return renderUsers();
            case 'drivers': return renderDrivers();
            case 'pickups': return renderPickups();
            case 'areas': return renderAreas();
            case 'reports': return renderReports();
            case 'finance': return renderFinance();
            case 'settings': return renderSettings();
            default: return <div>Halaman tidak ditemukan</div>;
        }
    };

    return (
        <DashboardLayout
            user={{ name: 'Admin Pusat', role: 'Administrator', email: 'admin@recycle.id' }}
            menuItems={MENUS.admin}
            activePage={activePage}
            setActivePage={setActivePage}
        >
            {renderModal()}
            <div className="mb-6 flex justify-between items-end text-black">
                <div>
                    <h2 className="text-2xl font-bold capitalize">{activePage === 'dashboard' ? 'Overview' : activePage.replace('-', ' ')}</h2>
                    <p className="text-sm mt-1">Panel Admin Sistem</p>
                </div>
                <div className="text-sm font-medium bg-gray-100 px-3 py-1 rounded flex items-center gap-2">
                    <Clock size={14}/> {mounted ? currentTime : 'Loading...'}
                </div>
            </div>
            {renderContent()}
        </DashboardLayout>
    );
}